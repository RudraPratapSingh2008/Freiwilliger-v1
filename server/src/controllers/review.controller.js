const mongoose = require('mongoose');
const Review = require('../models/Review.model');
const Event = require('../models/Event.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

// ─── Constants ──────────────────────────────────────────────────────────────

const REVIEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// ─── POST /reviews ──────────────────────────────────────────────────────────

const createReview = async (req, res) => {
  try {
    const { eventId, revieweeId, stars, text, noShow } = req.body;
    const reviewerId = req.user._id;

    // ── Basic field validation ───────────────────────────────────────────
    if (!eventId || !revieweeId || stars == null) {
      return errorResponse(res, 'eventId, revieweeId, and stars are required.', 400);
    }

    if (stars < 1 || stars > 5) {
      return errorResponse(res, 'Stars must be between 1 and 5.', 400);
    }

    // Cannot review yourself
    if (reviewerId.toString() === revieweeId.toString()) {
      return errorResponse(res, 'You cannot review yourself.', 400);
    }

    // ── Fetch event and validate ─────────────────────────────────────────
    const event = await Event.findById(eventId);
    if (!event) {
      return errorResponse(res, 'Event not found.', 404);
    }

    if (event.status !== 'completed') {
      return errorResponse(res, 'Reviews can only be submitted for completed events.', 400);
    }

    // ── Review window: 7 days after event end ────────────────────────────
    const endDate = new Date(event.dateTime.end);
    const windowClose = new Date(endDate.getTime() + REVIEW_WINDOW_MS);

    if (Date.now() > windowClose.getTime()) {
      return errorResponse(res, 'The review window for this event has closed.', 400);
    }

    // ── Eligibility: reviewer must be organiser or attended volunteer ────
    const isOrganiser = event.organiserId.toString() === reviewerId.toString();
    const attendedEntry = event.attendanceLog.find(
      (log) => log.volunteerId.toString() === reviewerId.toString() && log.attended === true
    );

    if (!isOrganiser && !attendedEntry) {
      return errorResponse(
        res,
        'You must have attended this event or be its organiser to submit a review.',
        403
      );
    }

    // ── Determine review type from role ──────────────────────────────────
    const reviewType =
      req.user.role === 'organiser'
        ? 'organiser_to_volunteer'
        : 'volunteer_to_organiser';

    // ── Create review ────────────────────────────────────────────────────
    const review = new Review({
      eventId,
      reviewerId,
      revieweeId,
      reviewType,
      stars,
      comment: text || '',
      isNoShow: Boolean(noShow),
    });

    await review.save();

    return successResponse(res, review, 'Review submitted successfully.', 201);
  } catch (error) {
    // Duplicate review — unique index violation
    if (error.code === 11000) {
      return errorResponse(
        res,
        'You have already submitted a review for this person for this event.',
        409
      );
    }
    console.error('Error creating review:', error);
    return errorResponse(res, 'Failed to create review.', 500);
  }
};

// ─── GET /reviews/user/:userId ──────────────────────────────────────────────

const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch visible reviews for this user
    const reviews = await Review.find({ revieweeId: userId, isVisible: true })
      .populate(
        'reviewerId',
        'username role volunteerProfile.profilePhoto organiserProfile.profilePhoto organiserProfile.logo'
      )
      .sort({ createdAt: -1 });

    // Compute average stars via aggregation
    const revieweeObjectId = new mongoose.Types.ObjectId(userId);
    const [aggregation] = await Review.aggregate([
      { $match: { revieweeId: revieweeObjectId, isVisible: true } },
      { $group: { _id: null, averageStars: { $avg: '$stars' }, totalReviews: { $count: {} } } },
    ]);

    // If no reviews exist the aggregation returns nothing
    const averageStars = aggregation ? Math.round(aggregation.averageStars * 10) / 10 : 0;
    const totalReviews = aggregation ? aggregation.totalReviews : 0;

    return successResponse(res, { reviews, averageStars, totalReviews }, 'User reviews fetched.');
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return errorResponse(res, 'Failed to fetch user reviews.', 500);
  }
};

// ─── GET /reviews/event/:eventId ────────────────────────────────────────────

const getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;

    const reviews = await Review.find({ eventId, isVisible: true })
      .populate(
        'reviewerId',
        'username role volunteerProfile.profilePhoto organiserProfile.profilePhoto organiserProfile.logo'
      )
      .populate(
        'revieweeId',
        'username role volunteerProfile.profilePhoto organiserProfile.profilePhoto organiserProfile.logo'
      )
      .sort({ createdAt: -1 });

    return successResponse(res, reviews, 'Event reviews fetched.');
  } catch (error) {
    console.error('Error fetching event reviews:', error);
    return errorResponse(res, 'Failed to fetch event reviews.', 500);
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getEventReviews,
};
