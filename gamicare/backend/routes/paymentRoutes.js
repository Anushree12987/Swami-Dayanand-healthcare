const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { initiateEsewa, verifyEsewa } = require('../controllers/paymentController');

// Initiate eSewa payment
router.post('/initiate-esewa', auth, initiateEsewa);
// Verify eSewa payment
router.post('/verify-esewa', auth, verifyEsewa);

module.exports = router;
