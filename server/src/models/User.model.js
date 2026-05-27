const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const addressSchema = new Schema(
  {
    street:  { type: String, trim: true },
    city:    { type: String, trim: true },
    state:   { type: String, trim: true },
    pincode: { type: String, trim: true, match: /^\d{6}$/ },
  },
  { _id: false }
);

const pastExperienceSchema = new Schema(
  {
    organisationName: { type: String, trim: true },
    role:             { type: String, trim: true },
    duration:         { type: String, trim: true }, // e.g. "6 months"
  },
  { _id: true, timestamps: false }
);

const scoreHistorySchema = new Schema(
  {
    field:  { type: String, enum: ['helpScore', 'hireScore'], required: true },
    delta:  { type: Number, required: true },          // positive or negative
    reason: { type: String, trim: true },
    date:   { type: Date, default: Date.now },
  },
  { _id: false }
);

const volunteerProfileSchema = new Schema(
  {
    fullName:     { type: String, trim: true },
    email:        { type: String, trim: true, lowercase: true },
    isEmailVerified: { type: Boolean, default: false },
    bio:          { type: String, trim: true },
    age:          { type: Number, min: 18 },
    gender:       {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    qualification: {
      type: String,
      enum: ['10th', '12th', 'Diploma', 'Graduate', 'PG', 'Other'],
    },
    occupation:   { type: String, trim: true },
    address:      addressSchema,

    // Skills: preset list + free-text additions
    skills: {
      type: [String],
      enum: [
        'Ushering', 'Crowd Management', 'Registration Desk', 'Security',
        'Hospitality', 'Event Setup', 'MC/Hosting', 'Photography',
        'First Aid', 'Catering',
      ],
      validate: {
        validator: (v) => v.length >= 0, // min 1 enforced at controller level
        message: 'At least one skill is required.',
      },
    },

    otherSkills: [{ type: String, trim: true }],

    languages: {
      type: [String],
      enum: [
        'Hindi', 'English', 'Tamil', 'Telugu', 'Kannada',
        'Bengali', 'Marathi', 'Gujarati', 'Malayalam', 'Punjabi', 'Odia',
      ],
    },

    pastExperience: [pastExperienceSchema],

    profilePhoto: { type: String, trim: true }, // Cloudinary secure_url
    idDocument:   { type: String, trim: true }, // Cloudinary secure_url — never log

    // Scoring (capped 0–100 by score.service.js)
    helpScore:    { type: Number, default: 50, min: 0, max: 100 },
    scoreHistory: [scoreHistorySchema],

    // Favourite events (ObjectId refs to Event)
    favouriteEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],

    isProfileComplete: { type: Boolean, default: false },
  },
  { _id: false }
);

const organiserProfileSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ['company', 'individual'],
    },

    // Company fields
    companyName:  { type: String, trim: true },
    companyEmail: { type: String, trim: true, lowercase: true },
    isEmailVerified: { type: Boolean, default: false },
    companyPhone: { type: String, trim: true },
    gstNumber:    { type: String, trim: true, uppercase: true },
    logo:         { type: String, trim: true }, // Cloudinary secure_url
    website:      { type: String, trim: true },

    // Individual fields (fullName lives here when entityType === 'individual')
    fullName:     { type: String, trim: true },
    email:        { type: String, trim: true, lowercase: true },
    profilePhoto: { type: String, trim: true },

    bio:          { type: String, trim: true },

    // Scoring
    hireScore:    { type: Number, default: 50, min: 0, max: 100 },
    scoreHistory: [scoreHistorySchema],

    volunteerCount: { type: Number, default: 0 },   // cumulative
    pastEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],

    isProfileComplete: { type: Boolean, default: false },
  },
  { _id: false }
);

const visibilityPrefsSchema = new Schema(
  {
    showHelpScore:   { type: Boolean, default: true },
    showWorkHistory: { type: Boolean, default: true },
    showCity:        { type: Boolean, default: true },
  },
  { _id: false }
);

// ─── Root user schema ────────────────────────────────────────────────────────

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_]+$/,
    },

    password: {
      type: String,
      minlength: 8,
      select: false, // never returned in queries by default
    },

    // 10-digit Indian mobile number (stored without +91)
    phone: {
      type: String,
      unique: true,
      sparse: true,           // allows multiple null values
      trim: true,
      match: /^\d{10}$/,
    },

    firebaseUid: { type: String, unique: true, sparse: true },

    role: {
      type: String,
      enum: ['volunteer', 'organiser'],
      required: [true, 'Role is required'],
    },

    isPhoneVerified: { type: Boolean, default: false },

    // Refresh token rotation — store hashed tokens
    refreshTokens: { type: [String], select: false },

    // GeoJSON Point for $near queries — index added below
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      city:  { type: String, trim: true },
      state: { type: String, trim: true },
    },

    volunteerProfile: {
      type: volunteerProfileSchema,
      default: () => ({}),
    },

    organiserProfile: {
      type: organiserProfileSchema,
      default: () => ({}),
    },

    visibilityPrefs: {
      type: visibilityPrefsSchema,
      default: () => ({}),
    },

    // Network connections
    network: [
      {
        userId:      { type: Schema.Types.ObjectId, ref: 'User' },
        connectedAt: { type: Date, default: Date.now },
      },
    ],

    favouriteUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    isActive:  { type: Boolean, default: true },
    isBanned:  { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

userSchema.index({ location: '2dsphere' });
userSchema.index({ username: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1, isActive: 1 });

// ─── Virtuals ────────────────────────────────────────────────────────────────

// Convenience: display name regardless of role
userSchema.virtual('displayName').get(function () {
  if (this.role === 'organiser') {
    return (
      this.organiserProfile?.companyName ||
      this.organiserProfile?.fullName ||
      this.username
    );
  }
  return this.volunteerProfile?.fullName || this.username;
});

// ─── Pre-save middleware ─────────────────────────────────────────────────────

// Hash password on create / change
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Instance methods ────────────────────────────────────────────────────────

// Compare plain-text password against stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  // password field has select:false — caller must explicitly select it
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Export ──────────────────────────────────────────────────────────────────

module.exports = mongoose.model('User', userSchema);