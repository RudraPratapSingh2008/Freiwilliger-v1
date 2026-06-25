const mongoose = require('mongoose');

const { Schema } = mongoose;

const contactRequestSchema = new Schema(
  {
    // The organiser making the request
    organiserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The volunteer being requested
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The event context
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['Full-time hiring', 'Certificate delivery', 'Background check', 'Other'],
    },
    details: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'approved_by_volunteer', 'denied_by_volunteer'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending requests for the same organiser->volunteer pair
contactRequestSchema.index(
  { organiserId: 1, volunteerId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'pending' } 
  }
);

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
