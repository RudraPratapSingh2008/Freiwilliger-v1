const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

const admin = require('../config/firebase.admin');
const User = require('../models/User.model');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt.utils');

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Hash a token string (SHA-256) for safe storage in DB */
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * Normalize Indian phone number.
 * Firebase returns +91XXXXXXXXXX → we store 10-digit number.
 */
const normalizeIndianPhone = (phoneNumber) => {
  if (!phoneNumber) return null;
  // Strip +91 or 91 prefix, keep last 10 digits
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 10) return digits;
  return null;
};

/**
 * verifyFirebaseToken — shared helper used by phone auth + forgot password.
 * Throws on invalid token.
 * Returns the normalized 10-digit Indian phone number.
 */
const verifyFirebaseToken = async (firebaseIdToken) => {
  if (!firebaseIdToken) {
    const err = new Error('Firebase ID token is required.');
    err.status = 400;
    throw err;
  }
  const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
  const phone = normalizeIndianPhone(decodedToken.phone_number);
  if (!phone) {
    const err = new Error('Could not extract a valid Indian phone number from Firebase token.');
    err.status = 400;
    throw err;
  }
  return phone;
};

/**
 * Issue JWT pair, set cookie, return access token + user object.
 * Rotates refresh token: stores hash in DB, clears old ones that are expired.
 */
const issueTokens = async (user, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const tokenHash = hashToken(refreshToken);

  // Prune refresh token list: keep only non-expired hashes.
  // We store hashes, so we can't verify expiry here — cap the list at 10 devices.
  const MAX_REFRESH_TOKENS = 10;
  const existing = user.refreshTokens || [];
  const trimmed = existing.slice(-MAX_REFRESH_TOKENS + 1); // keep latest (N-1), add 1 new
  trimmed.push(tokenHash);

  user.refreshTokens = trimmed;
  await user.save();

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  return {
    accessToken,
    user: {
      _id: user._id,
      username: user.username,
      role: user.role,
      phone: user.phone,
    },
  };
};

// ─────────────────────────────────────────────
// Validation rule sets (reusable with express-validator)
// ─────────────────────────────────────────────
const validateRegistration = [
  body('firebaseIdToken').notEmpty().withMessage('Firebase ID token is required.'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3–30 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username may only contain letters, numbers, and underscores.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),
  body('role')
    .isIn(['volunteer', 'organiser'])
    .withMessage('Role must be volunteer or organiser.'),
];

const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const validateForgotPassword = [
  body('firebaseIdToken').notEmpty().withMessage('Firebase ID token is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters.'),
];

// ─────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────

/**
 * POST /auth/phone
 * Step 1 of phone auth.
 * Client sends { firebaseIdToken } after the user completes OTP on the frontend.
 * - Unknown phone → { isNewUser: true, phone }     (client proceeds to /register)
 * - Known phone   → { accessToken, user }          (login complete)
 */
const loginOrRegisterWithPhone = async (req, res) => {
  try {
    const { firebaseIdToken } = req.body;
    const phone = await verifyFirebaseToken(firebaseIdToken);

    const user = await User.findOne({ phone });

    if (!user) {
      // New user — client must call /register next
      return res.status(200).json({
        success: true,
        isNewUser: true,
        phone, // pass back so client can pre-fill / include in register call
      });
    }

    // Existing user — issue JWT pair
    const tokenData = await issueTokens(user, res);
    return res.status(200).json({
      success: true,
      isNewUser: false,
      ...tokenData,
    });
  } catch (err) {
    console.error('[loginOrRegisterWithPhone]', err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Phone authentication failed.',
    });
  }
};

/**
 * POST /auth/register
 * Step 2 — called only when isNewUser === true.
 * Body: { firebaseIdToken, username, password, role }
 * Re-verifies the Firebase token so this endpoint can't be called independently.
 */
const completeRegistration = async (req, res) => {
  // Run express-validator rules inline (routes attach them, but validate here too)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { firebaseIdToken, username, password, role } = req.body;

    // Re-verify Firebase token (security: prevents skipping /auth/phone)
    const phone = await verifyFirebaseToken(firebaseIdToken);

    // Guard: phone must not already exist
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: 'This phone number is already registered. Please log in.',
      });
    }

    // Guard: username uniqueness
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken. Please choose another.',
      });
    }

    // Pass plain password — User model's pre-save hook hashes it (bcrypt cost 12)
    const newUser = await User.create({
      phone,
      username: username.toLowerCase(),
      password,
      role,
      isPhoneVerified: true,
    });

    const tokenData = await issueTokens(newUser, res);
    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      ...tokenData,
    });
  } catch (err) {
    console.error('[completeRegistration]', err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Registration failed.',
    });
  }
};

/**
 * POST /auth/login
 * Username + password alternative login (no phone OTP).
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const tokenData = await issueTokens(user, res);
    return res.status(200).json({ success: true, ...tokenData });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
};

/**
 * POST /auth/refresh-token
 * Reads httpOnly 'refreshToken' cookie.
 * Implements rotation: old token hash removed, new token issued.
 */
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token not found.' });
    }

    // Verify signature + expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      res.clearCookie('refreshToken');
      return res.status(401).json({ success: false, message: 'Refresh token invalid or expired.' });
    }

    const tokenHash = hashToken(token);

    const user = await User.findOne({
      _id: decoded._id,
      refreshTokens: tokenHash,
    }).select('+refreshTokens');

    if (!user) {
      // Token not in DB — possible reuse attack; clear cookie
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: 'Refresh token already used or revoked.',
        code: 'REFRESH_REUSE',
      });
    }

    // Rotate: remove old hash
    user.refreshTokens = user.refreshTokens.filter((h) => h !== tokenHash);

    const tokenData = await issueTokens(user, res); // saves new hash inside
    return res.status(200).json({ success: true, ...tokenData });
  } catch (err) {
    console.error('[refreshToken]', err);
    return res.status(500).json({ success: false, message: 'Token refresh failed.' });
  }
};

/**
 * POST /auth/logout
 * Revokes the current refresh token from DB and clears the cookie.
 */
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const tokenHash = hashToken(token);
      // Remove hash from whichever user holds it
      await User.updateOne(
        { refreshTokens: tokenHash },
        { $pull: { refreshTokens: tokenHash } }
      );
      res.clearCookie('refreshToken');
    }

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('[logout]', err);
    return res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

/**
 * POST /auth/forgot-password
 * Body: { firebaseIdToken, newPassword }
 * Client re-does phone OTP flow → sends new Firebase ID token + desired new password.
 * Backend verifies token → looks up user by phone → resets password.
 */
const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { firebaseIdToken, newPassword } = req.body;
    const phone = await verifyFirebaseToken(firebaseIdToken);

    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found for this phone number.',
      });
    }

    // Assign plain password — pre-save hook hashes it before saving
    user.password = newPassword;
    // Invalidate ALL existing refresh tokens (force re-login everywhere)
    user.refreshTokens = [];
    await user.save();

    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in again.',
    });
  } catch (err) {
    console.error('[forgotPassword]', err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Password reset failed.',
    });
  }
};

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────
module.exports = {
  // Validation rule arrays (consumed by routes)
  validateRegistration,
  validateLogin,
  validateForgotPassword,

  // Handlers
  loginOrRegisterWithPhone,
  completeRegistration,
  login,
  refreshToken,
  logout,
  forgotPassword,
};