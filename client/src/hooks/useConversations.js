import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchConversations as apiFetchConversations, createConversation as apiCreateConversation } from '@/api/messagesApi';

/**
 * Derives an `otherParty` object from the populated `participants` array,
 * mapping backend virtuals (displayName / displayPhoto) to the shape the
 * ConversationList / ConversationListItem components already expect.
 */
const normalizeConversation = (conv, currentUserId) => {
  const participants = conv.participants || [];

  // Find the other participant (for direct chats)
  const other = participants.find(
    (p) => (p._id || p.id)?.toString() !== currentUserId?.toString()
  ) || participants[0];

  // Build an otherParty object the presentational components expect
  const otherParty = other
    ? {
        _id: other._id || other.id,
        name:
          other.displayName ||
          other.volunteerProfile?.fullName ||
          other.organiserProfile?.fullName ||
          other.organiserProfile?.companyName ||
          other.username ||
          'Unknown',
        avatar:
          other.displayPhoto ||
          other.volunteerProfile?.profilePhoto ||
          other.organiserProfile?.profilePhoto ||
          null,
        role: other.role || 'volunteer',
        isOnline: false, // will be updated by presence events
      }
    : null;

  return {
    ...conv,
    otherParty,
    currentUserId,
    // Map backend field name to what ConversationListItem expects
    unreadCount: conv.myUnreadCount ?? 0,
    lastMessage: conv.lastMessage
      ? {
          ...conv.lastMessage,
          // ConversationListItem reads lastMessage.timestamp, backend sends sentAt
          timestamp: conv.lastMessage.sentAt || conv.lastMessage.timestamp,
        }
      : null,
  };
};

export const useConversations = () => {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetchConversations();
      // The backend wraps responses in { success, data, message }
      const raw = res.data || res;
      const normalized = (Array.isArray(raw) ? raw : []).map((conv) =>
        normalizeConversation(conv, user?._id)
      );
      setConversations(normalized);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  // Create a new conversation
  const createConversation = useCallback(
    async (participantId) => {
      try {
        const res = await apiCreateConversation(participantId);
        const raw = res.data || res;
        const normalized = normalizeConversation(raw, user?._id);
        setConversations((prev) => {
          // Avoid duplicates if conversation already exists
          const exists = prev.some((c) => c._id === normalized._id);
          return exists ? prev : [normalized, ...prev];
        });
        return normalized;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error('Error creating conversation:', err);
        throw err;
      }
    },
    [user?._id]
  );

  // Update a single conversation in state (for optimistic last-message updates)
  const updateConversation = useCallback((conversationId, updater) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === conversationId
          ? typeof updater === 'function'
            ? updater(conv)
            : { ...conv, ...updater }
          : conv
      )
    );
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    if (user?._id) {
      fetchConversations();
    }
  }, [fetchConversations, user?._id]);

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    fetchConversations,
    createConversation,
    updateConversation,
  };
};
