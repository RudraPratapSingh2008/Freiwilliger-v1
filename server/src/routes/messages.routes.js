const express = require('express');
const { body, param, query } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
} = require('../controllers/message.controller');

const router = express.Router();

// GET /conversations — list all conversations for req.user, newest first
router.get('/conversations', verifyToken, getConversations);

// POST /conversations — start (or fetch existing) direct conversation
router.post(
  '/conversations',
  verifyToken,
  [body('participantId').isMongoId().withMessage('Invalid participant ID.')],
  createConversation
);

// GET /conversations/:id/messages — paginated, newest first
router.get(
  '/conversations/:id/messages',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid conversation ID.'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  ],
  getMessages
);

// POST /conversations/:id/messages — REST fallback (Socket.io send:message is primary)
router.post(
  '/conversations/:id/messages',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid conversation ID.'),
    body('text').trim().notEmpty().withMessage('Message text is required.').isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters.'),
  ],
  sendMessage
);

module.exports = router;