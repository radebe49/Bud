import { HealthMetrics } from '../../../shared/types/healthTypes';
import { HabitMilestone, ProactiveNotification } from '../types/proactiveCoachingTypes';

export class HabitReinforcementService {
  private milestones: Map<string, HabitMilestone[]> = new Map();
  private readonly STREAK_THRESHOLDS = [3, 7, 14, 30, 60, 90, 180, 365];
  private readonly IMPROVEMENT_THRESHOLDS = [0.1, 0.2, 0.3, 0.5]; // 10%, 20%, 30%, 50% improvement

  /**
   * Track and update habit milestones based on user behavior
   */
  async updateHabitMilestones(userId: string, healthData: HealthMetrics[]): Promise<HabitMilestone[]> {
    const userMilestones = this.milestones.get(userId) || [];
    const updatedMilestones: HabitMilestone[] = [];

    // Update workout consistency milestones
    const workoutMilestones = await this.updateWorkoutMilestones(userId, healthData, userMilestones);
    updatedMilestones.push(...workoutMilestones);

    // Update sleep schedule milestones
    const sleepMilestones = await this.updateSleepMilestones(userId, healthData, userMilestones);
    updatedMilestones.push(...sleepMilestones);

    // Update nutrition tracking milestones
    const nutritionMilestones = await this.updateNutritionMilestones(userId, healthData, userMilestones);
    updatedMilestones.push(...nutritionMilestones);

    // Update hydration milestones
    const hydrationMilestones = await this.updateHydrationMilestones(userId, healthData, userMilestones);
    updatedMilestones.push(...hydrationMilestones);

    // Update stress management milestones
    const stressMilestones = await this.updateStressMilestones(userId, healthData, userMilestones);
    updatedMilestones.push(...stressMilestones);

    this.milestones.set(userId, updatedMilestones);
    return updatedMilestones;
  }

  /**
   * Generate celebration notifications for achieved milestones
   */
  async generateCelebrationNotifications(userId: string, newMilestones: HabitMilestone[]): Promise<ProactiveNotification[]> {
    const notifications: ProactiveNotification[] = [];

    for (const milestone of newMilestones) {
      if (milestone.achieved) {
        const notification = this.createCelebrationNotification(userId, milestone);
        notifications.push(notification);
      }
    }

    return notifications;
  }

  /**
   * Get current progress on all habits for a user
   */
  getHabitProgress(userId: string): HabitMilestone[] {
    return this.milestones.get(userId) || [];
  }

  /**
   * Get next milestone for a specific habit type
   */
  getNextMilestone(userId: string, habitType: HabitMilestone['habitType']): HabitMilestone | null {
    const userMilestones = this.milestones.get(userId) || [];
    const habitMilestones = userMilestones.filter(m => m.habitType === habitType);
    
    return habitMilestones.find(m => !m.achieved) || null;
  }

  // Private methods for updating specific habit types

