import { demoWorkoutMappingService } from '../demoWorkoutMappings';

describe('DemoWorkoutMappingService', () => {
  beforeEach(() => {
    // Reset demo state before each test
    demoWorkoutMappingService.resetDemo();
  });

  describe('processMessage', () => {
    it('should detect back pain messages and update recommendations', () => {
      const result = demoWorkoutMappingService.processMessage('My back feels sore today');
      
      expect(result).toBe(true);
      
      const currentRec = demoWorkoutMappingService.getCurrentRecommendation();
      expect(currentRec).toBeTruthy();
      expect(currentRec?.workoutPlan.name).toBe('Core Stability & Light Cardio');
      expect(currentRec?.reason).toContain('sore back');
      expect(currentRec?.priority).toBe('high');
    });

    it('should detect fatigue messages and update recommendations', () => {
      const result = demoWorkoutMappingService.processMessage('I am feeling tired today');
      
      expect(result).toBe(true);
      
      const currentRec = demoWorkoutMappingService.getCurrentRecommendation();
      expect(currentRec).toBeTruthy();
      expect(currentRec?.workoutPlan.name).toBe('Gentle Movement Flow');
      expect(currentRec?.reason).toContain('energy');
    });

    it('should detect high energy messages and update recommendations', () => {
      const result = demoWorkoutMappingService.processMessage('I am feeling great and energetic!');
      
      expect(result).toBe(true);
      
      const currentRec = demoWorkoutMappingService.getCurrentRecommendation();
      expect(currentRec).toBeTruthy();
      expect(currentRec?.workoutPlan.name).toBe('High-Intensity Challenge');
      expect(currentRec?.priority).toBe('high');
    });

    it('should not trigger for unrelated messages', () => {
      const result = demoWorkoutMappingService.processMessage('Hello, how are you?');
      
      expect(result).toBe(false);
      
      const currentRec = demoWorkoutMappingService.getCurrentRecommendation();
      expect(currentRec).toBeNull();
    });

    it('should be case insensitive', () => {
      const result = demoWorkoutMappingService.processMessage('MY BACK FEELS SORE TODAY');
      
      expect(result).toBe(true);
      
      const currentRec = demoWorkoutMappingService.getCurrentRecommendation();
      expect(currentRec?.workoutPlan.name).toBe('Core Stability & Light Cardio');
    });
  });

  describe('getRecommendationsWithDemo', () => {
    it('should return demo recommendation first when available', () => {
      // Trigger a demo scenario
      demoWorkoutMappingService.processMessage('My back feels sore');
      
      const recommendations = demoWorkoutMappingService.getRecommendationsWithDemo();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].workoutPlan.name).toBe('Core Stability & Light Cardio');
      expect(recommendations[0].priority).toBe('high');
    });

    it('should return fallback recommendations when no demo is active', () => {
      const recommendations = demoWorkoutMappingService.getRecommendationsWithDemo();
      
      expect(recommendations.length).toBeGreaterThan(0);
      // Should return fallback recommendations
      expect(recommendations[0].workoutPlan.name).toBe('Morning HIIT Blast');
    });

    it('should limit total recommendations to 3', () => {
      const recommendations = demoWorkoutMappingService.getRecommendationsWithDemo();
      
      expect(recommendations.length).toBeLessThanOrEqual(3);
    });
  });

  describe('resetDemo', () => {
    it('should clear current recommendation', () => {
      // Set a demo recommendation
      demoWorkoutMappingService.processMessage('My back feels sore');
      expect(demoWorkoutMappingService.getCurrentRecommendation()).toBeTruthy();
      
      // Reset demo
      demoWorkoutMappingService.resetDemo();
      expect(demoWorkoutMappingService.getCurrentRecommendation()).toBeNull();
    });
  });
});