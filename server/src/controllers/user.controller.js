
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');
const { filterProfileForViewer } = require('../middleware/profileFilter.middleware');
const { sendEmailOtp, verifyEmailOtp } = require('../services/phone.service');

/**
 * GET /users/me
 * Get current user's full profile
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * PATCH /users/me
 * Update current user's profile
 */
exports.updateMe = async (req, res) => {
  try {
    const updates = req.body;
    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.phone;
    delete updates.email;
    delete updates.isEmailVerified;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    return successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * PATCH /users/me/volunteer-profile
 * Update volunteer profile data
 */
exports.updateVolunteerProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      age,
      gender,
      qualification,
      occupation,
      street,
      city,
      state,
      pincode,
      skills = [],
      otherSkills = [],
      languages = [],
      pastExperiences = [],
      bio,
    } = req.body;

    const genderMap = {
      male: 'Male',
      female: 'Female',
      other: 'Other',
      'prefer not to say': 'Prefer not to say',
    };

    const normalizedGender = gender ? (genderMap[gender] || gender) : undefined;

    const pastExperience = Array.isArray(pastExperiences)
      ? pastExperiences.map((exp) => ({
          organisationName: exp.organisation || exp.organisationName || '',
          role: exp.role || '',
          duration: exp.duration || '',
        }))
      : [];

    const update = {
      'volunteerProfile.fullName': fullName,
      'volunteerProfile.email': email,
      'volunteerProfile.age': age,
      'volunteerProfile.gender': normalizedGender,
      'volunteerProfile.qualification': qualification,
      'volunteerProfile.occupation': occupation,
      'volunteerProfile.address.street': street,
      'volunteerProfile.address.city': city,
      'volunteerProfile.address.state': state,
      'volunteerProfile.address.pincode': pincode,
      'volunteerProfile.skills': Array.isArray(skills) ? skills : [],
      'volunteerProfile.otherSkills': Array.isArray(otherSkills) ? otherSkills : [],
      'volunteerProfile.languages': Array.isArray(languages) ? languages : [],
      'volunteerProfile.pastExperience': pastExperience,
      'volunteerProfile.bio': bio,
      'volunteerProfile.isProfileComplete': true,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    return successResponse(res, user, 'Volunteer profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * PATCH /users/me/organiser-profile
 * Update organiser profile data
 */
exports.updateOrganiserProfile = async (req, res) => {
  try {
    const {
      entityType,
      companyName,
      companyEmail,
      companyPhone,
      gstNumber,
      websiteUrl,
      fullName,
      email,
      bio,
    } = req.body;

    const update = {
      'organiserProfile.entityType': entityType,
      'organiserProfile.companyName': companyName,
      'organiserProfile.companyEmail': companyEmail,
      'organiserProfile.companyPhone': companyPhone,
      'organiserProfile.gstNumber': gstNumber,
      'organiserProfile.website': websiteUrl,
      'organiserProfile.fullName': fullName,
      'organiserProfile.email': email,
      'organiserProfile.bio': bio,
      'organiserProfile.isProfileComplete': true,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    return successResponse(res, user, 'Organiser profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * POST /users/me/photo
 * Actual upload logic integrated via middleware in routes
 */
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.fileUrl) {
      return errorResponse(res, 'File upload failed', 400);
    }

    const update = req.user.role === 'organiser'
      ? { 'organiserProfile.profilePhoto': req.fileUrl }
      : { 'volunteerProfile.profilePhoto': req.fileUrl };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    ).select('role volunteerProfile.profilePhoto organiserProfile.profilePhoto');

    return successResponse(res, user, 'Photo uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * POST /users/me/id-document
 * Actual upload logic integrated via middleware in routes
 */
exports.uploadIdDocument = async (req, res) => {
  try {
    if (!req.fileUrl) {
      return errorResponse(res, 'File upload failed', 400);
    }

    if (req.user.role !== 'volunteer') {
      return errorResponse(res, 'ID document upload is only for volunteers', 403);
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'volunteerProfile.idDocument': req.fileUrl,
        'volunteerProfile.isProfileComplete': true,
      },
    });

    return successResponse(res, null, 'ID document uploaded and pending verification');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * POST /users/me/company-logo
 * Upload organiser company logo
 */
exports.uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.fileUrl) {
      return errorResponse(res, 'File upload failed', 400);
    }

    if (req.user.role !== 'organiser') {
      return errorResponse(res, 'Company logo upload is only for organisers', 403);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'organiserProfile.logo': req.fileUrl } },
      { new: true }
    ).select('organiserProfile.logo');

    return successResponse(res, user, 'Company logo uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * POST /users/me/verify-email/send
 * Send OTP to user's email
 */
exports.sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const email =
      req.body.email ||
      user?.volunteerProfile?.email ||
      user?.organiserProfile?.companyEmail ||
      user?.organiserProfile?.email;

    if (!email) {
      return errorResponse(res, 'Email address is required', 400);
    }

    await sendEmailOtp(email, 'email_verification');
    return successResponse(res, null, `Verification OTP sent to ${email}`);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * POST /users/me/verify-email/confirm
 * Verify OTP and mark email as verified
 */
exports.confirmEmailVerification = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return errorResponse(res, 'Email and OTP are required', 400);
    }

    await verifyEmailOtp(email, otp, 'email_verification');

    const update = req.user.role === 'volunteer'
      ? {
          'volunteerProfile.email': email,
          'volunteerProfile.isEmailVerified': true,
        }
      : {
          'organiserProfile.email': email,
          'organiserProfile.isEmailVerified': true,
        };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    ).select('volunteerProfile.email volunteerProfile.isEmailVerified organiserProfile.email organiserProfile.isEmailVerified');

    return successResponse(res, user, 'Email verified successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * PATCH /users/me/location
 * Update user's lat/lng and city
 */
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, city, state } = req.body;
    if (!lat || !lng) {
      return errorResponse(res, 'Coordinates are required', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        location: { type: 'Point', coordinates: [lng, lat], city, state },
      },
      { new: true }
    ).select('location city state');

    return successResponse(res, user, 'Location updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * GET /users/me/score-history
 * Returns last 20 score changes
 */
exports.getScoreHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: req.user.role === 'volunteer' 
        ? 'volunteerProfile.scoreHistory.eventId' 
        : 'organiserProfile.scoreHistory.eventId',
      select: 'eventName'
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const profile = req.user.role === 'volunteer' ? user.volunteerProfile : user.organiserProfile;
    const history = profile?.scoreHistory || [];

    const formattedHistory = history.map(entry => ({
      delta: entry.delta,
      reason: entry.reason,
      eventId: entry.eventId?._id || null,
      eventName: entry.eventId?.eventName || null,
      timestamp: entry.timestamp
    }));

    // Sort descending by timestamp and take the last 20
    formattedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentHistory = formattedHistory.slice(0, 20);

    return successResponse(res, recentHistory, 'Score history retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * GET /users/:username
 * Get public profile of a user
 */
exports.getUserByUsername = async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    if (!targetUser) {
      return errorResponse(res, 'User not found', 404);
    }

    const filteredProfile = filterProfileForViewer(targetUser, req.user.role);
    return successResponse(res, filteredProfile, 'Public profile retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * GET /users/search
 * Search users by username or name
 */
exports.searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;
    if (!q) return successResponse(res, [], 'Empty search');

    // Load the authenticated user's blocked list
    const currentUser = await User.findById(req.user._id).select('blockedUsers');

    // Build exclusion list: blocked users + the searching user themselves
    const excludedIds = [...(currentUser.blockedUsers || []), req.user._id];

    // Build the query filter
    const filter = {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { 'volunteerProfile.fullName': { $regex: q, $options: 'i' } },
        { 'organiserProfile.companyName': { $regex: q, $options: 'i' } },
        { 'organiserProfile.fullName': { $regex: q, $options: 'i' } }
      ],
      _id: { $nin: excludedIds }
    };

    // Optional role filter
    if (role && (role === 'volunteer' || role === 'organiser')) {
      filter.role = role;
    }

    const users = await User.find(filter).limit(20);

    const filteredUsers = users.map(u => filterProfileForViewer(u, req.user.role));
    return successResponse(res, filteredUsers, 'Search results');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
