import { HealthMetrics } from '../../../shared/types/healthTypes';
import { 
  ProactiveNotification, 
  HealthMetricChange, 
  CoachingAction,
  SmartTimingPreferences,
  TimeWindow
} from '../types/proactiveCoachingTypes';

export class ProactiveNotificationService {
  private notifications: Map<string, ProactiveNotification> = new Map();
  private userPreferences: Map<string, SmartTimingPreferences> = new Map();
  private readonly SIGNIFICANT_CHANGE_THRESHOLD = 0.15; // 15% change
  private readonly NOTIFICATION_COOLDOWN = 60; // minutes

  /**
   * Analyze health metric changes and generate proactive notifications
   */
  async generateNotifications(
    userId: string, 
    currentMetrics: HealthMetrics, 
    previousMetrics: HealthMetrics[]
  ): Promise<ProactiveNotification[]> {
    const notifications: ProactiveNotification[] = [];

    // Analyze each metric for significant changes
    const metricChanges = this.analyzeMetricChanges(currentMetrics, previousMetrics);

    for (const change of metricChanges) {
      if (this.isSignificantChange(change)) {
        const notification = await this.createNotificationForChange(userId, change);
        if (notification && this.shouldSendNotification(userId, notification)) {
          notifications.push(notification);
          this.notifications.set(notification.id, notification);
        }
      }
    }

    return notifications;
  }

  /**
   * Create contextual coaching triggers based on health patterns
   */
  async createContextualTriggers(userId: string, currentMetrics: HealthMetrics): Promise<ProactiveNotification[]> {
    const notifications: ProactiveNotification[] = [];

    // Poor sleep → nutrition adjustments
    if (currentMetrics.sleepScore < 0.6) {
      const nutritionNotification = this.createSleepNutritionTrigger(userId, currentMetrics);
      if (nutritionNotification) notifications.push(nutritionNotification);
    }

    // High stress → recovery recommendations
    if (currentMetrics.stressLevel > 0.7) {
      const stressNotification = this.createStressRecoveryTrigger(userId, currentMetrics);
      if (stressNotification) notifications.push(stressNotification);
    }

    // Low recovery → workout adjustment
    if (currentMetrics.recoveryScore < 0.5) {
      const recoveryNotification = this.createRecoveryWorkoutTrigger(userId, currentMetrics);
      if (recoveryNotification) notifications.push(recoveryNotification);
    }

    // High activity without adequate nutrition
    if (currentMetrics.activityLevel > 0.8 && currentMetrics.caloriesConsumed < 1500) {
      const fuelingNotification = this.createFuelingTrigger(userId, currentMetrics);
      if (fuelingNotification) notifications.push(fuelingNotification);
    }

    // Dehydration during high activity
    if (currentMetrics.activityLevel > 0.6 && currentMetrics.waterIntake < 1500) {
      const hydrationNotification = this.createHydrationTrigger(userId, currentMetrics);
      if (hydrationNotification) notifications.push(hydrationNotification);
    }

    return notifications;
  }

  /**
   * Schedule notifications based on optimal timing
   */
  async scheduleNotification(notification: ProactiveNotification): Promise<void> {
    const userPrefs = this.userPreferences.get(notification.userId);
    
    if (!userPrefs) {
      // Send immediately if no preferences set
      notification.scheduledFor = new Date();
      return;
    }

    const optimalTime = this.calculateOptimalDeliveryTime(notification, userPrefs);
    notification.scheduledFor = optimalTime;
  }

  /**
   * Set user preferences for notification timing
   */
  setUserPreferences(userId: string, preferences: SmartTimingPreferences): void {
    this.userPreferences.set(userId, preferences);
  }

  /**
   * Get pending notifications for a user
   */
  getPendingNotifications(userId: string): ProactiveNotification[] {
    return Array.from(this.notifications.values())
      .filter(notification => 
        notification.userId === userId && 
        !notification.delivered &&
        notification.scheduledFor <= new Date()
      );
  }

