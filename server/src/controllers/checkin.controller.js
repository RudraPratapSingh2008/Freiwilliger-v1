const crypto = require('crypto');
const Event = require('../models/Event.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

/**
 * GET /events/:id/checkin-qr
 * Generates a unique check-in token for an event (Organiser only).
 * Stores the token on the event document for later validation.
 */
const generateCheckinQR = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return errorResponse(res, 'Event not found.', 404);

    if (event.organiserId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized — only the event organiser can generate QR.', 403);
    }

    // Generate a unique token and store it on the event
    const token = crypto.randomBytes(16).toString('hex');
    event.checkinToken = token;
    await event.save();

    return successResponse(res, { token }, 'Check-in QR token generated.');
  } catch (error) {
    console.error('Error generating checkin QR:', error);
    return errorResponse(res, 'Failed to generate check-in QR.', 500);
  }
};

/**
 * POST /events/:id/checkin
 * Volunteer scans QR code and sends { token } to validate check-in.
 * Marks their attendance as true.
 */
const validateCheckin = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) return errorResponse(res, 'Token is required.', 400);

    const event = await Event.findById(eventId);
    if (!event) return errorResponse(res, 'Event not found.', 404);

    // Validate that the token matches
    if (!event.checkinToken || event.checkinToken !== token) {
      return errorResponse(res, 'Invalid check-in token.', 400);
    }

    // Verify volunteer is selected for this event
    const isSelected = event.selectedVolunteers.some(
      (volId) => volId.toString() === userId.toString()
    );
    if (!isSelected) {
      return errorResponse(res, 'You are not selected for this event.', 403);
    }

    // Mark attendance
    const existingIndex = event.attendanceLog.findIndex(
      (log) => log.volunteerId.toString() === userId.toString()
    );

    if (existingIndex !== -1) {
      event.attendanceLog[existingIndex].attended = true;
      event.attendanceLog[existingIndex].markedAt = Date.now();
    } else {
      event.attendanceLog.push({
        volunteerId: userId,
        attended: true,
        markedAt: Date.now(),
        markedBy: event.organiserId,
      });
    }

    await event.save();

    return successResponse(res, null, 'Check-in successful! Attendance marked.');
  } catch (error) {
    console.error('Error validating checkin:', error);
    return errorResponse(res, 'Failed to validate check-in.', 500);
  }
};

module.exports = { generateCheckinQR, validateCheckin };
