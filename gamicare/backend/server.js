const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { validateEnv } = require('./config/env');
const connectDB = require('./config/database');

// Validate environment variables
validateEnv();

// Import routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctorRoutes');
const symptomRoutes = require('./routes/symptoms'); // match the file above
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports'); // ← Add this for reports API
const paymentRoutes = require('./routes/paymentRoutes');
const { startReminderJob } = require('./cron/reminderJob');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Start appointment reminder cron job
startReminderJob();

// Serve static React build files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes); // ← Add this for reports
app.use('/api/payments', paymentRoutes);
app.use('/api/users', require('./routes/userRoutes')); // ← Added this for user profiles

// Static files for profile pictures
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// For production: Serve React app for any non-API routes
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));