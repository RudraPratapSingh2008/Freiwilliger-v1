const { getTierLabel, getTier } = require('../../src/utils/scoreTier.utils');

describe('scoreTier.utils', () => {
  describe('getTierLabel', () => {
    it('returns Top tier for scores 80-100', () => {
      const result = getTierLabel(85, 'volunteer');
      expect(result).toContain('Top');
    });

    it('returns Reliable tier for scores 60-79', () => {
      const result = getTierLabel(65, 'volunteer');
      expect(result).toContain('Reliable');
    });

    it('returns Building tier for scores 40-59', () => {
      const result = getTierLabel(45, 'volunteer');
      expect(result).toContain('Building');
    });

    it('returns Needs Improvement tier for scores 20-39', () => {
      const result = getTierLabel(25, 'volunteer');
      expect(result).toContain('Needs Improvement');
    });

    it('returns Low Trust tier for scores 0-19', () => {
      const result = getTierLabel(10, 'volunteer');
      expect(result).toContain('Low');
    });

    it('handles edge case score 0', () => {
      const result = getTierLabel(0, 'organiser');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Caution');
    });

    it('handles edge case score 100', () => {
      const result = getTierLabel(100, 'organiser');
      expect(result).toContain('Trusted');
    });

    it('clamps scores above 100', () => {
      const result = getTierLabel(150, 'volunteer');
      expect(result).toContain('Top');
    });

    it('clamps negative scores to 0', () => {
      const result = getTierLabel(-10, 'volunteer');
      expect(result).toContain('Low');
    });

    it('defaults to volunteer wording for unknown roles', () => {
      const result = getTierLabel(85, 'unknown');
      expect(result).toContain('Top Volunteer');
    });
  });

  describe('getTier', () => {
    it('returns tier object with emoji and label', () => {
      const tier = getTier(75);
      expect(tier).toHaveProperty('emoji');
      expect(tier).toHaveProperty('label');
      expect(tier).toHaveProperty('min');
    });

    it('returns correct min for each tier boundary', () => {
      expect(getTier(80).min).toBe(80);
      expect(getTier(60).min).toBe(60);
      expect(getTier(40).min).toBe(40);
      expect(getTier(20).min).toBe(20);
      expect(getTier(0).min).toBe(0);
    });

    it('handles non-numeric input gracefully', () => {
      const tier = getTier(undefined);
      expect(tier).toBeDefined();
      expect(tier.min).toBe(0);
    });
  });
});
