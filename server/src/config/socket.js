const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt.utils');
const Conversation = require('../models/Conversation.model');
const { saveMessage, broadcastMessage } = require('../services/message.service');
const notificationService = require('../services/notification.service');

// conversationId -> Map<userId, socketCount>
// socketCount lets the same user have multiple tabs open without the
// "online" list flickering when one tab closes.
const presenceByConversation = new Map();

const addPresence = (conversationId, userId) => {
    const room = presenceByConversation.get(conversationId) || new Map();
    room.set(userId, (room.get(userId) || 0) + 1);
    presenceByConversation.set(conversationId, room);
};

const removePresence = (conversationId, userId) => {
    const room = presenceByConversation.get(conversationId);
    if (!room) return;
    const next = (room.get(userId) || 0) - 1;
    if (next <= 0) {
        room.delete(userId);
    } else {
        room.set(userId, next);
    }
    if (room.size === 0) presenceByConversation.delete(conversationId);
};

const getOnlineUsers = (conversationId) => {
    const room = presenceByConversation.get(conversationId);
    return room ? Array.from(room.keys()) : [];
};

const broadcastPresence = (chatNamespace, conversationId) => {
    chatNamespace.to(`conv:${conversationId}`).emit('presence:update', {
        conversationId,
        onlineUsers: getOnlineUsers(conversationId),
    });
};

/**
 * Shared auth middleware for both namespaces.
 * Reads the JWT from socket.handshake.auth.token (same access token used
 * for REST calls), verifies it, and attaches the decoded payload to
 * socket.user. Rejects the handshake on any failure.
 */
const authenticateSocket = (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication error: token missing'));
        }

        const decoded = verifyAccessToken(token); // { _id, role, username }
        socket.user = decoded;
        return next();
    } catch (err) {
        return next(new Error('Authentication error: invalid or expired token'));
    }
};

/**
 * Builds the /chat namespace: conversation rooms, messaging, typing, presence.
 */
const registerChatNamespace = (ioInstance) => {
    const chat = ioInstance.of('/chat');
    chat.use(authenticateSocket);

    chat.on('connection', (socket) => {
        const userId = socket.user._id;

        // Personal room — lets other parts of the app target this user directly
        // on the /chat namespace too (e.g. "stop typing" cleanup), mirroring the
        // same room name used on /notify.
        socket.join(`user:${userId}`);

        // Track which conversation rooms this socket has joined so we can clean
        // up presence correctly on disconnect.
        socket.data.joinedConversations = new Set();

        /**
         * join:conversation
         * Body: conversationId (string)
         * Verifies the user is a participant before joining the room.
         */
        socket.on('join:conversation', async (conversationId) => {
            try {
                const conversation = await Conversation.findById(conversationId).select('participants');
                if (!conversation) return socket.emit('error:join', { message: 'Conversation not found' });

                const isParticipant = conversation.participants.some(
                    (p) => p.toString() === userId.toString()
                );
                if (!isParticipant) {
                    return socket.emit('error:join', { message: 'Not a participant of this conversation' });
                }

                socket.join(`conv:${conversationId}`);
                socket.data.joinedConversations.add(conversationId);

                addPresence(conversationId, userId);
                broadcastPresence(chat, conversationId);
            } catch (err) {
                socket.emit('error:join', { message: 'Failed to join conversation' });
            }
        });

        /**
         * leave:conversation
         * Body: conversationId (string)
         * Complements join:conversation so useSocket(conversationId) can leave
         * the room cleanly on unmount without disconnecting the whole socket.
         */
        socket.on('leave:conversation', (conversationId) => {
            socket.leave(`conv:${conversationId}`);
            socket.data.joinedConversations.delete(conversationId);
            removePresence(conversationId, userId);
            broadcastPresence(chat, conversationId);
        });

        /**
         * send:message
         * Body: { conversationId, text, attachments? }
         * Delegates to message.service.js's saveMessage()/broadcastMessage() —
         * the same functions message.controller.js's REST fallback uses — so
         * "what happens when a message is sent" can't drift between the two
         * transports. Saves the message, updates the conversation's lastMessage
         * + unread counters, emits new:message to the room, and notifies any
         * participant who isn't currently sitting in that room.
         */
        socket.on('send:message', async ({ conversationId, text, attachments } = {}) => {
            try {
                const { message, conversation } = await saveMessage({
                    conversationId,
                    senderId: userId,
                    text,
                    attachments,
                });

                broadcastMessage(ioInstance, {
                    message,
                    conversation,
                    senderUsername: socket.user.username,
                    onlineUserIds: new Set(getOnlineUsers(conversationId).map(String)),
                });
            } catch (err) {
                socket.emit('error:message', { message: err.message || 'Failed to send message' });
            }
        });

        /**
         * typing
         * Body: { conversationId, isTyping }
         * Broadcast-only — not persisted. Excludes the sender.
         */
        socket.on('typing', ({ conversationId, isTyping } = {}) => {
            if (!conversationId) return;
            socket.to(`conv:${conversationId}`).emit('user:typing', {
                conversationId,
                userId,
                username: socket.user.username,
                isTyping: Boolean(isTyping),
            });
        });

        socket.on('disconnect', () => {
            socket.data.joinedConversations.forEach((conversationId) => {
                removePresence(conversationId, userId);
                broadcastPresence(chat, conversationId);
            });
        });
    });

    return chat;
};

/**
 * Builds the /notify namespace: personal room only. Controllers and cron
 * jobs push to it via notification.service.js's emitToUser().
 */
const registerNotifyNamespace = (ioInstance) => {
    const notify = ioInstance.of('/notify');
    notify.use(authenticateSocket);

    notify.on('connection', (socket) => {
        socket.join(`user:${socket.user._id}`);
        socket.on('disconnect', () => { });
    });

    return notify;
};

/**
 * setupSocket(httpServer) — call once from server.js.
 * Returns the Socket.io Server instance. server.js does `app.set('io', io)`
 * with the return value so controllers can reach it via req.app.get('io')
 * if they ever need the raw instance — but prefer notification.service.js's
 * emitToUser() for anything outside a request (e.g. cron jobs), since that
 * doesn't depend on `req` existing at all.
 */
const setupSocket = (httpServer) => {
    const allowedOrigins = [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
    ].filter(Boolean);

    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });

    // Hand the live io instance to notification.service.js so its emitToUser()
    // works from controllers/cron jobs without needing req.app. Done here
    // (rather than each module requiring the other) to avoid a require cycle,
    // since this file also requires notification.service.js above.
    notificationService.setIO(io);

    registerChatNamespace(io);
    registerNotifyNamespace(io);

    return io;
};

module.exports = setupSocket;