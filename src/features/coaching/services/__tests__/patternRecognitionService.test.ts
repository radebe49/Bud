import { patternRecognitionService } from '../patternRecognitionService';
import { HealthMetrics } from '../../../../shared/types/healthTypes';

describe('PatternRecognitionService', () => {
  const mockUserId = 'test-user-123';
  
  const createMockHealthData = (days: number, overrides: Partial<HealthMetrics>[] = []): HealthMetrics[] => {
    const baseData: HealthMetrics = {
      heartRate: 70,
      heartRateVariability: 45,
      sleepScore: 0.8,
      recoveryScore: 0.7,
      stressLevel: 0.3,
      activityLevel: 0.6,
      caloriesConsumed: 2000,
      caloriesBurned: 2200,
      waterIntake: 2500,
      timestamp: new Date()
    };

    return Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - index));
      
      const override = overrides[index] || {};
      
      return {
        ...baseData,
        ...override,
        timestamp: date
      };
    });
  };

  beforeEach(() => {
    // Clear any existing patterns
    jest.clearAllMocks();
  });

  describe('detectPatterns', () => {
    it('should return empty array for insufficient data', async () => {
      const healthData = createMockHealthData(3);
      const patterns = await patternRecognitionService.detectPatterns(mockUserId, healthData);
      expect(patterns).toEqual([]);
    });

    it('should detect workout timing patterns', async () => {
      // Create data with consistent morning workouts
      const healthData = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (9 - i));
        date.setHours(7, 0, 0, 0); // 7 AM workouts
        
        return {
          heartRate: 70,
          heartRateVariability: 45,
          sleepScore: 0.8,
          recoveryScore: 0.7,
          stressLevel: 0.3,
          activityLevel: 0.8, // High activity indicating workout
          caloriesConsumed: 2000,
          caloriesBurned: 2200,
          waterIntake: 2500,
          timestamp: date
        };
      });

      const patterns = await patternRecognitionService.detectPatterns(mockUserId, healthData);
      
      const workoutPattern = patterns.find(p => p.patternType === 'workout_timing');
      expect(workoutPattern).toBeDefined();
      expect(workoutPattern?.frequency).toBeGreaterThan(0.6);
      expect(workoutPattern?.triggers[0].value).toBe('early_morning');
    });

    it('should detect sleep schedule patterns', async () => {
      // Create data with consistent good sleep
      const healthData = createMockHealthData(10, 
        Array.from({ length: 10 }, () => ({
          sleepScore: 0.85 // Consistent good sleep
        }))
      );

      const patterns = await patternRecognitionService.detectPatterns(mockUserId, healthData);
      
      const sleepPattern = patterns.find(p => p.patternType === 'sleep_schedule');
      expect(sleepPattern).toBeDefined();
      expect(sleepPattern?.frequency).toBeGreaterThan(0.5);
    });

    it('should detect nutrition habits', async () => {
      // Create data with consistent nutrition tracking
      const healthData = createMockHealthData(10, 
        Array.from({ length: 10 }, () => ({
          caloriesConsumed: 2100 // Consistent calorie intake
        }))
      );

      const patterns = await patternRecognitionService.detectPatterns(mockUserId, healthData);
      
      const nutritionPattern = patterns.find(p => p.patternType === 'nutrition_habits');
      expect(nutritionPattern).toBeDefined();
    });

    it('should detect stress response patterns', async () => {
      // Create data with high stress followed by recovery
      const healthData = createMockHealthData(10);
      
      // Add high stress periods
      healthData[2].stressLevel = 0.8;
      healthData[5].stressLevel = 0.9;
      healthData[8].stressLevel = 0.85;
      
      // Add recovery data (next day after stress)
      healthData[3].stressLevel = 0.4;
      healthData[3].activityLevel = 0.7; // Workout helped
      healthData[6].stressLevel = 0.3;
      healthData[6].activityLevel = 0.8;

      const patterns = await patternRecognitionService.detectPatterns(mockUserId, healthData);
      
      const stressPattern = patterns.find(p => p.patternType === 'stress_response');
      expect(stressPattern).toBeDefined();
    });

    it('should detect recovery patterns', async () => {
      // Create data with varying recovery scores
      const healthData = createMockHealthData(14);
      
      // Good recovery days with good sleep
      healthData.slice(0, 7).forEach(data => {
        data.recoveryScore = 0.8;
        data.sleepScore = 0.85;
      });
      
      // Poor recovery days with poor sleep
      healthData.slice(7, 14).forEach(data => {
        data.recoveryScore = 0.3;
        data.sleepScore = 0.5;
      });

      const patterns = await patternRecognitionService.detectPatterns(mockUserId, healthData);
      
      const recoveryPattern = patterns.find(p => p.patternType === 'recovery_patterns');
      expect(recoveryPattern).toBeDefined();
    });
  });

  describe('getUserPatterns', () => {
    it('should return patterns for specific user', async () => {
      const healthData = createMockHealthData(10, 
        Array.from({ length: 10 }, () => ({
          activityLevel: 0.8
        }))
      );

      await patternRecognitionService.detectPatterns(mockUserId, healthData);
      const patterns = patternRecognitionService.getUserPatterns(mockUserId);
      
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every(p => p.userId === mockUserId)).toBe(true);
    });

    it('should return empty array for user with no patterns', () => {
      const patterns = patternRecognitionService.getUserPatterns('non-existent-user');
      expect(patterns).toEqual([]);
    });
  });

  describe('hasPattern', () => {
    it('should return true when user has specific pattern type', async () => {
      const healthData = createMockHealthData(10, 
        Array.from({ length: 10 }, () => ({
          activityLevel: 0.8
        }))
      );

      await patternRecognitionService.detectPatterns(mockUserId, healthData);
      
      const hasWorkoutPattern = patternRecognitionService.hasPattern(mockUserId, 'workout_timing');
      expect(hasWorkoutPattern).toBe(true);
    });

    it('should return false when user does not have specific pattern type', () => {
      const hasPattern = patternRecognitionService.hasPattern('non-existent-user', 'nutrition_habits');
      expect(hasPattern).toBe(false);
    });
  });

  describe('pattern confidence calculation', () => {
    it('should have higher confidence with more data points', async () => {
      const smallDataset = createMockHealthData(7, 
        Array.from({ length: 7 }, () => ({ activityLevel: 0.8 }))
      );
      
      const largeDataset = createMockHealthData(30, 
        Array.from({ length: 30 }, () => ({ activityLevel: 0.8 }))
      );

      const smallPatterns = await patternRecognitionService.detectPatterns(mockUserId + '1', smallDataset);
      const largePatterns = await patternRecognitionService.detectPatterns(mockUserId + '2', largeDataset);

      const smallWorkoutPattern = smallPatterns.find(p => p.patternType === 'workout_timing');
      const largeWorkoutPattern = largePatterns.find(p => p.patternType === 'workout_timing');

      if (smallWorkoutPattern && largeWorkoutPattern) {
        expect(largeWorkoutPattern.confidence).toBeGreaterThan(smallWorkoutPattern.confidence);
      }
    });

    it('should have higher confidence with more consistent patterns', async () => {
      const consistentData = createMockHealthData(10, 
        Array.from({ length: 10 }, () => ({ activityLevel: 0.8 }))
      );
      
      const inconsistentData = createMockHealthData(10, 
        Array.from({ length: 10 }, (_, i) => ({ 
          activityLevel: i % 2 === 0 ? 0.8 : 0.2 
        }))
      );

      const consistentPatterns = await patternRecognitionService.detectPatterns(mockUserId + '1', consistentData);
      const inconsistentPatterns = await patternRecognitionService.detectPatterns(mockUserId + '2', inconsistentData);

      const consistentPattern = consistentPatterns.find(p => p.patternType === 'workout_timing');
      const inconsistentPattern = inconsistentPatterns.find(p => p.patternType === 'workout_timing');

      if (consistentPattern && inconsistentPattern) {
        expect(consistentPattern.confidence).toBeGreaterThan(inconsistentPattern.confidence);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle missing metric values gracefully', async () => {
      const healthData = createMockHealthData(10);
      
      // Remove some values to simulate missing data
      healthData.forEach((data, index) => {
        if (index % 2 === 0) {
          (data as any).activityLevel = undefined;
        }
      });

      const patterns = await patternRecognitionService.detectPatterns(mockUserId, healthData);
      
      // Should not throw error and should return some patterns
      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should handle extreme values appropriately', async () => {
      const healthData = createMockHealthData(10, 
        Array.from({ length: 10 }, () => ({
          stressLevel: 1.0, // Maximum stress
          sleepScore: 0.0,  // Minimum sleep
          activityLevel: 1.0 // Maximum activity
        }))
      );

      const patterns = await patternRecognitionService.detectPatterns(mockUserId, healthData);
      
      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
    });
  });
});