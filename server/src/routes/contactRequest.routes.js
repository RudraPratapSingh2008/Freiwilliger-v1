const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  createContactRequest,
  getMyRequests,
  respondToRequest,
  revealContact,
} = require('../controllers/contactRequest.controller');

const router = express.Router();

// POST /api/v1/contact-requests — Create request (organiser only)
router.post('/', verifyToken, createContactRequest);

// GET /api/v1/contact-requests/mine — Get organiser's requests
router.get('/mine', verifyToken, getMyRequests);

// PATCH /api/v1/contact-requests/:id/volunteer-response — Approve/deny
router.patch('/:id/volunteer-response', verifyToken, respondToRequest);

// GET /api/v1/contact-requests/:id/reveal — View approved details
router.get('/:id/reveal', verifyToken, revealContact);

module.exports = router;
