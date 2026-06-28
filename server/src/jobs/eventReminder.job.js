const cron = require('node-cron');
const Event = require('../models/Event.model');
const { notifyUser } = require('../services/notification.service');

// Run every hour — check for events starting in 24–25 hours
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Find events starting in 24-25 hours that haven't been reminded
    const events = await Event.find({
      'dateTime.start': { $gte: in24h, $lt: in25h },
      status: { $in: ['open', 'closed'] },
      reminderSent: { $ne: true },
    });

    for (const event of events) {
      // Notify all selected volunteers
      for (const volunteerId of event.selectedVolunteers || []) {
        notifyUser(volunteerId.toString(), 'event_reminder', {
          message: `Reminder: "${event.eventName}" starts tomorrow!`,
          resourceId: event._id,
        });
      }
      // Mark as reminded
      event.reminderSent = true;
      await event.save();
    }

    if (events.length > 0) {
      console.log(`[eventReminder] Sent reminders for ${events.length} events`);
    }
  } catch (error) {
    console.error('[eventReminder] Error:', error.message);
  }
});
