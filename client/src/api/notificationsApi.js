import axios from '@/lib/axios';

/**
 * Notifications API — stub for future persistence.
 *
 * Currently the backend has no REST endpoints for notifications (they're
 * pushed live via Socket.io only). When a Notification model + CRUD routes
 * land on the server, fill these in.
 */

/**
 * Fetch past notifications for the current user
 * TODO: GET /notifications?page=&limit=
 */
export const fetchNotifications = async (/* page = 1, limit = 20 */) => {
  // No backend endpoint yet — return empty
  return { data: [], pagination: { page: 1, hasMore: false } };
};

/**
 * Mark a notification as read
 * TODO: PATCH /notifications/:id/read
 */
export const markNotificationRead = async (/* notificationId */) => {
  return { success: true };
};

/**
 * Mark all notifications as read
 * TODO: PATCH /notifications/read-all
 */
export const markAllNotificationsRead = async () => {
  return { success: true };
};
