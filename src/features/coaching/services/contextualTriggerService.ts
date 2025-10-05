import { HealthMetrics } from '../../../shared/types/healthTypes';
import { 
  ContextualTrigger, 
  TriggerCondition, 
  CoachingIntervention, 
  ProactiveNotification,
  CoachingAction
} from '../types/proactiveCoachingTypes';

export class ContextualTriggerService {
  private triggers: Map<string, ContextualTrigger> = new Map();
  private readonly CORRELATION_THRESHOLD = 0.7;

  constructor() {
    this.initializeDefaultTriggers();
  }

  /**
   * Initialize default contextual triggers
   */
  private initializeDefaultTriggers(): void {
    // Poor sleep → nutrition adjustments
    this.addTrigger({
      id: 'poor_sleep_nutrition',
      name: 'Poor Sleep Nutrition Adjustment',
      condition: {
        type: 'metric_threshold',
        parameters: { metric: 'sleepScore', threshold: 0.6, operator: 'less_than' },
        evaluationFunction: 'sleepScore < 0.6'
      },
      action: {
        type: 'immediate_notification',
        content: 'Your sleep quality was low last night. Let\'s optimize your nutrition today to help you recover.',
        actions: [
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
        timing: {
          immediate: false,
          delay: 30, // 30 minutes after wake up
          optimalTimeWindow: { start: '07:00', end: '10:00' },
          respectUserPreferences: true
        }
      },
      enabled: true,
      triggerCount: 0
    });

    // High stress → recovery recommendations
    this.addTrigger({
      id: 'high_stress_recovery',
      name: 'High Stress Recovery Protocol',
      condition: {
        type: 'metric_threshold',
        parameters: { metric: 'stressLevel', threshold: 0.7, operator: 'greater_than' },
        evaluationFunction: 'stressLevel > 0.7'
      },
      action: {
        type: 'immediate_notification',
        content: 'Your stress levels are elevated. Let\'s take immediate action to help you feel better.',
        actions: [
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
        timing: {
          immediate: true,
          respectUserPreferences: false // Stress is urgent
        }
      },
      enabled: true,
      triggerCount: 0
    });

    // Low recovery → workout adjustment
    this.addTrigger({
      id: 'low_recovery_workout',
      name: 'Low Recovery Workout Adjustment',
      condition: {
        type: 'metric_threshold',
        parameters: { metric: 'recoveryScore', threshold: 0.5, operator: 'less_than' },
        evaluationFunction: 'recoveryScore < 0.5'
      },
      action: {
        type: 'scheduled_reminder',
        content: 'Your recovery is low today. Let\'s adjust your workout to support your body\'s needs.',
        actions: [
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
        timing: {
          immediate: false,
          delay: 60, // 1 hour before typical workout time
          optimalTimeWindow: { start: '06:00', end: '09:00' },
          respectUserPreferences: true
        }
      },
      enabled: true,
      triggerCount: 0
    });

    // High activity without adequate nutrition
    this.addTrigger({
      id: 'high_activity_low_fuel',
      name: 'High Activity Low Fuel Alert',
      condition: {
        type: 'correlation_found',
        parameters: { 
          metric1: 'activityLevel', 
          threshold1: 0.8, 
          operator1: 'greater_than',
          metric2: 'caloriesConsumed',
          threshold2: 1500,
          operator2: 'less_than'
        },
        evaluationFunction: 'activityLevel > 0.8 && caloriesConsumed < 1500'
      },
      action: {
        type: 'immediate_notification',
        content: 'You\'re training hard but haven\'t eaten enough. Let\'s fuel your body properly.',
        actions: [
          {
            type: 'nutrition_suggestion',
            title: 'Post-Workout Fuel',
            description: 'Eat a balanced meal with protein and carbs within 2 hours',
            estimatedTime: 20,
            difficulty: 'easy',
            expectedOutcome: 'Better recovery and energy replenishment'
          },
          {
            type: 'nutrition_suggestion',
            title: 'Quick Energy',
            description: 'Have a protein shake or banana if you can\'t eat a full meal',
            estimatedTime: 5,
            difficulty: 'easy',
            expectedOutcome: 'Immediate energy and recovery support'
          }
        ],
        timing: {
          immediate: true,
          respectUserPreferences: true
        }
      },
      enabled: true,
      triggerCount: 0
    });

    // Dehydration during activity
    this.addTrigger({
      id: 'activity_dehydration',
      name: 'Activity Dehydration Alert',
      condition: {
        type: 'correlation_found',
        parameters: {
          metric1: 'activityLevel',
          threshold1: 0.6,
          operator1: 'greater_than',
          metric2: 'waterIntake',
          threshold2: 1500,
          operator2: 'less_than'
        },
        evaluationFunction: 'activityLevel > 0.6 && waterIntake < 1500'
      },
      action: {
        type: 'immediate_notification',
        content: 'You\'re active but haven\'t had enough water. Let\'s get you hydrated.',
        actions: [
          {
            type: 'nutrition_suggestion',
            title: 'Immediate Hydration',
            description: 'Drink 16-20oz of water right now',
            estimatedTime: 2,
            difficulty: 'easy',
            expectedOutcome: 'Improved performance and recovery'
          },
          {
            type: 'nutrition_suggestion',
            title: 'Electrolyte Balance',
            description: 'Add electrolytes if you\'ve been sweating heavily',
            estimatedTime: 3,
            difficulty: 'easy',
            expectedOutcome: 'Better hydration and performance'
          }
        ],
        timing: {
          immediate: true,
          respectUserPreferences: false // Dehydration is urgent
        }
      },
      enabled: true,
      triggerCount: 0
    });

    // Consistent poor sleep → sleep coaching
    this.addTrigger({
      id: 'consistent_poor_sleep',
      name: 'Consistent Poor Sleep Intervention',
      condition: {
        type: 'pattern_detected',
        parameters: { 
          metric: 'sleepScore', 
          threshold: 0.6, 
          operator: 'less_than',
          consecutiveDays: 3
        },
        evaluationFunction: 'sleepScore < 0.6 for 3+ consecutive days'
      },
      action: {
        type: 'conversation_starter',
        content: 'I\'ve noticed your sleep has been challenging for a few days. Let\'s work together to improve it.',
        actions: [
          {
            type: 'sleep_optimization',
            title: 'Sleep Environment Audit',
            description: 'Review and optimize your bedroom for better sleep',
            estimatedTime: 15,
            difficulty: 'easy',
            expectedOutcome: 'Improved sleep environment'
          },
          {
            type: 'sleep_optimization',
            title: 'Bedtime Routine Reset',
            description: 'Create a consistent wind-down routine',
            estimatedTime: 30,
            difficulty: 'moderate',
            expectedOutcome: 'Better sleep onset and quality'
          }
        ],
        timing: {
          immediate: false,
          optimalTimeWindow: { start: '19:00', end: '21:00' },
          respectUserPreferences: true
        }
      },
      enabled: true,
      triggerCount: 0
    });

    // Workout performance decline
    this.addTrigger({
      id: 'workout_performance_decline',
      name: 'Workout Performance Decline Alert',
      condition: {
        type: 'pattern_detected',
        parameters: {
          metric: 'activityLevel',
          threshold: -0.2, // 20% decline
          operator: 'decline_percentage',
          timeframe: '7d'
        },
        evaluationFunction: 'activityLevel declined by 20% over 7 days'
      },
      action: {
        type: 'conversation_starter',
        content: 'I\'ve noticed your workout performance has declined recently. Let\'s figure out what\'s going on.',
        actions: [
          {
            type: 'workout_adjustment',
            title: 'Recovery Week',
            description: 'Take a planned recovery week to reset',
            estimatedTime: 0,
            difficulty: 'easy',
            expectedOutcome: 'Restored performance and motivation'
          },
          {
            type: 'stress_management',
            title: 'Stress Assessment',
            description: 'Evaluate if stress is impacting your performance',
            estimatedTime: 10,
            difficulty: 'easy',
            expectedOutcome: 'Better understanding of performance factors'
          }
        ],
        timing: {
          immediate: false,
          optimalTimeWindow: { start: '18:00', end: '20:00' },
          respectUserPreferences: true
        }
      },
      enabled: true,
      triggerCount: 0
    });
  }

  /**
   * Add a new contextual trigger
   */
  addTrigger(trigger: ContextualTrigger): void {
    this.triggers.set(trigger.id, trigger);
  }

  /**
   * Remove a contextual trigger
   */
  removeTrigger(triggerId: string): void {
    this.triggers.delete(triggerId);
  }

  /**
   * Enable or disable a trigger
   */
  setTriggerEnabled(triggerId: string, enabled: boolean): void {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.enabled = enabled;
    }
  }

  /**
   * Evaluate all triggers against current health metrics
   */
  async evaluateTriggers(
    userId: string, 
    currentMetrics: HealthMetrics, 
    historicalMetrics: HealthMetrics[]
  ): Promise<ProactiveNotification[]> {
    const notifications: ProactiveNotification[] = [];

    for (const trigger of this.triggers.values()) {
      if (!trigger.enabled) continue;

      const shouldTrigger = await this.evaluateTriggerCondition(
        trigger.condition, 
        currentMetrics, 
        historicalMetrics
      );

      if (shouldTrigger) {
        const notification = this.createNotificationFromTrigger(userId, trigger);
        notifications.push(notification);

        // Update trigger statistics
        trigger.triggerCount++;
        trigger.lastTriggered = new Date();
      }
    }

    return notifications;
  }

  /**
   * Get all available triggers
   */
  getAllTriggers(): ContextualTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Get enabled triggers only
   */
  getEnabledTriggers(): ContextualTrigger[] {
    return Array.from(this.triggers.values()).filter(trigger => trigger.enabled);
  }

  /**
   * Get trigger statistics
   */
  getTriggerStats(triggerId: string): { triggerCount: number; lastTriggered?: Date } | null {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return null;

    return {
      triggerCount: trigger.triggerCount,
      lastTriggered: trigger.lastTriggered
    };
  }

  // Private helper methods

  private async evaluateTriggerCondition(
    condition: TriggerCondition,
    currentMetrics: HealthMetrics,
    historicalMetrics: HealthMetrics[]
  ): Promise<boolean> {
    switch (condition.type) {
      case 'metric_threshold':
        return this.evaluateMetricThreshold(condition, currentMetrics);
      
      case 'pattern_detected':
        return this.evaluatePatternDetection(condition, currentMetrics, historicalMetrics);
      
      case 'time_based':
        return this.evaluateTimeBased(condition);
      
      case 'correlation_found':
        return this.evaluateCorrelation(condition, currentMetrics);
      
      default:
        return false;
    }
  }

  private evaluateMetricThreshold(condition: TriggerCondition, metrics: HealthMetrics): boolean {
    const { metric, threshold, operator } = condition.parameters;
    const value = (metrics as any)[metric];

    if (value === undefined) return false;

    switch (operator) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return Math.abs(value - threshold) < 0.01;
      default:
        return false;
    }
  }

  private evaluatePatternDetection(
    condition: TriggerCondition,
    currentMetrics: HealthMetrics,
    historicalMetrics: HealthMetrics[]
  ): boolean {
    const { metric, threshold, operator, consecutiveDays, timeframe } = condition.parameters;

    if (operator === 'decline_percentage') {
      return this.evaluatePerformanceDecline(metric, threshold, timeframe, historicalMetrics);
    }

    if (consecutiveDays) {
      return this.evaluateConsecutiveDays(metric, threshold, operator, consecutiveDays, historicalMetrics);
    }

    return false;
  }

  private evaluatePerformanceDecline(
    metric: string,
    threshold: number,
    timeframe: string,
    historicalMetrics: HealthMetrics[]
  ): boolean {
    const days = parseInt(timeframe.replace('d', ''));
    if (historicalMetrics.length < days * 2) return false;

    const recentPeriod = historicalMetrics.slice(-days);
    const previousPeriod = historicalMetrics.slice(-days * 2, -days);

    const recentAvg = recentPeriod.reduce((sum, m) => sum + (m as any)[metric], 0) / recentPeriod.length;
    const previousAvg = previousPeriod.reduce((sum, m) => sum + (m as any)[metric], 0) / previousPeriod.length;

    if (previousAvg === 0) return false;

    const declinePercentage = (previousAvg - recentAvg) / previousAvg;
    return declinePercentage >= Math.abs(threshold);
  }

  private evaluateConsecutiveDays(
    metric: string,
    threshold: number,
    operator: string,
    consecutiveDays: number,
    historicalMetrics: HealthMetrics[]
  ): boolean {
    if (historicalMetrics.length < consecutiveDays) return false;

    const recentDays = historicalMetrics.slice(-consecutiveDays);
    
    return recentDays.every(metrics => {
      const value = (metrics as any)[metric];
      if (value === undefined) return false;

      switch (operator) {
        case 'greater_than':
          return value > threshold;
        case 'less_than':
          return value < threshold;
        default:
          return false;
      }
    });
  }

  private evaluateTimeBased(condition: TriggerCondition): boolean {
    const { timeOfDay, dayOfWeek } = condition.parameters;
    const now = new Date();

    if (timeOfDay) {
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentTime !== timeOfDay) return false;
    }

    if (dayOfWeek !== undefined) {
      if (now.getDay() !== dayOfWeek) return false;
    }

    return true;
  }

