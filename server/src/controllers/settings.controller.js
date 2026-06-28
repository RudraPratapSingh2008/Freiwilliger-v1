const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

// ─── PATCH /settings/profile ────────────────────────────────────────────────

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const updates = req.body;

    if (user.role === 'volunteer') {
      Object.keys(updates).forEach((key) => {
        user.volunteerProfile[key] = updates[key];
      });
    } else if (user.role === 'organiser') {
      Object.keys(updates).forEach((key) => {
        user.organiserProfile[key] = updates[key];
      });
    }

    await user.save();

    return successResponse(res, user, 'Profile updated successfully.');
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, messages.join(' '), 400);
    }
    console.error('Error updating profile:', error);
    return errorResponse(res, 'Failed to update profile.', 500);
  }
};

// ─── PATCH /settings/security/password ──────────────────────────────────────

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'currentPassword and newPassword are required.', 400);
    }

    const user = await User.findById(req.user._id).select('+password +refreshTokens');
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect.', 401);
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    return successResponse(res, null, 'Password changed successfully.');
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, messages.join(' '), 400);
    }
    console.error('Error changing password:', error);
    return errorResponse(res, 'Failed to change password.', 500);
  }
};

// ─── PATCH /settings/visibility ─────────────────────────────────────────────

const updateVisibility = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const { showHelpScore, showWorkHistory, showCity } = req.body;

    if (showHelpScore !== undefined) user.visibilityPrefs.showHelpScore = showHelpScore;
    if (showWorkHistory !== undefined) user.visibilityPrefs.showWorkHistory = showWorkHistory;
    if (showCity !== undefined) user.visibilityPrefs.showCity = showCity;

    await user.save();

    return successResponse(res, user.visibilityPrefs, 'Visibility preferences updated.');
  } catch (error) {
    console.error('Error updating visibility:', error);
    return errorResponse(res, 'Failed to update visibility preferences.', 500);
  }
};

// ─── PATCH /settings/notifications ──────────────────────────────────────────

const updateNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const { events, messages, reviews, network, contactRequests } = req.body;

    if (events !== undefined) user.notificationPrefs.events = events;
    if (messages !== undefined) user.notificationPrefs.messages = messages;
    if (reviews !== undefined) user.notificationPrefs.reviews = reviews;
    if (network !== undefined) user.notificationPrefs.network = network;
    if (contactRequests !== undefined) user.notificationPrefs.contactRequests = contactRequests;

    await user.save();

    return successResponse(res, user.notificationPrefs, 'Notification preferences updated.');
  } catch (error) {
    console.error('Error updating notifications:', error);
    return errorResponse(res, 'Failed to update notification preferences.', 500);
  }
};

// ─── DELETE /settings/account ───────────────────────────────────────────────

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    if (user.accountStatus === 'deletion_requested') {
      return errorResponse(res, 'Deletion already requested.', 400);
    }

    user.accountStatus = 'deletion_requested';
    user.deletionRequestedAt = new Date();
    await user.save();

    return successResponse(res, null, 'Account deletion requested. Your account will be removed within 30 days.');
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    return errorResponse(res, 'Failed to request account deletion.', 500);
  }
};

// ─── PATCH /settings/language ────────────────────────────────────────────────

const updateLanguage = async (req, res) => {
  try {
    const { preferredLanguage } = req.body;
    if (!['en', 'hi'].includes(preferredLanguage)) {
      return errorResponse(res, 'Invalid language. Must be "en" or "hi".', 400);
    }
    const user = await User.findByIdAndUpdate(req.user._id, { preferredLanguage }, { new: true });
    return successResponse(res, { preferredLanguage: user.preferredLanguage }, 'Language updated.');
  } catch (error) {
    console.error('Error updating language:', error);
    return errorResponse(res, 'Failed to update language.', 500);
  }
};

module.exports = {
  updateProfile,
  changePassword,
  updateVisibility,
  updateNotifications,
  deleteAccount,
  updateLanguage,
};
