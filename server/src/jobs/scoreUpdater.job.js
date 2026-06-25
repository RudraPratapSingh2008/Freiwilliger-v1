const cron = require('node-cron');
const Event = require('../models/Event.model');
const Review = require('../models/Review.model');
const { applyScoreDelta } = require('../services/score.service');

/**
 * Score Updater — Daily Cron (02:00 IST / 20:30 UTC)
 *
 * After the 7-day review window closes, this job processes all unscored
 * reviews for each completed event:
 *
 *   • Normal review  → delta = (stars / 5) * 10  (range: +2 to +10)
 *   • No-show flag   → delta = −15 penalty
 *
 * Review direction determines the target score field:
 *   • organiser_to_volunteer → volunteer's helpScore
 *   • volunteer_to_organiser → organiser's hireScore
 *
 * Once every review for an event is applied, the event's scoreProcessed
 * flag is set to true so it is never re-processed.
 */
cron.schedule('30 20 * * *', async () => {
  // 20:30 UTC = 02:00 IST
  const label = '[scoreUpdater.job]';

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find events whose review window has closed but scores haven't been applied
    const events = await Event.find({
      status: 'completed',
      scoreProcessed: false,
      'dateTime.end': { $lt: sevenDaysAgo },
    });

    if (events.length === 0) return;

    console.log(`${label} Processing scores for ${events.length} event(s)…`);

    for (const event of events) {
      // Get all unprocessed reviews for this event
      const reviews = await Review.find({
        eventId: event._id,
        scoreApplied: false,
      });

      for (const review of reviews) {
        try {
          // Determine target user and score field
          const targetUserId = review.revieweeId;
          const field =
            review.reviewType === 'organiser_to_volunteer'
              ? 'helpScore'
              : 'hireScore';

          let delta;
          let reason;

          if (review.isNoShow) {
            // No-show penalty
            delta = -10;
            reason = 'no-show';
          } else {
            // Star-based delta: (stars / 5) * 10 → 1★ = +2, 5★ = +10
            delta = (review.stars / 5) * 10;
            reason = 'review';
          }

          await applyScoreDelta(
            targetUserId,
            field,
            delta,
            reason,
            event._id
          );

          review.scoreApplied = true;
          await review.save();
        } catch (reviewErr) {
          console.error(
            `${label} Failed to process review ${review._id}:`,
            reviewErr
          );
          // Continue with remaining reviews
        }
      }

      // Mark event as fully processed
      event.scoreProcessed = true;
      await event.save();

      console.log(
        `${label} Event "${event.eventName}" — ${reviews.length} review(s) scored.`
      );
    }
  } catch (error) {
    console.error(`${label} Error:`, error);
  }
});

console.log('[scoreUpdater.job] Cron registered — runs daily at 02:00 IST.');