  /**
   * Mark notification as delivered
   */
  markAsDelivered(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.delivered = true;
    }
  }

  /**
   * Mark notification as acknowledged by user
   */
  markAsAcknowledged(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.acknowledged = true;
    }
  }

  // Private helper methods

  private analyzeMetricChanges(current: HealthMetrics, previous: HealthMetrics[]): HealthMetricChange[] {
    if (previous.length === 0) return [];

    const recentPrevious = previous[previous.length - 1];
    const weeklyAverage = this.calculateWeeklyAverage(previous);

    const changes: HealthMetricChange[] = [];

    // Analyze each metric
    const metrics = [
      'heartRate', 'heartRateVariability', 'sleepScore', 'recoveryScore', 
      'stressLevel', 'activityLevel', 'caloriesConsumed', 'waterIntake'
    ];

    for (const metric of metrics) {
      const currentValue = (current as any)[metric];
      const previousValue = (recentPrevious as any)[metric];
      const weeklyValue = (weeklyAverage as any)[metric];

      if (currentValue !== undefined && previousValue !== undefined) {
        const changeFromPrevious = (currentValue - previousValue) / previousValue;
        const changeFromWeekly = weeklyValue ? (currentValue - weeklyValue) / weeklyValue : 0;

        changes.push({
          metric,
          previousValue,
          currentValue,
          changePercentage: changeFromPrevious,
          trend: this.determineTrend(changeFromPrevious, changeFromWeekly),
          timeframe: '24h'
        });
      }
    }

    return changes;
  }

  private calculateWeeklyAverage(metrics: HealthMetrics[]): Partial<HealthMetrics> {
    if (metrics.length === 0) return {};

    const recentWeek = metrics.slice(-7);
    const averages: any = {};

    const numericFields = [
      'heartRate', 'heartRateVariability', 'sleepScore', 'recoveryScore',
      'stressLevel', 'activityLevel', 'caloriesConsumed', 'waterIntake'
    ];

    for (const field of numericFields) {
      const values = recentWeek.map(m => (m as any)[field]).filter(v => v !== undefined);
      if (values.length > 0) {
        averages[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    }

    return averages;
  }

  private determineTrend(shortTerm: number, longTerm: number): 'improving' | 'declining' | 'stable' {
    const threshold = 0.05; // 5% threshold for stability

    if (Math.abs(shortTerm) < threshold && Math.abs(longTerm) < threshold) {
      return 'stable';
    }

    // For metrics where higher is better (recovery, sleep, HRV)
    // For metrics where lower is better (stress, resting HR)
    const improvingMetrics = ['recoveryScore', 'sleepScore', 'heartRateVariability', 'activityLevel'];
    const decliningMetrics = ['stressLevel', 'heartRate'];

    if (shortTerm > threshold) {
      return 'improving'; // Simplified - would need metric-specific logic
    } else if (shortTerm < -threshold) {
      return 'declining';
    }

    return 'stable';
  }

  private isSignificantChange(change: HealthMetricChange): boolean {
    return Math.abs(change.changePercentage) >= this.SIGNIFICANT_CHANGE_THRESHOLD;
  }

  private async createNotificationForChange(
    userId: string, 
    change: HealthMetricChange
  ): Promise<ProactiveNotification | null> {
    const notificationId = `${userId}_${change.metric}_${Date.now()}`;

    switch (change.metric) {
      case 'sleepScore':
        return this.createSleepScoreNotification(notificationId, userId, change);
      case 'recoveryScore':
        return this.createRecoveryNotification(notificationId, userId, change);
      case 'stressLevel':
        return this.createStressNotification(notificationId, userId, change);
      case 'heartRateVariability':
        return this.createHRVNotification(notificationId, userId, change);
      default:
        return null;
    }
  }

  private createSleepScoreNotification(
    id: string, 
    userId: string, 
    change: HealthMetricChange
  ): ProactiveNotification {
    const isImproving = change.trend === 'improving';
    const magnitude = Math.abs(change.changePercentage);

    return {
      id,
      userId,
      type: isImproving ? 'milestone_celebration' : 'coaching_suggestion',
      priority: magnitude > 0.3 ? 'high' : 'medium',
      title: isImproving ? 'Great Sleep Progress!' : 'Sleep Quality Alert',
      message: isImproving 
        ? `Your sleep quality improved by ${Math.round(magnitude * 100)}%! Keep up the great work.`
        : `Your sleep quality dropped by ${Math.round(magnitude * 100)}%. Let's get you back on track.`,
      actionable: !isImproving,
      suggestedActions: isImproving ? [] : [
        {
          type: 'sleep_optimization',
          title: 'Optimize Sleep Environment',
          description: 'Review your bedroom setup and bedtime routine',
          estimatedTime: 10,
          difficulty: 'easy',
          expectedOutcome: 'Better sleep quality tonight'
        },
        {
          type: 'stress_management',
          title: 'Evening Wind-Down',
          description: 'Try a 10-minute meditation before bed',
          estimatedTime: 10,
          difficulty: 'easy',
          expectedOutcome: 'Reduced pre-sleep anxiety'
        }
      ],
      triggerData: change,
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      delivered: false,
      acknowledged: false
    };
  }

  private createRecoveryNotification(
    id: string, 
    userId: string, 
    change: HealthMetricChange
  ): ProactiveNotification {
    const isImproving = change.trend === 'improving';
    const magnitude = Math.abs(change.changePercentage);

    return {
      id,
      userId,
      type: isImproving ? 'milestone_celebration' : 'coaching_suggestion',
      priority: magnitude > 0.25 ? 'high' : 'medium',
      title: isImproving ? 'Recovery Trending Up!' : 'Recovery Needs Attention',
      message: isImproving
        ? `Your recovery improved by ${Math.round(magnitude * 100)}%! Your body is adapting well.`
        : `Your recovery dropped by ${Math.round(magnitude * 100)}%. Time to prioritize rest.`,
      actionable: !isImproving,
      suggestedActions: isImproving ? [] : [
        {
          type: 'workout_adjustment',
          title: 'Reduce Training Intensity',
          description: 'Switch to lighter workouts or active recovery',
          estimatedTime: 30,
          difficulty: 'easy',
          expectedOutcome: 'Improved recovery scores'
        },
        {
          type: 'sleep_optimization',
          title: 'Prioritize Sleep',
          description: 'Aim for an extra hour of sleep tonight',
          estimatedTime: 60,
          difficulty: 'moderate',
          expectedOutcome: 'Better recovery tomorrow'
        }
      ],
      triggerData: change,
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      delivered: false,
      acknowledged: false
    };
  }

  private createStressNotification(
    id: string, 
    userId: string, 
    change: HealthMetricChange
  ): ProactiveNotification {
    const isImproving = change.trend === 'declining'; // Lower stress is better
    const magnitude = Math.abs(change.changePercentage);

    return {
      id,
      userId,
      type: isImproving ? 'milestone_celebration' : 'health_alert',
      priority: magnitude > 0.4 ? 'high' : 'medium',
      title: isImproving ? 'Stress Levels Improving!' : 'Elevated Stress Detected',
      message: isImproving
        ? `Your stress levels decreased by ${Math.round(magnitude * 100)}%! Great job managing stress.`
        : `Your stress levels increased by ${Math.round(magnitude * 100)}%. Let's address this.`,
      actionable: !isImproving,
      suggestedActions: isImproving ? [] : [
        {
          type: 'stress_management',
          title: 'Quick Breathing Exercise',
          description: '5-minute box breathing to reduce immediate stress',
          estimatedTime: 5,
          difficulty: 'easy',
          expectedOutcome: 'Immediate stress relief'
        },
        {
          type: 'workout_adjustment',
          title: 'Gentle Movement',
          description: 'Light yoga or walking to release tension',
          estimatedTime: 20,
          difficulty: 'easy',
          expectedOutcome: 'Reduced stress hormones'
        }
      ],
      triggerData: change,
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      delivered: false,
      acknowledged: false
    };
  }

  private createHRVNotification(
    id: string, 
    userId: string, 
    change: HealthMetricChange
  ): ProactiveNotification {
    const isImproving = change.trend === 'improving';
    const magnitude = Math.abs(change.changePercentage);

    return {
      id,
      userId,
      type: isImproving ? 'milestone_celebration' : 'coaching_suggestion',
      priority: magnitude > 0.2 ? 'medium' : 'low',
      title: isImproving ? 'HRV Improving!' : 'HRV Needs Attention',
      message: isImproving
        ? `Your heart rate variability improved by ${Math.round(magnitude * 100)}%! Your autonomic nervous system is responding well.`
        : `Your HRV decreased by ${Math.round(magnitude * 100)}%. This might indicate you need more recovery.`,
      actionable: !isImproving,
      suggestedActions: isImproving ? [] : [
        {
          type: 'stress_management',
          title: 'HRV Breathing',
          description: 'Coherent breathing at 5 breaths per minute',
          estimatedTime: 10,
          difficulty: 'easy',
          expectedOutcome: 'Improved HRV and autonomic balance'
        }
      ],
      triggerData: change,
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      delivered: false,
      acknowledged: false
    };
  }

  // Contextual trigger methods
  private createSleepNutritionTrigger(userId: string, metrics: HealthMetrics): ProactiveNotification {
    return {
      id: `sleep_nutrition_${userId}_${Date.now()}`,
      userId,
      type: 'coaching_suggestion',
      priority: 'medium',
      title: 'Poor Sleep Recovery Plan',
      message: 'Your sleep quality was low last night. Let\'s optimize your nutrition today to help you feel better.',
      actionable: true,
      suggestedActions: [
        {
          type: 'nutrition_suggestion',
          title: 'Hydrate First',
          description: 'Drink 16-20oz of water to combat sleep-related dehydration',
          estimatedTime: 2,
          difficulty: 'easy',
          expectedOutcome: 'Improved alertness and energy'
        },
        {
          type: 'nutrition_suggestion',
          title: 'Protein-Rich Breakfast',
          description: 'Focus on protein to stabilize blood sugar after poor sleep',
          estimatedTime: 15,
          difficulty: 'easy',
          expectedOutcome: 'More stable energy levels'
        }
      ],
      triggerData: {
        metric: 'sleepScore',
        previousValue: 0.8,
        currentValue: metrics.sleepScore,
        changePercentage: (metrics.sleepScore - 0.8) / 0.8,
        trend: 'declining',
        timeframe: '24h'
      },
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      delivered: false,
      acknowledged: false
    };
  }

  private createStressRecoveryTrigger(userId: string, metrics: HealthMetrics): ProactiveNotification {
    return {
      id: `stress_recovery_${userId}_${Date.now()}`,
      userId,
      type: 'health_alert',
      priority: 'high',
      title: 'High Stress Alert',
      message: 'Your stress levels are elevated. Let\'s take immediate action to help you feel better.',
      actionable: true,
      suggestedActions: [
        {
          type: 'stress_management',
          title: 'Immediate Relief',
          description: '4-7-8 breathing technique for quick stress reduction',
          estimatedTime: 3,
          difficulty: 'easy',
          expectedOutcome: 'Rapid stress relief'
        },
        {
          type: 'workout_adjustment',
          title: 'Gentle Movement',
          description: 'Light stretching or short walk to release tension',
          estimatedTime: 10,
          difficulty: 'easy',
          expectedOutcome: 'Physical and mental stress relief'
        }
      ],
      triggerData: {
        metric: 'stressLevel',
        previousValue: 0.4,
        currentValue: metrics.stressLevel,
        changePercentage: (metrics.stressLevel - 0.4) / 0.4,
        trend: 'declining',
        timeframe: '24h'
      },
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      delivered: false,
      acknowledged: false
    };
  }

  private createRecoveryWorkoutTrigger(userId: string, metrics: HealthMetrics): ProactiveNotification {
    return {
      id: `recovery_workout_${userId}_${Date.now()}`,
      userId,
      type: 'coaching_suggestion',
      priority: 'medium',
      title: 'Low Recovery - Workout Adjustment',
      message: 'Your recovery is low today. Let\'s adjust your workout to support your body\'s needs.',
      actionable: true,
      suggestedActions: [
        {
          type: 'workout_adjustment',
          title: 'Active Recovery',
          description: 'Switch to light yoga, walking, or mobility work',
          estimatedTime: 30,
          difficulty: 'easy',
          expectedOutcome: 'Better recovery without additional stress'
        },
        {
          type: 'workout_adjustment',
          title: 'Reduce Intensity',
          description: 'If you must train, reduce intensity by 30-40%',
          estimatedTime: 45,
          difficulty: 'moderate',
          expectedOutcome: 'Maintained fitness without overreaching'
        }
      ],
      triggerData: {
        metric: 'recoveryScore',
        previousValue: 0.7,
        currentValue: metrics.recoveryScore,
        changePercentage: (metrics.recoveryScore - 0.7) / 0.7,
        trend: 'declining',
        timeframe: '24h'
      },
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      delivered: false,
      acknowledged: false
    };
  }

  private createFuelingTrigger(userId: string, metrics: HealthMetrics): ProactiveNotification {
    return {
      id: `fueling_${userId}_${Date.now()}`,
      userId,
      type: 'coaching_suggestion',
      priority: 'high',
      title: 'Fuel Your Performance',
      message: 'You\'re training hard but haven\'t eaten enough. Let\'s fuel your body properly.',
      actionable: true,
      suggestedActions: [
        {
          type: 'nutrition_suggestion',
          title: 'Post-Workout Fuel',
          description: 'Eat a balanced meal with protein and carbs within 2 hours',
          estimatedTime: 20,
          difficulty: 'easy',
          expectedOutcome: 'Better recovery and energy replenishment'
        }
      ],
      triggerData: {
        metric: 'caloriesConsumed',
        previousValue: 2000,
        currentValue: metrics.caloriesConsumed,
        changePercentage: (metrics.caloriesConsumed - 2000) / 2000,
        trend: 'declining',
        timeframe: '24h'
      },
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      delivered: false,
      acknowledged: false
    };
  }

  private createHydrationTrigger(userId: string, metrics: HealthMetrics): ProactiveNotification {
    return {
      id: `hydration_${userId}_${Date.now()}`,
      userId,
      type: 'coaching_suggestion',
      priority: 'medium',
      title: 'Hydration Check',
      message: 'You\'re active but haven\'t had enough water. Let\'s get you hydrated.',
      actionable: true,
      suggestedActions: [
        {
          type: 'nutrition_suggestion',
          title: 'Immediate Hydration',
          description: 'Drink 16-20oz of water right now',
          estimatedTime: 2,
          difficulty: 'easy',
          expectedOutcome: 'Improved performance and recovery'
        }
      ],
      triggerData: {
        metric: 'waterIntake',
        previousValue: 2000,
        currentValue: metrics.waterIntake,
        changePercentage: (metrics.waterIntake - 2000) / 2000,
        trend: 'declining',
        timeframe: '24h'
      },
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      delivered: false,
      acknowledged: false
    };
  }

  private shouldSendNotification(userId: string, notification: ProactiveNotification): boolean {
    // Check if we've sent too many notifications recently
    const recentNotifications = Array.from(this.notifications.values())
      .filter(n => 
        n.userId === userId && 
        n.delivered && 
        new Date().getTime() - new Date(n.scheduledFor).getTime() < this.NOTIFICATION_COOLDOWN * 60 * 1000
      );

    const userPrefs = this.userPreferences.get(userId);
    const maxPerDay = userPrefs?.maxNotificationsPerDay || 10;

    if (recentNotifications.length >= maxPerDay) {
      return false;
    }

    // Always allow urgent notifications
    if (notification.priority === 'urgent') {
      return true;
    }

    return true;
  }

  private calculateOptimalDeliveryTime(
    notification: ProactiveNotification, 
    preferences: SmartTimingPreferences
  ): Date {
    const now = new Date();
    
    // For urgent notifications, send immediately
    if (notification.priority === 'urgent') {
      return now;
    }

    // Check if we're in a do-not-disturb period
    if (this.isInDoNotDisturbPeriod(now, preferences.doNotDisturbPeriods)) {
      // Find next available time window
      return this.findNextAvailableTime(now, preferences);
    }

    // Check if we're in a preferred notification time
    if (this.isInPreferredTime(now, preferences.preferredNotificationTimes)) {
      return now;
    }

    // Find next preferred time
    return this.findNextPreferredTime(now, preferences);
  }

  private isInDoNotDisturbPeriod(time: Date, dndPeriods: TimeWindow[]): boolean {
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    const dayOfWeek = time.getDay();

    return dndPeriods.some(period => {
      if (period.daysOfWeek && !period.daysOfWeek.includes(dayOfWeek)) {
        return false;
      }
      return timeStr >= period.start && timeStr <= period.end;
    });
  }

  private isInPreferredTime(time: Date, preferredTimes: TimeWindow[]): boolean {
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    const dayOfWeek = time.getDay();

    return preferredTimes.some(period => {
      if (period.daysOfWeek && !period.daysOfWeek.includes(dayOfWeek)) {
        return false;
      }
      return timeStr >= period.start && timeStr <= period.end;
    });
  }

  private findNextAvailableTime(from: Date, preferences: SmartTimingPreferences): Date {
    // Simplified: add 1 hour and check again
    const nextTime = new Date(from.getTime() + 60 * 60 * 1000);
    
    if (this.isInDoNotDisturbPeriod(nextTime, preferences.doNotDisturbPeriods)) {
      return this.findNextAvailableTime(nextTime, preferences);
    }
    
    return nextTime;
  }

  private findNextPreferredTime(from: Date, preferences: SmartTimingPreferences): Date {
    // Simplified: find next preferred time window
    const preferredTimes = preferences.preferredNotificationTimes;
    
    if (preferredTimes.length === 0) {
      return new Date(from.getTime() + 60 * 60 * 1000); // 1 hour later
    }

    // For simplicity, return the start of the first preferred time window tomorrow
    const tomorrow = new Date(from);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const firstPreferred = preferredTimes[0];
    const [hours, minutes] = firstPreferred.start.split(':').map(Number);
    
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow;
  }
}

export const proactiveNotificationService = new ProactiveNotificationService();