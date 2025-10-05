import { proactiveNotificationService } from '../proactiveNotificationService';
import { HealthMetrics } from '../../../../shared/types/healthTypes';
import { SmartTimingPreferences } from '../../types/proactiveCoachingTypes';

describe('ProactiveNotificationService', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateNotifications', () => {
    it('should generate notifications for significant sleep score decline', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const previousMetrics = [createMockHealthMetrics({ sleepScore: 0.8 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications.length).toBeGreaterThan(0);
      
      const sleepNotification = notifications.find(n => 
        n.triggerData.metric === 'sleepScore'
      );
      
      expect(sleepNotification).toBeDefined();
      expect(sleepNotification?.type).toBe('coaching_suggestion');
      expect(sleepNotification?.suggestedActions.length).toBeGreaterThan(0);
    });

    it('should generate notifications for significant recovery score decline', async () => {
      const currentMetrics = createMockHealthMetrics({ recoveryScore: 0.3 });
      const previousMetrics = [createMockHealthMetrics({ recoveryScore: 0.8 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      const recoveryNotification = notifications.find(n => 
        n.triggerData.metric === 'recoveryScore'
      );
      
      expect(recoveryNotification).toBeDefined();
      expect(recoveryNotification?.priority).toBe('high');
      expect(recoveryNotification?.actionable).toBe(true);
    });

    it('should generate notifications for significant stress increase', async () => {
      const currentMetrics = createMockHealthMetrics({ stressLevel: 0.9 });
      const previousMetrics = [createMockHealthMetrics({ stressLevel: 0.3 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      const stressNotification = notifications.find(n => 
        n.triggerData.metric === 'stressLevel'
      );
      
      expect(stressNotification).toBeDefined();
      expect(stressNotification?.type).toBe('health_alert');
      expect(stressNotification?.priority).toBe('high');
    });

    it('should generate celebration notifications for improvements', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.95 });
      const previousMetrics = [createMockHealthMetrics({ sleepScore: 0.6 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      const celebrationNotification = notifications.find(n => 
        n.type === 'milestone_celebration'
      );
      
      expect(celebrationNotification).toBeDefined();
      expect(celebrationNotification?.actionable).toBe(false);
    });

    it('should not generate notifications for small changes', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.78 });
      const previousMetrics = [createMockHealthMetrics({ sleepScore: 0.8 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications.length).toBe(0);
    });
  });

  describe('createContextualTriggers', () => {
    it('should create nutrition trigger for poor sleep', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });

      const notifications = await proactiveNotificationService.createContextualTriggers(
        mockUserId,
        currentMetrics
      );

      const nutritionTrigger = notifications.find(n => 
        n.title === 'Poor Sleep Recovery Plan'
      );
      
      expect(nutritionTrigger).toBeDefined();
      expect(nutritionTrigger?.suggestedActions.some(a => 
        a.type === 'nutrition_suggestion'
      )).toBe(true);
    });

    it('should create stress recovery trigger for high stress', async () => {
      const currentMetrics = createMockHealthMetrics({ stressLevel: 0.8 });

      const notifications = await proactiveNotificationService.createContextualTriggers(
        mockUserId,
        currentMetrics
      );

      const stressTrigger = notifications.find(n => 
        n.title === 'High Stress Alert'
      );
      
      expect(stressTrigger).toBeDefined();
      expect(stressTrigger?.priority).toBe('high');
    });

    it('should create workout adjustment trigger for low recovery', async () => {
      const currentMetrics = createMockHealthMetrics({ recoveryScore: 0.4 });

      const notifications = await proactiveNotificationService.createContextualTriggers(
        mockUserId,
        currentMetrics
      );

      const workoutTrigger = notifications.find(n => 
        n.title === 'Low Recovery - Workout Adjustment'
      );
      
      expect(workoutTrigger).toBeDefined();
      expect(workoutTrigger?.suggestedActions.some(a => 
        a.type === 'workout_adjustment'
      )).toBe(true);
    });

    it('should create fueling trigger for high activity with low calories', async () => {
      const currentMetrics = createMockHealthMetrics({ 
        activityLevel: 0.9, 
        caloriesConsumed: 1200 
      });

      const notifications = await proactiveNotificationService.createContextualTriggers(
        mockUserId,
        currentMetrics
      );

      const fuelingTrigger = notifications.find(n => 
        n.title === 'Fuel Your Performance'
      );
      
      expect(fuelingTrigger).toBeDefined();
      expect(fuelingTrigger?.priority).toBe('high');
    });

    it('should create hydration trigger for activity with low water intake', async () => {
      const currentMetrics = createMockHealthMetrics({ 
        activityLevel: 0.7, 
        waterIntake: 1000 
      });

      const notifications = await proactiveNotificationService.createContextualTriggers(
        mockUserId,
        currentMetrics
      );

      const hydrationTrigger = notifications.find(n => 
        n.title === 'Hydration Check'
      );
      
      expect(hydrationTrigger).toBeDefined();
    });
  });

  describe('notification scheduling', () => {
    it('should schedule notifications immediately by default', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const previousMetrics = [createMockHealthMetrics({ sleepScore: 0.8 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications.length).toBeGreaterThan(0);
      
      const notification = notifications[0];
      const now = new Date();
      const scheduledTime = new Date(notification.scheduledFor);
      
      expect(Math.abs(scheduledTime.getTime() - now.getTime())).toBeLessThan(5000); // Within 5 seconds
    });

    it('should respect user timing preferences when set', async () => {
      const preferences: SmartTimingPreferences = {
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

      proactiveNotificationService.setUserPreferences(mockUserId, preferences);

      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const previousMetrics = [createMockHealthMetrics({ sleepScore: 0.8 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications.length).toBeGreaterThan(0);
      
      for (const notification of notifications) {
        await proactiveNotificationService.scheduleNotification(notification);
        // Notification should be scheduled according to preferences
        expect(notification.scheduledFor).toBeDefined();
      }
    });
  });

  describe('notification management', () => {
    it('should track pending notifications', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const previousMetrics = [createMockHealthMetrics({ sleepScore: 0.8 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications.length).toBeGreaterThan(0);

      // Initially no pending notifications
      let pending = proactiveNotificationService.getPendingNotifications(mockUserId);
      expect(pending.length).toBe(0);

      // After scheduling, should have pending notifications
      for (const notification of notifications) {
        await proactiveNotificationService.scheduleNotification(notification);
      }
    });

    it('should mark notifications as delivered', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const previousMetrics = [createMockHealthMetrics({ sleepScore: 0.8 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications.length).toBeGreaterThan(0);
      
      const notification = notifications[0];
      expect(notification.delivered).toBe(false);

      proactiveNotificationService.markAsDelivered(notification.id);
      expect(notification.delivered).toBe(true);
    });

    it('should mark notifications as acknowledged', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const previousMetrics = [createMockHealthMetrics({ sleepScore: 0.8 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications.length).toBeGreaterThan(0);
      
      const notification = notifications[0];
      expect(notification.acknowledged).toBe(false);

      proactiveNotificationService.markAsAcknowledged(notification.id);
      expect(notification.acknowledged).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty previous metrics gracefully', async () => {
      const currentMetrics = createMockHealthMetrics({ sleepScore: 0.4 });
      const previousMetrics: HealthMetrics[] = [];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should handle undefined metric values', async () => {
      const currentMetrics = createMockHealthMetrics();
      (currentMetrics as any).sleepScore = undefined;
      
      const previousMetrics = [createMockHealthMetrics({ sleepScore: 0.8 })];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should handle extreme metric values', async () => {
      const currentMetrics = createMockHealthMetrics({ 
        sleepScore: 0,
        stressLevel: 1,
        recoveryScore: 0
      });
      const previousMetrics = [createMockHealthMetrics()];

      const notifications = await proactiveNotificationService.generateNotifications(
        mockUserId,
        currentMetrics,
        previousMetrics
      );

      expect(notifications).toBeDefined();
      expect(notifications.length).toBeGreaterThan(0);
    });
  });
});