const express = require('express');
const {
  joinQueue,
  getQueueStatus,
  getServiceQueue,
  callNextToken,
  completeToken,
  getAdminStats
} = require('../controllers/queueController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// User routes
router.post('/join', auth, joinQueue);
router.get('/status', auth, getQueueStatus);

// Admin routes
router.get('/admin/stats', auth, roleAuth('admin'), getAdminStats);
router.get('/:serviceId', auth, roleAuth('admin'), getServiceQueue);
router.put('/next', auth, roleAuth('admin'), callNextToken);
router.put('/complete', auth, roleAuth('admin'), completeToken);

module.exports = router;
