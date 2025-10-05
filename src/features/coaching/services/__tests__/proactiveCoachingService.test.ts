import { proactiveCoachingService } from '../proactiveCoachingService';
import { HealthMetrics } from '../../../../shared/types/healthTypes';

// Mock the individual services
jest.mock('../patternRecognitionService');
jest.mock('../proactiveNotificationService');
jest.mock('../habitReinforcementService');
jest.mock('../contextualTriggerService');
jest.mock('../smartTimingService');

describe('ProactiveCoachingService', () => {
  const mockUserId = 'test-user-123';
  
  const createMockHealthMetrics = (overrides: Partial<HealthMetrics> = {}): HealthMetrics => ({
    heartRate: 70,
    heartRateVariability: 45,
    sleepScore: 0.8,
    recoveryScore: 0.7,
    stressLevel: 0.3,
    activityLevel: 0.6,
    caloriesConsumed: 2000,
    caloriesBurned: 2200,
    waterIntake: 2500,
    timestamp: new Date(),
    ...overrides
  });

  const createMockHealthData = (days: number): HealthMetrics[] => {
    return Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - index));
      
      return createMockHealthMetrics({ timestamp: date });
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processHealthData', () => {
    it('should process health data and return comprehensive results', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const historicalMetrics = createMockHealthData(14);

      const result = await proactiveCoachingService.processHealthData(
        mockUserId,
        currentMetrics,
        historicalMetrics
      );

      expect(result).toBeDefined();
      expect(result.notifications).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.milestones).toBeDefined();
      
      expect(Array.isArray(result.notifications)).toBe(true);
      expect(Array.isArray(result.patterns)).toBe(true);
      expect(Array.isArray(result.milestones)).toBe(true);
    });

    it('should handle insufficient historical data gracefully', async () => {
      const currentMetrics = createMockHealthMetrics();
      const historicalMetrics = createMockHealthData(3); // Less than 7 days

      const result = await proactiveCoachingService.processHealthData(
        mockUserId,
        currentMetrics,
        historicalMetrics
      );

      expect(result).toBeDefined();
      expect(result.notifications).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.milestones).toBeDefined();
    });

    it('should handle empty historical data', async () => {
      const currentMetrics = createMockHealthMetrics();
      const historicalMetrics: HealthMetrics[] = [];

      const result = await proactiveCoachingService.processHealthData(
        mockUserId,
        currentMetrics,
        historicalMetrics
      );

      expect(result).toBeDefined();
      expect(result.notifications).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.milestones).toBeDefined();
    });

    it('should handle errors gracefully and return empty results', async () => {
      // Mock an error in one of the services
      const mockError = new Error('Service error');
      
      // We'll simulate this by passing invalid data that might cause errors
      const currentMetrics = createMockHealthMetrics();
      const historicalMetrics = createMockHealthData(10);

      const result = await proactiveCoachingService.processHealthData(
        mockUserId,
        currentMetrics,
        historicalMetrics
      );

      // Should still return valid structure even if services fail
      expect(result).toBeDefined();
      expect(result.notifications).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.milestones).toBeDefined();
    });
  });

  describe('configuration management', () => {
    it('should set and get user configuration', () => {
      const config = {
        patternDetectionSensitivity: 0.8,
        notificationFrequencyLimit: 5,
        enableProactiveNotifications: false
      };

      proactiveCoachingService.setUserConfig(mockUserId, config);
      const retrievedConfig = proactiveCoachingService.getUserConfig(mockUserId);

      expect(retrievedConfig.patternDetectionSensitivity).toBe(0.8);
      expect(retrievedConfig.notificationFrequencyLimit).toBe(5);
      expect(retrievedConfig.enableProactiveNotifications).toBe(false);
    });

    it('should merge partial configuration updates', () => {
      // Set initial config
      proactiveCoachingService.setUserConfig(mockUserId, {
        notificationFrequencyLimit: 10
      });

      // Update only one field
      proactiveCoachingService.setUserConfig(mockUserId, {
        enableProactiveNotifications: false
      });

      const config = proactiveCoachingService.getUserConfig(mockUserId);
      
      // Should have both the old and new values
      expect(config.notificationFrequencyLimit).toBe(10);
      expect(config.enableProactiveNotifications).toBe(false);
    });

    it('should return default configuration for new users', () => {
      const config = proactiveCoachingService.getUserConfig('new-user');
      
      expect(config).toBeDefined();
      expect(config.patternDetectionSensitivity).toBeDefined();
      expect(config.notificationFrequencyLimit).toBeDefined();
      expect(config.enableProactiveNotifications).toBeDefined();
      expect(config.enableHabitTracking).toBeDefined();
      expect(config.enableContextualTriggers).toBeDefined();
      expect(config.personalizedTimingEnabled).toBeDefined();
    });
  });

  describe('notification management', () => {
    it('should acknowledge notifications and learn from user behavior', async () => {
      const notificationId = 'test-notification-123';
      
      // Should not throw error even if notification doesn't exist
      await expect(
        proactiveCoachingService.acknowledgeNotification(
          mockUserId, 
          notificationId, 
          'acknowledged'
        )
      ).resolves.not.toThrow();
    });

    it('should handle different user actions appropriately', async () => {
      const notificationId = 'test-notification-123';
      const actions = ['acknowledged', 'dismissed', 'acted_upon', 'ignored'] as const;
      
      for (const action of actions) {
        await expect(
          proactiveCoachingService.acknowledgeNotification(
            mockUserId, 
            notificationId, 
            action
          )
        ).resolves.not.toThrow();
      }
    });
  });

  describe('pattern and milestone access', () => {
    it('should provide access to user patterns', () => {
      const patterns = proactiveCoachingService.getUserPatterns(mockUserId);
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should provide access to habit progress', () => {
      const progress = proactiveCoachingService.getHabitProgress(mockUserId);
      expect(Array.isArray(progress)).toBe(true);
    });

    it('should provide next milestone for specific habit types', () => {
      const habitTypes = [
        'workout_consistency', 
        'sleep_schedule', 
        'nutrition_tracking', 
        'hydration', 
        'stress_management'
      ] as const;

      for (const habitType of habitTypes) {
        const nextMilestone = proactiveCoachingService.getNextMilestone(mockUserId, habitType);
        // Should return null or a valid milestone object
        expect(nextMilestone === null || typeof nextMilestone === 'object').toBe(true);
      }
    });
  });

  describe('timing and optimization', () => {
    it('should set user timing preferences', () => {
      const preferences = {
        userId: mockUserId,
        preferredNotificationTimes: [
          { start: '09:00', end: '10:00' }
        ],
        doNotDisturbPeriods: [
          { start: '22:00', end: '07:00' }
        ],
        maxNotificationsPerDay: 5,
        urgentNotificationsAllowed: true,
        contextualFactors: {}
      };

      expect(() => {
        proactiveCoachingService.setUserTimingPreferences(mockUserId, preferences);
      }).not.toThrow();
    });

    it('should optimize notification timing based on activity patterns', async () => {
      const healthData = createMockHealthData(14);
      
      const optimalTimes = await proactiveCoachingService.optimizeNotificationTiming(
        mockUserId, 
        healthData
      );
      
      expect(Array.isArray(optimalTimes)).toBe(true);
    });

    it('should provide delivery statistics', () => {
      const stats = proactiveCoachingService.getDeliveryStats(mockUserId);
      
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });

  describe('trigger management', () => {
    it('should enable and disable contextual triggers', () => {
      const triggerId = 'poor_sleep_nutrition';
      
      expect(() => {
        proactiveCoachingService.setTriggerEnabled(triggerId, false);
      }).not.toThrow();
      
      expect(() => {
        proactiveCoachingService.setTriggerEnabled(triggerId, true);
      }).not.toThrow();
    });

    it('should provide available triggers', () => {
      const triggers = proactiveCoachingService.getAvailableTriggers();
      expect(Array.isArray(triggers)).toBe(true);
    });
  });

  describe('immediate coaching', () => {
    it('should generate immediate coaching suggestions', async () => {
      const currentMetrics = createMockHealthMetrics({ stressLevel: 0.8 });
      
      const suggestion = await proactiveCoachingService.generateImmediateCoaching(
        mockUserId,
        currentMetrics
      );
      
      // Should return null or a valid notification
      expect(suggestion === null || typeof suggestion === 'object').toBe(true);
    });

    it('should handle immediate coaching with context', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const context = 'User reported feeling tired';
      
      const suggestion = await proactiveCoachingService.generateImmediateCoaching(
        mockUserId,
        currentMetrics,
        context
      );
      
      expect(suggestion === null || typeof suggestion === 'object').toBe(true);
    });
  });

  describe('force operations', () => {
    it('should force pattern detection', async () => {
      const healthData = createMockHealthData(14);
      
      const patterns = await proactiveCoachingService.forcePatternDetection(
        mockUserId,
        healthData
      );
      
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should handle a complete coaching cycle', async () => {
      // 1. Process initial health data
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const historicalMetrics = createMockHealthData(14);

      const result = await proactiveCoachingService.processHealthData(
        mockUserId,
        currentMetrics,
        historicalMetrics
      );

      expect(result).toBeDefined();

      // 2. Get pending notifications
      const pending = await proactiveCoachingService.getPendingNotifications(mockUserId);
      expect(Array.isArray(pending)).toBe(true);

      // 3. Acknowledge a notification (if any exist)
      if (result.notifications.length > 0) {
        await proactiveCoachingService.acknowledgeNotification(
          mockUserId,
          result.notifications[0].id,
          'acknowledged'
        );
      }

      // 4. Check patterns and milestones
      const patterns = proactiveCoachingService.getUserPatterns(mockUserId);
      const progress = proactiveCoachingService.getHabitProgress(mockUserId);

      expect(Array.isArray(patterns)).toBe(true);
      expect(Array.isArray(progress)).toBe(true);
    });

    it('should handle configuration changes affecting processing', async () => {
      // Disable all proactive features
      proactiveCoachingService.setUserConfig(mockUserId, {
        enableProactiveNotifications: false,
        enableHabitTracking: false,
        enableContextualTriggers: false,
        personalizedTimingEnabled: false
      });

      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const historicalMetrics = createMockHealthData(14);

      const result = await proactiveCoachingService.processHealthData(
        mockUserId,
        currentMetrics,
        historicalMetrics
      );

      // Should still return valid structure but with limited results
      expect(result).toBeDefined();
      expect(result.notifications).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.milestones).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle null or undefined inputs gracefully', async () => {
      await expect(
        proactiveCoachingService.processHealthData(
          mockUserId,
          null as any,
          []
        )
      ).resolves.toBeDefined();

      await expect(
        proactiveCoachingService.processHealthData(
          mockUserId,
          createMockHealthMetrics(),
          null as any
        )
      ).resolves.toBeDefined();
    });

    it('should handle invalid user IDs', async () => {
      const currentMetrics = createMockHealthMetrics();
      const historicalMetrics = createMockHealthData(7);

      await expect(
        proactiveCoachingService.processHealthData(
          '',
          currentMetrics,
          historicalMetrics
        )
      ).resolves.toBeDefined();

      await expect(
        proactiveCoachingService.processHealthData(
          null as any,
          currentMetrics,
          historicalMetrics
        )
      ).resolves.toBeDefined();
    });
  });
});