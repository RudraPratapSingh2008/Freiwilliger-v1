
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { uploadProfilePhoto, uploadIdDocument } = require('../middleware/upload.middleware');

// All routes require authentication
router.use(verifyToken);

// Private profile routes
router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.patch('/me/location', userController.updateLocation);
router.patch('/me/volunteer-profile', userController.updateVolunteerProfile);
router.patch('/me/organiser-profile', userController.updateOrganiserProfile);

// Email verification routes
router.post('/me/verify-email/send', userController.sendEmailVerification);
router.post('/me/verify-email/confirm', userController.confirmEmailVerification);

// Score history
router.get('/me/score-history', userController.getScoreHistory);

// Upload routes (Actual upload logic integrated)
router.post('/me/photo', uploadProfilePhoto, userController.uploadPhoto);
router.post('/me/id-document', uploadIdDocument, userController.uploadIdDocument);
router.post('/me/company-logo', uploadProfilePhoto, userController.uploadCompanyLogo);

// Public profile routes
router.get('/search', userController.searchUsers);
router.get('/:username', userController.getUserByUsername);

module.exports = router;
