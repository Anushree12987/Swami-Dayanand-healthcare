const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load env vars
dotenv.config({ path: './.env' });

const migrateDoctorsRoomNumbers = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamicare';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const doctors = await User.find({ role: 'doctor' }).sort({ createdAt: 1 });
        console.log(`Found ${doctors.length} doctors to migrate`);

        let currentRoom = 101;
        for (const doctor of doctors) {
            doctor.roomNumber = currentRoom++;
            await doctor.save();
            console.log(`Assigned Room ${doctor.roomNumber} to Dr. ${doctor.name}`);
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateDoctorsRoomNumbers();
