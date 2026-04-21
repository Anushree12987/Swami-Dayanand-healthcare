const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware'); // ← Import from here

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/availability', doctorController.getPublicAvailability);

// Protected doctor routes
router.use(protect); // ← Verify the user
router.use(authorize('doctor')); // ← Check if the user is a doctor

router.get('/dashboard/stats', doctorController.getDoctorDashboard);
router.get('/appointments/list', doctorController.getDoctorAppointments);
router.put('/appointments/:appointmentId/status', doctorController.updateAppointmentStatus);
router.post('/availability/slots', doctorController.addAvailabilitySlots);
router.get('/availability/slots', doctorController.getAvailabilitySlots);
router.put('/profile/update', doctorController.updateDoctorProfile);

module.exports = router