const mongoose = require('mongoose');

const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    // 'direct' = 1-on-1 DM,  'group' = event volunteer group chat
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
      default: 'direct',
    },

    // All participants (2 for direct, N for group)
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    // Only populated for group chats
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },

    groupName: {
      type: String,
      trim: true, // e.g. event name — auto-set when group chat is created
    },

    // Denormalised for fast inbox rendering (avoids populating last message every time)
    lastMessage: {
      text:     { type: String, trim: true },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      sentAt:   { type: Date },
    },

    // Per-user unread counters  { userId: count }
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Fast lookup: all conversations a user is part of
conversationSchema.index({ participants: 1 });
// Find the group chat for a specific event
conversationSchema.index({ eventId: 1 }, { sparse: true });

// ─── Export ──────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Conversation', conversationSchema);