const User = require('../models/User.model');
const Event = require('../models/Event.model');
const Review = require('../models/Review.model');
const Message = require('../models/Message.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, events, reviews, messages] = await Promise.all([
      User.findById(userId).select('-password -refreshTokens -fcmTokens'),
      Event.find({ $or: [{ organiserId: userId }, { 'applications.volunteerId': userId }] }).select('eventName dateTime location status'),
      Review.find({ $or: [{ reviewerId: userId }, { revieweeId: userId }] }),
      Message.find({ senderId: userId }).select('text sentAt conversationId'),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user?.toObject(),
      events,
      reviews,
      messageCount: messages.length,
      // Don't include full messages for privacy of other participants
    };

    return successResponse(res, exportData, 'Data exported successfully.');
  } catch (error) {
    console.error('Error exporting data:', error);
    return errorResponse(res, 'Failed to export data.', 500);
  }
};

module.exports = { exportUserData };
