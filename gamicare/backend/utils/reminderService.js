const Appointment = require('../models/Appointment');
const { sendNotification } = require('./notificationHelper');
const sendEmail = require('./sendEmail');

// Format time nicely: "14:30" → "2:30 PM"
const formatTime = (time) => {
    if (!time) return '';
    const [hourStr, minute] = time.split(':');
    const hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
};

// Format date nicely
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Beautiful HTML email for patient
const buildPatientEmail = (appointment) => {
    const doctor = appointment.doctorId;
    const formattedDate = formatDate(appointment.date);
    const formattedTime = formatTime(appointment.time);
    const isVirtual = appointment.type === 'Virtual';

    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #19456B 0%, #16C79A 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">🏥 Swami Dayanand Healthcare</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Your Health, Our Priority</p>
        </div>

        <!-- Body -->
        <div style="background: white; padding: 32px 28px;">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 15px; color: #856404; font-weight: 600;">Appointment Reminder — 24 Hours Notice</p>
            </div>

            <p style="font-size: 16px; color: #333; margin-top: 0;">Dear <strong>${appointment.patientId?.name || 'Patient'}</strong>,</p>
            <p style="color: #555; line-height: 1.6;">This is a friendly reminder that you have an upcoming appointment scheduled for tomorrow.</p>

            <!-- Appointment Card -->
            <div style="background: linear-gradient(135deg, #f0fdf9 0%, #e8f4f8 100%); border: 1px solid #16C79A33; border-radius: 10px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 18px; color: #19456B; font-size: 16px; border-bottom: 1px solid #16C79A44; padding-bottom: 12px;">📋 Appointment Details</h3>

                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">👨‍⚕️ Doctor</td>
                        <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px;">Dr. ${doctor?.name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">🩺 Specialization</td>
                        <td style="padding: 8px 0; color: #222; font-size: 14px;">${doctor?.specialization || 'General Medicine'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">📅 Date</td>
                        <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px;">${formattedDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">Time</td>
                        <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px;">${formattedTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">📍 Type</td>
                        <td style="padding: 8px 0; font-size: 14px;">
                            <span style="background: ${isVirtual ? '#dbeafe' : '#dcfce7'}; color: ${isVirtual ? '#1e40af' : '#166534'}; padding: 3px 10px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                ${isVirtual ? '💻 Virtual Consultation' : '🏥 In-Person Visit'}
                            </span>
                        </td>
                    </tr>
                    ${!isVirtual && doctor?.roomNumber ? `
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">🚪 Room</td>
                        <td style="padding: 8px 0; color: #222; font-size: 14px;">Room ${doctor.roomNumber}</td>
                    </tr>` : ''}
                </table>
            </div>

            <p style="color: #555; font-size: 14px; line-height: 1.7;">
                ${isVirtual
                    ? '💡 <strong>Tip:</strong> Please ensure your internet connection is stable and your camera/microphone are working before the session.'
                    : '💡 <strong>Tip:</strong> Please arrive 10–15 minutes early and bring any previous medical records or prescriptions.'
                }
            </p>
        </div>

        <!-- Footer -->
        <div style="background: #19456B; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
            <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Swami Dayanand Healthcare. All rights reserved.</p>
            <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 6px 0 0;">This is an automated reminder. Please do not reply to this email.</p>
        </div>
    </div>`;
};

// Beautiful HTML email for doctor
const buildDoctorEmail = (appointment) => {
    const patient = appointment.patientId;
    const formattedDate = formatDate(appointment.date);
    const formattedTime = formatTime(appointment.time);

    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #19456B 0%, #16C79A 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">🏥 Swami Dayanand Healthcare</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Doctor Portal — Appointment Reminder</p>
        </div>

        <!-- Body -->
        <div style="background: white; padding: 32px 28px;">
            <div style="background: #e8f4f8; border-left: 4px solid #19456B; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 15px; color: #19456B; font-weight: 600;">📅 Scheduled Appointment Tomorrow</p>
            </div>

            <p style="font-size: 16px; color: #333; margin-top: 0;">Dear <strong>Dr. ${appointment.doctorId?.name || 'Doctor'}</strong>,</p>
            <p style="color: #555; line-height: 1.6;">You have a patient appointment scheduled for tomorrow. Here are the details:</p>

            <!-- Appointment Card -->
            <div style="background: linear-gradient(135deg, #f0fdf9 0%, #e8f4f8 100%); border: 1px solid #16C79A33; border-radius: 10px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 18px; color: #19456B; font-size: 16px; border-bottom: 1px solid #16C79A44; padding-bottom: 12px;">👤 Patient Details</h3>

                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">🧑 Patient Name</td>
                        <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px;">${patient?.name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">📧 Email</td>
                        <td style="padding: 8px 0; color: #222; font-size: 14px;">${patient?.email || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">📞 Phone</td>
                        <td style="padding: 8px 0; color: #222; font-size: 14px;">${patient?.phone || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">📅 Date</td>
                        <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px;">${formattedDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">Time</td>
                        <td style="padding: 8px 0; color: #222; font-weight: 600; font-size: 14px;">${formattedTime}</td>
                    </tr>
                    ${appointment.reason || appointment.symptoms ? `
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px; vertical-align: top;">📝 Reason</td>
                        <td style="padding: 8px 0; color: #222; font-size: 14px;">${appointment.reason || appointment.symptoms || 'Not specified'}</td>
                    </tr>` : ''}
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #19456B; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
            <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Swami Dayanand Healthcare. All rights reserved.</p>
            <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 6px 0 0;">This is an automated reminder. Please do not reply to this email.</p>
        </div>
    </div>`;
};

// Main reminder function
const sendAppointmentReminders = async () => {
    console.log('[Reminder Job] Running at', new Date().toLocaleString());

    try {
        // Find appointments happening in the next 23–25 hours window that haven't been reminded
        const now = new Date();
        const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
        const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // 25 hours from now

        const upcomingAppointments = await Appointment.find({
            date: { $gte: windowStart, $lte: windowEnd },
            status: { $in: ['approved', 'pending'] },
            reminderSent: false
        })
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name email specialization roomNumber');

        if (upcomingAppointments.length === 0) {
            console.log('[Reminder Job] No appointments to remind right now.');
            return;
        }

        console.log(`📋 [Reminder Job] Found ${upcomingAppointments.length} appointment(s) to remind.`);

        for (const appointment of upcomingAppointments) {
            const patient = appointment.patientId;
            const doctor = appointment.doctorId;
            const formattedTime = formatTime(appointment.time);
            const formattedDate = formatDate(appointment.date);

            try {
                // ── IN-APP NOTIFICATION for PATIENT ──────────────────────────────
                if (patient?._id) {
                    await sendNotification(
                        patient._id,
                        'Appointment Reminder',
                        `Your appointment with Dr. ${doctor?.name || 'your doctor'} is scheduled for tomorrow at ${formattedTime}.`,
                        'reminder',
                        appointment._id
                    );
                }

                // ── IN-APP NOTIFICATION for DOCTOR ───────────────────────────────
                if (doctor?._id) {
                    await sendNotification(
                        doctor._id,
                        '📅 Upcoming Appointment',
                        `You have an appointment with ${patient?.name || 'a patient'} tomorrow at ${formattedTime}.`,
                        'reminder',
                        appointment._id
                    );
                }

                // ── EMAIL to PATIENT ─────────────────────────────────────────────
                if (patient?.email && process.env.SMTP_USER) {
                    await sendEmail({
                        email: patient.email,
                        subject: `Appointment Reminder — ${formattedDate} at ${formattedTime}`,
                        message: `Your appointment with Dr. ${doctor?.name} is tomorrow at ${formattedTime}.`,
                        html: buildPatientEmail(appointment)
                    });
                    console.log(`📧 [Reminder] Email sent to patient: ${patient.email}`);
                }

                // ── EMAIL to DOCTOR ──────────────────────────────────────────────
                if (doctor?.email && process.env.SMTP_USER) {
                    await sendEmail({
                        email: doctor.email,
                        subject: `📅 Patient Appointment Tomorrow — ${patient?.name} at ${formattedTime}`,
                        message: `You have an appointment with ${patient?.name} tomorrow at ${formattedTime}.`,
                        html: buildDoctorEmail(appointment)
                    });
                    console.log(`📧 [Reminder] Email sent to doctor: ${doctor.email}`);
                }

                // ── Mark reminder as sent ────────────────────────────────────────
                await Appointment.findByIdAndUpdate(appointment._id, { reminderSent: true });
                console.log(`[Reminder] Done for appointment ${appointment._id}`);

            } catch (err) {
                console.error(`❌ [Reminder] Failed for appointment ${appointment._id}:`, err.message);
            }
        }

    } catch (err) {
        console.error('❌ [Reminder Job] Unexpected error:', err.message);
    }
};

// Short-term reminder function (2 hours before)
const sendShortTermReminders = async () => {
    console.log('[Short-term Reminder Job] Running at', new Date().toLocaleString());

    try {
        // Find appointments happening in the next 1–3 hours window
        const now = new Date();
        const windowStart = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now
        const windowEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);   // 3 hours from now

        const upcomingAppointments = await Appointment.find({
            date: { $gte: windowStart, $lte: windowEnd },
            status: { $in: ['approved', 'pending'] },
            shortTermReminderSent: false
        })
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name email specialization roomNumber');

        if (upcomingAppointments.length === 0) {
            console.log('[Short-term Reminder Job] No appointments to remind right now.');
            return;
        }

        console.log(`📋 [Short-term Reminder Job] Found ${upcomingAppointments.length} appointment(s) to remind.`);

        for (const appointment of upcomingAppointments) {
            const patient = appointment.patientId;
            const doctor = appointment.doctorId;
            const formattedTime = formatTime(appointment.time);

            try {
                // ── IN-APP NOTIFICATION for PATIENT ──────────────────────────────
                if (patient?._id) {
                    await sendNotification(
                        patient._id,
                        'Appointment Starting Soon! 🏥',
                        `Reminder: Your appointment with Dr. ${doctor?.name || 'your doctor'} starts at ${formattedTime}. Please be ready!`,
                        'reminder',
                        appointment._id
                    );
                }

                // ── EMAIL to PATIENT ─────────────────────────────────────────────
                if (patient?.email && process.env.SMTP_USER) {
                    await sendEmail({
                        email: patient.email,
                        subject: `🚨 Starting Soon: Appointment with Dr. ${doctor?.name} at ${formattedTime}`,
                        message: `Your appointment with Dr. ${doctor?.name} is starting in less than 2 hours (at ${formattedTime}).`,
                        html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #16C79A; border-radius: 10px;">
                            <h2 style="color: #19456B;">🏥 Appointment Starting Soon</h2>
                            <p>Dear <strong>${patient.name}</strong>,</p>
                            <p>This is a final reminder that your appointment with <strong>Dr. ${doctor?.name}</strong> is scheduled for today at <strong>${formattedTime}</strong>.</p>
                            <div style="background: #f0fdf9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime}</p>
                                <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctor?.name}</p>
                                <p style="margin: 5px 0;"><strong>Specialization:</strong> ${doctor?.specialization}</p>
                            </div>
                            <p>Please ensure you are ready 10 minutes before the scheduled time.</p>
                        </div>`
                    });
                }

                // ── Mark short-term reminder as sent ──────────────────────────────
                await Appointment.findByIdAndUpdate(appointment._id, { shortTermReminderSent: true });
                console.log(`[Short-term Reminder] Done for appointment ${appointment._id}`);

            } catch (err) {
                console.error(`❌ [Short-term Reminder] Failed for appointment ${appointment._id}:`, err.message);
            }
        }

    } catch (err) {
        console.error('❌ [Short-term Reminder Job] Unexpected error:', err.message);
    }
};

module.exports = { sendAppointmentReminders, sendShortTermReminders };
