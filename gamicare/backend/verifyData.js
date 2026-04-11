const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: './.env' });

const checkDoctors = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const doctors = await User.find({ role: 'doctor' }).select('name roomNumber');
        console.log('Doctors in DB:');
        doctors.forEach(d => {
            console.log(`- ${d.name}: Room ${d.roomNumber || 'MISSING'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDoctors();
