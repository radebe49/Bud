import { HealthMetrics } from '../../../shared/types/healthTypes';
import { 
  ProactiveNotification, 
  UserBehaviorPattern, 
  HabitMilestone,
  CoachingIntelligenceConfig
} from '../types/proactiveCoachingTypes';

import { patternRecognitionService } from './patternRecognitionService';
import { proactiveNotificationService } from './proactiveNotificationService';
import { habitReinforcementService } from './habitReinforcementService';
import { contextualTriggerService } from './contextualTriggerService';
import { smartTimingService } from './smartTimingService';

/**
 * Main orchestrator for proactive coaching intelligence
 * Coordinates pattern recognition, notifications, habit tracking, and smart timing
 */
export class ProactiveCoachingService {
  private readonly DEFAULT_CONFIG: CoachingIntelligenceConfig = {
    patternDetectionSensitivity: 0.7,
    notificationFrequencyLimit: 8,
    interventionCooldownPeriod: 60, // minutes
    enableProactiveNotifications: true,
    enableHabitTracking: true,
    enableContextualTriggers: true,
    personalizedTimingEnabled: true
  };

  /**
   * Main entry point - analyze health data and generate proactive coaching
   */
  async processHealthData(
    userId: string, 
    currentMetrics: HealthMetrics, 
    historicalMetrics: HealthMetrics[]
  ): Promise<{
    notifications: ProactiveNotification[];
    patterns: UserBehaviorPattern[];
    milestones: HabitMilestone[];
  }> {
    const config = this.getUserConfig(userId);
    const allNotifications: ProactiveNotification[] = [];
    let detectedPatterns: UserBehaviorPattern[] = [];
    let achievedMilestones: HabitMilestone[] = [];

    try {
      // 1. Pattern Recognition
      if (config.enableProactiveNotifications && historicalMetrics.length >= 7) {
        detectedPatterns = await patternRecognitionService.detectPatterns(userId, historicalMetrics);
      }

      // 2. Generate notifications based on metric changes
      if (config.enableProactiveNotifications && historicalMetrics.length > 0) {
        const metricNotifications = await proactiveNotificationService.generateNotifications(
          userId, 
          currentMetrics, 
          historicalMetrics
        );
        if (metricNotifications) {
          allNotifications.push(...metricNotifications);
        }
      }

      // 3. Generate contextual trigger notifications
      if (config.enableContextualTriggers) {
        const contextualNotifications = await contextualTriggerService.evaluateTriggers(
          userId, 
          currentMetrics, 
          historicalMetrics
        );
        if (contextualNotifications) {
          allNotifications.push(...contextualNotifications);
        }
      }

      // 4. Update habit milestones and generate celebrations
      if (config.enableHabitTracking && historicalMetrics.length > 0) {
        const allHealthData = [...historicalMetrics, currentMetrics];
        achievedMilestones = await habitReinforcementService.updateHabitMilestones(userId, allHealthData);
        
        if (achievedMilestones.length > 0) {
          const celebrationNotifications = await habitReinforcementService.generateCelebrationNotifications(
            userId, 
            achievedMilestones
          );
          allNotifications.push(...celebrationNotifications);
        }
      }

      // 5. Apply smart timing to all notifications
      if (config.personalizedTimingEnabled) {
        for (const notification of allNotifications) {
          const optimalTime = await smartTimingService.calculateOptimalTiming(
            userId, 
            notification, 
            currentMetrics
          );
          notification.scheduledFor = optimalTime;
        }
      }

      // 6. Filter and prioritize notifications
      const finalNotifications = this.filterAndPrioritizeNotifications(
        allNotifications, 
        config
      );

      // 7. Record notifications for learning
      for (const notification of finalNotifications) {
        smartTimingService.recordNotificationDelivery(userId, notification);
      }

      return {
        notifications: finalNotifications,
        patterns: detectedPatterns,
        milestones: achievedMilestones
      };

    } catch (error) {
      console.error('Error in proactive coaching processing:', error);
      return {
        notifications: [],
        patterns: [],
        milestones: []
      };
    }
  }

