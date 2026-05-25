const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'eventId is required'],
    },

    // Who wrote the review
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'reviewerId is required'],
    },

    // Who the review is about
    revieweeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'revieweeId is required'],
    },

    // Direction determines which score gets updated by the cron job:
    //   'organiser_to_volunteer' → affects volunteer's helpScore
    //   'volunteer_to_organiser' → affects organiser's hireScore
    reviewType: {
      type: String,
      enum: ['organiser_to_volunteer', 'volunteer_to_organiser'],
      required: true,
    },

    // 1–5 stars  (score delta = (stars / 5) * 10, max change = 10)
    stars: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Skill tags the organiser can highlight (optional)
    highlightedSkills: {
      type: [String],
      default: [],
    },

    // Flags for the no-show penalty path
    isNoShow: { type: Boolean, default: false },

    // Set to true once the nightly cron has applied the score delta
    scoreApplied: { type: Boolean, default: false },

    isVisible: { type: Boolean, default: true }, // soft-hide without deleting
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Prevent duplicate reviews: one reviewer → one reviewee per event
reviewSchema.index(
  { eventId: 1, reviewerId: 1, revieweeId: 1 },
  { unique: true }
);

// Fetch all reviews about a user (public profile page)
reviewSchema.index({ revieweeId: 1, isVisible: 1 });

// Cron job query: find unprocessed reviews for completed events
reviewSchema.index({ scoreApplied: 1, createdAt: 1 });

// ─── Export ──────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Review', reviewSchema);