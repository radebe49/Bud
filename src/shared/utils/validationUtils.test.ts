/**
 * Tests for validation utility functions
 */

import {
  isValidEmail,
  isValidPassword,
  isValidHeartRate,
  isValidWeight,
  validateHealthMetrics,
} from './validationUtils';

describe('validationUtils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('MySecure1Pass')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(isValidPassword('password')).toBe(false); // no uppercase or number
      expect(isValidPassword('PASSWORD123')).toBe(false); // no lowercase
      expect(isValidPassword('Password')).toBe(false); // no number
      expect(isValidPassword('Pass1')).toBe(false); // too short
    });
  });

  describe('isValidHeartRate', () => {
    it('should return true for valid heart rates', () => {
      expect(isValidHeartRate(60)).toBe(true);
      expect(isValidHeartRate(100)).toBe(true);
      expect(isValidHeartRate(180)).toBe(true);
    });

    it('should return false for invalid heart rates', () => {
      expect(isValidHeartRate(25)).toBe(false); // too low
      expect(isValidHeartRate(250)).toBe(false); // too high
    });
  });

  describe('isValidWeight', () => {
    it('should return true for valid weights in kg', () => {
      expect(isValidWeight(70)).toBe(true);
      expect(isValidWeight(50)).toBe(true);
      expect(isValidWeight(120)).toBe(true);
    });

    it('should return false for invalid weights', () => {
      expect(isValidWeight(10)).toBe(false); // too low
      expect(isValidWeight(400)).toBe(false); // too high
    });
  });

  describe('validateHealthMetrics', () => {
    it('should return valid for correct health metrics', () => {
      const metrics = {
        heartRate: 75,
        weight: 70,
        waterIntake: 2000,
        caloriesConsumed: 1800,
      };

      const result = validateHealthMetrics(metrics);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for incorrect health metrics', () => {
      const metrics = {
        heartRate: 300, // invalid
        weight: 10, // invalid
        waterIntake: -100, // invalid
      };

      const result = validateHealthMetrics(metrics);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});