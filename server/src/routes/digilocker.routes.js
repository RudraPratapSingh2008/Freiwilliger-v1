const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { initiate, callback } = require('../controllers/digilocker.controller');

const router = express.Router();

// GET /auth/digilocker/initiate — Protected, requires authenticated user
router.get('/initiate', verifyToken, initiate);

// GET /auth/digilocker/callback — DigiLocker redirects here (no auth needed)
router.get('/callback', callback);

module.exports = router;
