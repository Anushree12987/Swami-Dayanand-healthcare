const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
    createAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    getTodayAppointments,
    getUpcomingAppointments,
    getAppointmentByRoomID,
    updatePaymentStatus
} = require('../controllers/appointmentController');

// Patient routes
router.post('/', auth, role('patient'), createAppointment);
router.get('/patient', auth, role('patient'), getPatientAppointments);
router.get('/room/:roomID', auth, getAppointmentByRoomID);

// Doctor routes
router.get('/doctor', auth, role('doctor'), getDoctorAppointments);
router.get('/doctor/today', auth, role('doctor'), getTodayAppointments);        // Add this
router.get('/doctor/upcoming', auth, role('doctor'), getUpcomingAppointments);  // Add this
router.patch('/:id/status', auth, role('doctor', 'admin'), updateAppointmentStatus);
router.patch('/:id/payment-status', auth, updatePaymentStatus);

module.exports = router;