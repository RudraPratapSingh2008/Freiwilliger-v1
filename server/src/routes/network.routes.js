const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  requestConnection,
  removeConnection,
  getNetwork,
  addFavourite,
  removeFavourite,
  getFavourites,
  blockUser,
  unblockUser,
} = require('../controllers/network.controller');

const router = express.Router();

router.use(verifyToken);

// Favourites
router.post('/favourites/:userId', addFavourite);
router.delete('/favourites/:userId', removeFavourite);
router.get('/favourites', getFavourites);

// Block
router.post('/block/:userId', blockUser);
router.delete('/block/:userId', unblockUser);

// Network connections
router.post('/request/:userId', requestConnection);
router.delete('/:userId', removeConnection);
router.get('/', getNetwork);

module.exports = router;
