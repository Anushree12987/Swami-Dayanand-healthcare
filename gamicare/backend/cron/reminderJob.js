const cron = require('node-cron');
const { sendAppointmentReminders, sendShortTermReminders } = require('../utils/reminderService');

/**
 * Reminder Cron Job
 * Runs every 15 minutes
 * Finds appointments in the 23–25 hour window AND the 1–3 hour window
 */
const startReminderJob = () => {
    // Runs every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        await sendAppointmentReminders();
        await sendShortTermReminders();
    });

    console.log('[Cron] Appointment reminder job started — runs every 15 minutes.');

    // Also run once immediately at server start
    const runInitialReminders = async () => {
        try {
            await sendAppointmentReminders();
            await sendShortTermReminders();
        } catch (err) {
            console.error(' [Cron] Initial reminder run failed:', err.message);
        }
    };
    runInitialReminders();
};

module.exports = { startReminderJob };
