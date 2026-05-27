const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  requestConnection,
  removeConnection,
  getNetwork,
} = require('../controllers/network.controller');

const router = express.Router();

router.use(verifyToken);

router.post('/request/:userId', requestConnection);
router.delete('/:userId', removeConnection);
router.get('/', getNetwork);

module.exports = router;
