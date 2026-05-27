const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  getPublicProfile,
  toggleFavouriteUser,
} = require('../controllers/profile.controller');

const router = express.Router();

router.use(verifyToken);

router.get('/public/:username', getPublicProfile);
router.post('/favourite/:userId', toggleFavouriteUser);

module.exports = router;
