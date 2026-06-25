const ContactRequest = require('../models/ContactRequest.model');
const Event = require('../models/Event.model');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');
const { emitToUser, NOTIFICATION_TYPES } = require('../services/notification.service');
const nodemailer = require('nodemailer');

// Set up Nodemailer transporter using env vars
// Note: This relies on SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS being in .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── POST /contact-requests ─────────────────────────────────────────────────

const createContactRequest = async (req, res) => {
  try {
    const { volunteerId, eventId, reason, details } = req.body;
    const organiserId = req.user._id;

    if (!volunteerId || !eventId || !reason) {
      return errorResponse(res, 'volunteerId, eventId, and reason are required.', 400);
    }

    // Check organiser hireScore
    const organiser = await User.findById(organiserId);
    if (!organiser || organiser.role !== 'organiser') {
      return errorResponse(res, 'Unauthorized.', 403);
    }
    if ((organiser.organiserProfile.hireScore || 0) <= 30) {
      return errorResponse(res, 'Your hireScore must be above 30 to request contact details.', 403);
    }

    // Check if volunteer is in event's selectedVolunteers
    const event = await Event.findById(eventId);
    if (!event) {
      return errorResponse(res, 'Event not found.', 404);
    }
    if (!event.selectedVolunteers.includes(volunteerId)) {
      return errorResponse(res, 'You can only request contact details of volunteers selected for your event.', 400);
    }

    // Create the request
    const contactRequest = new ContactRequest({
      organiserId,
      volunteerId,
      eventId,
      reason,
      details,
    });

    await contactRequest.save();

    // Send email to admin
    try {
      await transporter.sendMail({
        from: `"Freiwilliger System" <${process.env.SMTP_USER || 'no-reply@freiwilliger.com'}>`,
        to: process.env.ADMIN_EMAIL || 'admin@freiwilliger.com',
        subject: `New Contact Request from ${organiser.username}`,
        text: `Organiser ${organiser.username} requested contact details for volunteer ${volunteerId} (Event: ${eventId}).\nReason: ${reason}\nDetails: ${details || 'None'}\nRequest ID: ${contactRequest._id}`,
      });
    } catch (emailErr) {
      console.error('Failed to send admin email, but request created:', emailErr);
    }

    // Notify the volunteer in-app
    emitToUser(volunteerId.toString(), NOTIFICATION_TYPES.CONTACT_REQUEST_RECEIVED, {
      requestId: contactRequest._id,
      organiserId,
      organiserName: organiser.organiserProfile?.companyName || organiser.organiserProfile?.fullName || organiser.username,
      eventId,
      eventName: event.eventName,
      reason,
      details
    });

    return successResponse(res, contactRequest, 'Contact request submitted successfully.', 201);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 'You already have a pending request for this volunteer.', 409);
    }
    console.error('Error creating contact request:', error);
    return errorResponse(res, 'Failed to create contact request.', 500);
  }
};

// ─── GET /contact-requests/mine ─────────────────────────────────────────────

const getMyRequests = async (req, res) => {
  try {
    const organiserId = req.user._id;

    const requests = await ContactRequest.find({ organiserId })
      .populate('volunteerId', 'username volunteerProfile.fullName')
      .populate('eventId', 'eventName')
      .sort({ createdAt: -1 });

    return successResponse(res, requests, 'Your contact requests fetched.');
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return errorResponse(res, 'Failed to fetch contact requests.', 500);
  }
};

// ─── PATCH /contact-requests/:id/volunteer-response ─────────────────────────

const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved_by_volunteer' or 'denied_by_volunteer'
    const volunteerId = req.user._id;

    if (!['approved_by_volunteer', 'denied_by_volunteer'].includes(status)) {
      return errorResponse(res, 'Invalid status.', 400);
    }

    const contactRequest = await ContactRequest.findOne({ _id: id, volunteerId });

    if (!contactRequest) {
      return errorResponse(res, 'Contact request not found or unauthorized.', 404);
    }

    if (contactRequest.status !== 'pending') {
      return errorResponse(res, 'This request has already been responded to.', 400);
    }

    contactRequest.status = status;
    await contactRequest.save();

    // Notify organiser
    const notificationType = status === 'approved_by_volunteer' 
      ? NOTIFICATION_TYPES.CONTACT_REQUEST_APPROVED 
      : 'contact_request:denied';

    emitToUser(contactRequest.organiserId.toString(), notificationType, {
      requestId: contactRequest._id,
      volunteerId,
      volunteerName: req.user.volunteerProfile?.fullName || req.user.username,
      status
    });

    return successResponse(res, contactRequest, `Request ${status.split('_')[0]} successfully.`);
  } catch (error) {
    console.error('Error responding to contact request:', error);
    return errorResponse(res, 'Failed to respond to request.', 500);
  }
};

// ─── GET /contact-requests/:id/reveal ───────────────────────────────────────

const revealContact = async (req, res) => {
  try {
    const { id } = req.params;
    const organiserId = req.user._id;

    const contactRequest = await ContactRequest.findOne({ _id: id, organiserId });

    if (!contactRequest) {
      return errorResponse(res, 'Contact request not found.', 404);
    }

    if (contactRequest.status !== 'approved_by_volunteer') {
      return errorResponse(res, 'This request has not been approved by the volunteer.', 403);
    }

    const volunteer = await User.findById(contactRequest.volunteerId)
      .select('email phone volunteerProfile.fullName');

    if (!volunteer) {
      return errorResponse(res, 'Volunteer not found.', 404);
    }

    return successResponse(res, {
      email: volunteer.email,
      phone: volunteer.phone,
      name: volunteer.volunteerProfile?.fullName
    }, 'Contact details revealed successfully.');
  } catch (error) {
    console.error('Error revealing contact details:', error);
    return errorResponse(res, 'Failed to reveal contact details.', 500);
  }
};

module.exports = {
  createContactRequest,
  getMyRequests,
  respondToRequest,
  revealContact,
};
