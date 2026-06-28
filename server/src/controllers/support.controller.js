const Report = require('../models/Report.model');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

// ─── POST /support/report ───────────────────────────────────────────────────

const createReport = async (req, res) => {
  try {
    const { category, subject, description } = req.body;

    // ── Validate required fields ────────────────────────────────────────
    if (!category || !subject || !description) {
      return errorResponse(res, 'category, subject, and description are required.', 400);
    }

    // ── Validate description length ─────────────────────────────────────
    if (description.length < 20) {
      return errorResponse(res, 'Description must be at least 20 characters.', 400);
    }

    // ── Build report data ───────────────────────────────────────────────
    const reportData = {
      userId: req.user._id,
      category,
      subject,
      description,
    };

    // If a file was uploaded via middleware, attach the URL
    if (req.fileUrl) {
      reportData.screenshotUrl = req.fileUrl;
    }

    // ── Create and save report ──────────────────────────────────────────
    const report = await Report.create(reportData);

    return successResponse(res, report, 'Report submitted successfully.', 201);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, messages.join(' '), 400);
    }
    console.error('Error creating report:', error);
    return errorResponse(res, 'Failed to create report.', 500);
  }
};

module.exports = {
  createReport,
};
