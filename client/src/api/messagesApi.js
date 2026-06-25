import axios from '@/lib/axios';

/**
 * Fetch all conversations for the current user
 * @returns {Promise} Array of conversations
 */
export const fetchConversations = async () => {
  try {
    const response = await axios.get('/api/messages/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Fetch messages for a specific conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Messages per page (default: 50)
 * @returns {Promise} Object with messages and pagination info
 */
export const fetchMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await axios.get(
      `/api/messages/conversations/${conversationId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a message
 * @param {string} conversationId - Conversation ID
 * @param {string} text - Message text
 * @param {array} attachments - Optional file attachments
 * @returns {Promise} Sent message object
 */
export const sendMessage = async (conversationId, text, attachments = []) => {
  try {
    const response = await axios.post('/api/messages/send', {
      conversationId,
      text,
      attachments,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Create a new conversation
 * @param {string} otherUserId - ID of the other user
 * @param {boolean} isGroupChat - Whether this is a group chat
 * @param {string} eventName - Event name for group chats
 * @returns {Promise} Created conversation object
 */
export const createConversation = async (
  otherUserId,
  isGroupChat = false,
  eventName = null
) => {
  try {
    const response = await axios.post('/api/messages/conversations', {
      otherUserId,
      isGroupChat,
      eventName,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise}
 */
export const deleteConversation = async (conversationId) => {
  try {
    const response = await axios.delete(
      `/api/messages/conversations/${conversationId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 * @param {string} conversationId - Conversation ID
 * @param {array} messageIds - Array of message IDs to mark as read
 * @returns {Promise}
 */
export const markMessagesAsRead = async (conversationId, messageIds) => {
  try {
    const response = await axios.post(
      `/api/messages/conversations/${conversationId}/mark-as-read`,
      { messageIds }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @returns {Promise}
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await axios.delete(`/api/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Edit a message
 * @param {string} messageId - Message ID
 * @param {string} text - New message text
 * @returns {Promise} Updated message object
 */
export const editMessage = async (messageId, text) => {
  try {
    const response = await axios.patch(`/api/messages/${messageId}`, { text });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

/**
 * Mute a conversation
 * @param {string} conversationId - Conversation ID
 * @param {boolean} isMuted - Whether to mute or unmute
 * @returns {Promise}
 */
export const muteConversation = async (conversationId, isMuted) => {
  try {
    const response = await axios.patch(
      `/api/messages/conversations/${conversationId}/mute`,
      { isMuted }
    );
    return response.data;
  } catch (error) {
    console.error('Error muting conversation:', error);
    throw error;
  }
};

/**
 * Archive a conversation
 * @param {string} conversationId - Conversation ID
 * @param {boolean} isArchived - Whether to archive or unarchive
 * @returns {Promise}
 */
export const archiveConversation = async (conversationId, isArchived) => {
  try {
    const response = await axios.patch(
      `/api/messages/conversations/${conversationId}/archive`,
      { isArchived }
    );
    return response.data;
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
};

/**
 * Search conversations
 * @param {string} query - Search query
 * @returns {Promise} Array of matching conversations
 */
export const searchConversations = async (query) => {
  try {
    const response = await axios.get('/api/messages/conversations/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw error;
  }
};

/**
 * Get conversation details
 * @param {string} conversationId - Conversation ID
 * @returns {Promise} Conversation object with details
 */
export const getConversationDetails = async (conversationId) => {
  try {
    const response = await axios.get(
      `/api/messages/conversations/${conversationId}/details`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    throw error;
  }
};

/**
 * Add participants to a group chat
 * @param {string} conversationId - Conversation ID
 * @param {array} userIds - Array of user IDs to add
 * @returns {Promise}
 */
export const addGroupParticipants = async (conversationId, userIds) => {
  try {
    const response = await axios.post(
      `/api/messages/conversations/${conversationId}/add-participants`,
      { userIds }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding participants:', error);
    throw error;
  }
};

/**
 * Remove participant from a group chat
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID to remove
 * @returns {Promise}
 */
export const removeGroupParticipant = async (conversationId, userId) => {
  try {
    const response = await axios.delete(
      `/api/messages/conversations/${conversationId}/participants/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
};

/**
 * Leave a group chat
 * @param {string} conversationId - Conversation ID
 * @returns {Promise}
 */
export const leaveGroupChat = async (conversationId) => {
  try {
    const response = await axios.post(
      `/api/messages/conversations/${conversationId}/leave`
    );
    return response.data;
  } catch (error) {
    console.error('Error leaving group chat:', error);
    throw error;
  }
};
