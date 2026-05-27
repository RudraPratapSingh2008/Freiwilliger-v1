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

module.exports = {
  requestConnection,
  removeConnection,
  getNetwork,
};
