const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets must be defined in environment variables');
}

/**
 * Sign a short-lived access token (15 minutes).
 * Payload: { _id, role, username }
 */
const signAccessToken = (user) => {
  const payload = {
    _id: user._id.toString(),
    role: user.role,
    username: user.username,
  };
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

/**
 * Sign a long-lived refresh token (7 days).
 * Payload: { _id } — minimal surface area.
 */
const signRefreshToken = (user) => {
  const payload = { _id: user._id.toString() };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

/**
 * Verify an access token.
 * Returns decoded payload or throws.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Verify a refresh token.
 * Returns decoded payload or throws.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};