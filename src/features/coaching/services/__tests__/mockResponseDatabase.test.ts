/**
 * Tests for MockResponseDatabase
 */

import { MockResponseDatabase } from '../mockResponseDatabase';

describe('MockResponseDatabase', () => {
  let mockDb: MockResponseDatabase;
  
  beforeEach(() => {
    mockDb = MockResponseDatabase.getInstance();
  });

  describe('getResponse', () => {
    it('should return greeting responses', () => {
      const response = mockDb.getResponse('greetings', 'general');
      
      expect(response).toBeDefined();
      expect(response?.content).toBeTruthy();
      expect(typeof response?.content).toBe('string');
    });

    it('should return sleep responses', () => {
      const response = mockDb.getResponse('sleep', 'good_sleep');
      
      expect(response).toBeDefined();
      expect(response?.content).toBeTruthy();
      expect(response?.followUpQuestions).toBeDefined();
    });

    it('should return fitness responses', () => {
      const response = mockDb.getResponse('fitness', 'workout_completed');
      
      expect(response).toBeDefined();
      expect(response?.content).toBeTruthy();
      expect(response?.suggestions).toBeDefined();
    });

    it('should return null for invalid category', () => {
      const response = mockDb.getResponse('invalid', 'subcategory');
      
      expect(response).toBeNull();
    });

    it('should return null for invalid subcategory', () => {
      const response = mockDb.getResponse('greetings', 'invalid');
      
      expect(response).toBeNull();
    });
  });

  describe('getRandomResponse', () => {
    it('should return random response from category', () => {
      const response = mockDb.getRandomResponse('general');
      
      expect(response).toBeDefined();
      expect(response?.content).toBeTruthy();
    });

    it('should return null for invalid category', () => {
      const response = mockDb.getRandomResponse('invalid');
      
      expect(response).toBeNull();
    });
  });

  describe('getResponsesByPattern', () => {
    it('should find responses containing pattern', () => {
      const responses = mockDb.getResponsesByPattern('workout');
      
      expect(responses).toBeDefined();
      expect(Array.isArray(responses)).toBe(true);
      expect(responses.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent pattern', () => {
      const responses = mockDb.getResponsesByPattern('nonexistentpattern123');
      
      expect(responses).toBeDefined();
      expect(Array.isArray(responses)).toBe(true);
      expect(responses.length).toBe(0);
    });
  });

  describe('getAllCategories', () => {
    it('should return all available categories', () => {
      const categories = mockDb.getAllCategories();
      
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('greetings');
      expect(categories).toContain('sleep');
      expect(categories).toContain('fitness');
    });
  });

  describe('getSubcategories', () => {
    it('should return subcategories for valid category', () => {
      const subcategories = mockDb.getSubcategories('greetings');
      
      expect(subcategories).toBeDefined();
      expect(Array.isArray(subcategories)).toBe(true);
      expect(subcategories.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid category', () => {
      const subcategories = mockDb.getSubcategories('invalid');
      
      expect(subcategories).toBeDefined();
      expect(Array.isArray(subcategories)).toBe(true);
      expect(subcategories.length).toBe(0);
    });
  });
});