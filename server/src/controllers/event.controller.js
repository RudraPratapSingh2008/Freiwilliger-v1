
const { validationResult } = require('express-validator');
const Event = require('../models/Event.model');
const Conversation = require('../models/Conversation.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

/**
 * GET /events/feed
 * Uses MongoDB $near query with 50km radius
 */
const getEventFeed = async (req, res) => {
  try {
    const { lat, lng, category, paymentType, minPay, genderPreference, distance = 50 } = req.query;

    const query = { status: 'open', isDeleted: false };

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(distance) * 1000, // Convert km to meters
        },
      };
    }

    if (category) query.category = category;
    if (paymentType) query['compensation.paymentType'] = paymentType;
    if (minPay) query['compensation.amount'] = { $gte: parseFloat(minPay) };
    if (genderPreference) query['requirements.genderPreference'] = { $in: [genderPreference, 'Any'] };

    const events = await Event.find(query)
      .populate('organiserId', 'username organiserProfile')
      .sort('-createdAt')
      .limit(20);

    return successResponse(res, events, 'Event feed fetched successfully');
  } catch (error) {
    console.error('[getEventFeed]', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * POST /events
 * Organiser only, creates event, auto-generates groupChatId
 */
const createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    if (req.user.role !== 'organiser') {
      return errorResponse(res, 'Only organisers can create events', 403);
    }

    const eventData = {
      ...req.body,
      organiserId: req.user._id,
      status: 'open', // Default to open for now
    };

    const event = await Event.create(eventData);

    // Create group chat for the event
    const groupChat = await Conversation.create({
      type: 'group',
      eventId: event._id,
      groupName: `📢 Group · ${event.eventName}`,
      participants: [req.user._id],
    });

    event.groupChatId = groupChat._id;
    await event.save();

    return successResponse(res, event, 'Event created successfully', 201);
  } catch (error) {
    console.error('[createEvent]', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * GET /events/:id
 */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organiserId', 'username organiserProfile')
      .populate('selectedVolunteers', 'username volunteerProfile');

    if (!event || event.isDeleted) {
      return errorResponse(res, 'Event not found', 404);
    }

    return successResponse(res, event, 'Event details fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};



/**
 * POST /events/:id/mark-attendance
 * sets attended: true/false, triggers score job
 */
const markAttendance = async (req, res) => {
  try {
    const { volunteerId, attended } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return errorResponse(res, 'Event not found', 404);
    if (event.organiserId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized', 403);
    }

    const existingLogIndex = event.attendanceLog.findIndex(
      (log) => log.volunteerId.toString() === volunteerId
    );

    if (existingLogIndex > -1) {
      event.attendanceLog[existingLogIndex].attended = attended;
      event.attendanceLog[existingLogIndex].markedAt = Date.now();
      event.attendanceLog[existingLogIndex].markedBy = req.user._id;
    } else {
      event.attendanceLog.push({
        volunteerId,
        attended,
        markedBy: req.user._id,
      });
    }

    await event.save();

    return successResponse(res, null, 'Attendance marked successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getEventFeed,
  createEvent,
  getEventById,

  markAttendance,
};
