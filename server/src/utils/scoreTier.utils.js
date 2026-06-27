/**
 * scoreTier.utils.js
 *
 * Maps a 0–100 helpScore/hireScore to a human-readable tier: an emoji plus
 * a role-specific label. Used on volunteer/organiser profile cards so users
 * get a quick trust signal without parsing a raw number.
 *
 * Score field → role:
 *   helpScore → 'volunteer'
 *   hireScore → 'organiser'
 */

// Ordered highest → lowest. `min` is inclusive.
const TIERS = [
    { min: 80, emoji: '🏆', label: { volunteer: 'Top Volunteer', organiser: 'Trusted Organiser' } },
    { min: 60, emoji: '✅', label: { volunteer: 'Reliable Volunteer', organiser: 'Good Organiser' } },
    { min: 40, emoji: '🌱', label: { volunteer: 'Building Reputation', organiser: 'New Organiser' } },
    { min: 20, emoji: '⚠️', label: { volunteer: 'Needs Improvement', organiser: 'Review Carefully' } },
    { min: 0, emoji: '🚫', label: { volunteer: 'Low Trust', organiser: 'Caution' } },
];

/**
 * Find the tier definition for a given score.
 * @param {number} score
 * @returns {{min: number, emoji: string, label: {volunteer: string, organiser: string}}}
 */
const getTier = (score) => {
    const clamped = Math.max(0, Math.min(100, Number(score) || 0));
    return TIERS.find((tier) => clamped >= tier.min) || TIERS[TIERS.length - 1];
};

/**
 * getTierLabel(score, role) → "🏆 Top Volunteer" / "✅ Good Organiser" / etc.
 *
 * @param {number} score - helpScore or hireScore, 0–100.
 * @param {'volunteer'|'organiser'} role - whose score this is.
 * @returns {string} emoji + label, e.g. "🏆 Top Volunteer"
 */
const getTierLabel = (score, role) => {
    const tier = getTier(score);
    const roleKey = role === 'organiser' ? 'organiser' : 'volunteer'; // default to volunteer wording
    return `${tier.emoji} ${tier.label[roleKey]}`;
};

module.exports = {
    getTierLabel,
    getTier, // exported in case callers want { emoji, label } separately (e.g. for styling)
};