const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// Create doctor (Admin only)
const createDoctor = async (req, res) => {
    try {
        const { name, email, password, specialization, availableTime, phone } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Find max room number among all doctors
        const lastDoctor = await User.findOne({ role: 'doctor' })
            .sort({ roomNumber: -1 });
            
        const nextRoomNumber = lastDoctor && lastDoctor.roomNumber 
            ? lastDoctor.roomNumber + 1 
            : 101;
            
        // Create doctor
        const doctor = new User({
            name,
            email,
            password,
            specialization,
            availableTime,
            phone,
            role: 'doctor',
            roomNumber: nextRoomNumber
        });
        
        await doctor.save();
        
        res.status(201).json({
            message: 'Doctor created successfully',
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                roomNumber: doctor.roomNumber
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const stats = {
            totalPatients: await User.countDocuments({ role: 'patient' }),
            totalDoctors: await User.countDocuments({ role: 'doctor' }),
            totalAppointments: await Appointment.countDocuments(),
            todayAppointments: await Appointment.countDocuments({
                date: { $gte: today, $lt: tomorrow }
            }),
            pendingAppointments: await Appointment.countDocuments({ status: 'pending' }),
            approvedAppointments: await Appointment.countDocuments({ status: 'approved' })
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        
        const query = {};
        if (status) query.status = status;
        
        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization roomNumber')
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Appointment.countDocuments(query);
        
        res.json({
            appointments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Manage system settings
const updateSystemSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        // Implement settings update logic
        // This could be stored in a separate Settings model or environment
        
        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Broadcast message to all users
const broadcastMessage = async (req, res) => {
    try {
        const { title, message } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }
        
        // Find all non-admin users
        const users = await User.find({ role: { $ne: 'admin' } }).select('_id');
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found to broadcast to' });
        }
        
        // Create notifications for all users
        const notifications = users.map(user => ({
            userId: user._id,
            title: 'Announcement from Admin',
            message: `${title}: ${message}`,
            type: 'system'
        }));
        
        await Notification.insertMany(notifications);
        
        res.json({ 
            message: 'Broadcast message sent successfully', 
            userCount: users.length 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createDoctor,
    getDashboardStats,
    getAllAppointments,
    updateSystemSettings,
    broadcastMessage
};
