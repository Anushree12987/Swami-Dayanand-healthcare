const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create appointment
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, symptoms, type } = req.body;
        const patientId = req.user.userId;
        
        // Generate roomID for virtual appointments
        let roomID = null;
        if (type === 'Virtual') {
            const doctorName = (await User.findById(doctorId)).name.replace(/\s+/g, '-').toLowerCase();
            roomID = `gamicare-${doctorName}-${Date.now()}`;
        }
        
        // Check if date is in the past
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (appointmentDate < today) {
            return res.status(400).json({ message: 'Cannot book appointments in the past' });
        }
        
        // Check doctor availability
        const doctor = await User.findById(doctorId).select('name specialization qualification experience consultationFee rating profileImage bio roomNumber role');
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Check capacities
        const MAX_IN_PERSON = 3;
        const MAX_VIRTUAL = 1;

        const currentAppointments = await Appointment.find({
            doctorId,
            date: appointmentDate,
            time,
            status: { $in: ['pending', 'approved'] }
        });

        const virtualCount = currentAppointments.filter(a => a.type === 'Virtual').length;
        const inPersonCount = currentAppointments.filter(a => a.type === 'In-person').length;

        // Rule 1: If it's a Virtual booking, ensure no appointments exist in this slot
        if (type === 'Virtual') {
            if (currentAppointments.length > 0) {
                return res.status(400).json({ message: 'This time slot is occupied. Virtual consultations require a private session.' });
            }
        }

        // Rule 2: If it's an In-person booking, ensure no Virtual exists and In-person < 3
        if (type === 'In-person' || !type) {
            if (virtualCount > 0) {
                return res.status(400).json({ message: 'This time slot is booked for a virtual consultation.' });
            }
            if (inPersonCount >= MAX_IN_PERSON) {
                return res.status(400).json({ message: `This time slot has reached its maximum in-person capacity (${MAX_IN_PERSON} patients).` });
            }
        }
        
        // Create appointment
        const appointment = new Appointment({
            patientId,
            doctorId,
            date: appointmentDate,
            time,
            symptoms,
            type: type || 'In-person',
            roomID,
            amount: doctor.consultationFee || 500, // Dynamic fee with fallback
            status: 'pending'
        });
        
        await appointment.save();
        
        // Mark the slot as booked ONLY IF capacity is reached
        const updatedAppointments = await Appointment.find({
            doctorId,
            date: appointmentDate,
            time,
            status: { $in: ['pending', 'approved'] }
        });

        const isFull = (type === 'Virtual') || (updatedAppointments.length >= MAX_IN_PERSON);

        if (isFull) {
            await User.updateOne(
                { 
                    _id: doctorId,
                    'availabilitySlots.date': appointmentDate,
                    'availabilitySlots.startTime': time
                },
                {
                    $set: { 
                        'availabilitySlots.$.isBooked': true,
                        'availabilitySlots.$.appointmentId': appointment._id
                    }
                }
            );
        }
        
        // Create notifications
        await Notification.create([
            {
                userId: doctorId,
                title: 'New Appointment Request',
                message: `You have a new appointment request from ${req.user.name}`,
                type: 'appointment',
                relatedId: appointment._id
            },
            {
                userId: process.env.ADMIN_ID, // First admin ID from env
                title: 'New Appointment Booked',
                message: `A new appointment has been booked`,
                type: 'appointment',
                relatedId: appointment._id
            }
        ]);
        
        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get appointments for patient
