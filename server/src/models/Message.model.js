const mongoose = require('mongoose');

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'conversationId is required'],
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'senderId is required'],
    },

    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // Future-proof: image / file attachments via Cloudinary
    attachments: [
      {
        url:      { type: String, trim: true },
        mimeType: { type: String, trim: true },
        fileName: { type: String, trim: true },
      },
    ],

    // Which participants have seen this message
    readBy: [
      {
        userId:  { type: Schema.Types.ObjectId, ref: 'User' },
        readAt:  { type: Date, default: Date.now },
      },
    ],

    sentAt: {
      type: Date,
      default: Date.now,
    },

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Primary access pattern: fetch messages for a conversation, newest first
messageSchema.index({ conversationId: 1, sentAt: -1 });

// ─── Export ──────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Message', messageSchema);