const User = require('../models/User.model');

const clampScore = (value) => Math.max(0, Math.min(100, value));

/**
 * Apply a score delta to a user's helpScore or hireScore.
 *
 * @param {string}  userId  - The user whose score changes.
 * @param {string}  field   - 'helpScore' or 'hireScore'.
 * @param {number}  delta   - Positive or negative change.
 * @param {string}  reason  - Human-readable reason ('review', 'no-show', …).
 * @param {string} [eventId] - Optional event that triggered the change.
 * @returns {Promise<number>} The new clamped score.
 */
const applyScoreDelta = async (userId, field, delta, reason = '', eventId = null) => {
  if (!['helpScore', 'hireScore'].includes(field)) {
    throw new Error('Invalid score field.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const profileKey = field === 'helpScore' ? 'volunteerProfile' : 'organiserProfile';
  const profile = user[profileKey] || {};
  const currentScore = Number(profile[field] ?? 50);
  const nextScore = clampScore(currentScore + Number(delta || 0));

  profile[field] = nextScore;
  profile.scoreHistory = Array.isArray(profile.scoreHistory) ? profile.scoreHistory : [];
  profile.scoreHistory.push({
    field,
    delta: Number(delta || 0),
    reason,
    eventId: eventId || undefined,
    timestamp: new Date(),
  });

  user[profileKey] = profile;
  await user.save();

  return nextScore;
};

module.exports = {
  applyScoreDelta,
};
