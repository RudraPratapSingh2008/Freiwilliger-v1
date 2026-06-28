const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

// POST /users/me/fcm-token — Register an FCM push token for the current user
const registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return errorResponse(res, 'FCM token is required.', 400);
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { fcmTokens: token },
    });

    return successResponse(res, null, 'FCM token registered.');
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return errorResponse(res, 'Failed to register token.', 500);
  }
};

module.exports = { registerToken };
