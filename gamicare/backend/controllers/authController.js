const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// Add JWT verification middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add role-based middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        next();
    };
};

// Get current user (for token verification)
const getCurrentUser = async (req, res) => {
    try {
        res.json({
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Patient Registration (Only patients can register)
// Patient Registration (Only patients can register)
const register = async (req, res) => {
    console.log('Registration request received:', req.body);

    try {
        const { name, email, password, phone, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Password hashing is handled automatically by the User model's pre-save middleware
        const userData = {
            name,
            email,
            password,
            role: 'patient'
        };
        if (phone) userData.phone = phone;
        if (address) userData.address = address;

        const user = new User(userData);

        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 11000) { // Duplicate key
            return res.status(400).json({ message: 'Email already exists' });
        }

        return res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};


// General login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'unregistered account  login first' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialization: user.specialization,
                roomNumber: user.roomNumber,
                profilePicture: user.profilePicture,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin-specific login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(404).json({ message: 'un regeisterd account pls login first' });
        }
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(401).json({ message: 'Admin access only' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Admin login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Doctor-specific login
const doctorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(404).json({ message: 'un regeisterd account pls login first' });
        }
        
        // Check if user is doctor
        if (user.role !== 'doctor') {
            return res.status(401).json({ message: 'Doctor access only' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Doctor login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialization: user.specialization,
                roomNumber: user.roomNumber,
                profilePicture: user.profilePicture,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Forgot Password -> Generate OTP and send email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email not found' });
        }
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save({ validateBeforeSave: false }); // Avoid triggering validation on other fields
        
        const message = `You are receiving this email because you requested a password reset.\n\nYour 6-digit Password Reset OTP is: ${otp}\n\nThis OTP is valid for 15 minutes.`;
        
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP - Swami Dayanand Healthcare',
                message
            });
            res.json({ message: 'OTP sent to email', email: user.email });
        } catch (error) {
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            console.error('Send email error:', error);
            return res.status(500).json({ message: 'Could not send email because email credentials are not configured or are invalid. Check .env' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reset Password with OTP
const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        
        if (!password || password.length < 6) {
             return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({ 
            email,
            resetPasswordOTP: otp
        }).select('+password');
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Expired OTP' });
        }
        
        user.password = password;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();
        
        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { 
    register, 
    login, 
    adminLogin, 
    doctorLogin, 
    authMiddleware, 
    requireRole, 
    getCurrentUser,
    forgotPassword,
    resetPassword
};