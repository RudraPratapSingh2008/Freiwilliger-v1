const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

/**
 * POST /network/request/:userId
 * Toggle network connection
 */
const requestConnection = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id === userId) {
      return errorResponse(res, 'You cannot connect with yourself', 400);
    }

    const user = await User.findById(req.user._id).select('network');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.network = user.network || [];
    const exists = user.network.some((entry) => entry.userId.toString() === userId);

    if (exists) {
      user.network = user.network.filter((entry) => entry.userId.toString() !== userId);
    } else {
      user.network.push({ userId });
    }

    await user.save();

    return successResponse(
      res,
      { isInNetwork: !exists },
      exists ? 'Removed from network' : 'Added to network'
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * DELETE /network/:userId
 * Remove from network
 */
const removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(req.user._id).select('network');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.network = (user.network || []).filter((entry) => entry.userId.toString() !== userId);
    await user.save();

    return successResponse(res, { isInNetwork: false }, 'Removed from network');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * GET /network
 * List network connections
 */
const getNetwork = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('network.userId', 'username role')
      .select('network');

    return successResponse(res, user?.network || [], 'Network retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * POST /network/favourites/:userId
 * Add a user to favourites (must be in network)
 */
const addFavourite = async (req, res) => {
  try {
    const { userId } = req.params;

    // Cannot favourite yourself
    if (req.user._id.toString() === userId) {
      return errorResponse(res, 'You cannot favourite yourself', 400);
    }

    const user = await User.findById(req.user._id).select('network favouriteUsers');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Target must be in network
    const isInNetwork = (user.network || []).some(
      (entry) => entry.userId.toString() === userId
    );
    if (!isInNetwork) {
      return errorResponse(res, 'Target user is not in your network', 400);
    }

    // Check if already in favourites
    const alreadyFavourited = (user.favouriteUsers || []).some(
      (id) => id.toString() === userId
    );
    if (alreadyFavourited) {
      return errorResponse(res, 'User is already in your favourites', 409);
    }

    user.favouriteUsers.push(userId);
    await user.save();

    return successResponse(res, user.favouriteUsers, 'Added to favourites');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * DELETE /network/favourites/:userId
 * Remove a user from favourites
 */
const removeFavourite = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(req.user._id).select('favouriteUsers');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.favouriteUsers = (user.favouriteUsers || []).filter(
      (id) => id.toString() !== userId
    );
    await user.save();

    return successResponse(res, user.favouriteUsers, 'Removed from favourites');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * GET /network/favourites
 * List favourited users (populated with username, role, displayName, displayPhoto, city)
 */
const getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate(
        'favouriteUsers',
        'username role location.city volunteerProfile.fullName volunteerProfile.profilePhoto organiserProfile.companyName organiserProfile.fullName organiserProfile.profilePhoto'
      )
      .select('favouriteUsers');

    return successResponse(res, user?.favouriteUsers || [], 'Favourites retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * POST /network/block/:userId
 * Block a user (also removes from network and favourites in both directions)
 */
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() === userId) {
      return errorResponse(res, 'You cannot block yourself', 400);
    }

    const user = await User.findById(req.user._id).select('blockedUsers network favouriteUsers');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Check if already blocked
    const alreadyBlocked = (user.blockedUsers || []).some(
      (id) => id.toString() === userId
    );
    if (alreadyBlocked) {
      return errorResponse(res, 'User is already blocked', 409);
    }

    // Add to blockedUsers
    user.blockedUsers = user.blockedUsers || [];
    user.blockedUsers.push(userId);

    // Remove target from blocker's network
    user.network = (user.network || []).filter(
      (entry) => entry.userId.toString() !== userId
    );

    // Remove target from blocker's favouriteUsers
    user.favouriteUsers = (user.favouriteUsers || []).filter(
      (id) => id.toString() !== userId
    );

    await user.save();

    // Remove blocker from target's network and favouriteUsers
    await User.findByIdAndUpdate(userId, {
      $pull: {
        network: { userId: req.user._id },
        favouriteUsers: req.user._id,
      },
    });

    return successResponse(res, { blocked: true }, 'User blocked successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * DELETE /network/block/:userId
 * Unblock a user
 */
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { blockedUsers: userId },
    });

    return successResponse(res, { blocked: false }, 'User unblocked successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  requestConnection,
  removeConnection,
  getNetwork,
  addFavourite,
  removeFavourite,
  getFavourites,
  blockUser,
  unblockUser,
};
