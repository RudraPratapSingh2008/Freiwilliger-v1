const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

const buildPublicProfile = (user) => {
  const volunteer = user.volunteerProfile || {};
  const organiser = user.organiserProfile || {};
  const volunteerAddress = volunteer.address || {};

  const isVolunteer = user.role === 'volunteer';

  const skills = [
    ...(volunteer.skills || []),
    ...(volunteer.otherSkills || []),
  ];

  const workHistory = isVolunteer
    ? (volunteer.pastExperience || []).map((exp) => ({
        eventTitle: exp.organisationName || 'Event',
        organiserName: exp.role || 'Volunteer',
        date: null,
      }))
    : [];

  return {
    _id: user._id,
    username: user.username,
    role: user.role,
    name: isVolunteer
      ? (volunteer.fullName || user.username)
      : (organiser.companyName || organiser.fullName || user.username),
    avatarUrl: isVolunteer
      ? volunteer.profilePhoto
      : (organiser.logo || organiser.profilePhoto),
    city: isVolunteer
      ? (volunteerAddress.city || user.location?.city)
      : (user.location?.city || null),
    bio: isVolunteer ? volunteer.bio : organiser.bio,
    helpScore: volunteer.helpScore,
    hireScore: organiser.hireScore,
    skills: isVolunteer ? skills : [],
    languages: isVolunteer ? (volunteer.languages || []) : [],
    qualification: volunteer.qualification,
    gender: volunteer.gender,
    joinedAt: user.createdAt,
    reviews: [],
    eventsCount: isVolunteer
      ? (volunteer.pastExperience ? volunteer.pastExperience.length : 0)
      : (organiser.pastEvents ? organiser.pastEvents.length : 0),
    reviewsCount: 0,
    networkCount: user.network ? user.network.length : 0,
    workHistory,
  };
};

/**
 * GET /profile/public/:username
 * Returns public profile + favourite/network flags
 */
const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const targetUser = await User.findOne({ username }).lean();
    if (!targetUser) {
      return errorResponse(res, 'User not found', 404);
    }

    const currentUser = await User.findById(req.user._id)
      .select('favouriteUsers network')
      .lean();

    const isFavourited = currentUser?.favouriteUsers
      ? currentUser.favouriteUsers.some((id) => id.toString() === targetUser._id.toString())
      : false;

    const isInNetwork = currentUser?.network
      ? currentUser.network.some((entry) => entry.userId.toString() === targetUser._id.toString())
      : false;

    const profile = buildPublicProfile(targetUser);

    return successResponse(res, { profile, isFavourited, isInNetwork }, 'Public profile retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * POST /profile/favourite/:userId
 * Toggle favourite user
 */
const toggleFavouriteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id === userId) {
      return errorResponse(res, 'You cannot favourite yourself', 400);
    }

    const user = await User.findById(req.user._id).select('favouriteUsers');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.favouriteUsers = user.favouriteUsers || [];
    const exists = user.favouriteUsers.some((id) => id.toString() === userId);

    if (exists) {
      user.favouriteUsers = user.favouriteUsers.filter((id) => id.toString() !== userId);
    } else {
      user.favouriteUsers.push(userId);
    }

    await user.save();

    return successResponse(res, { isFavourited: !exists }, exists ? 'Removed from favourites' : 'Added to favourites');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getPublicProfile,
  toggleFavouriteUser,
};
