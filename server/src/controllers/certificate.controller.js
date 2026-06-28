const Event = require('../models/Event.model');
const User = require('../models/User.model');
const { generateCertificate } = require('../services/certificate.service');
const { errorResponse } = require('../utils/apiResponse.utils');

/**
 * GET /events/:id/certificate
 * Download a participation certificate (Volunteer only).
 * Requires that the volunteer attended the event.
 */
const downloadCertificate = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return errorResponse(res, 'Event not found', 404);

    // Verify volunteer attended
    const attendanceRecord = event.attendanceLog?.find(
      (log) => log.volunteerId.toString() === userId.toString() && log.attended === true
    );
    if (!attendanceRecord) {
      return errorResponse(res, 'You must have attended this event to get a certificate', 403);
    }

    const user = await User.findById(userId);
    const volunteerName = user.volunteerProfile?.fullName || user.username;
    const eventDate = new Date(event.dateTime?.start).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const pdfBuffer = await generateCertificate({
      volunteerName,
      eventName: event.eventName,
      eventDate,
      organiserId: event.organiserId,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${eventId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating certificate:', error);
    return errorResponse(res, 'Failed to generate certificate', 500);
  }
};

module.exports = { downloadCertificate };
