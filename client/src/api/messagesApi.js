import axios from '@/lib/axios';

/**
 * Fetch all conversations for the current user
 * GET /messages/conversations
 * @returns {Promise} Array of conversations
 */
export const fetchConversations = async () => {
  const response = await axios.get('/messages/conversations');
  return response.data;
};

/**
 * Fetch messages for a specific conversation (paginated, newest-first from API)
 * GET /messages/conversations/:id/messages?page=&limit=
 * @param {string} conversationId - Conversation ID
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Messages per page (default: 30)
 * @returns {Promise} Object with { data: { messages, pagination } }
 */
export const fetchMessages = async (conversationId, page = 1, limit = 30) => {
  const response = await axios.get(
    `/messages/conversations/${conversationId}/messages`,
    { params: { page, limit } }
  );
  return response.data;
};

/**
 * Send a message (REST fallback — Socket.io send:message is the primary path)
 * POST /messages/conversations/:id/messages
 * @param {string} conversationId - Conversation ID
 * @param {string} text - Message text
 * @returns {Promise} Sent message object
 */
export const sendMessage = async (conversationId, text) => {
  const response = await axios.post(
    `/messages/conversations/${conversationId}/messages`,
    { text }
  );
  return response.data;
};

/**
 * Create (or fetch existing) direct conversation
 * POST /messages/conversations
 * @param {string} participantId - ID of the other user
 * @returns {Promise} Conversation object
 */
export const createConversation = async (participantId) => {
  const response = await axios.post('/messages/conversations', {
    participantId,
  });
  return response.data;
};

// ─── Future endpoints (no backend route yet) ──────────────────────────────
// TODO: deleteConversation, markMessagesAsRead, muteConversation,
//       archiveConversation, searchConversations, editMessage,
//       deleteMessage, addGroupParticipants, removeGroupParticipant,
//       leaveGroupChat — re-add when backend support lands.
