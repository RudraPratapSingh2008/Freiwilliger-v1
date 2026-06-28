const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');
const {
  getConsentUrl,
  exchangeCodeForToken,
  fetchAadhaarDocument,
  parseAadhaarXml,
} = require('../services/digilocker.service');

// ─── GET /auth/digilocker/initiate ──────────────────────────────────────────
// Returns the DigiLocker consent URL for the authenticated user
const initiate = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Mark user as pending verification
    await User.findByIdAndUpdate(userId, { idVerificationStatus: 'pending' });

    const consentUrl = getConsentUrl(userId);
    return successResponse(res, { consentUrl }, 'DigiLocker consent URL generated.');
  } catch (error) {
    console.error('Error initiating DigiLocker verification:', error);
    return errorResponse(res, 'Failed to initiate verification.', 500);
  }
};

// ─── GET /auth/digilocker/callback ──────────────────────────────────────────
// DigiLocker redirects here with ?code=...&state=userId
const callback = async (req, res) => {
  try {
    const { code, state: userId, error: authError } = req.query;

    if (authError || !code) {
      // User denied consent or something went wrong
      if (userId) {
        await User.findByIdAndUpdate(userId, { idVerificationStatus: 'failed' });
      }
      return errorResponse(res, 'DigiLocker authorization failed or was denied.', 400);
    }

    if (!userId) {
      return errorResponse(res, 'Missing state parameter (user ID).', 400);
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code);
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      await User.findByIdAndUpdate(userId, { idVerificationStatus: 'failed' });
      return errorResponse(res, 'Failed to obtain access token from DigiLocker.', 500);
    }

    // Fetch Aadhaar document
    const xmlString = await fetchAadhaarDocument(accessToken);

    // Parse the XML
    const aadhaarData = parseAadhaarXml(xmlString);

    if (!aadhaarData.lastFourDigits) {
      await User.findByIdAndUpdate(userId, { idVerificationStatus: 'failed' });
      return errorResponse(res, 'Failed to parse Aadhaar document.', 500);
    }

    // Update user with verification data
    await User.findByIdAndUpdate(userId, {
      idVerificationStatus: 'verified',
      aadhaarData: {
        ...aadhaarData,
        verifiedAt: new Date(),
      },
    });

    return successResponse(res, { status: 'verified' }, 'Aadhaar verification completed successfully.');
  } catch (error) {
    console.error('Error in DigiLocker callback:', error);

    // Try to mark verification as failed
    const userId = req.query.state;
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { idVerificationStatus: 'failed' });
      } catch (e) { /* ignore */ }
    }

    return errorResponse(res, 'DigiLocker verification failed.', 500);
  }
};

module.exports = { initiate, callback };
