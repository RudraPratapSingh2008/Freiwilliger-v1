
const express = require('express');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireOrganiser, requireVolunteer } = require('../middleware/role.middleware');
const eventController = require('../controllers/event.controller');
const applicationController = require('../controllers/application.controller');

const router = express.Router();

// Validation rules
const validateEventCreation = [
  body('eventName').trim().notEmpty().withMessage('Event name is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('category').notEmpty().withMessage('Category is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Valid coordinates are required'),
  body('dateTime.start').isISO8601().withMessage('Valid start date is required'),
  body('dateTime.end').isISO8601().withMessage('Valid end date is required'),
  body('totalVolunteersNeeded').isInt({ min: 1 }).withMessage('Total volunteers needed must be at least 1'),
];

// Public / Authenticated Feed
router.get('/feed', eventController.getEventFeed);

// Protected Routes
router.use(verifyToken);

// Event CRUD
router.post('/', requireOrganiser, validateEventCreation, eventController.createEvent);
router.get('/:id', eventController.getEventById);

// Applications
router.post('/:id/apply', requireVolunteer, applicationController.applyToEvent);
router.delete('/:id/apply', requireVolunteer, applicationController.withdrawApplication);

// Applicant Management (Organiser)
router.get('/:id/applicants', requireOrganiser, applicationController.getApplicants);
router.patch('/:id/applicants/:userId', requireOrganiser, applicationController.respondToApplicant);

// Attendance (Organiser)
router.post('/:id/mark-attendance', requireOrganiser, eventController.markAttendance);

module.exports = router;
