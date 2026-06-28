const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');
const crypto = require('crypto');

/**
 * GET /users/me/referral
 * Returns the user's referral code and stats. Generates code if not exists.
 */
const getMyReferral = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select('referralCode referralCount');

    // Generate referral code if not exists
    if (!user.referralCode) {
      user.referralCode = `FRW${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      await user.save();
    }

    const shareUrl = `${process.env.CLIENT_URL}/register?ref=${user.referralCode}`;

    return successResponse(res, {
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      shareUrl,
    }, 'Referral info fetched.');
  } catch (error) {
    console.error('Error fetching referral info:', error);
    return errorResponse(res, 'Failed to fetch referral info', 500);
  }
};

/**
 * POST /users/me/referral
 * Applies a referral code to the current user.
 */
const applyReferral = async (req, res) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) return errorResponse(res, 'Referral code required', 400);

    const referrer = await User.findOne({ referralCode });
    if (!referrer) return errorResponse(res, 'Invalid referral code', 404);
    if (referrer._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 'Cannot refer yourself', 400);
    }

    const user = await User.findById(req.user._id);
    if (user.referredBy) return errorResponse(res, 'Referral already applied', 400);

    user.referredBy = referrer._id;
    await user.save();

    referrer.referralCount = (referrer.referralCount || 0) + 1;
    await referrer.save();

    return successResponse(res, null, 'Referral applied successfully.');
  } catch (error) {
    console.error('Error applying referral:', error);
    return errorResponse(res, 'Failed to apply referral', 500);
  }
};

module.exports = { getMyReferral, applyReferral };
