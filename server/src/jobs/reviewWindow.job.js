const cron = require('node-cron');
const Event = require('../models/Event.model');

/**
 * Review-Window Closer
 *
 * Runs every hour.
 * Finds completed events whose review window has expired (7 days after
 * dateTime.end) and sets reviewsEnabled = false so the UI hides the
 * review form.
 */
cron.schedule('0 * * * *', async () => {
  const label = '[reviewWindow.job]';

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await Event.updateMany(
      {
        status: 'completed',
        'dateTime.end': { $lt: sevenDaysAgo },
        reviewsEnabled: true,
      },
      { $set: { reviewsEnabled: false } }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `${label} Closed review window for ${result.modifiedCount} event(s).`
      );
    }
  } catch (error) {
    console.error(`${label} Error:`, error);
  }
});

console.log('[reviewWindow.job] Cron registered — runs every hour.');
