const express = require('express');
const rateLimit = require('express-rate-limit');

const {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  loginOrRegisterWithPhone,
  completeRegistration,
  login,
  refreshToken,
  logout,
  forgotPassword,
} = require('../controllers/auth.controller');

const router = express.Router();

const phoneLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many phone auth attempts. Please try again in 15 minutes.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

router.post('/phone', phoneLimiter, loginOrRegisterWithPhone);
router.post('/register', validateRegistration, completeRegistration);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', validateForgotPassword, forgotPassword);

module.exports = router;