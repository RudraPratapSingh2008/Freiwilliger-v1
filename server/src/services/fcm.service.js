const admin = require('../config/firebase.admin');
const User = require('../models/User.model');

/**
 * Check if a user has an active socket connection.
 * Falls back to false if socket manager is unavailable.
 */
function isUserOnline(userId) {
  try {
    const io = global._io;
    if (!io) return false;
    const room = `user:${userId}`;
    const sockets = io.sockets.adapter.rooms.get(room);
    return sockets && sockets.size > 0;
  } catch {
    return false;
  }
}

/**
 * Send a push notification via FCM to a user's registered devices.
 * Only sends if the user is offline (no active socket).
 * Removes invalid tokens automatically.
 */
async function sendPushNotification(userId, { title, body, data = {} }) {
  try {
    // Skip if user is online
    if (isUserOnline(userId)) return;

    const user = await User.findById(userId).select('fcmTokens');
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    const message = {
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      tokens: user.fcmTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Remove invalid tokens
    const tokensToRemove = [];
    response.responses.forEach((res, idx) => {
      if (res.error && (
        res.error.code === 'messaging/registration-token-not-registered' ||
        res.error.code === 'messaging/invalid-registration-token'
      )) {
        tokensToRemove.push(user.fcmTokens[idx]);
      }
    });

    if (tokensToRemove.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { $in: tokensToRemove } },
      });
    }
  } catch (error) {
    console.error('FCM push notification error:', error.message);
  }
}

module.exports = { sendPushNotification, isUserOnline };
