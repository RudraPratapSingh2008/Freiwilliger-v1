const express = require("express");
const { body, param, query } = require("express-validator");
const { verifyToken } = require("../middleware/auth.middleware");
const { requireOrganiser, requireVolunteer } = require("../middleware/role.middleware");
const { getEventFeed, createEvent, markAttendance, getMyEventsVolunteer, getMyEventsOrganiser, getEventById } = require("../controllers/event.controller");
const {
  applyToEvent,
  withdrawApplication,
  respondToApplicant,
  getApplicants,
} = require("../controllers/application.controller");

const router = express.Router();

// Validation for event creation
const validateCreateEvent = [
  body("eventName").trim().notEmpty().withMessage("Event name is required.").isLength({ max: 120 }).withMessage("Event name cannot exceed 120 characters."),
  body("description").trim().notEmpty().withMessage("Description is required.").isLength({ max: 2000 }).withMessage("Description cannot exceed 2000 characters."),
  body("category").notEmpty().withMessage("Category is required.").isIn([
    "Conference", "Festival", "Sports", "Community Service",
    "Education", "Healthcare", "Environment", "Corporate",
    "Cultural", "Religious", "Fundraiser", "Other",
  ]).withMessage("Invalid event category."),
  body("location.lat").isFloat().withMessage("Latitude must be a number."),
  body("location.lng").isFloat().withMessage("Longitude must be a number."),
  body("location.address").trim().notEmpty().withMessage("Address is required."),
  body("location.city").trim().notEmpty().withMessage("City is required."),
  body("location.state").trim().notEmpty().withMessage("State is required."),
  body("location.pincode").trim().notEmpty().withMessage("Pincode is required.").isLength({ min: 6, max: 6 }).withMessage("Pincode must be 6 digits."),
  body("dateTime.start").isISO8601().toDate().withMessage("Start date/time must be a valid ISO 8601 date."),
  body("dateTime.end").isISO8601().toDate().withMessage("End date/time must be a valid ISO 8601 date.").custom((end, { req }) => {
    if (new Date(end) <= new Date(req.body.dateTime.start)) {
      throw new Error("End date/time must be after start date/time.");
    }
    return true;
  }),
  body("totalVolunteersNeeded").isInt({ min: 1 }).withMessage("Total volunteers needed must be at least 1."),
  body("requirements.genderPreference").optional().isIn(["Male", "Female", "Any"]).withMessage("Invalid gender preference."),
  body("requirements.requiredSkills").optional().isArray().withMessage("Required skills must be an array."),
  body("requirements.minHelpScore").optional().isInt({ min: 0, max: 100 }).withMessage("Minimum help score must be between 0 and 100."),
  body("requirements.minAge").optional().isInt({ min: 18 }).withMessage("Minimum age must be at least 18."),
  body("requirements.maxAge").optional().isInt().withMessage("Maximum age must be a number.").custom((maxAge, { req }) => {
    if (maxAge && req.body.requirements.minAge && maxAge < req.body.requirements.minAge) {
      throw new Error("Maximum age cannot be less than minimum age.");
    }
    return true;
  }),
  body("compensation.paymentType").optional().isIn(["paid", "unpaid", "certificate", "stipend"]).withMessage("Invalid payment type."),
  body("compensation.amount").optional().isFloat({ min: 0 }).withMessage("Compensation amount must be a non-negative number."),
];

// GET /events/feed - Public event feed
router.get(
  "/feed",
  [
    verifyToken,
    query("lat").isFloat().withMessage("Latitude is required and must be a number."),
    query("lng").isFloat().withMessage("Longitude is required and must be a number."),
    query("radius").optional().isFloat({ min: 1, max: 200 }).withMessage("Radius must be a number between 1 and 200km."),
  ],
  getEventFeed
);

// GET /events/my/volunteer - Volunteer's applied/selected events
router.get(
  "/my/volunteer",
  verifyToken,
  requireVolunteer,
  getMyEventsVolunteer
);

// GET /events/my/organiser - Organiser's posted events
router.get(
  "/my/organiser",
  verifyToken,
  requireOrganiser,
  getMyEventsOrganiser
);

// GET /events/:id - Single event detail
router.get(
  "/:id",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid event ID.")],
  getEventById
);

// POST /events - Create event (Organiser only)
router.post(
  "/",
  verifyToken,
  requireOrganiser,
  validateCreateEvent,
  createEvent
);

// POST /events/:id/apply - Apply to an event (Volunteer only)
router.post(
  "/:id/apply",
  verifyToken,
  requireVolunteer,
  [param("id").isMongoId().withMessage("Invalid event ID.")],
  applyToEvent
);

// DELETE /events/:id/apply - Withdraw application (Volunteer only)
router.delete(
  "/:id/apply",
  verifyToken,
  requireVolunteer,
  [param("id").isMongoId().withMessage("Invalid event ID.")],
  withdrawApplication
);

// GET /events/:id/applicants - List applicants with skills-match info (Organiser only)
router.get(
  "/:id/applicants",
  verifyToken,
  requireOrganiser,
  [param("id").isMongoId().withMessage("Invalid event ID.")],
  getApplicants
);

// PATCH /events/:id/applicants/:userId - Select/reject/shortlist applicant (Organiser only)
router.patch(
  "/:id/applicants/:userId",
  verifyToken,
  requireOrganiser,
  [
    param("id").isMongoId().withMessage("Invalid event ID."),
    param("userId").isMongoId().withMessage("Invalid user ID."),
    body("action").isIn(["select", "reject", "shortlist"]).withMessage("Action must be 'select', 'reject', or 'shortlist'."),
  ],
  respondToApplicant
);

// POST /events/:id/mark-attendance - Mark attendance (Organiser only)
router.post(
  "/:id/mark-attendance",
  verifyToken,
  requireOrganiser,
  [
    param("id").isMongoId().withMessage("Invalid event ID."),
    body("volunteerId").isMongoId().withMessage("Invalid volunteer ID."),
    body("attended").isBoolean().withMessage("Attended status must be a boolean."),
  ],
  markAttendance
);

module.exports = router;