  /**
   * Get pending notifications for a user
   */
  async getPendingNotifications(userId: string): Promise<ProactiveNotification[]> {
    try {
      return proactiveNotificationService.getPendingNotifications(userId) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Mark notification as acknowledged and learn from user behavior
   */
  async acknowledgeNotification(
    userId: string, 
    notificationId: string, 
    userAction: 'acknowledged' | 'dismissed' | 'acted_upon' | 'ignored'
  ): Promise<void> {
    // Mark as acknowledged in notification service
    if (userAction === 'acknowledged' || userAction === 'acted_upon') {
      proactiveNotificationService.markAsAcknowledged(notificationId);
    }

    // Learn from user behavior for smart timing
    const notification = this.findNotificationById(notificationId);
    if (notification) {
      await smartTimingService.learnFromUserBehavior(
        userId, 
        notification, 
        userAction, 
        new Date()
      );
    }
  }

  /**
   * Get user's behavior patterns
   */
  getUserPatterns(userId: string): UserBehaviorPattern[] {
    try {
      return patternRecognitionService.getUserPatterns(userId) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get user's habit progress
   */
  getHabitProgress(userId: string): HabitMilestone[] {
    try {
      return habitReinforcementService.getHabitProgress(userId) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get next milestone for a specific habit
   */
  getNextMilestone(userId: string, habitType: HabitMilestone['habitType']): HabitMilestone | null {
    try {
      return habitReinforcementService.getNextMilestone(userId, habitType);
    } catch (error) {
      return null;
    }
  }

  private userConfigs: Map<string, CoachingIntelligenceConfig> = new Map();

  /**
   * Configure proactive coaching settings for a user
   */
  setUserConfig(userId: string, config: Partial<CoachingIntelligenceConfig>): void {
    const currentConfig = this.getUserConfig(userId);
    const updatedConfig = { ...currentConfig, ...config };
    this.userConfigs.set(userId, updatedConfig);
    this.saveUserConfig(userId, updatedConfig);
  }

  /**
   * Get user's coaching configuration
   */
  getUserConfig(userId: string): CoachingIntelligenceConfig {
    return this.userConfigs.get(userId) || this.DEFAULT_CONFIG;
  }

  /**
   * Set user's notification timing preferences
   */
  setUserTimingPreferences(userId: string, preferences: any): void {
    smartTimingService.setUserPreferences(userId, preferences);
  }

  /**
   * Analyze user activity patterns and suggest optimal notification times
   */
  async optimizeNotificationTiming(userId: string, healthData: HealthMetrics[]): Promise<any[]> {
    try {
      return await smartTimingService.analyzeActivityPatterns(userId, healthData) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get notification delivery statistics
   */
  getDeliveryStats(userId: string): any {
    try {
      return smartTimingService.getDeliveryStats(userId);
    } catch (error) {
      return {
        totalSent: 0,
        acknowledged: 0,
        dismissed: 0,
        averageResponseTime: 0,
        optimalTimes: []
      };
    }
  }

  /**
   * Enable or disable specific contextual triggers
   */
  setTriggerEnabled(triggerId: string, enabled: boolean): void {
    contextualTriggerService.setTriggerEnabled(triggerId, enabled);
  }

  /**
   * Get all available contextual triggers
   */
  getAvailableTriggers(): any[] {
    try {
      return contextualTriggerService.getAllTriggers() || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Force pattern detection (useful for testing or manual triggers)
   */
  async forcePatternDetection(userId: string, healthData: HealthMetrics[]): Promise<UserBehaviorPattern[]> {
    try {
      return await patternRecognitionService.detectPatterns(userId, healthData) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate immediate coaching suggestion based on current state
   */
  async generateImmediateCoaching(
    userId: string, 
    currentMetrics: HealthMetrics, 
    context?: string
  ): Promise<ProactiveNotification | null> {
    // Generate contextual suggestions based on current metrics
    const contextualNotifications = await contextualTriggerService.evaluateTriggers(
      userId, 
      currentMetrics, 
      []
    );

    if (contextualNotifications && contextualNotifications.length > 0) {
      const notification = contextualNotifications[0];
      notification.scheduledFor = new Date(); // Immediate
      return notification;
    }

    // Fallback to metric-based suggestions
    const metricNotifications = await proactiveNotificationService.createContextualTriggers(
      userId, 
      currentMetrics
    );

    return (metricNotifications && metricNotifications.length > 0) ? metricNotifications[0] : null;
  }

  // Private helper methods

  private filterAndPrioritizeNotifications(
    notifications: ProactiveNotification[], 
    config: CoachingIntelligenceConfig
  ): ProactiveNotification[] {
    // Remove duplicates based on type and content similarity
    const uniqueNotifications = this.removeDuplicateNotifications(notifications);

    // Sort by priority and scheduled time
    const sortedNotifications = uniqueNotifications.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    });

    // Limit to daily notification frequency
    return sortedNotifications.slice(0, config.notificationFrequencyLimit);
  }

  private removeDuplicateNotifications(notifications: ProactiveNotification[]): ProactiveNotification[] {
    const seen = new Set<string>();
    const unique: ProactiveNotification[] = [];

    for (const notification of notifications) {
      const key = `${notification.type}_${notification.triggerData.metric}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(notification);
      }
    }

    return unique;
  }

  private findNotificationById(notificationId: string): ProactiveNotification | null {
    // In a real implementation, this would search through stored notifications
    // For now, return null as we don't have a central notification store
    return null;
  }

  private saveUserConfig(userId: string, config: CoachingIntelligenceConfig): void {
    // In a real implementation, this would save to persistent storage
    // For now, we'll just log it
    console.log(`Saving config for user ${userId}:`, config);
  }
}

export const proactiveCoachingService = new ProactiveCoachingService();