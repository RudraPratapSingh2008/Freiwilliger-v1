const Event = require("../models/Event.model");
const User = require("../models/User.model");
const Conversation = require("../models/Conversation.model");
const { successResponse, errorResponse } = require("../utils/apiResponse.utils");
const { applyScoreDelta } = require("../services/score.service");
const { validationResult } = require("express-validator");

// Helper to create a group chat for an event
const createEventGroupChat = async (eventId, organiserId, volunteerIds) => {
  const participants = [organiserId, ...volunteerIds];
  const newConversation = new Conversation({
    type: "group",
    eventId,
    participants: participants,
    groupName: `Event Chat: ${eventId}` // This will be updated with event name later
  });
  await newConversation.save();
  return newConversation._id;
};

// GET /events/feed - Get events near user's location
const getEventFeed = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { lat, lng, radius = 50 } = req.query; // Default radius 50km

    if (!lat || !lng) {
      return errorResponse(res, "Latitude and longitude are required for event feed.", 400);
    }

    const events = await Event.find({
      status: "open",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radius * 1000, // radius in meters
        },
      },
    })
      .populate("organiserId", "username profilePhotoUrl")
      .sort({ "dateTime.start": 1 });

    const volunteerId = req.user?._id?.toString();
    const eventsWithApplicationStatus = events.map((event) => {
      const plainEvent = event.toObject({ virtuals: true });
      const matchedApplication = plainEvent.applications?.find(
        (application) => application.volunteerId?.toString() === volunteerId
      );

      return {
        ...plainEvent,
        applicationStatus: matchedApplication?.status || "none",
      };
    });

    return successResponse(res, eventsWithApplicationStatus, "Event feed fetched successfully.");
  } catch (error) {
    console.error("Error fetching event feed:", error);
    return errorResponse(res, "Failed to fetch event feed.", 500);
  }
};

// POST /events - Create a new event (Organiser only)
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    if (req.user.role !== "organiser") {
      return errorResponse(res, "Only organisers can create events.", 403);
    }

    const { eventName, description, category, location, dateTime, requirements, compensation, roles, totalVolunteersNeeded } = req.body;

    const newEvent = new Event({
      eventName,
      description,
      category,
      organiserId: req.user._id,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
        address: location.address,
        city: location.city,
        state: location.state,
        pincode: location.pincode,
      },
      dateTime,
      requirements,
      compensation,
      roles,
      totalVolunteersNeeded,
      status: "open",
    });

    await newEvent.save();

    if (!newEvent.groupChatId) {
      newEvent.groupChatId = await createEventGroupChat(newEvent._id, req.user._id, []);
      await newEvent.save();
    }

    return successResponse(res, newEvent, "Event created successfully.", 201);
  } catch (error) {
    console.error("Error creating event:", error);
    return errorResponse(res, "Failed to create event.", 500);
  }
};

// NOTE: Applicant select/reject/shortlist, apply, withdraw, and the applicants
// list now all live in controllers/application.controller.js (Day 18 spec).
// That version also handles 'shortlist' and keeps the group chat participants
// in sync on withdraw, which this one didn't.

