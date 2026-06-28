/**
 * notification.service.js
 *
 * Thin wrapper around the /notify Socket.io namespace so that controllers
 * and cron jobs can push a real-time notification to a user without needing
 * access to `req` (and therefore `req.app.get('io')`).
 *
 * Wiring: config/socket.js calls setIO(io) once, inside setupSocket(), right
 * after the Server is created. Everything below just uses that reference.
 * (Deliberately NOT `require('../config/socket')` here — that would create a
 * require cycle, since config/socket.js itself requires this file to emit
 * new_message notifications from the send:message handler.)
 */

const { sendPushNotification } = require('./fcm.service');
const User = require('../models/User.model');

let io;

// Brief in-memory cache for user notification prefs (avoids hitting DB on every notification)
const prefsCache = new Map();
const PREFS_CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Maps notification types to the corresponding notificationPrefs key on the User model.
 */
const TYPE_TO_PREF_KEY = {
    new_applicant: 'events',
    selected: 'events',
    rejected: 'events',
    new_message: 'messages',
    'score:updated': 'reviews',
    'contact_request:received': 'contactRequests',
    'contact_request:approved': 'contactRequests',
};

/**
 * getUserNotificationPrefs(userId)
 * Returns the notificationPrefs object for a user, using a short TTL cache.
 */
const getUserNotificationPrefs = async (userId) => {
    const key = userId.toString();
    const cached = prefsCache.get(key);
    if (cached && Date.now() - cached.fetchedAt < PREFS_CACHE_TTL) {
        return cached.prefs;
    }

    const user = await User.findById(userId).select('notificationPrefs').lean();
    const prefs = user?.notificationPrefs || {};
    prefsCache.set(key, { prefs, fetchedAt: Date.now() });
    return prefs;
};

const setIO = (ioInstance) => {
    io = ioInstance;
};

/**
 * emitToUser(userId, eventName, data)
 * Emits `eventName` with `data` to the given user's personal room on the
 * /notify namespace. Every authenticated socket on /notify auto-joins
 * `user:{userId}` on connect (see config/socket.js), so this reaches every
 * tab/device that user currently has open — and silently no-ops if none are.
 */
const emitToUser = (userId, eventName, data) => {
    if (!io) {
        console.warn('[notification.service] emitToUser called before Socket.io was initialized — skipping.');
        return;
    }
    io.of('/notify').to(`user:${userId}`).emit(eventName, data);
};

/**
 * NOTIFICATION_TYPES
 * Canonical `type` values used inside the generic 'notification' event
 * payload: io.of('/notify').to(room).emit('notification', { type, ... }).
 * Keeping them here (instead of magic strings scattered across controllers)
 * makes it easy to keep the frontend's notification-bell icon/label mapping
 * in sync with what the backend actually sends.
 *
 * ── When each one fires ──────────────────────────────────────────────────
 * NEW_APPLICANT          → volunteer applies to an event (POST /events/:id/apply).
 *                           Fired from application.controller.js#applyToEvent.
 *                           Target: the event's organiser.
 *
 * SELECTED                → organiser selects a volunteer
 *                           (PATCH /events/:id/applicants/:userId, action='select').
 *                           Fired from application.controller.js#respondToApplicant.
 *                           Target: the selected volunteer.
 *
 * REJECTED                → organiser rejects a volunteer's application
 *                           (same endpoint, action='reject').
 *                           Fired from application.controller.js#respondToApplicant.
 *                           Target: the rejected volunteer.
 *
 * NEW_MESSAGE              → a chat message arrives for a participant who is
 *                           NOT currently sitting in that conversation's room
 *                           (i.e. their chat window isn't open right now).
 *                           Fired from config/socket.js's send:message handler.
 *                           Target: every such participant.
 *
 * SCORE_UPDATED            → the daily scoring cron job recalculates a user's
 *                           helpScore (volunteer) or hireScore (organiser).
 *                           Fired from score.service.js, invoked by
 *                           jobs/scoreUpdater.job.js (node-cron, 02:00 IST).
 *                           Target: the user whose score changed.
 *
 * CONTACT_REQUEST_RECEIVED → an organiser submits a contact-info request for
 *                           a volunteer they selected (POST /contact-requests).
 *                           Fired from contactRequest.controller.js.
 *                           Target: the volunteer (so ContactRequestFlow.jsx
 *                           has something to render the approve/deny UI for).
 *
 * CONTACT_REQUEST_APPROVED → a volunteer approves a contact-info request
 *                           (PATCH /contact-requests/:id/volunteer-response).
 *                           Fired from contactRequest.controller.js.
 *                           Target: the requesting organiser.
 */
