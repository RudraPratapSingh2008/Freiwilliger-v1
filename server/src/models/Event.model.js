const mongoose = require('mongoose');

const { Schema } = mongoose;

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required'],
    },
    address: { type: String, trim: true },
    city:    { type: String, trim: true },
    state:   { type: String, trim: true },
    pincode: { type: String, trim: true },
  },
  { _id: false }
);

const dateTimeSchema = new Schema(
  {
    start: { type: Date, required: [true, 'Start date/time is required'] },
    end:   { type: Date, required: [true, 'End date/time is required'] },
  },
  { _id: false }
);

const requirementsSchema = new Schema(
  {
    genderPreference: {
      type: String,
      enum: ['Male', 'Female', 'Any'],
      default: 'Any',
    },
    requiredSkills: {
      type: [String],
      enum: [
        'Ushering', 'Crowd Management', 'Registration Desk', 'Security',
        'Hospitality', 'Event Setup', 'MC/Hosting', 'Photography',
        'First Aid', 'Catering',
      ],
      default: [],
    },
    minHelpScore:  { type: Number, default: 0, min: 0, max: 100 },
    minAge:        { type: Number, default: 18 },
    maxAge:        { type: Number },
    qualifications: {
      type: [String],
      enum: ['10th', '12th', 'Diploma', 'Graduate', 'PG', 'Other'],
      default: [],
    },
    requiredLanguages: { type: [String], default: [] },
  },
  { _id: false }
);

const compensationSchema = new Schema(
  {
    paymentType: {
      type: String,
      enum: ['paid', 'unpaid', 'certificate', 'stipend'],
      default: 'unpaid',
    },
    amount:   { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    notes:    { type: String, trim: true }, // e.g. "Meals provided"
  },
  { _id: false }
);

const applicationSchema = new Schema(
  {
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'selected', 'rejected', 'withdrew'],
      default: 'pending',
    },
    appliedAt:  { type: Date, default: Date.now },
    updatedAt:  { type: Date },
    note:       { type: String, trim: true }, // organiser's internal note
  },
  { _id: true }
);

const attendanceLogSchema = new Schema(
  {
    volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attended:    { type: Boolean, default: false },
    markedAt:    { type: Date, default: Date.now },
    markedBy:    { type: Schema.Types.ObjectId, ref: 'User' }, // organiser
  },
  { _id: false }
);

// ─── Root event schema ────────────────────────────────────────────────────────

const eventSchema = new Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Conference', 'Festival', 'Sports', 'Community Service',
        'Education', 'Healthcare', 'Environment', 'Corporate',
        'Cultural', 'Religious', 'Fundraiser', 'Other',
      ],
    },

    // Who posted this event
    organiserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organiser is required'],
    },

    location:      { type: locationSchema, required: true },
    dateTime:      { type: dateTimeSchema, required: true },
    requirements:  { type: requirementsSchema, default: () => ({}) },
    compensation:  { type: compensationSchema, default: () => ({}) },

    // Role tags shown on the event card
    roles: { type: [String], default: [] },

    totalVolunteersNeeded: {
      type: Number,
      required: [true, 'Total volunteers needed is required'],
      min: 1,
    },

    // All applications (including withdrew / rejected — preserved for records)
    applications: [applicationSchema],

    // Volunteers confirmed by organiser
    selectedVolunteers: [
      { type: Schema.Types.ObjectId, ref: 'User' },
    ],

    // Attendance marked after the event
    attendanceLog: [attendanceLogSchema],

    // Auto-created group chat when first volunteer is selected
    groupChatId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },

    // Prevents double-processing by the nightly cron job
    scoreProcessed: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'completed', 'cancelled'],
      default: 'draft',
    },

    isFeatured: { type: Boolean, default: false },

    // Soft-delete flag
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Geo index — required for $near / $geoWithin queries
eventSchema.index({ location: '2dsphere' });

// Common query patterns
eventSchema.index({ organiserId: 1, status: 1 });
eventSchema.index({ 'dateTime.start': 1 });
eventSchema.index({ status: 1, scoreProcessed: 1 }); // used by cron job
eventSchema.index({ category: 1, status: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

// How many spots remain
eventSchema.virtual('spotsRemaining').get(function () {
  const selected = this.selectedVolunteers?.length ?? 0;
  return Math.max(0, this.totalVolunteersNeeded - selected);
});

// Pending application count (useful for organiser dashboard badge)
eventSchema.virtual('pendingApplicationCount').get(function () {
  return (this.applications || []).filter((a) => a.status === 'pending').length;
});

// ─── Pre-save middleware ──────────────────────────────────────────────────────

// Auto-close event when enough volunteers selected
eventSchema.pre('save', function (next) {
  if (
    this.isModified('selectedVolunteers') &&
    this.selectedVolunteers.length >= this.totalVolunteersNeeded &&
    this.status === 'open'
  ) {
    this.status = 'closed';
  }
  next();
});

// ─── Export ──────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Event', eventSchema);