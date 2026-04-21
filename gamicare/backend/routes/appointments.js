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
router.get('/debug-auth', auth, (req, res) => res.json({ message: 'Authentication debug info', user: req.user }));
router.post('/', auth, role('patient'), createAppointment);
router.get('/patient', auth, role('patient'), getPatientAppointments);
router.get('/room/:roomID', auth, getAppointmentByRoomID);

// Doctor routes
router.get('/doctor', auth, role('doctor'), getDoctorAppointments);
router.get('/doctor/today', auth, role('doctor'), getTodayAppointments);        
router.get('/doctor/upcoming', auth, role('doctor'), getUpcomingAppointments);  
router.patch('/:id/status', auth, updateAppointmentStatus);
router.patch('/:id/payment-status', auth, updatePaymentStatus);

module.exports = router;