  private async updateWorkoutMilestones(
    userId: string, 
    healthData: HealthMetrics[], 
    existingMilestones: HabitMilestone[]
  ): Promise<HabitMilestone[]> {
    const milestones: HabitMilestone[] = [];

    // Calculate workout streak
    const workoutStreak = this.calculateWorkoutStreak(healthData);
    
    // Check streak milestones
    for (const threshold of this.STREAK_THRESHOLDS) {
      const milestoneId = `workout_streak_${threshold}_${userId}`;
      let milestone = existingMilestones.find(m => m.id === milestoneId);

      if (!milestone) {
        milestone = {
          id: milestoneId,
          userId,
          habitType: 'workout_consistency',
          milestoneType: 'streak',
          targetValue: threshold,
          currentValue: workoutStreak,
          progress: Math.min(1, workoutStreak / threshold),
          achieved: workoutStreak >= threshold,
          celebrationMessage: this.getWorkoutStreakMessage(threshold),
          reward: this.getWorkoutStreakReward(threshold)
        };

        if (milestone.achieved) {
          milestone.achievedAt = new Date();
        }
      } else {
        milestone.currentValue = workoutStreak;
        milestone.progress = Math.min(1, workoutStreak / threshold);
        
        if (!milestone.achieved && workoutStreak >= threshold) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      }

      milestones.push(milestone);
    }

    // Calculate workout frequency (workouts per week)
    const weeklyFrequency = this.calculateWeeklyWorkoutFrequency(healthData);
    const frequencyThresholds = [2, 3, 4, 5, 6]; // workouts per week

    for (const threshold of frequencyThresholds) {
      const milestoneId = `workout_frequency_${threshold}_${userId}`;
      let milestone = existingMilestones.find(m => m.id === milestoneId);

      if (!milestone) {
        milestone = {
          id: milestoneId,
          userId,
          habitType: 'workout_consistency',
          milestoneType: 'frequency',
          targetValue: threshold,
          currentValue: weeklyFrequency,
          progress: Math.min(1, weeklyFrequency / threshold),
          achieved: weeklyFrequency >= threshold,
          celebrationMessage: `Amazing! You're working out ${threshold} times per week consistently!`,
          reward: threshold >= 4 ? 'Unlock advanced workout plans' : undefined
        };

        if (milestone.achieved) {
          milestone.achievedAt = new Date();
        }
      } else {
        milestone.currentValue = weeklyFrequency;
        milestone.progress = Math.min(1, weeklyFrequency / threshold);
        
        if (!milestone.achieved && weeklyFrequency >= threshold) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      }

      milestones.push(milestone);
    }

    return milestones;
  }

  private async updateSleepMilestones(
    userId: string, 
    healthData: HealthMetrics[], 
    existingMilestones: HabitMilestone[]
  ): Promise<HabitMilestone[]> {
    const milestones: HabitMilestone[] = [];

    // Calculate consistent sleep schedule streak
    const sleepConsistencyStreak = this.calculateSleepConsistencyStreak(healthData);

    for (const threshold of this.STREAK_THRESHOLDS) {
      const milestoneId = `sleep_consistency_${threshold}_${userId}`;
      let milestone = existingMilestones.find(m => m.id === milestoneId);

      if (!milestone) {
        milestone = {
          id: milestoneId,
          userId,
          habitType: 'sleep_schedule',
          milestoneType: 'streak',
          targetValue: threshold,
          currentValue: sleepConsistencyStreak,
          progress: Math.min(1, sleepConsistencyStreak / threshold),
          achieved: sleepConsistencyStreak >= threshold,
          celebrationMessage: `Incredible! ${threshold} days of consistent sleep schedule!`,
          reward: threshold >= 30 ? 'Unlock advanced sleep optimization features' : undefined
        };

        if (milestone.achieved) {
          milestone.achievedAt = new Date();
        }
      } else {
        milestone.currentValue = sleepConsistencyStreak;
        milestone.progress = Math.min(1, sleepConsistencyStreak / threshold);
        
        if (!milestone.achieved && sleepConsistencyStreak >= threshold) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      }

      milestones.push(milestone);
    }

    // Sleep quality improvement milestones
    const sleepImprovement = this.calculateSleepQualityImprovement(healthData);

    for (const threshold of this.IMPROVEMENT_THRESHOLDS) {
      const milestoneId = `sleep_improvement_${Math.round(threshold * 100)}_${userId}`;
      let milestone = existingMilestones.find(m => m.id === milestoneId);

      if (!milestone) {
        milestone = {
          id: milestoneId,
          userId,
          habitType: 'sleep_schedule',
          milestoneType: 'improvement',
          targetValue: threshold,
          currentValue: sleepImprovement,
          progress: Math.min(1, sleepImprovement / threshold),
          achieved: sleepImprovement >= threshold,
          celebrationMessage: `Your sleep quality improved by ${Math.round(threshold * 100)}%! Great work!`,
        };

        if (milestone.achieved) {
          milestone.achievedAt = new Date();
        }
      } else {
        milestone.currentValue = sleepImprovement;
        milestone.progress = Math.min(1, sleepImprovement / threshold);
        
        if (!milestone.achieved && sleepImprovement >= threshold) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      }

      milestones.push(milestone);
    }

    return milestones;
  }

