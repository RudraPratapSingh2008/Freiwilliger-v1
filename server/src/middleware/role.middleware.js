/**
 * Role middleware
 * Must be used AFTER verifyToken (req.user must already be set).
 *
 * Usage:
 *   router.post('/event', verifyToken, requireOrganiser, createEventHandler)
 *   router.post('/apply', verifyToken, requireVolunteer, applyHandler)
 */

const requireVolunteer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Volunteer role required.',
    });
  }
  next();
};

const requireOrganiser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (req.user.role !== 'organiser') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organiser role required.',
    });
  }
  next();
};

/**
 * requireAnyRole — allows either role (e.g., for shared endpoints).
 * Pass roles as an array: requireAnyRole(['volunteer', 'organiser'])
 */
const requireAnyRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}.`,
    });
  }
  next();
};

module.exports = { requireVolunteer, requireOrganiser, requireAnyRole };