const express = require('express');
const {
  getServices,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Public route
router.get('/', getServices);

// Admin-only routes
router.post('/', auth, roleAuth('admin'), createService);
router.put('/:id', auth, roleAuth('admin'), updateService);
router.delete('/:id', auth, roleAuth('admin'), deleteService);

module.exports = router;