const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.userId })
            .populate('doctorId', 'name specialization roomNumber')
            .sort({ date: -1 });
        
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get appointments for doctor
const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.user.userId })
            .populate('patientId', 'name email phone')
            .sort({ date: -1 });
        
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const appointment = await Appointment.findById(id).populate('patientId', 'name');
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        // Check if doctor owns this appointment
        if (req.user.role === 'doctor' && appointment.doctorId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Check if patient owns this appointment and is only cancelling
        if (req.user.role === 'patient') {
            const patientId = appointment.patientId._id || appointment.patientId;
            if (patientId.toString() !== req.user.userId) {
                return res.status(403).json({ message: 'Not authorized to modify this appointment' });
            }
            if (status !== 'cancelled') {
                return res.status(400).json({ message: 'Patients can only cancel appointments' });
            }
        }
        
        const oldStatus = appointment.status;
        appointment.status = status;
        await appointment.save();

        // Release the slot if appointment is cancelled
        if (status === 'cancelled') {
            try {
                await User.updateOne(
                    { 
                        _id: appointment.doctorId,
                        'availabilitySlots.appointmentId': appointment._id
                    },
                    {
                        $set: { 'availabilitySlots.$.isBooked': false }
                    }
                );

                // Create notification for doctor if patient cancelled
                if (req.user.role === 'patient') {
                    const dateStr = appointment.date instanceof Date ? appointment.date.toLocaleDateString() : 'scheduled date';
                    await Notification.create({
                        userId: appointment.doctorId,
                        title: 'Appointment Cancelled',
                        message: `Patient ${appointment.patientId?.name || 'A patient'} has cancelled their appointment on ${dateStr} at ${appointment.time}`,
                        type: 'appointment',
                        relatedId: appointment._id
                    });
                }
            } catch (notifyError) {
                console.error('Notification/Slot update error:', notifyError);
                // We don't fail the request if notification fails, the appointment is already saved as cancelled
            }
        }
        
        // Create notification for patient (if doctor/admin changed status)
        if (req.user.role !== 'patient') {
            await Notification.create({
                userId: appointment.patientId,
                title: `Appointment ${status}`,
                message: `Your appointment has been ${status}`,
                type: 'appointment',
                relatedId: appointment._id
            });
        }
        
        res.json({
            message: `Appointment ${status} successfully`,
            appointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Get today's appointments for doctor
const getTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const appointments = await Appointment.find({
            doctorId: req.user.userId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        })
        .populate('patientId', 'name email phone')
        .sort({ time: 1 });
        
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get upcoming appointments for doctor (next 7 days)
const getUpcomingAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const appointments = await Appointment.find({
            doctorId: req.user.userId,
            date: {
                $gte: today,
                $lt: nextWeek
            },
            status: { $in: ['approved', 'pending'] }
        })
        .populate('patientId', 'name email phone')
        .sort({ date: 1, time: 1 });
        
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get appointment by room ID
const getAppointmentByRoomID = async (req, res) => {
    try {
        const { roomID } = req.params;
        const appointment = await Appointment.findOne({ roomID })
            .populate('doctorId', 'name specialization profileImage')
            .populate('patientId', 'name');
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        // Ensure the requester is either the patient or the doctor
        if (req.user.userId !== appointment.patientId._id.toString() && 
            req.user.userId !== appointment.doctorId._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this room' });
        }
        
        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Payment Status (for Cash/Manual payments)
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        // Safety check: Only doctor can confirm 'paid', Patient can set 'cash_pending'
        if (paymentStatus === 'paid' && req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only medical staff can confirm payment' });
        }
        
        appointment.paymentStatus = paymentStatus;
        if (paymentStatus === 'paid' && !appointment.transactionId) {
            appointment.transactionId = `CASH-${Date.now()}`;
        }
        await appointment.save();
        
        // Notify patient if doctor marks it as paid
        if (paymentStatus === 'paid') {
            await Notification.create({
                userId: appointment.patientId,
                title: 'Payment Confirmed',
                message: `Your cash payment for the appointment has been confirmed by the doctor.`,
                type: 'appointment',
                relatedId: appointment._id
            });
        }
        
        res.json({
            success: true,
            message: `Payment status updated to ${paymentStatus}`,
            appointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    getTodayAppointments,
    getUpcomingAppointments,
    getAppointmentByRoomID,
    updatePaymentStatus
};