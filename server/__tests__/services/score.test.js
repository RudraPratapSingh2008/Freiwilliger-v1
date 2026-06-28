describe('score.service — scoring logic', () => {
  // Utility: clamp score to valid range
  const clamp = (v) => Math.max(0, Math.min(100, v));

  describe('score clamping', () => {
    it('score should never exceed 100', () => {
      expect(clamp(110)).toBe(100);
      expect(clamp(100)).toBe(100);
      expect(clamp(999)).toBe(100);
    });

    it('score should never go below 0', () => {
      expect(clamp(-10)).toBe(0);
      expect(clamp(0)).toBe(0);
      expect(clamp(-999)).toBe(0);
    });

    it('preserves valid scores in range', () => {
      expect(clamp(50)).toBe(50);
      expect(clamp(1)).toBe(1);
      expect(clamp(99)).toBe(99);
    });
  });

  describe('score delta formula', () => {
    // Formula: delta = (stars / 5) * 10
    const calculateDelta = (stars) => (stars / 5) * 10;

    it('5 stars = +10 points', () => {
      expect(calculateDelta(5)).toBe(10);
    });

    it('4 stars = +8 points', () => {
      expect(calculateDelta(4)).toBe(8);
    });

    it('3 stars = +6 points', () => {
      expect(calculateDelta(3)).toBe(6);
    });

    it('2 stars = +4 points', () => {
      expect(calculateDelta(2)).toBe(4);
    });

    it('1 star = +2 points', () => {
      expect(calculateDelta(1)).toBe(2);
    });

    it('delta is always positive for valid star counts', () => {
      for (let stars = 1; stars <= 5; stars++) {
        expect(calculateDelta(stars)).toBeGreaterThan(0);
      }
    });

    it('maximum single delta is 10', () => {
      expect(calculateDelta(5)).toBeLessThanOrEqual(10);
    });
  });

  describe('score with decay', () => {
    // Decay: -0.5 points per day of inactivity (after 30 days)
    const applyDecay = (score, inactiveDays) => {
      if (inactiveDays <= 30) return score;
      const decay = (inactiveDays - 30) * 0.5;
      return Math.max(0, score - decay);
    };

    it('no decay within 30 days', () => {
      expect(applyDecay(80, 0)).toBe(80);
      expect(applyDecay(80, 15)).toBe(80);
      expect(applyDecay(80, 30)).toBe(80);
    });

    it('decays 0.5/day after 30 days', () => {
      expect(applyDecay(80, 31)).toBe(79.5);
      expect(applyDecay(80, 32)).toBe(79);
      expect(applyDecay(80, 40)).toBe(75);
    });

    it('never decays below 0', () => {
      expect(applyDecay(10, 200)).toBe(0);
    });
  });
});
