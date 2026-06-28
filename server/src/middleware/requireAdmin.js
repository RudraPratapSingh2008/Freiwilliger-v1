const { errorResponse } = require('../utils/apiResponse.utils');

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 'Access denied', 403);
  }
  next();
};
