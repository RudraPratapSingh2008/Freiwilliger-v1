const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  createReview,
  getUserReviews,
  getEventReviews,
} = require('../controllers/review.controller');

const router = express.Router();

// POST /api/v1/reviews — submit a review (authenticated)
router.post('/', verifyToken, createReview);

// GET /api/v1/reviews/user/:userId — all reviews about a user (authenticated)
router.get('/user/:userId', verifyToken, getUserReviews);

// GET /api/v1/reviews/event/:eventId — all reviews for an event (authenticated)
router.get('/event/:eventId', verifyToken, getEventReviews);

module.exports = router;
