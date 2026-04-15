const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    hospitalName: {
        type: String,
        default: 'Swami Dayanand Hospital'
    },
    hospitalEmail: {
        type: String,
        default: 'info@swamidayanandhospital.in'
    },
    hospitalPhone: {
        type: String,
        default: '+91 11 2258 8585'
    },
    hospitalAddress: {
        type: String,
        default: 'Shahdara North Zone, Dilshad Garden New Delhi, Delhi 110095'
    },
    appointmentDuration: {
        type: Number,
        default: 30
    },
    workingHoursStart: {
        type: String,
        default: '08:00'
    },
    workingHoursEnd: {
        type: String,
        default: '20:00'
    },
    consultationFee: {
        type: Number,
        default: 500
    },
    emergencyFee: {
        type: Number,
        default: 1000
    },
    currency: {
        type: String,
        default: 'INR'
    },
    notifyOnNewAppointment: {
        type: Boolean,
        default: true
    },
    notifyOnCancellation: {
        type: Boolean,
        default: true
    },
    smsNotifications: {
        type: Boolean,
        default: false
    },
    emailNotifications: {
        type: Boolean,
        default: true
    },
    followupFee: {
        type: Number,
        default: 300
    },
    sessionTimeout: {
        type: Number,
        default: 60
    },
    twoFactorAuth: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
