const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'cancelled', 'completed'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'cash_pending'],
        default: 'pending'
    },
    reason: {
        type: String
    },
    notes: {
        type: String
    },
    type: {
        type: String,
        enum: ['In-person', 'Virtual'],
        default: 'In-person'
    },
    roomID: {
        type: String
    },
    symptoms: {
        type: String
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    shortTermReminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);