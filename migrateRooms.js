const mongoose = require('mongoose');
const User = require('./backend/models/User');

const migrateDoctorsRoomNumbers = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/gamicare');
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