// POST /events/:id/mark-attendance - Mark attendance for volunteers (Organiser only)
const markAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { id: eventId } = req.params;
    const { volunteerId, attended } = req.body; // attended: true/false

    const event = await Event.findById(eventId);

    if (!event) {
      return errorResponse(res, "Event not found.", 404);
    }

    if (event.organiserId.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized to mark attendance for this event.", 403);
    }

    // Check if the volunteer was selected for this event
    if (!event.selectedVolunteers.includes(volunteerId)) {
      return errorResponse(res, "Volunteer was not selected for this event.", 400);
    }

    // Check if attendance is already marked for this volunteer
    const existingAttendanceIndex = event.attendanceLog.findIndex(
      (log) => log.volunteerId.toString() === volunteerId
    );

    if (existingAttendanceIndex !== -1) {
      // Update existing attendance
      event.attendanceLog[existingAttendanceIndex].attended = attended;
      event.attendanceLog[existingAttendanceIndex].markedAt = Date.now();
      event.attendanceLog[existingAttendanceIndex].markedBy = req.user._id;
    } else {
      // Add new attendance log
      event.attendanceLog.push({
        volunteerId,
        attended,
        markedBy: req.user._id,
      });
    }

    // Check if all selected volunteers have their attendance marked
    const allMarked = event.selectedVolunteers.every((volId) =>
      event.attendanceLog.some((log) => log.volunteerId.toString() === volId.toString())
    );

    // Auto-complete the event when all attendance is marked
    if (allMarked && event.status !== 'completed') {
      event.status = 'completed';
    }

    await event.save();

    return successResponse(res, event, "Attendance marked successfully.");
  } catch (error) {
    console.error("Error marking attendance:", error);
    return errorResponse(res, "Failed to mark attendance.", 500);
  }
};

// GET /events/my/volunteer - Events the current volunteer has applied to or been selected for
const getMyEventsVolunteer = async (req, res) => {
  try {
    const volunteerId = req.user._id;

    const events = await Event.find({
      "applications.volunteerId": volunteerId,
    })
      .populate("organiserId", "username organiserProfile.companyName organiserProfile.fullName organiserProfile.logo organiserProfile.profilePhoto")
      .sort({ "dateTime.start": -1 });

    const eventsWithStatus = events.map((event) => {
      const plain = event.toObject({ virtuals: true });
      const application = plain.applications.find(
        (app) => app.volunteerId?.toString() === volunteerId.toString()
      );
      return {
        ...plain,
        applicationStatus: application?.status || "none",
      };
    });

    return successResponse(res, eventsWithStatus, "Your events fetched successfully.");
  } catch (error) {
    console.error("Error fetching volunteer events:", error);
    return errorResponse(res, "Failed to fetch your events.", 500);
  }
};

// GET /events/my/organiser - Events posted by the current organiser
const getMyEventsOrganiser = async (req, res) => {
  try {
    const events = await Event.find({
      organiserId: req.user._id,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 });

    return successResponse(res, events, "Your posted events fetched successfully.");
  } catch (error) {
    console.error("Error fetching organiser events:", error);
    return errorResponse(res, "Failed to fetch your events.", 500);
  }
};

// GET /events/:id - Single event detail
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organiserId", "username organiserProfile role location")
      .populate("selectedVolunteers", "username volunteerProfile.fullName volunteerProfile.profilePhoto volunteerProfile.helpScore");

    if (!event) {
      return errorResponse(res, "Event not found.", 404);
    }

    const plain = event.toObject({ virtuals: true });

    // Attach the requesting user's application status
    const userId = req.user?._id?.toString();
    const matchedApp = plain.applications?.find(
      (app) => app.volunteerId?.toString() === userId
    );
    plain.applicationStatus = matchedApp?.status || "none";

    return successResponse(res, plain, "Event fetched successfully.");
  } catch (error) {
    console.error("Error fetching event:", error);
    return errorResponse(res, "Failed to fetch event.", 500);
  }
};

// GET /events/discover - Discover events by state (case-insensitive, paginated)
const discoverByState = async (req, res) => {
  try {
    const { state, page = 1, limit = 20 } = req.query;
    if (!state) {
      return errorResponse(res, 'State parameter is required.', 400);
    }

    const query = {
      'location.state': new RegExp(`^${state}$`, 'i'),
      status: { $in: ['open', 'active'] },
    };

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organiserId', 'username profilePhotoUrl organiserProfile.companyName organiserProfile.fullName')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return successResponse(res, {
      events,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    }, 'Events discovered.');
  } catch (error) {
    console.error('Error discovering events by state:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getEventFeed,
  createEvent,
  markAttendance,
  getMyEventsVolunteer,
  getMyEventsOrganiser,
  getEventById,
  discoverByState,
};