const NOTIFICATION_TYPES = {
    NEW_APPLICANT: 'new_applicant',
    SELECTED: 'selected',
    REJECTED: 'rejected',
    NEW_MESSAGE: 'new_message',
    SCORE_UPDATED: 'score:updated',
    CONTACT_REQUEST_RECEIVED: 'contact_request:received',
    CONTACT_REQUEST_APPROVED: 'contact_request:approved',
};

/**
 * FCM push payload mapping.
 * Maps notification types to human-readable push notification content.
 */
const FCM_PAYLOAD_MAP = {
    [NOTIFICATION_TYPES.NEW_APPLICANT]: (data) => ({
        title: 'New Applicant',
        body: data.message || 'A volunteer has applied to your event.',
    }),
    [NOTIFICATION_TYPES.SELECTED]: (data) => ({
        title: 'You\'re Selected!',
        body: data.message || 'You have been selected for an event.',
    }),
    [NOTIFICATION_TYPES.REJECTED]: (data) => ({
        title: 'Application Update',
        body: data.message || 'Your application status has been updated.',
    }),
    [NOTIFICATION_TYPES.NEW_MESSAGE]: (data) => ({
        title: 'New Message',
        body: data.message || 'You have a new message.',
    }),
    [NOTIFICATION_TYPES.CONTACT_REQUEST_RECEIVED]: (data) => ({
        title: 'Contact Request',
        body: data.message || 'An organiser has requested your contact information.',
    }),
    [NOTIFICATION_TYPES.CONTACT_REQUEST_APPROVED]: (data) => ({
        title: 'Contact Request Approved',
        body: data.message || 'A volunteer has shared their contact information with you.',
    }),
};

// Types that should trigger FCM push notifications
const FCM_ENABLED_TYPES = [
    NOTIFICATION_TYPES.NEW_APPLICANT,
    NOTIFICATION_TYPES.SELECTED,
    NOTIFICATION_TYPES.REJECTED,
    NOTIFICATION_TYPES.NEW_MESSAGE,
    NOTIFICATION_TYPES.CONTACT_REQUEST_RECEIVED,
    NOTIFICATION_TYPES.CONTACT_REQUEST_APPROVED,
];

/**
 * notifyUser(userId, type, data)
 * Emits a socket event AND dispatches an FCM push notification (for eligible types).
 * Respects user notification preferences — if the user has disabled the category
 * for this notification type, both socket and FCM are skipped.
 * This is the preferred entry point for sending notifications.
 */
const notifyUser = async (userId, type, data = {}) => {
    // Check user notification preferences before sending
    const prefKey = TYPE_TO_PREF_KEY[type];
    if (prefKey) {
        try {
            const prefs = await getUserNotificationPrefs(userId);
            if (prefs[prefKey] === false) {
                // User has disabled this notification category — skip entirely
                return;
            }
        } catch (err) {
            // If we can't load prefs, default to sending the notification
            console.error('[notification.service] Failed to load prefs for', userId, err.message);
        }
    }

    // Emit socket event
    emitToUser(userId, 'notification', { type, ...data, timestamp: new Date().toISOString() });

    // Also dispatch FCM push for supported types
    if (FCM_ENABLED_TYPES.includes(type) && FCM_PAYLOAD_MAP[type]) {
        const { title, body } = FCM_PAYLOAD_MAP[type](data);
        sendPushNotification(userId, {
            title,
            body,
            data: { type, ...(data.resourceId ? { resourceId: String(data.resourceId) } : {}) },
        }).catch((err) => {
            console.error('[notification.service] FCM dispatch error:', err.message);
        });
    }
};

module.exports = { setIO, emitToUser, notifyUser, NOTIFICATION_TYPES };