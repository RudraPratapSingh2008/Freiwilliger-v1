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

let io;

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

module.exports = { setIO, emitToUser, NOTIFICATION_TYPES };