const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');
const { saveMessage, broadcastMessage } = require('../services/message.service');
const { validationResult } = require('express-validator');

// Selected fields needed for the displayName / displayPhoto virtuals on User,
// reused across every populate() call in this file.
const PARTICIPANT_SELECT =
    'username role volunteerProfile.fullName volunteerProfile.profilePhoto ' +
    'organiserProfile.fullName organiserProfile.companyName organiserProfile.profilePhoto';

/**
 * GET /conversations
 * Lists all conversations the current user is part of, newest message first.
 * Replaces the raw unreadCounts map (which would leak every participant's
 * count) with a single myUnreadCount field scoped to the requester.
 */
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({ participants: userId, isActive: true })
            .sort({ 'lastMessage.sentAt': -1 })
            .populate({ path: 'participants', select: PARTICIPANT_SELECT })
            .populate({ path: 'lastMessage.senderId', select: 'username' });

        const result = conversations.map((conversation) => {
            const obj = conversation.toObject({ virtuals: true });
            obj.myUnreadCount = conversation.unreadCounts?.get(userId.toString()) || 0;
            delete obj.unreadCounts;
            return obj;
        });

        return successResponse(res, result, 'Conversations fetched successfully');
    } catch (error) {
        console.error('[getConversations]', error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * POST /conversations
 * Body: { participantId }
 * Starts (or returns the existing) direct conversation between the current
 * user and participantId.
 */
const createConversation = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'Validation failed', 400, errors.array());
        }

        const userId = req.user._id;
        const { participantId } = req.body;

        if (participantId === userId.toString()) {
            return errorResponse(res, 'Cannot start a conversation with yourself', 400);
        }

        const participant = await User.findById(participantId).select('_id');
        if (!participant) {
            return errorResponse(res, 'User not found', 404);
        }

        // NOTE: visibilityPrefs ("Who can message me") isn't enforced yet — that
        // belongs to the Settings module (Day 37+). Revisit this check once
        // notificationPrefs/visibilityPrefs land on the User model.

        let conversation = await Conversation.findOne({
            type: 'direct',
            participants: { $all: [userId, participantId], $size: 2 },
        }).populate({ path: 'participants', select: PARTICIPANT_SELECT });

        if (conversation) {
            return successResponse(res, conversation, 'Conversation already exists', 200);
        }

        conversation = await Conversation.create({
            type: 'direct',
            participants: [userId, participantId],
        });
        await conversation.populate({ path: 'participants', select: PARTICIPANT_SELECT });

        return successResponse(res, conversation, 'Conversation created successfully', 201);
    } catch (error) {
        console.error('[createConversation]', error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * GET /conversations/:id/messages?page=1&limit=30
 * Paginated, newest-first. 403s if the requester isn't a participant.
 */
const getMessages = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'Validation failed', 400, errors.array());
        }

        const { id: conversationId } = req.params;
        const userId = req.user._id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

        const conversation = await Conversation.findById(conversationId).select('participants');
        if (!conversation) {
            return errorResponse(res, 'Conversation not found', 404);
        }

        const isParticipant = conversation.participants.some(
            (p) => p.toString() === userId.toString()
        );
        if (!isParticipant) {
            return errorResponse(res, 'Not a participant of this conversation', 403);
        }

        const [messages, total] = await Promise.all([
            Message.find({ conversationId, isDeleted: false })
                .sort({ sentAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate({ path: 'senderId', select: PARTICIPANT_SELECT }),
            Message.countDocuments({ conversationId, isDeleted: false }),
        ]);

        return successResponse(res, {
            messages,
            pagination: { page, limit, total, hasMore: page * limit < total },
        }, 'Messages fetched successfully');
    } catch (error) {
        console.error('[getMessages]', error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * POST /conversations/:id/messages
 * Body: { text }
 * REST fallback for sending a message — Socket.io (send:message) is the
 * primary path. Reuses the exact same saveMessage()/broadcastMessage() the
 * socket handler uses, so a message sent this way still shows up live for
 * anyone connected via socket, and the conversation's lastMessage / unread
 * counters stay identical either way.
 */
const sendMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'Validation failed', 400, errors.array());
        }

        const { id: conversationId } = req.params;
        const { text } = req.body;
        const senderId = req.user._id;

        const { message, conversation } = await saveMessage({ conversationId, senderId, text });

        const io = req.app.get('io');
        broadcastMessage(io, {
            message,
            conversation,
            senderUsername: req.user.username,
        });

        return successResponse(res, message, 'Message sent successfully', 201);
    } catch (error) {
        console.error('[sendMessage]', error);
        return errorResponse(res, error.message, error.statusCode || 500);
    }
};

module.exports = {
    getConversations,
    createConversation,
    getMessages,
    sendMessage,
};