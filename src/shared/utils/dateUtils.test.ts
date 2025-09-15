import { formatDate, isToday, getDaysAgo } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toBe('Jan 15, 2024');
    });
  });

  describe('isToday', () => {
    it("should return true for today's date", () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('getDaysAgo', () => {
    it('should return date from specified days ago', () => {
      const threeDaysAgo = getDaysAgo(3);
      const expected = new Date();
      expected.setDate(expected.getDate() - 3);

      expect(threeDaysAgo.getDate()).toBe(expected.getDate());
      expect(threeDaysAgo.getMonth()).toBe(expected.getMonth());
      expect(threeDaysAgo.getFullYear()).toBe(expected.getFullYear());
    });
  });
});
