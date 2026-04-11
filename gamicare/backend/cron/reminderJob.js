const cron = require('node-cron');
const { sendAppointmentReminders } = require('../utils/reminderService');

/**
 * Reminder Cron Job
 * Runs every hour at minute 0 (e.g., 9:00, 10:00, 11:00...)
 * Schedule format: 'minute hour day month weekday'
 *
 * Finds appointments in the 23–25 hour window from now
 * and sends in-app + email reminders to both patient and doctor.
 */
const startReminderJob = () => {
    // Runs every hour
    cron.schedule('0 * * * *', async () => {
        await sendAppointmentReminders();
    });

    console.log('🕐 [Cron] Appointment reminder job started — runs every hour.');

    // Also run once immediately at server start (catches any missed slots on restart)
    sendAppointmentReminders().catch(err =>
        console.error('❌ [Cron] Initial reminder run failed:', err.message)
    );
};

module.exports = { startReminderJob };
