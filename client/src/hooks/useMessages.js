import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '@/lib/axios';

export const useMessages = (conversationId) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with actual API endpoint
      // const response = await axios.get(`/api/messages/conversations/${conversationId}`);
      // setMessages(response.data.messages);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Send a message
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || !conversationId) return;

      try {
        // TODO: Replace with actual API endpoint
        // const response = await axios.post('/api/messages/send', {
        //   conversationId,
        //   text,
        // });

        // Optimistically add message to state
        const newMessage = {
          _id: `temp_${Date.now()}`,
          conversationId,
          senderId: user?._id,
          text,
          timestamp: new Date(),
          readStatus: 'sent',
        };

        setMessages((prev) => [...prev, newMessage]);
        return newMessage;
      } catch (err) {
        setError(err.message);
        console.error('Error sending message:', err);
        throw err;
      }
    },
    [conversationId, user?._id]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    async (messageIds) => {
      try {
        // TODO: Replace with actual API endpoint
        // await axios.post('/api/messages/mark-as-read', { messageIds });
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    },
    []
  );

  // Delete a message
  const deleteMessage = useCallback(
    async (messageId) => {
      try {
        // TODO: Replace with actual API endpoint
        // await axios.delete(`/api/messages/${messageId}`);
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      } catch (err) {
        setError(err.message);
        console.error('Error deleting message:', err);
        throw err;
      }
    },
    []
  );

  // Edit a message
  const editMessage = useCallback(
    async (messageId, newText) => {
      try {
        // TODO: Replace with actual API endpoint
        // const response = await axios.patch(`/api/messages/${messageId}`, {
        //   text: newText,
        // });

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, text: newText, edited: true } : msg
          )
        );
      } catch (err) {
        setError(err.message);
        console.error('Error editing message:', err);
        throw err;
      }
    },
    []
  );

  // Fetch messages on mount or when conversationId changes
  useEffect(() => {
    fetchMessages();
  }, [conversationId, fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    isTyping,
    setIsTyping,
    sendMessage,
    markAsRead,
    deleteMessage,
    editMessage,
    refetch: fetchMessages,
  };
};
