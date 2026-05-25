const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const errorResponse = (res, message, statusCode = 400, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = { successResponse, errorResponse };
