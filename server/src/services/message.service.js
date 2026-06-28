const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const User = require('../models/User.model');
const { emitToUser, NOTIFICATION_TYPES } = require('./notification.service');

const isParticipant = (conversation, userId) =>
    conversation.participants.some((p) => p.toString() === userId.toString());

/**
 * checkBlocked(senderId, recipientId)
 * Returns true if either user has blocked the other.
 */
const checkBlocked = async (senderId, recipientId) => {
    const [sender, recipient] = await Promise.all([
        User.findById(senderId).select('blockedUsers').lean(),
        User.findById(recipientId).select('blockedUsers').lean(),
    ]);

    const senderBlocked = sender?.blockedUsers?.some(
        (id) => id.toString() === recipientId.toString()
    );
    const recipientBlocked = recipient?.blockedUsers?.some(
        (id) => id.toString() === senderId.toString()
    );

    return senderBlocked || recipientBlocked;
};

/**
 * saveMessage({ conversationId, senderId, text, attachments })
 * Validates membership, persists the message, and updates the
 * conversation's lastMessage + per-participant unread counters.
 *
 * Used by BOTH:
 *   - config/socket.js's `send:message` handler (Socket.io — primary path)
 *   - message.controller.js's POST /conversations/:id/messages (REST fallback)
 * so the two transports can never drift out of sync on what "sending a
 * message" actually does to the database.
 *
 * Throws an Error with a `.statusCode` set, so REST callers can pass it
 * straight to errorResponse() and socket callers can fall back to 500-ish
 * generic handling.
 */
const saveMessage = async ({ conversationId, senderId, text, attachments = [] }) => {
    if (!text?.trim() && attachments.length === 0) {
        const err = new Error('Message text or attachments are required');
        err.statusCode = 400;
        throw err;
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        const err = new Error('Conversation not found');
        err.statusCode = 404;
        throw err;
    }

    if (!isParticipant(conversation, senderId)) {
        const err = new Error('Not a participant of this conversation');
        err.statusCode = 403;
        throw err;
    }

    // Check if either user has blocked the other (direct conversations only)
    if (conversation.type === 'direct' && conversation.participants.length === 2) {
        const recipientId = conversation.participants.find(
            (p) => p.toString() !== senderId.toString()
        );
        if (recipientId) {
            const blocked = await checkBlocked(senderId, recipientId);
            if (blocked) {
                const err = new Error('Cannot send message to this user');
                err.statusCode = 403;
                throw err;
            }
        }
    }

    const message = await Message.create({
        conversationId,
        senderId,
        text: text?.trim(),
        attachments,
    });

    conversation.lastMessage = {
        text: message.text,
        senderId,
        sentAt: message.sentAt,
    };

    // Bump unread counters for every participant except the sender
    conversation.participants.forEach((participantId) => {
        const pid = participantId.toString();
        if (pid === senderId.toString()) return;
        conversation.unreadCounts.set(pid, (conversation.unreadCounts.get(pid) || 0) + 1);
    });

    await conversation.save();

    return { message, conversation };
};

/**
 * broadcastMessage(io, { message, conversation, senderUsername, onlineUserIds })
 * Emits new:message to the conversation's room on the /chat namespace, and
 * pushes an offline-style notification (via notification.service.js) to any
 * participant who isn't currently sitting in that room.
 *
 * onlineUserIds: optional Set<string> of userIds currently in the conv room.
 * config/socket.js tracks this via its presence map; the REST fallback has
 * no such concept and can simply omit it — every other participant gets a
 * notification there, which is the safer default for a fallback path.
 */
const broadcastMessage = (io, { message, conversation, senderUsername, onlineUserIds = new Set() }) => {
    if (!io) {
        console.warn('[message.service] broadcastMessage called without an io instance — skipping.');
        return;
    }

    const conversationId = message.conversationId.toString();
    const payload = {
        _id: message._id,
        conversationId,
        senderId: message.senderId,
        senderUsername,
        text: message.text,
        attachments: message.attachments,
        sentAt: message.sentAt,
    };

    io.of('/chat').to(`conv:${conversationId}`).emit('new:message', payload);

    conversation.participants.forEach((participantId) => {
        const pid = participantId.toString();
        if (pid === message.senderId.toString() || onlineUserIds.has(pid)) return;
        emitToUser(pid, 'notification', {
            type: NOTIFICATION_TYPES.NEW_MESSAGE,
            conversationId,
            senderId: message.senderId,
            senderUsername,
            preview: message.text?.slice(0, 120),
        });
    });
};

module.exports = { saveMessage, broadcastMessage };