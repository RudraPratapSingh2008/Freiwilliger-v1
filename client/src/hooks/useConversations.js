import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '@/lib/axios';

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
      // TODO: Replace with actual API endpoint
      // const response = await axios.get('/api/messages/conversations');
      // setConversations(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(
    async (otherUserId, isGroupChat = false, eventName = null) => {
      try {
        // TODO: Replace with actual API endpoint
        // const response = await axios.post('/api/messages/conversations', {
        //   otherUserId,
        //   isGroupChat,
        //   eventName,
        // });

        // const newConversation = response.data;
        // setConversations((prev) => [newConversation, ...prev]);
        // return newConversation;
      } catch (err) {
        setError(err.message);
        console.error('Error creating conversation:', err);
        throw err;
      }
    },
    []
  );

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      // TODO: Replace with actual API endpoint
      // await axios.delete(`/api/messages/conversations/${conversationId}`);
      setConversations((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );
    } catch (err) {
      setError(err.message);
      console.error('Error deleting conversation:', err);
      throw err;
    }
  }, []);

  // Mute a conversation
  const muteConversation = useCallback(
    async (conversationId, isMuted) => {
      try {
        // TODO: Replace with actual API endpoint
        // await axios.patch(`/api/messages/conversations/${conversationId}/mute`, {
        //   isMuted,
        // });

        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId ? { ...conv, isMuted } : conv
          )
        );
      } catch (err) {
        setError(err.message);
        console.error('Error muting conversation:', err);
        throw err;
      }
    },
    []
  );

  // Archive a conversation
  const archiveConversation = useCallback(
    async (conversationId, isArchived) => {
      try {
        // TODO: Replace with actual API endpoint
        // await axios.patch(`/api/messages/conversations/${conversationId}/archive`, {
        //   isArchived,
        // });

        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId ? { ...conv, isArchived } : conv
          )
        );
      } catch (err) {
        setError(err.message);
        console.error('Error archiving conversation:', err);
        throw err;
      }
    },
    []
  );

  // Search conversations
  const searchConversations = useCallback(
    async (query) => {
      try {
        // TODO: Replace with actual API endpoint
        // const response = await axios.get('/api/messages/conversations/search', {
        //   params: { q: query },
        // });
        // return response.data;
      } catch (err) {
        setError(err.message);
        console.error('Error searching conversations:', err);
        throw err;
      }
    },
    []
  );

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    createConversation,
    deleteConversation,
    muteConversation,
    archiveConversation,
    searchConversations,
  };
};
