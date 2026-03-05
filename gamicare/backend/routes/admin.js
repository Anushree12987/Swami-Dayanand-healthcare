const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const upload = multer({ dest: 'uploads/' });
const departmentController = require('../controllers/departmentController');
const adminController = require('../controllers/adminController');

// Departments Management
router.get('/departments', auth, role('admin'), departmentController.getAllDepartments);
router.post('/departments', auth, role('admin'), departmentController.addDepartment);
router.put('/departments/:id', auth, role('admin'), departmentController.updateDepartment);
router.delete('/departments/:id', auth, role('admin'), departmentController.deleteDepartment);
router.patch('/departments/:id/toggle-status', auth, role('admin'), departmentController.toggleStatus);

// Get all patients (admin only)
router.get('/patients', auth, role('admin'), async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single patient by ID
router.get('/patients/:id', auth, role('admin'), async (req, res) => {
    try {
        const patient = await User.findById(req.params.id).select('-password');
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update patient (admin only)
router.put('/patients/:id', auth, role('admin'), async (req, res) => {
    try {
        const { name, email, phone, medicalInfo, isActive } = req.body;
        const patient = await User.findById(req.params.id);
        
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Patient not found' });
        }

        if (name) patient.name = name;
        if (email) patient.email = email;
        if (phone) patient.phone = phone;
        if (medicalInfo) patient.medicalInfo = medicalInfo;
        if (isActive !== undefined) patient.isActive = isActive;

        await patient.save();
        res.json({ message: 'Patient updated successfully', patient });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete patient (admin only)
router.delete('/patients/:id', auth, role('admin'), async (req, res) => {
    try {
        const patient = await User.findById(req.params.id);
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Check if patient has any appointments
        const hasAppointments = await Appointment.findOne({ patientId: req.params.id });
        if (hasAppointments) {
            return res.status(400).json({ 
                message: 'Cannot delete patient with existing appointments. Please cancel all appointments first.' 
            });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all appointments (admin only) with pagination
router.get('/appointments', auth, role('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        
        const query = {};
        if (status) query.status = status;
        
        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization roomNumber')
            .sort({ date: -1, time: -1 })
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
});

// Get recent appointments (for dashboard)
router.get('/appointments/recent', auth, role('admin'), async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization roomNumber')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update appointment status (admin only)
router.patch('/appointments/:id/status', auth, role('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        appointment.status = status;
        
        // If status is approved, add amount field
        if (status === 'approved' || status === 'completed') {
            appointment.amount = 50; // Default appointment price
            appointment.paymentStatus = 'pending';
        }
        
        // If status is cancelled, set amount to 0
        if (status === 'cancelled') {
            appointment.amount = 0;
        }
        
        await appointment.save();
        
        res.json({
            message: `Appointment ${status} successfully`,
            appointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete appointment (admin only)
router.delete('/appointments/:id', auth, role('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[ADMIN DELETE] Attempting to delete appointment: ${id}`);
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.error(`[ADMIN DELETE] Invalid appointment ID format: ${id}`);
            return res.status(400).json({ message: 'Invalid appointment ID format' });
        }
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            console.warn(`[ADMIN DELETE] Appointment not found: ${id}`);
            return res.status(404).json({ message: 'Appointment not found in registry' });
        }
        
        await Appointment.findByIdAndDelete(id);
        console.log(`[ADMIN DELETE] PURGE SUCCESS: ${id}`);
        
        return res.status(200).json({
            status: 'success',
            message: 'Appointment record deleted successfully'
        });
    } catch (error) {
        console.error(`[ADMIN DELETE] FATAL ERROR:`, error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Database error during purge operation', 
            error: error.message 
        });
    }
});

// Get all doctors (admin only)
router.get('/doctors', auth, role('admin'), async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single doctor by ID
router.get('/doctors/:id', auth, role('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const doctor = await User.findById(id).select('-password');
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update doctor (admin only)
router.put('/doctors/:id', auth, role('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, specialization, phone, availableTime, status } = req.body;
        
        // Check if doctor exists
        const doctor = await User.findById(id);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Check if email already exists for another doctor
        if (email && email !== doctor.email) {
            const existingDoctor = await User.findOne({ email, _id: { $ne: id } });
            if (existingDoctor) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        
        // Update doctor fields
        if (name) doctor.name = name;
        if (email) doctor.email = email;
        if (specialization) doctor.specialization = specialization;
        if (phone) doctor.phone = phone;
        if (availableTime) doctor.availableTime = availableTime;
        if (status !== undefined) doctor.isActive = status === 'active';
        
        await doctor.save();
        
        res.json({
            message: 'Doctor updated successfully',
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                phone: doctor.phone,
                roomNumber: doctor.roomNumber,
                isActive: doctor.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update doctor status (activate/deactivate)
router.patch('/doctors/:id/status', auth, role('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const doctor = await User.findById(id);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        doctor.isActive = status === 'active';
        await doctor.save();
        
        res.json({
            message: `Doctor ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                roomNumber: doctor.roomNumber,
                isActive: doctor.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete doctor (admin only)
router.delete('/doctors/:id', auth, role('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const doctor = await User.findById(id);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Check if doctor has appointments
        const hasAppointments = await Appointment.findOne({ doctorId: id });
        if (hasAppointments) {
            return res.status(400).json({ 
                message: 'Cannot delete doctor with existing appointments' 
            });
        }
        
        await User.findByIdAndDelete(id);
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create doctor (admin only)
router.post('/doctors', auth, role('admin'), async (req, res) => {
    try {
        const { name, email, password, specialization, phone, availableTime } = req.body;
        
        // Check if doctor exists
        const existingDoctor = await User.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Doctor already exists' });
        }
        
        // Find max room number among all doctors
        const lastDoctor = await User.findOne({ role: 'doctor' })
            .sort({ roomNumber: -1 });
            
        const nextRoomNumber = lastDoctor && lastDoctor.roomNumber 
            ? lastDoctor.roomNumber + 1 
            : 101;
            
        const doctor = new User({
            name,
            email,
            password,
            specialization,
            phone,
            availableTime: availableTime || [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }],
            role: 'doctor',
            roomNumber: nextRoomNumber,
            isActive: true
        });
        
        await doctor.save();
        
        res.status(201).json({
            message: 'Doctor created successfully',
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                phone: doctor.phone,
                roomNumber: doctor.roomNumber,
                isActive: doctor.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Import doctors via CSV (admin only)
router.post('/doctors/import', auth, role('admin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No CSV file uploaded' });
        }

        const results = [];
        const errors = [];
        let successCount = 0;

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                // Get starting room number
                const lastDoctor = await User.findOne({ role: 'doctor' })
                    .sort({ roomNumber: -1 });
                let roomCounter = lastDoctor && lastDoctor.roomNumber ? lastDoctor.roomNumber + 1 : 101;

                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    try {
                        const { name, email, password, specialization, phone } = row;
                        
                        if (!name || !email || !password) {
                            errors.push(`Row ${i + 2}: Missing required fields (name, email, password)`);
                            continue;
                        }

                        const existingDoctor = await User.findOne({ email });
                        if (existingDoctor) {
                            errors.push(`Row ${i + 2}: Email ${email} already exists`);
                            continue;
                        }

                        const hashedPassword = await bcrypt.hash(password, 10);

                        const doctor = new User({
                            name,
                            email,
                            password: hashedPassword,
                            specialization: specialization || 'General Physician',
                            phone: phone || '',
                            availableTime: [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }],
                            role: 'doctor',
                            roomNumber: roomCounter++,
                            isActive: true
                        });
                        
                        await doctor.save();
                        successCount++;
                    } catch (err) {
                        errors.push(`Row ${i + 2}: ${err.message}`);
                    }
                }
                
                // Cleanup temp file
                fs.unlinkSync(req.file.path);
                
                res.json({
                    message: `Import complete. Successfully added ${successCount} doctors.`,
                    successCount,
                    errors: errors.length > 0 ? errors : null
                });
            })
            .on('error', (error) => {
                res.status(500).json({ message: 'Error reading CSV file', error: error.message });
            });
            
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get dashboard statistics (admin only) - UPDATED WITH REVENUE
router.get('/stats', auth, role('admin'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Calculate counts
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalAppointments = await Appointment.countDocuments();
        
        // Today's appointments
        const todayAppointments = await Appointment.countDocuments({
            date: { $gte: today, $lt: tomorrow }
        });
        
        // Count by status
        const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
        const approvedAppointments = await Appointment.countDocuments({ status: 'approved' });
        const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
        const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
        
        // Today's approved appointments
        const todayApprovedAppointments = await Appointment.countDocuments({
            date: { $gte: today, $lt: tomorrow },
            status: 'approved'
        });
        
        // Today's completed appointments
        const todayCompletedAppointments = await Appointment.countDocuments({
            date: { $gte: today, $lt: tomorrow },
            status: 'completed'
        });
        
        // Revenue calculations
        const todayRevenueResult = await Appointment.aggregate([
            {
                $match: {
                    date: { $gte: today, $lt: tomorrow },
                    status: { $in: ['approved', 'completed'] }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

        const totalRevenueResult = await Appointment.aggregate([
            {
                $match: {
                    status: { $in: ['approved', 'completed'] }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        const weeklyRevenue = Math.round(totalRevenue * 0.25);
        const monthlyRevenue = Math.round(totalRevenue * 1.5);
        
        const stats = {
            totalPatients,
            totalDoctors,
            totalAppointments,
            todayAppointments,
            pendingAppointments,
            approvedAppointments,
            cancelledAppointments,
            completedAppointments,
            todayApprovedAppointments,
            todayRevenue,
            totalRevenue,
            weeklyRevenue,
            monthlyRevenue
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get payments (admin only) - NEW ENDPOINT
router.get('/payments', auth, role('admin'), async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const payments = await Appointment.find({
            $or: [
                { status: 'approved' },
                { status: 'completed' }
            ]
        })
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name specialization roomNumber')
        .select('date time status patientId doctorId amount')
        .sort({ date: -1, time: -1 })
        .limit(parseInt(limit));
        
        // Add amount field if not present
        const paymentsWithAmount = payments.map(payment => ({
            ...payment.toObject(),
            amount: payment.amount || 50
        }));
        
        res.json(paymentsWithAmount);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get payment statistics (admin only) - NEW ENDPOINT
router.get('/payments/stats', auth, role('admin'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Calculate revenue from appointments
        const approvedAppointments = await Appointment.countDocuments({ 
            status: 'approved',
            date: { $gte: today, $lt: tomorrow }
        });
        
        const todayRevenueResult = await Appointment.aggregate([
            {
                $match: {
                    date: { $gte: today, $lt: tomorrow },
                    status: { $in: ['approved', 'completed'] }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

        const totalApprovedResult = await Appointment.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalApprovedRevenue = totalApprovedResult.length > 0 ? totalApprovedResult[0].total : 0;

        const totalCompletedResult = await Appointment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalCompletedRevenue = totalCompletedResult.length > 0 ? totalCompletedResult[0].total : 0;

        const stats = {
            todayRevenue,
            totalApprovedRevenue,
            totalCompletedRevenue,
            pendingPayments: await Appointment.countDocuments({ status: 'pending' }),
            successfulPayments: await Appointment.countDocuments({ 
                $or: [
                    { status: 'approved' },
                    { status: 'completed' }
                ]
            })
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// System Broadcasting
router.post('/broadcast', auth, role('admin'), adminController.broadcastMessage);

module.exports = router;