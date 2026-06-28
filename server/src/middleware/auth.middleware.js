const { verifyAccessToken } = require('../utils/jwt.utils');

/**
 * verifyToken
 * Reads Authorization: Bearer <token>, verifies the JWT,
 * and attaches the decoded payload to req.user.
 *
 * Usage: router.get('/protected', verifyToken, handler)
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token missing or malformed.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Attach minimal user info for downstream handlers
    req.user = {
      _id: decoded._id,
      role: decoded.role,
      username: decoded.username,
    };

    // Tag the authenticated user in Sentry for error context
    try { const Sentry = require('@sentry/node'); Sentry.setUser({ id: decoded._id }); } catch (e) { /* Sentry optional */ }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired. Please refresh.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid access token.',
    });
  }
};

module.exports = { verifyToken };