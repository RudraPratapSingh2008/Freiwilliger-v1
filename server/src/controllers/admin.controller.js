const User = require('../models/User.model');
const Event = require('../models/Event.model');
const Report = require('../models/Report.model');
const ContactRequest = require('../models/ContactRequest.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

// ─── GET /admin/users ───────────────────────────────────────────────────────
// Paginated, filterable by role/accountStatus, searchable by username/name
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, accountStatus, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (accountStatus) query.accountStatus = accountStatus;
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { 'volunteerProfile.fullName': new RegExp(search, 'i') },
        { 'organiserProfile.fullName': new RegExp(search, 'i') },
        { 'organiserProfile.companyName': new RegExp(search, 'i') },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshTokens')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return successResponse(res, {
      users,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    }, 'Users fetched successfully.');
  } catch (error) {
    console.error('Error fetching users (admin):', error);
    return errorResponse(res, 'Failed to fetch users.', 500);
  }
};

// ─── PATCH /admin/users/:id/ban ─────────────────────────────────────────────
const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) return errorResponse(res, 'User not found.', 404);
    return successResponse(res, user, 'User banned successfully.');
  } catch (error) {
    console.error('Error banning user:', error);
    return errorResponse(res, 'Failed to ban user.', 500);
  }
};

// ─── PATCH /admin/users/:id/unban ───────────────────────────────────────────
const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) return errorResponse(res, 'User not found.', 404);
    return successResponse(res, user, 'User unbanned successfully.');
  } catch (error) {
    console.error('Error unbanning user:', error);
    return errorResponse(res, 'Failed to unban user.', 500);
  }
};

// ─── GET /admin/reports ─────────────────────────────────────────────────────
// Paginated, filterable by status
const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};

    if (status) query.status = status;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('userId', 'username role')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return successResponse(res, {
      reports,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    }, 'Reports fetched successfully.');
  } catch (error) {
    console.error('Error fetching reports (admin):', error);
    return errorResponse(res, 'Failed to fetch reports.', 500);
  }
};

// ─── PATCH /admin/reports/:id ───────────────────────────────────────────────
// Update report status
const updateReport = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
      return errorResponse(res, 'Invalid status. Must be open, in_progress, or resolved.', 400);
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'username role');

    if (!report) return errorResponse(res, 'Report not found.', 404);
    return successResponse(res, report, 'Report updated successfully.');
  } catch (error) {
    console.error('Error updating report:', error);
    return errorResponse(res, 'Failed to update report.', 500);
  }
};

// ─── GET /admin/contact-requests ────────────────────────────────────────────
// Get pending contact requests (paginated)
const getContactRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { status: 'pending' };

    const total = await ContactRequest.countDocuments(query);
    const contactRequests = await ContactRequest.find(query)
      .populate('organiserId', 'username organiserProfile.companyName organiserProfile.fullName')
      .populate('volunteerId', 'username volunteerProfile.fullName')
      .populate('eventId', 'eventName')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return successResponse(res, {
      contactRequests,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    }, 'Contact requests fetched successfully.');
  } catch (error) {
    console.error('Error fetching contact requests (admin):', error);
    return errorResponse(res, 'Failed to fetch contact requests.', 500);
  }
};

// ─── PATCH /admin/contact-requests/:id/approve ──────────────────────────────
const approveContactRequest = async (req, res) => {
  try {
    const contactRequest = await ContactRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved_by_volunteer' },
      { new: true }
    );

    if (!contactRequest) return errorResponse(res, 'Contact request not found.', 404);
    return successResponse(res, contactRequest, 'Contact request approved.');
  } catch (error) {
    console.error('Error approving contact request:', error);
    return errorResponse(res, 'Failed to approve contact request.', 500);
  }
};

// ─── GET /admin/stats ───────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalVolunteers, totalOrganisers, totalEvents, activeEvents, openReports] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'organiser' }),
      Event.countDocuments(),
      Event.countDocuments({ status: { $in: ['open', 'active'] } }),
      Report.countDocuments({ status: 'open' }),
    ]);

    return successResponse(res, {
      totalUsers,
      totalVolunteers,
      totalOrganisers,
      totalEvents,
      activeEvents,
      openReports,
    }, 'Stats fetched successfully.');
  } catch (error) {
    console.error('Error fetching stats:', error);
    return errorResponse(res, 'Failed to fetch stats.', 500);
  }
};

module.exports = {
  getUsers,
  banUser,
  unbanUser,
  getReports,
  updateReport,
  getContactRequests,
  approveContactRequest,
  getStats,
};
