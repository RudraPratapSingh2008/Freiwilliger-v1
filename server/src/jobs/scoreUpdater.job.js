const cron = require('node-cron');
const Event = require('../models/Event.model');
const Review = require('../models/Review.model');
const { applyScoreDelta } = require('../services/score.service');

/**
 * Score Updater — Daily Cron (02:00 IST / 20:30 UTC)
 *
 * After the 7-day review window closes, this job processes all unscored
 * reviews for each completed event, PLUS any no-show attendance records
 * that never got a formal review:
 *
 *   • Normal review        → delta = (stars / 5) * 10  (range: +2 to +10)
 *   • No-show review flag  → delta = −10 penalty
 *   • No-show attendance   → delta = −10 penalty (attendanceLog.attended
 *                             === false, even if the organiser never wrote
 *                             a review — see attendanceLog sweep below)
 *
 * NOTE on timing: this intentionally waits 7 days (not 24h) before
 * processing an event, matching the review submission window in
 * review.controller.js / reviewWindow.job.js. Processing earlier (e.g. at
 * 24h) would risk marking an event scoreProcessed before volunteers/
 * organisers who review on day 2–7 ever get scored, since each event is
 * only ever processed once.
 *
 * Review direction determines the target score field:
 *   • organiser_to_volunteer → volunteer's helpScore
 *   • volunteer_to_organiser → organiser's hireScore
 *
 * Once every review + attendance record for an event is applied, the
 * event's scoreProcessed flag is set to true so it is never re-processed.
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

      // Track which volunteers already got a no-show penalty via a review,
      // so the attendanceLog sweep below doesn't double-penalize them.
      const noShowHandled = new Set();

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
            noShowHandled.add(targetUserId.toString());
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

      // ── Automatic no-show penalty straight from attendance records ──────
      // An organiser may mark a volunteer attended:false without ever
      // submitting a formal review for them. Those no-shows still need to
      // be penalized, so sweep attendanceLog directly for anyone the
      // review loop above didn't already cover.
      for (const log of event.attendanceLog) {
        if (log.attended !== false) continue;
        const volunteerKey = log.volunteerId.toString();
        if (noShowHandled.has(volunteerKey)) continue; // already penalized via review

        try {
          await applyScoreDelta(
            log.volunteerId,
            'helpScore',
            -10,
            'no-show',
            event._id
          );
          noShowHandled.add(volunteerKey);
        } catch (attendanceErr) {
          console.error(
            `${label} Failed to apply no-show penalty for volunteer ${log.volunteerId}:`,
            attendanceErr
          );
          // Continue with remaining attendance entries
        }
      }

      // Mark event as fully processed
      event.scoreProcessed = true;
      await event.save();

      console.log(
        `${label} Event "${event.eventName}" — ${reviews.length} review(s), ${noShowHandled.size} no-show(s) scored.`
      );
    }
  } catch (error) {
    console.error(`${label} Error:`, error);
  }
});

console.log('[scoreUpdater.job] Cron registered — runs daily at 02:00 IST.');