  private async updateNutritionMilestones(
    userId: string, 
    healthData: HealthMetrics[], 
    existingMilestones: HabitMilestone[]
  ): Promise<HabitMilestone[]> {
    const milestones: HabitMilestone[] = [];

    // Calculate nutrition tracking streak
    const nutritionTrackingStreak = this.calculateNutritionTrackingStreak(healthData);

    for (const threshold of this.STREAK_THRESHOLDS) {
      const milestoneId = `nutrition_tracking_${threshold}_${userId}`;
      let milestone = existingMilestones.find(m => m.id === milestoneId);

      if (!milestone) {
        milestone = {
          id: milestoneId,
          userId,
          habitType: 'nutrition_tracking',
          milestoneType: 'streak',
          targetValue: threshold,
          currentValue: nutritionTrackingStreak,
          progress: Math.min(1, nutritionTrackingStreak / threshold),
          achieved: nutritionTrackingStreak >= threshold,
          celebrationMessage: `${threshold} days of consistent nutrition tracking! You're building great habits!`,
          reward: threshold >= 30 ? 'Unlock personalized meal recommendations' : undefined
        };

        if (milestone.achieved) {
          milestone.achievedAt = new Date();
        }
      } else {
        milestone.currentValue = nutritionTrackingStreak;
        milestone.progress = Math.min(1, nutritionTrackingStreak / threshold);
        
        if (!milestone.achieved && nutritionTrackingStreak >= threshold) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      }

      milestones.push(milestone);
    }

    return milestones;
  }

  private async updateHydrationMilestones(
    userId: string, 
    healthData: HealthMetrics[], 
    existingMilestones: HabitMilestone[]
  ): Promise<HabitMilestone[]> {
    const milestones: HabitMilestone[] = [];

    // Calculate hydration goal achievement streak
    const hydrationStreak = this.calculateHydrationStreak(healthData);

    for (const threshold of this.STREAK_THRESHOLDS) {
      const milestoneId = `hydration_${threshold}_${userId}`;
      let milestone = existingMilestones.find(m => m.id === milestoneId);

      if (!milestone) {
        milestone = {
          id: milestoneId,
          userId,
          habitType: 'hydration',
          milestoneType: 'streak',
          targetValue: threshold,
          currentValue: hydrationStreak,
          progress: Math.min(1, hydrationStreak / threshold),
          achieved: hydrationStreak >= threshold,
          celebrationMessage: `${threshold} days of staying properly hydrated! Your body thanks you!`,
        };

        if (milestone.achieved) {
          milestone.achievedAt = new Date();
        }
      } else {
        milestone.currentValue = hydrationStreak;
        milestone.progress = Math.min(1, hydrationStreak / threshold);
        
        if (!milestone.achieved && hydrationStreak >= threshold) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      }

      milestones.push(milestone);
    }

    return milestones;
  }

  private async updateStressMilestones(
    userId: string, 
    healthData: HealthMetrics[], 
    existingMilestones: HabitMilestone[]
  ): Promise<HabitMilestone[]> {
    const milestones: HabitMilestone[] = [];

    // Calculate stress management improvement
    const stressImprovement = this.calculateStressManagementImprovement(healthData);

    for (const threshold of this.IMPROVEMENT_THRESHOLDS) {
      const milestoneId = `stress_management_${Math.round(threshold * 100)}_${userId}`;
      let milestone = existingMilestones.find(m => m.id === milestoneId);

      if (!milestone) {
        milestone = {
          id: milestoneId,
          userId,
          habitType: 'stress_management',
          milestoneType: 'improvement',
          targetValue: threshold,
          currentValue: stressImprovement,
          progress: Math.min(1, stressImprovement / threshold),
          achieved: stressImprovement >= threshold,
          celebrationMessage: `Your stress levels improved by ${Math.round(threshold * 100)}%! You're mastering stress management!`,
        };

        if (milestone.achieved) {
          milestone.achievedAt = new Date();
        }
      } else {
        milestone.currentValue = stressImprovement;
        milestone.progress = Math.min(1, stressImprovement / threshold);
        
        if (!milestone.achieved && stressImprovement >= threshold) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      }

      milestones.push(milestone);
    }

    return milestones;
  }

