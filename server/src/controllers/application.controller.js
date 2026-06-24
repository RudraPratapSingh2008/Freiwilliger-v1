const Event = require('../models/Event.model');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');
const { emitToUser, NOTIFICATION_TYPES } = require('../services/notification.service');
const {
  createGroupChat,
  addParticipantToGroupChat,
  removeParticipantFromGroupChat,
} = require('../services/conversation.service');
const { filterProfileForViewer, calcSkillsMatch } = require('../middleware/profileFilter.middleware');
const { validationResult } = require('express-validator');

/**
 * POST /events/:id/apply
 * - Check volunteer not already applied
 * - Push to event.applications array with status: 'pending'
 * - Emit Socket.io notification to organiser
 */
const applyToEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { id: eventId } = req.params;
    const volunteerId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return errorResponse(res, 'Event not found', 404);

    // Check if already applied (including withdrawn/rejected)
    const existingApplication = event.applications.find(
      (app) => app.volunteerId.toString() === volunteerId.toString()
    );

    if (existingApplication) {
      if (existingApplication.status === 'withdrew') {
        // Allow re-applying if they previously withdrew? 
        // Spec says "don't remove from array" for withdraw, 
        // but doesn't specify if they can re-apply. 
        // Usually, re-applying updates the status back to pending.
        existingApplication.status = 'pending';
        existingApplication.appliedAt = Date.now();
      } else {
        return errorResponse(res, 'You have already applied for this event', 400);
      }
    } else {
      event.applications.push({
        volunteerId,
        status: 'pending',
      });
    }

    await event.save();

    // Emit notification to organiser
    emitToUser(event.organiserId, 'notification', {
      type: NOTIFICATION_TYPES.NEW_APPLICANT,
      eventId,
      volunteerId,
      message: `New applicant for your event: ${event.eventName}`,
    });

    return successResponse(res, null, 'Application submitted successfully');
  } catch (error) {
    console.error('[applyToEvent]', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * DELETE /events/:id/apply
 * - Set application status to 'withdrew' (don't remove from array)
 */
const withdrawApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { id: eventId } = req.params;
    const volunteerId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return errorResponse(res, 'Event not found', 404);

    const application = event.applications.find(
      (app) => app.volunteerId.toString() === volunteerId.toString()
    );

    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }

    application.status = 'withdrew';
    application.updatedAt = Date.now();

    await event.save();

    return successResponse(res, null, 'Application withdrawn successfully');
  } catch (error) {
    console.error('[withdrawApplication]', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * PATCH /events/:id/applicants/:userId
 * - Body: { action: 'select' | 'reject' | 'shortlist' }
 * - Update application.status accordingly
 * - If selected: add to event.selectedVolunteers + emit notification
 * - If rejected: emit notification
 */
const respondToApplicant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { id: eventId, userId } = req.params;
    const { action } = req.body;

    if (!['select', 'reject', 'shortlist'].includes(action)) {
      return errorResponse(res, 'Invalid action. Use select, reject, or shortlist.', 400);
    }

    const event = await Event.findById(eventId);
    if (!event) return errorResponse(res, 'Event not found', 404);

    // Check if requester is the organiser
    if (event.organiserId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Only the organiser can respond to applicants', 403);
    }

    const application = event.applications.find(
      (app) => app.volunteerId.toString() === userId
    );

    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }

    const oldStatus = application.status;
    application.status = action === 'select' ? 'selected' : action === 'reject' ? 'rejected' : 'shortlisted';
    application.updatedAt = Date.now();

    if (action === 'select' && oldStatus !== 'selected') {
      // Add to selectedVolunteers if not already there
      if (!event.selectedVolunteers.includes(userId)) {
        event.selectedVolunteers.push(userId);
      }

      // Create the group chat on the first selection, otherwise add to it
      if (!event.groupChatId) {
        const groupChat = await createGroupChat(
          eventId,
          event.organiserId,
          event.selectedVolunteers
        );
        event.groupChatId = groupChat._id;
      } else {
        await addParticipantToGroupChat(event.groupChatId, userId);
      }

      // Emit notification to volunteer
      emitToUser(userId, 'notification', {
        type: NOTIFICATION_TYPES.SELECTED,
        eventId,
        message: `Congratulations! You have been selected for: ${event.eventName}`,
      });
    } else if (action === 'reject' && oldStatus !== 'rejected') {
      // Remove from selected if they were previously selected
      event.selectedVolunteers = event.selectedVolunteers.filter(
        (v) => v.toString() !== userId
      );

      // Remove from group chat
      if (event.groupChatId) {
        await removeParticipantFromGroupChat(event.groupChatId, userId);
      }

      // Emit notification to volunteer
      emitToUser(userId, 'notification', {
        type: NOTIFICATION_TYPES.REJECTED,
        eventId,
        message: `Your application for ${event.eventName} was not selected this time.`,
      });
    } else if (action === 'shortlist') {
      // Just update status, no special side effects or notifications defined in spec
    }

    await event.save();

    return successResponse(res, null, `Applicant ${action}ed successfully`);
  } catch (error) {
    console.error('[respondToApplicant]', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * GET /events/:id/applicants
 * - Organiser only
 * - Populate volunteer profiles with visibility filter applied
 * - Include skillsMatchPercent
 */
const getApplicants = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { id: eventId } = req.params;

    const event = await Event.findById(eventId).populate({
      path: 'applications.volunteerId',
      select: 'username volunteerProfile visibilityPrefs role location',
    });

    if (!event) return errorResponse(res, 'Event not found', 404);

    // Organiser only check
    if (event.organiserId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Only the organiser can view applicants', 403);
    }

    const requiredSkills = event.requirements?.requiredSkills || [];

    const applicants = event.applications.map((app) => {
      const volunteer = app.volunteerId;
      if (!volunteer) return null;

      // Apply visibility filter
      const filteredProfile = filterProfileForViewer(volunteer, 'organiser', true);

      // Calculate skills match
      const skillsMatchPercent = calcSkillsMatch(
        volunteer.volunteerProfile?.skills || [],
        requiredSkills
      );

      return {
        ...filteredProfile,
        applicationStatus: app.status,
        appliedAt: app.appliedAt,
        skillsMatchPercent,
      };
    }).filter(Boolean);

    return successResponse(res, applicants, 'Applicants fetched successfully');
  } catch (error) {
    console.error('[getApplicants]', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  applyToEvent,
  withdrawApplication,
  respondToApplicant,
  getApplicants,
};