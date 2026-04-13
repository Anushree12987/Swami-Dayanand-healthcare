const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// Get profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Count total appointments for this user
        const appointmentCount = await Appointment.countDocuments({ patientId: req.user.userId });
        
        // Return user with actual appointment count
        const userObj = user.toObject();
        userObj.totalAppointments = appointmentCount;
        userObj.roomNumber = user.roomNumber; // Ensure roomNumber is explicitly included
        
        res.json(userObj);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, address, medicalInfo } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        
        // Doctor specific fields
        if (req.body.specialization) user.specialization = req.body.specialization;
        if (req.body.consultationFee) user.consultationFee = req.body.consultationFee;
        if (req.body.experience) user.experience = req.body.experience;
        if (req.body.qualification) user.qualification = req.body.qualification;
        if (req.body.bio) user.bio = req.body.bio;
        if (req.body.hospital) user.hospital = req.body.hospital;
        
        // Update medical info if provided
        if (medicalInfo) {
            user.medicalInfo = {
                ...user.medicalInfo,
                ...medicalInfo
            };
        }

        await user.save();

        const appointmentCount = await Appointment.countDocuments({ patientId: user._id });

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                medicalInfo: user.medicalInfo,
                profilePicture: user.profilePicture,
                roomNumber: user.roomNumber,
                totalAppointments: appointmentCount,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword; // Model pre-save will hash it
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save the relative path
        user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
        await user.save();

        res.json({
            message: 'Profile picture updated successfully',
            profilePicture: user.profilePicture
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