  // Helper methods for calculating streaks and improvements

  private calculateWorkoutStreak(healthData: HealthMetrics[]): number {
    let streak = 0;
    const sortedData = healthData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    for (const data of sortedData) {
      if (data.activityLevel > 0.5) { // Consider as workout day
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateWeeklyWorkoutFrequency(healthData: HealthMetrics[]): number {
    const recentWeek = healthData.slice(-7);
    return recentWeek.filter(data => data.activityLevel > 0.5).length;
  }

  private calculateSleepConsistencyStreak(healthData: HealthMetrics[]): number {
    let streak = 0;
    const sortedData = healthData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    for (const data of sortedData) {
      if (data.sleepScore > 0.6) { // Consider as good sleep
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateSleepQualityImprovement(healthData: HealthMetrics[]): number {
    if (healthData.length < 14) return 0;

    const recentWeek = healthData.slice(-7);
    const previousWeek = healthData.slice(-14, -7);

    const recentAvg = recentWeek.reduce((sum, data) => sum + data.sleepScore, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, data) => sum + data.sleepScore, 0) / previousWeek.length;

    return previousAvg > 0 ? (recentAvg - previousAvg) / previousAvg : 0;
  }

  private calculateNutritionTrackingStreak(healthData: HealthMetrics[]): number {
    let streak = 0;
    const sortedData = healthData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    for (const data of sortedData) {
      if (data.caloriesConsumed > 0) { // Consider as tracked day
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateHydrationStreak(healthData: HealthMetrics[]): number {
    let streak = 0;
    const sortedData = healthData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const dailyGoal = 2000; // 2L daily goal

    for (const data of sortedData) {
      if (data.waterIntake >= dailyGoal) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateStressManagementImprovement(healthData: HealthMetrics[]): number {
    if (healthData.length < 14) return 0;

    const recentWeek = healthData.slice(-7);
    const previousWeek = healthData.slice(-14, -7);

    const recentAvg = recentWeek.reduce((sum, data) => sum + data.stressLevel, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, data) => sum + data.stressLevel, 0) / previousWeek.length;

    // For stress, lower is better, so improvement is negative change
    return previousAvg > 0 ? (previousAvg - recentAvg) / previousAvg : 0;
  }

  private wasAlreadyAchieved(milestone: HabitMilestone, existingMilestones: HabitMilestone[]): boolean {
    const existing = existingMilestones.find(m => m.id === milestone.id);
    return existing ? existing.achieved : false;
  }

  private getWorkoutStreakMessage(days: number): string {
    if (days <= 7) return `${days} days of consistent workouts! You're building momentum!`;
    if (days <= 30) return `${days} days strong! Your dedication is paying off!`;
    if (days <= 90) return `${days} days of consistency! You're a fitness champion!`;
    return `${days} days! You've mastered the art of consistency!`;
  }

  private getWorkoutStreakReward(days: number): string | undefined {
    if (days === 7) return 'Unlock workout variety pack';
    if (days === 30) return 'Unlock advanced training programs';
    if (days === 90) return 'Unlock elite athlete protocols';
    if (days === 365) return 'Unlock lifetime achievement badge';
    return undefined;
  }

  private createCelebrationNotification(userId: string, milestone: HabitMilestone): ProactiveNotification {
    return {
      id: `celebration_${milestone.id}_${Date.now()}`,
      userId,
      type: 'milestone_celebration',
      priority: 'medium',
      title: '🎉 Milestone Achieved!',
      message: milestone.celebrationMessage,
      actionable: false,
      suggestedActions: [],
      triggerData: {
        metric: milestone.habitType,
        previousValue: milestone.targetValue - 1,
        currentValue: milestone.currentValue,
        changePercentage: 0,
        trend: 'improving',
        timeframe: 'milestone'
      },
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      delivered: false,
      acknowledged: false
    };
  }
}

export const habitReinforcementService = new HabitReinforcementService();