const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/notificationHelper');

// Get all doctors (for patients to choose from)
exports.getAllDoctors = async (req, res) => {
    try {
        const { specialization, search } = req.query;
        
        let query = { role: 'doctor', isActive: true };
        
        // Filter by specialization
        if (specialization) {
            query.specialization = new RegExp(specialization, 'i');
        }
        
        // Search by name or specialization
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { specialization: new RegExp(search, 'i') },
                { qualification: new RegExp(search, 'i') }
            ];
        }
        
        const doctors = await User.find(query)
            .select('name specialization qualification experience consultationFee rating profileImage bio roomNumber')
            .sort({ 'rating.average': -1 });
        
        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get single doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await User.findOne({
            _id: req.params.id,
            role: 'doctor',
            isActive: true
        }).select('-password -availabilitySlots');
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Get doctor's available slots for next 7 days
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const availableSlots = doctor.availabilitySlots.filter(slot => 
            slot.date >= today && 
            slot.date <= nextWeek && 
            !slot.isBooked
        );
        
        res.status(200).json({
            success: true,
            data: {
                ...doctor.toObject(),
                availableSlots
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Doctor dashboard statistics
exports.getDoctorDashboard = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        // Get today's appointments
        const todaysAppointments = await Appointment.find({
            doctorId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('patientId', 'name phone email');
        
        // Get upcoming appointments (next 7 days)
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const upcomingAppointments = await Appointment.find({
            doctorId,
            date: {
                $gte: today,
                $lt: nextWeek
            },
            status: { $in: ['pending', 'approved'] }
        })
        .populate('patientId', 'name phone email')
        .sort({ date: 1, time: 1 });
        
        // Get appointment statistics
        const totalAppointments = await Appointment.countDocuments({ doctorId });
        const pendingAppointments = await Appointment.countDocuments({ 
            doctorId, 
            status: 'pending' 
        });
        const approvedAppointments = await Appointment.countDocuments({ 
            doctorId, 
            status: 'approved' 
        });
        
        res.status(200).json({
            success: true,
            data: {
                dashboard: {
                    totalAppointments,
                    pendingAppointments,
                    approvedAppointments,
                    todaysAppointments: todaysAppointments.length
                },
                todaysAppointments,
                upcomingAppointments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get doctor's appointments
exports.getDoctorAppointments = async (req, res) => {
    try {
        const { status, date } = req.query;
        const doctorId = req.user.id;
        
        let query = { doctorId };
        
        // Filter by status
        if (status) {
            query.status = status;
        }
        
        // Filter by date
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(searchDate.getDate() + 1);
            
            query.date = {
                $gte: searchDate,
                $lt: nextDay
            };
        }
        
        const appointments = await Appointment.find(query)
            .populate('patientId', 'name phone email gender dateOfBirth')
            .sort({ date: -1, time: -1 });
        
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update appointment status (approve/cancel)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, reason } = req.body;
        
        // Validate status
        if (!['approved', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        // Find appointment
        const appointment = await Appointment.findById(appointmentId)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name');
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        // Check if doctor is authorized
        if (appointment.doctorId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment'
            });
        }
        
        // Update appointment status
        appointment.status = status;
        if (reason) appointment.notes = reason;
        await appointment.save();
        
        // Update doctor's availability slot
        if (status === 'cancelled') {
            await User.updateOne(
                { 
                    _id: appointment.doctorId,
                    'availabilitySlots.date': appointment.date,
                    'availabilitySlots.startTime': appointment.time
                },
                {
                    $set: { 'availabilitySlots.$.isBooked': false }
                }
            );
        }
        
        // Create notification for patient
        await Notification.create({
            userId: appointment.patientId._id,
            title: `Appointment ${status}`,
            message: `Your appointment with Dr. ${appointment.doctorId.name} has been ${status}`,
            type: 'appointment',
            relatedId: appointmentId,
            relatedModel: 'Appointment'
        });
        
        res.status(200).json({
            success: true,
            message: `Appointment ${status} successfully`,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Add availability slots
exports.addAvailabilitySlots = async (req, res) => {
    try {
        const { slots } = req.body; // Array of { date: '2026-04-05', startTime: '09:00', endTime: '17:00' }
        
        if (!slots || !Array.isArray(slots)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid slots data'
            });
        }
        
        const doctor = await User.findById(req.user.id);
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

        // Get unique dates from the new slots to clear previous entries for those dates only
        const datesToClear = [...new Set(slots.map(s => new Date(s.date).toDateString()))];

        // Filter out existing unbooked slots for these dates
        doctor.availabilitySlots = doctor.availabilitySlots.filter(s => {
            // Keep the slot if it's booked OR if its date isn't in the new update set
            const slotDate = new Date(s.date).toDateString();
            return s.isBooked || !datesToClear.includes(slotDate);
        });
        
        // Add each new slot
        for (const slot of slots) {
            doctor.availabilitySlots.push({
                date: new Date(slot.date),
                startTime: slot.startTime,
                endTime: slot.endTime,
                isBooked: false
            });
        }
        
        await doctor.save();
        
        res.status(200).json({
            success: true,
            message: 'Availability slots updated successfully',
            addedSlots: slots.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get doctor's availability slots
exports.getAvailabilitySlots = async (req, res) => {
    try {
        const doctor = await User.findById(req.user.id);
        
        const { date } = req.query;
        let availabilitySlots = doctor.availabilitySlots;
        
        // Filter by date if provided
        if (date) {
            const filterDate = new Date(date);
            availabilitySlots = availabilitySlots.filter(slot => 
                slot.date.toDateString() === filterDate.toDateString()
            );
        }
        
        res.status(200).json({
            success: true,
            count: availabilitySlots.length,
            data: availabilitySlots
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
// NEW: Get availability slots for a specific doctor (Public/Patient)
exports.getPublicAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;
        
        const doctor = await User.findOne({ _id: id, role: 'doctor' });
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

        // Helper to convert "HH:mm" (24hr) to minutes
        const timeToMinutes = (time) => {
            if (!time) return 0;
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        // Helper to format minutes to "hh:mm A" (12hr)
        const formatTime = (minutes) => {
            let h = Math.floor(minutes / 60);
            const m = minutes % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
        };

        let availableBlocks = [];
        let filterDateObj = null;

        if (date) {
            filterDateObj = new Date(date);
            // "date" comes in exactly as YYYY-MM-DD from frontend 
            const filterDateStrShort = date.split('T')[0];
            
            // Check if there are specific slots customized for this date
            const customSlots = (doctor.availabilitySlots || []).filter(slot => {
                if (!slot.date) return false;
                const slotDateStrStr = new Date(slot.date).toISOString().split('T')[0];
                return slotDateStrStr === filterDateStrShort;
            });

            if (customSlots.length > 0) {
                // Doctor saved something in Availability.jsx
                availableBlocks = customSlots.map(slot => ({
                    start: slot.startTime,
                    end: slot.endTime
                }));
            } else {
                // Determine day of the week robustly
                const dayName = filterDateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
                
                // Fetch default available time for that day
                const defaultTime = (doctor.availableTime || []).filter(block => 
                    block.day && block.day.toLowerCase() === dayName.toLowerCase()
                );
                
                if (defaultTime.length > 0) {
                    availableBlocks = defaultTime.map(block => ({
                        start: block.startTime,
                        end: block.endTime
                    }));
                } else {
                    // Fallback so every doctor has slots for any day requested
                    availableBlocks = [{ start: '09:00', end: '17:00' }];
                }
            }
        }

        const generatedSlots = [];
        
        // Generate 30-minute intervals for all valid blocks
        for (const block of availableBlocks) {
            if (block.start && (block.start.includes('AM') || block.start.includes('PM'))) {
                // It's already formatted as a specific time slot (from seed script or UI)
                generatedSlots.push(block.start);
            } else {
                // It's a 24-hr layout string (e.g., '09:00' to '17:00')
                let currentMinutes = timeToMinutes(block.start);
                const endMinutes = timeToMinutes(block.end);
                
                while (currentMinutes + 30 <= endMinutes && !isNaN(currentMinutes)) {
                    generatedSlots.push(formatTime(currentMinutes));
                    currentMinutes += 30;
                }
            }
        }

        let available30MinSlots = [];

        if (date && filterDateObj && generatedSlots.length > 0) {
            const todayStart = new Date(filterDateObj);
            todayStart.setUTCHours(0, 0, 0, 0);
            const todayEnd = new Date(todayStart);
            todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

            // Find existing appointments for this date
            const appointments = await Appointment.find({
                doctorId: id,
                date: {
                    $gte: todayStart,
                    $lt: todayEnd
                },
                status: { $in: ['pending', 'approved'] }
            });
            
            const MAX_IN_PERSON = 3;
            const MAX_VIRTUAL = 1;

            const now = new Date();
            // Create a specific string for today in YYYY-MM-DD to compare with 'date'
            const todayStr = now.toISOString().split('T')[0];
            const isToday = (date === todayStr);

            for (const timeStr of generatedSlots) {
                // If it's today, skip slots that have already passed
                if (isToday) {
                    // timeStr is expected like "09:00 AM"
                    const [timePart, ampm] = timeStr.split(' ');
                    const [hPart, mPart] = timePart.split(':').map(Number);
                    
                    let actualH = hPart;
                    if (ampm === 'PM' && actualH !== 12) actualH += 12;
                    if (ampm === 'AM' && actualH === 12) actualH = 0;
                    
                    // Create a Date object for this specific slot today in local time
                    const slotTime = new Date();
                    slotTime.setHours(actualH, mPart, 0, 0);
                    
                    // Skip if the slot is in the past (e.g. 10 AM when it's already 3 PM)
                    if (slotTime < now) continue;
                }

                const slotAppointments = appointments.filter(a => a.time === timeStr);
                
                const virtualCount = slotAppointments.filter(a => a.type === 'Virtual').length;
                const inPersonCount = slotAppointments.filter(a => a.type === 'In-person' || !a.type).length;
                
                if (virtualCount < MAX_VIRTUAL && inPersonCount < MAX_IN_PERSON) {
                    available30MinSlots.push({ startTime: timeStr });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: available30MinSlots
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update doctor profile
exports.updateDoctorProfile = async (req, res) => {
    try {
        const updates = req.body;
        
        // Remove fields that shouldn't be updated
        delete updates.email;
        delete updates.role;
        delete updates.password;
        
        const doctor = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password -availabilitySlots');
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};