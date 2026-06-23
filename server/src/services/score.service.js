const User = require('../models/User.model');

const clampScore = (value) => Math.max(0, Math.min(100, value));

const applyScoreDelta = async (userId, field, delta, reason = '') => {
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
    date: new Date(),
  });

  user[profileKey] = profile;
  await user.save();

  return nextScore;
};

module.exports = {
  applyScoreDelta,
};
