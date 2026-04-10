const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  searchUsers,
  sendFriendRequest,
  getRequests,
  acceptRequest,
  getFriends,
  removeFriend,
  blockUser
} = require('../controllers/friendController');

router.use(authMiddleware);
router.get('/', getFriends);
router.get('/search', searchUsers);
router.get('/requests', getRequests);
router.post('/requests', sendFriendRequest);
router.post('/requests/:id/accept', acceptRequest);
router.delete('/:id', removeFriend);
router.post('/block/:id', blockUser);

module.exports = router;
