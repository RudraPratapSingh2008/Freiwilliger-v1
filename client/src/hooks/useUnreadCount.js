import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { connectSocket, getNotifySocket, getChatSocket } from '@/lib/socket';

/**
 * useUnreadCount()
 *
 * Maintains a Map<conversationId, unreadCount> by:
 *  1. Seeding from the conversations list (myUnreadCount from the API).
 *  2. Listening for 'notification' events (type: 'new_message') on the /notify
 *     namespace — increments the count for the relevant conversation.
 *  3. Listening for 'unread:updated' on the /chat namespace — server-confirmed
 *     reset after mark:read.
 *
 * Exposes:
 *  - totalUnread          — sum of all unread counts
 *  - unreadByConversation — Map<conversationId, number>
 *  - markAsRead(convId)   — emits 'mark:read' on /chat and optimistically
 *                           resets that conversation's count to 0
 *  - initFromConversations(conversations) — seed counts from API data
 */
const useUnreadCount = () => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  // Using a plain object as state (Map can't be diffed by React)
  const [unreadMap, setUnreadMap] = useState({});
  const listenerAttached = useRef(false);

  // ── Socket listeners ──────────────────────────────────────────────────

  useEffect(() => {
    if (!accessToken) return;

    // Ensure sockets are connected
    let notifySocket = getNotifySocket();
    let chatSocket = getChatSocket();
    if (!notifySocket?.connected || !chatSocket?.connected) {
      connectSocket(accessToken);
      notifySocket = getNotifySocket();
      chatSocket = getChatSocket();
    }
    if (!notifySocket || !chatSocket) return;

    // Guard against double-attaching in StrictMode
    if (listenerAttached.current) return;
    listenerAttached.current = true;

    // Increment count when a new_message notification arrives
    const handleNotification = (data) => {
      if (data.type !== 'new_message' || !data.conversationId) return;
      setUnreadMap((prev) => ({
        ...prev,
        [data.conversationId]: (prev[data.conversationId] || 0) + 1,
      }));
    };

    // Server-confirmed reset after mark:read
    const handleUnreadUpdated = ({ conversationId, unreadCount }) => {
      if (!conversationId) return;
      setUnreadMap((prev) => ({
        ...prev,
        [conversationId]: unreadCount ?? 0,
      }));
    };

    notifySocket.on('notification', handleNotification);
    chatSocket.on('unread:updated', handleUnreadUpdated);

    return () => {
      notifySocket.off('notification', handleNotification);
      chatSocket.off('unread:updated', handleUnreadUpdated);
      listenerAttached.current = false;
    };
  }, [accessToken]);

  // ── Actions ───────────────────────────────────────────────────────────

  /**
   * markAsRead(conversationId)
   * Emits 'mark:read' on the /chat socket and optimistically resets the
   * local count to 0 immediately.
   */
  const markAsRead = useCallback((conversationId) => {
    if (!conversationId) return;

    // Optimistic reset
    setUnreadMap((prev) => ({
      ...prev,
      [conversationId]: 0,
    }));

    // Tell the server
    const chatSocket = getChatSocket();
    if (chatSocket?.connected) {
      chatSocket.emit('mark:read', { conversationId });
    }
  }, []);

  /**
   * initFromConversations(conversations)
   * Seeds the unread map from the conversations array (each has unreadCount
   * or myUnreadCount). Call once when conversations load from the API.
   */
  const initFromConversations = useCallback((conversations) => {
    const map = {};
    for (const conv of conversations) {
      const count = conv.unreadCount ?? conv.myUnreadCount ?? 0;
      if (count > 0) {
        map[conv._id] = count;
      }
    }
    setUnreadMap(map);
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────

  const totalUnread = Object.values(unreadMap).reduce((sum, c) => sum + c, 0);

  return {
    totalUnread,
    unreadByConversation: unreadMap,
    markAsRead,
    initFromConversations,
  };
};

export default useUnreadCount;
