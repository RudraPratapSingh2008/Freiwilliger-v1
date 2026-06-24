const Conversation = require('../models/Conversation.model');

/**
 * createGroupChat(eventId, organiserId, volunteerIds)
 * Creates the group conversation for an event the first time an organiser
 * confirms a volunteer selection. Called from application.controller.js's
 * respondToApplicant (action: 'select') — kept here instead of inline so
 * there's exactly one place that knows how an event's group chat is built.
 */
const createGroupChat = async (eventId, organiserId, volunteerIds = [], groupName) => {
    const conversation = await Conversation.create({
        type: 'group',
        eventId,
        participants: [organiserId, ...volunteerIds],
        groupName: groupName || `Event Chat: ${eventId}`,
    });
    return conversation;
};

/**
 * addParticipantToGroupChat(conversationId, userId)
 * Adds a volunteer to an event's existing group chat (e.g. a second
 * selection after the chat already exists). Idempotent via $addToSet.
 */
const addParticipantToGroupChat = async (conversationId, userId) => {
    return Conversation.findByIdAndUpdate(
        conversationId,
        { $addToSet: { participants: userId } },
        { new: true }
    );
};

/**
 * removeParticipantFromGroupChat(conversationId, userId)
 * Removes a volunteer from an event's group chat (e.g. they were rejected
 * after previously being selected).
 */
const removeParticipantFromGroupChat = async (conversationId, userId) => {
    return Conversation.findByIdAndUpdate(
        conversationId,
        { $pull: { participants: userId } },
        { new: true }
    );
};

module.exports = {
    createGroupChat,
    addParticipantToGroupChat,
    removeParticipantFromGroupChat,
};