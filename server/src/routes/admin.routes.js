const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/requireAdmin');
const {
  getUsers,
  banUser,
  unbanUser,
  getReports,
  updateReport,
  getContactRequests,
  approveContactRequest,
  getStats,
} = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(verifyToken);
router.use(requireAdmin);

// Users management
router.get('/users', getUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);

// Reports management
router.get('/reports', getReports);
router.patch('/reports/:id', updateReport);

// Contact requests management
router.get('/contact-requests', getContactRequests);
router.patch('/contact-requests/:id/approve', approveContactRequest);

// Platform statistics
router.get('/stats', getStats);

module.exports = router;
