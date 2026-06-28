const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  updateProfile,
  changePassword,
  updateVisibility,
  updateNotifications,
  deleteAccount,
  updateLanguage,
} = require('../controllers/settings.controller');
const { exportUserData } = require('../controllers/dataExport.controller');

const router = express.Router();

router.use(verifyToken);

router.patch('/profile', updateProfile);
router.patch('/security/password', changePassword);
router.patch('/visibility', updateVisibility);
router.patch('/notifications', updateNotifications);
router.patch('/language', updateLanguage);
router.delete('/account', deleteAccount);
router.get('/data/export', exportUserData);

module.exports = router;
