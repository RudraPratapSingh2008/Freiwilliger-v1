const mongoose = require('mongoose');

const { Schema } = mongoose;

// NOTE: Phone OTP is handled entirely by Firebase on the client —
// this collection is ONLY used for email OTP verification.
// Firebase manages phone OTPs; no phone OTPs are stored here.

const otpTokenSchema = new Schema(
  {
    // The email address this OTP was sent to
    email: {
      type: String,
      required: [true, 'email is required'],
      trim: true,
      lowercase: true,
    },

    // Purpose prevents an OTP meant for one action being used for another
    purpose: {
      type: String,
      enum: ['email_verify', 'password_reset'],
      required: true,
    },

    // bcrypt hash of the 6-digit OTP (never store plain OTP)
    otpHash: {
      type: String,
      required: true,
      select: false, // never returned in queries
    },

    // Attempt counter — lock out after 5 failed attempts
    attempts: {
      type: Number,
      default: 0,
    },

    // MongoDB TTL index on this field auto-deletes expired documents
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },

    isUsed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// TTL index — MongoDB auto-deletes documents when expiresAt is reached
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Fast lookup when verifying an OTP
otpTokenSchema.index({ email: 1, purpose: 1 });

// ─── Export ──────────────────────────────────────────────────────────────────

module.exports = mongoose.model('OtpToken', otpTokenSchema);