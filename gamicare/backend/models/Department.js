const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        trim: true,
        minlength: [2, 'Name must be at least 2 characters']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    icon: {
        type: String,
        default: 'FaHospital' // Default icon if none provided
    },
    isActive: {
        type: Boolean,
        default: true
    },
    doctorCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster searching
departmentSchema.index({ name: 1 });

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
