import { habitReinforcementService } from '../habitReinforcementService';
import { HealthMetrics } from '../../../../shared/types/healthTypes';

describe('HabitReinforcementService', () => {
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
    jest.clearAllMocks();
  });

  describe('updateHabitMilestones', () => {
    it('should create workout streak milestones', async () => {
      // Create 7 days of consistent workouts
      const healthData = createMockHealthData(7, 
        Array.from({ length: 7 }, () => ({ activityLevel: 0.8 }))
      );

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const workoutMilestones = milestones.filter(m => 
        m.habitType === 'workout_consistency' && m.milestoneType === 'streak'
      );
      
      expect(workoutMilestones.length).toBeGreaterThan(0);
      
      const sevenDayMilestone = workoutMilestones.find(m => m.targetValue === 7);
      expect(sevenDayMilestone).toBeDefined();
      expect(sevenDayMilestone?.achieved).toBe(true);
      expect(sevenDayMilestone?.currentValue).toBe(7);
    });

    it('should create workout frequency milestones', async () => {
      // Create a week with 4 workout days
      const healthData = createMockHealthData(7, [
        { activityLevel: 0.8 }, // Day 1: workout
        { activityLevel: 0.2 }, // Day 2: rest
        { activityLevel: 0.8 }, // Day 3: workout
        { activityLevel: 0.2 }, // Day 4: rest
        { activityLevel: 0.8 }, // Day 5: workout
        { activityLevel: 0.8 }, // Day 6: workout
        { activityLevel: 0.2 }  // Day 7: rest
      ]);

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const frequencyMilestones = milestones.filter(m => 
        m.habitType === 'workout_consistency' && m.milestoneType === 'frequency'
      );
      
      expect(frequencyMilestones.length).toBeGreaterThan(0);
      
      const fourDayMilestone = frequencyMilestones.find(m => m.targetValue === 4);
      expect(fourDayMilestone).toBeDefined();
      expect(fourDayMilestone?.achieved).toBe(true);
    });

    it('should create sleep consistency milestones', async () => {
      // Create 14 days of good sleep
      const healthData = createMockHealthData(14, 
        Array.from({ length: 14 }, () => ({ sleepScore: 0.8 }))
      );

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const sleepMilestones = milestones.filter(m => 
        m.habitType === 'sleep_schedule' && m.milestoneType === 'streak'
      );
      
      expect(sleepMilestones.length).toBeGreaterThan(0);
      
      const fourteenDayMilestone = sleepMilestones.find(m => m.targetValue === 14);
      expect(fourteenDayMilestone).toBeDefined();
      expect(fourteenDayMilestone?.achieved).toBe(true);
    });

    it('should create sleep improvement milestones', async () => {
      // Create data showing sleep improvement
      const healthData = createMockHealthData(14);
      
      // First week: poor sleep
      healthData.slice(0, 7).forEach(data => {
        data.sleepScore = 0.5;
      });
      
      // Second week: improved sleep
      healthData.slice(7, 14).forEach(data => {
        data.sleepScore = 0.8;
      });

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const improvementMilestones = milestones.filter(m => 
        m.habitType === 'sleep_schedule' && m.milestoneType === 'improvement'
      );
      
      expect(improvementMilestones.length).toBeGreaterThan(0);
      
      // Should have achieved some improvement milestones
      const achievedImprovements = improvementMilestones.filter(m => m.achieved);
      expect(achievedImprovements.length).toBeGreaterThan(0);
    });

    it('should create nutrition tracking milestones', async () => {
      // Create 30 days of consistent nutrition tracking
      const healthData = createMockHealthData(30, 
        Array.from({ length: 30 }, () => ({ caloriesConsumed: 2100 }))
      );

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const nutritionMilestones = milestones.filter(m => 
        m.habitType === 'nutrition_tracking'
      );
      
      expect(nutritionMilestones.length).toBeGreaterThan(0);
      
      const thirtyDayMilestone = nutritionMilestones.find(m => m.targetValue === 30);
      expect(thirtyDayMilestone).toBeDefined();
      expect(thirtyDayMilestone?.achieved).toBe(true);
    });

    it('should create hydration milestones', async () => {
      // Create 7 days of meeting hydration goals
      const healthData = createMockHealthData(7, 
        Array.from({ length: 7 }, () => ({ waterIntake: 2500 }))
      );

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const hydrationMilestones = milestones.filter(m => 
        m.habitType === 'hydration'
      );
      
      expect(hydrationMilestones.length).toBeGreaterThan(0);
      
      const sevenDayMilestone = hydrationMilestones.find(m => m.targetValue === 7);
      expect(sevenDayMilestone).toBeDefined();
      expect(sevenDayMilestone?.achieved).toBe(true);
    });

    it('should create stress management improvement milestones', async () => {
      // Create data showing stress improvement
      const healthData = createMockHealthData(14);
      
      // First week: high stress
      healthData.slice(0, 7).forEach(data => {
        data.stressLevel = 0.8;
      });
      
      // Second week: lower stress
      healthData.slice(7, 14).forEach(data => {
        data.stressLevel = 0.4;
      });

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const stressMilestones = milestones.filter(m => 
        m.habitType === 'stress_management'
      );
      
      expect(stressMilestones.length).toBeGreaterThan(0);
      
      // Should have achieved some improvement milestones
      const achievedImprovements = stressMilestones.filter(m => m.achieved);
      expect(achievedImprovements.length).toBeGreaterThan(0);
    });

    it('should update existing milestones instead of creating duplicates', async () => {
      const healthData = createMockHealthData(7, 
        Array.from({ length: 7 }, () => ({ activityLevel: 0.8 }))
      );

      // First update
      const firstMilestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      // Second update with more data
      const extendedHealthData = createMockHealthData(10, 
        Array.from({ length: 10 }, () => ({ activityLevel: 0.8 }))
      );
      
      const secondMilestones = await habitReinforcementService.updateHabitMilestones(mockUserId, extendedHealthData);
      
      // Should have updated existing milestones, not created new ones
      const sevenDayMilestones = secondMilestones.filter(m => 
        m.habitType === 'workout_consistency' && 
        m.milestoneType === 'streak' && 
        m.targetValue === 7
      );
      
      expect(sevenDayMilestones.length).toBe(1);
      expect(sevenDayMilestones[0].currentValue).toBe(10);
    });
  });

  describe('generateCelebrationNotifications', () => {
    it('should generate celebration notifications for achieved milestones', async () => {
      const healthData = createMockHealthData(7, 
        Array.from({ length: 7 }, () => ({ activityLevel: 0.8 }))
      );

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      const achievedMilestones = milestones.filter(m => m.achieved);
      
      const notifications = await habitReinforcementService.generateCelebrationNotifications(
        mockUserId, 
        achievedMilestones
      );
      
      expect(notifications.length).toBe(achievedMilestones.length);
      
      notifications.forEach(notification => {
        expect(notification.type).toBe('milestone_celebration');
        expect(notification.userId).toBe(mockUserId);
        expect(notification.actionable).toBe(false);
        expect(notification.title).toContain('Milestone Achieved');
      });
    });

    it('should not generate notifications for unachieved milestones', async () => {
      const healthData = createMockHealthData(3, 
        Array.from({ length: 3 }, () => ({ activityLevel: 0.8 }))
      );

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      const unachievedMilestones = milestones.filter(m => !m.achieved);
      
      const notifications = await habitReinforcementService.generateCelebrationNotifications(
        mockUserId, 
        unachievedMilestones
      );
      
      expect(notifications.length).toBe(0);
    });
  });

  describe('getHabitProgress', () => {
    it('should return all milestones for a user', async () => {
      const healthData = createMockHealthData(7, 
        Array.from({ length: 7 }, () => ({ activityLevel: 0.8 }))
      );

      await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const progress = habitReinforcementService.getHabitProgress(mockUserId);
      
      expect(progress.length).toBeGreaterThan(0);
      expect(progress.every(m => m.userId === mockUserId)).toBe(true);
    });

    it('should return empty array for user with no milestones', () => {
      const progress = habitReinforcementService.getHabitProgress('non-existent-user');
      expect(progress).toEqual([]);
    });
  });

  describe('getNextMilestone', () => {
    it('should return next unachieved milestone for habit type', async () => {
      const healthData = createMockHealthData(5, 
        Array.from({ length: 5 }, () => ({ activityLevel: 0.8 }))
      );

      await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const nextMilestone = habitReinforcementService.getNextMilestone(
        mockUserId, 
        'workout_consistency'
      );
      
      expect(nextMilestone).toBeDefined();
      expect(nextMilestone?.achieved).toBe(false);
      expect(nextMilestone?.habitType).toBe('workout_consistency');
      expect(nextMilestone?.targetValue).toBeGreaterThan(5);
    });

    it('should return null if no unachieved milestones exist', async () => {
      const nextMilestone = habitReinforcementService.getNextMilestone(
        'non-existent-user', 
        'workout_consistency'
      );
      
      expect(nextMilestone).toBeNull();
    });
  });

  describe('milestone rewards', () => {
    it('should assign rewards for significant milestones', async () => {
      const healthData = createMockHealthData(30, 
        Array.from({ length: 30 }, () => ({ activityLevel: 0.8 }))
      );

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      const thirtyDayMilestone = milestones.find(m => 
        m.targetValue === 30 && m.milestoneType === 'streak'
      );
      
      expect(thirtyDayMilestone).toBeDefined();
      expect(thirtyDayMilestone?.reward).toBeDefined();
    });

    it('should have appropriate celebration messages', async () => {
      const healthData = createMockHealthData(7, 
        Array.from({ length: 7 }, () => ({ activityLevel: 0.8 }))
      );

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      milestones.forEach(milestone => {
        expect(milestone.celebrationMessage).toBeDefined();
        expect(milestone.celebrationMessage.length).toBeGreaterThan(0);
        expect(milestone.celebrationMessage).toContain(milestone.targetValue.toString());
      });
    });
  });

  describe('edge cases', () => {
    it('should handle inconsistent data gracefully', async () => {
      const healthData = createMockHealthData(10, [
        { activityLevel: 0.8 },
        { activityLevel: 0.1 },
        { activityLevel: 0.9 },
        { activityLevel: 0.0 },
        { activityLevel: 0.7 },
        { activityLevel: 0.2 },
        { activityLevel: 0.8 },
        { activityLevel: 0.1 },
        { activityLevel: 0.6 },
        { activityLevel: 0.3 }
      ]);

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      expect(milestones).toBeDefined();
      expect(Array.isArray(milestones)).toBe(true);
    });

    it('should handle missing data values', async () => {
      const healthData = createMockHealthData(7);
      
      // Remove some values
      healthData.forEach((data, index) => {
        if (index % 2 === 0) {
          (data as any).activityLevel = undefined;
        }
      });

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      expect(milestones).toBeDefined();
      expect(Array.isArray(milestones)).toBe(true);
    });

    it('should handle extreme values appropriately', async () => {
      const healthData = createMockHealthData(7, 
        Array.from({ length: 7 }, () => ({
          activityLevel: 1.0,
          sleepScore: 1.0,
          stressLevel: 0.0,
          waterIntake: 5000
        }))
      );

      const milestones = await habitReinforcementService.updateHabitMilestones(mockUserId, healthData);
      
      expect(milestones).toBeDefined();
      expect(milestones.length).toBeGreaterThan(0);
      
      // Should have achieved several milestones with perfect data
      const achievedMilestones = milestones.filter(m => m.achieved);
      expect(achievedMilestones.length).toBeGreaterThan(0);
    });
  });
});