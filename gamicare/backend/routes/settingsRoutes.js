const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route for landing page stats
router.get('/public/stats', settingsController.getPublicStats);

// Public route for hospital info (used in landing page)
router.get('/', settingsController.getSettings);

// Admin-only: Update settings
router.put('/', protect, authorize('admin'), settingsController.updateSettings);

module.exports = router;
