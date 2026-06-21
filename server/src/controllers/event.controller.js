const Event = require("../models/Event.model");
const User = require("../models/User.model");
const Conversation = require("../models/Conversation.model");
const { successResponse, errorResponse } = require("../utils/apiResponse.utils");
const { emitToUser } = require("../services/notification.service");
const { applyScoreDelta } = require("../services/score.service");
const { validationResult } = require("express-validator");

// Helper to create a group chat for an event
const createEventGroupChat = async (eventId, organiserId, volunteerIds) => {
  const participants = [organiserId, ...volunteerIds];
  const newConversation = new Conversation({
    type: "group",
    event: eventId,
    participants: participants,
    name: `Event Chat: ${eventId}` // This will be updated with event name later
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
      "location.coordinates": {
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

    return successResponse(res, events, "Event feed fetched successfully.");
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
      status: "draft", // Start as draft, organiser can publish later
    });

    await newEvent.save();

    return successResponse(res, newEvent, "Event created successfully.", 201);
  } catch (error) {
    console.error("Error creating event:", error);
    return errorResponse(res, "Failed to create event.", 500);
  }
};

// PATCH /events/:id/applicants/:userId - Select/reject applicant (Organiser only)
const manageApplicant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { id: eventId, userId: applicantId } = req.params;
    const { action } = req.body; // 'select' or 'reject'

    const event = await Event.findById(eventId);

    if (!event) {
      return errorResponse(res, "Event not found.", 404);
    }

    if (event.organiserId.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized to manage applicants for this event.", 403);
    }

    const applicationIndex = event.applications.findIndex(
      (app) => app.volunteerId.toString() === applicantId
    );

    if (applicationIndex === -1) {
      return errorResponse(res, "Applicant not found for this event.", 404);
    }

    const application = event.applications[applicationIndex];

    if (action === "select") {
      if (application.status === "selected") {
        return errorResponse(res, "Applicant already selected.", 400);
      }
      application.status = "selected";
      event.selectedVolunteers.push(applicantId);

      // Auto-create group chat if this is the first selected volunteer
      if (event.selectedVolunteers.length === 1 && !event.groupChatId) {
        const groupChatId = await createEventGroupChat(eventId, event.organiserId, event.selectedVolunteers);
        event.groupChatId = groupChatId;
      } else if (event.groupChatId) {
        // Add new selected volunteer to existing group chat
        await Conversation.findByIdAndUpdate(event.groupChatId, { $addToSet: { participants: applicantId } });
      }

      // Trigger notification to volunteer
      emitToUser(applicantId, "event_application_status", {
        eventId: event._id,
        eventName: event.eventName,
        status: "selected",
      });
    } else if (action === "reject") {
      if (application.status === "rejected") {
        return errorResponse(res, "Applicant already rejected.", 400);
      }
      application.status = "rejected";
      // Remove from selectedVolunteers if they were previously selected and then rejected
      event.selectedVolunteers = event.selectedVolunteers.filter(volId => volId.toString() !== applicantId);

      // Trigger notification to volunteer
      emitToUser(applicantId, "event_application_status", {
        eventId: event._id,
        eventName: event.eventName,
        status: "rejected",
      });
    } else {
      return errorResponse(res, "Invalid action. Must be 'select' or 'reject'.", 400);
    }

    application.updatedAt = Date.now();
    await event.save();

    return successResponse(res, event, `Applicant ${action}ed successfully.`);
  } catch (error) {
    console.error("Error managing applicant:", error);
    return errorResponse(res, "Failed to manage applicant.", 500);
  }
};

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

    await event.save();

    // Trigger score job (this would typically be an async background job or a direct call if simple)
    if (attended === false) {
      // Example: Apply penalty for no-show
      await applyScoreDelta(volunteerId, "helpScore", -10, "No-show penalty for event: " + event.eventName);
    } else {
      // Example: Apply positive score for attendance (if applicable, or handled by reviews)
      // await applyScoreDelta(volunteerId, "helpScore", 5, "Attended event: " + event.eventName);
    }

    return successResponse(res, event, "Attendance marked successfully.");
  } catch (error) {
    console.error("Error marking attendance:", error);
    return errorResponse(res, "Failed to mark attendance.", 500);
  }
};

module.exports = {
  getEventFeed,
  createEvent,
  manageApplicant,
  markAttendance,
};
