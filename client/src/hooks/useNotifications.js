import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { connectSocket, getNotifySocket } from '@/lib/socket';

/**
 * NOTIFICATION_TYPES — mirrors the backend's notification.service.js types.
 * Used to drive icon/label mapping in the dropdown UI.
 */
export const NOTIFICATION_TYPES = {
  NEW_APPLICANT: 'new_applicant',
  SELECTED: 'selected',
  REJECTED: 'rejected',
  NEW_MESSAGE: 'new_message',
  SCORE_UPDATED: 'score:updated',
  CONTACT_REQUEST_RECEIVED: 'contact_request:received',
  CONTACT_REQUEST_APPROVED: 'contact_request:approved',
};

let idCounter = 0;

/**
 * useNotifications()
 * Connects to the /notify Socket.io namespace and maintains an in-memory
 * list of notifications received while the user is online. Returns state
 * and actions for the notification bell UI.
 */
const useNotifications = () => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [notifications, setNotifications] = useState([]);
  const listenerAttached = useRef(false);

  useEffect(() => {
    if (!accessToken) return;

    // Ensure the socket connection exists
    let socket = getNotifySocket();
    if (!socket?.connected) {
      connectSocket(accessToken);
      socket = getNotifySocket();
    }
    if (!socket) return;

    // Guard against double-attaching listeners in StrictMode
    if (listenerAttached.current) return;
    listenerAttached.current = true;

    const handleNotification = (data) => {
      idCounter += 1;
      const notification = {
        id: `notif_${Date.now()}_${idCounter}`,
        type: data.type || 'general',
        message: buildMessage(data),
        data, // raw payload for navigation etc.
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50)); // cap at 50
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
      listenerAttached.current = false;
    };
  }, [accessToken]);

  // ── Actions ────────────────────────────────────────────────────────────

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAsRead, markAllRead, clearAll };
};

// ── Helpers ──────────────────────────────────────────────────────────────

function buildMessage(data) {
  switch (data.type) {
    case NOTIFICATION_TYPES.NEW_APPLICANT:
      return `${data.senderUsername || 'Someone'} applied to your event`;
    case NOTIFICATION_TYPES.SELECTED:
      return 'You have been selected for an event!';
    case NOTIFICATION_TYPES.REJECTED:
      return 'Your application was not accepted';
    case NOTIFICATION_TYPES.NEW_MESSAGE:
      return `${data.senderUsername || 'Someone'}: ${data.preview || 'sent a message'}`;
    case NOTIFICATION_TYPES.SCORE_UPDATED:
      return 'Your score has been updated';
    case NOTIFICATION_TYPES.CONTACT_REQUEST_RECEIVED:
      return 'You received a contact request';
    case NOTIFICATION_TYPES.CONTACT_REQUEST_APPROVED:
      return 'Your contact request was approved!';
    default:
      return data.message || 'New notification';
  }
}

export default useNotifications;
