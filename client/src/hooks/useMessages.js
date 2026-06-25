import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { fetchMessages as apiFetchMessages } from '@/api/messagesApi';

/**
 * Normalize a message from the backend shape to the shape the UI components
 * expect. The backend populates `senderId` as a User object; the UI reads
 * flat fields like `sender.name`, `sender.avatar`, and a top-level `senderId`
 * string.
 */
const normalizeMessage = (msg) => {
  const senderObj = msg.senderId && typeof msg.senderId === 'object' ? msg.senderId : null;

  return {
    _id: msg._id,
    conversationId: msg.conversationId,
    // Keep senderId as a plain string ID for ownership checks
    senderId: senderObj ? (senderObj._id || senderObj.id) : msg.senderId,
    sender: senderObj
      ? {
          _id: senderObj._id || senderObj.id,
          name:
            senderObj.displayName ||
            senderObj.volunteerProfile?.fullName ||
            senderObj.organiserProfile?.fullName ||
            senderObj.organiserProfile?.companyName ||
            senderObj.username ||
            'Unknown',
          avatar:
            senderObj.displayPhoto ||
            senderObj.volunteerProfile?.profilePhoto ||
            senderObj.organiserProfile?.profilePhoto ||
            null,
        }
      : msg.sender || { _id: msg.senderId, name: 'Unknown' },
    text: msg.text,
    attachments: msg.attachments || [],
    // Map backend's sentAt to the timestamp field the UI reads
    timestamp: msg.sentAt || msg.timestamp || msg.createdAt,
    readBy: msg.readBy || [],
    readStatus: msg.readStatus || 'sent',
  };
};

export const useMessages = (conversationId) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, hasMore: false });
  const fetchedConvRef = useRef(null);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (page = 1) => {
      if (!conversationId) return;

      try {
        setIsLoading(true);
        setError(null);
        const res = await apiFetchMessages(conversationId, page);
        // Backend wraps in { success, data: { messages, pagination }, message }
        const payload = res.data || res;
        const rawMessages = payload.messages || [];
        const paginationData = payload.pagination || {};

        // API returns newest-first; reverse for chronological display
        const normalized = rawMessages.map(normalizeMessage).reverse();

        if (page === 1) {
          setMessages(normalized);
        } else {
          // Prepend older messages for infinite scroll
          setMessages((prev) => [...normalized, ...prev]);
        }

        setPagination({
          page: paginationData.page || page,
          hasMore: paginationData.hasMore || false,
          total: paginationData.total,
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  // Load more (older) messages
  const loadMore = useCallback(() => {
    if (!pagination.hasMore || isLoading) return;
    fetchMessages(pagination.page + 1);
  }, [fetchMessages, pagination, isLoading]);

  // Append a message to the list (used for optimistic adds and socket events)
  const appendMessage = useCallback((msg) => {
    setMessages((prev) => {
      // Deduplicate by _id
      if (msg._id && prev.some((m) => m._id === msg._id)) return prev;
      return [...prev, normalizeMessage(msg)];
    });
  }, []);

  // Fetch messages when conversationId changes
  useEffect(() => {
    if (conversationId && conversationId !== fetchedConvRef.current) {
      fetchedConvRef.current = conversationId;
      setMessages([]);
      fetchMessages(1);
    }
  }, [conversationId, fetchMessages]);

  return {
    messages,
    setMessages,
    isLoading,
    error,
    pagination,
    fetchMessages,
    loadMore,
    appendMessage,
  };
};
