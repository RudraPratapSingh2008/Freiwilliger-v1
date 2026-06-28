const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { createReport } = require('../controllers/support.controller');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/report', verifyToken, upload.single('screenshot'), createReport);

module.exports = router;