  private evaluateCorrelation(condition: TriggerCondition, metrics: HealthMetrics): boolean {
    const { 
      metric1, threshold1, operator1,
      metric2, threshold2, operator2
    } = condition.parameters;

    const value1 = (metrics as any)[metric1];
    const value2 = (metrics as any)[metric2];

    if (value1 === undefined || value2 === undefined) return false;

    const condition1Met = this.evaluateOperator(value1, threshold1, operator1);
    const condition2Met = this.evaluateOperator(value2, threshold2, operator2);

    return condition1Met && condition2Met;
  }

  private evaluateOperator(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return Math.abs(value - threshold) < 0.01;
      default:
        return false;
    }
  }

  private createNotificationFromTrigger(userId: string, trigger: ContextualTrigger): ProactiveNotification {
    const intervention = trigger.action;
    
    return {
      id: `trigger_${trigger.id}_${userId}_${Date.now()}`,
      userId,
      type: this.mapInterventionTypeToNotificationType(intervention.type),
      priority: this.determinePriorityFromTrigger(trigger),
      title: this.generateTitleFromTrigger(trigger),
      message: intervention.content,
      actionable: intervention.actions.length > 0,
      suggestedActions: intervention.actions,
      triggerData: {
        metric: trigger.name,
        previousValue: 0,
        currentValue: 1,
        changePercentage: 0,
        trend: 'stable',
        timeframe: 'trigger'
      },
      scheduledFor: this.calculateScheduledTime(intervention.timing),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      delivered: false,
      acknowledged: false
    };
  }

  private mapInterventionTypeToNotificationType(
    interventionType: CoachingIntervention['type']
  ): ProactiveNotification['type'] {
    switch (interventionType) {
      case 'immediate_notification':
        return 'health_alert';
      case 'scheduled_reminder':
        return 'coaching_suggestion';
      case 'plan_adjustment':
        return 'coaching_suggestion';
      case 'conversation_starter':
        return 'coaching_suggestion';
      default:
        return 'coaching_suggestion';
    }
  }

  private determinePriorityFromTrigger(trigger: ContextualTrigger): ProactiveNotification['priority'] {
    // High priority for stress and dehydration
    if (trigger.id.includes('stress') || trigger.id.includes('dehydration')) {
      return 'high';
    }
    
    // Medium priority for recovery and performance issues
    if (trigger.id.includes('recovery') || trigger.id.includes('performance')) {
      return 'medium';
    }

    return 'low';
  }

  private generateTitleFromTrigger(trigger: ContextualTrigger): string {
    const titleMap: Record<string, string> = {
      'poor_sleep_nutrition': 'Sleep Recovery Plan',
      'high_stress_recovery': '🚨 High Stress Alert',
      'low_recovery_workout': 'Workout Adjustment Needed',
      'high_activity_low_fuel': 'Fuel Your Performance',
      'activity_dehydration': '💧 Hydration Alert',
      'consistent_poor_sleep': 'Sleep Improvement Plan',
      'workout_performance_decline': 'Performance Check-In'
    };

    return titleMap[trigger.id] || 'Coaching Suggestion';
  }

  private calculateScheduledTime(timing: CoachingIntervention['timing']): Date {
    const now = new Date();

    if (timing.immediate) {
      return now;
    }

    if (timing.delay) {
      return new Date(now.getTime() + timing.delay * 60 * 1000);
    }

    if (timing.optimalTimeWindow) {
      const [startHour, startMinute] = timing.optimalTimeWindow.start.split(':').map(Number);
      const [endHour, endMinute] = timing.optimalTimeWindow.end.split(':').map(Number);
      
      const startTime = new Date(now);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(now);
      endTime.setHours(endHour, endMinute, 0, 0);

      // If we're in the window, schedule for now
      if (now >= startTime && now <= endTime) {
        return now;
      }

      // If we're before the window, schedule for start of window
      if (now < startTime) {
        return startTime;
      }

      // If we're after the window, schedule for start of window tomorrow
      const tomorrow = new Date(startTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    return now;
  }
}

export const contextualTriggerService = new ContextualTriggerService();