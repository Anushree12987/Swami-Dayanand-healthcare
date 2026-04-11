const Appointment = require('../models/Appointment');

// Initiate Mock eSewa payment
const initiateEsewa = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        // Return basic data for the Mock UI
        res.json({
            success: true,
            appointmentId: appointment._id,
            amount: appointment.amount || 500,
            merchant: "Gamicare Health"
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Verify Mock eSewa payment (Local Success Handler)
const verifyEsewa = async (req, res) => {
    try {
        const { oid, amt, refId } = req.body;
        
        const appointment = await Appointment.findById(oid);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        // Upgrade appointment status instantly
        appointment.paymentStatus = 'paid';
        appointment.transactionId = refId || `MOCK-${Date.now()}`;
        if (amt) appointment.amount = amt;
        await appointment.save();
        
        res.json({
            success: true,
            message: 'Mock payment verified successfully',
            appointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    initiateEsewa,
    verifyEsewa
};
