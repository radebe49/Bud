/**
 * Sleep Coaching Service
 * Main service that orchestrates sleep coaching functionality
 */

import { 
  SleepData, 
  SleepGoals, 
  SleepCoaching,
  SleepAnalysis,
  SleepInsight,
  RoutineStep,
  SleepSchedule,
  DailySleepSchedule
} from '../types/sleepTypes';
import { SleepAnalysisService } from './sleepAnalysisService';
import { SleepRecommendationService } from './sleepRecommendationService';
import { PerformanceCorrelationService } from './performanceCorrelationService';

export class SleepCoachingService {
  /**
   * Get comprehensive sleep coaching for a user
   */
  static async getSleepCoaching(
    userId: string,
    sleepData: SleepData[],
    sleepGoals: SleepGoals,
    performanceData?: any[]
  ): Promise<SleepCoaching> {
    // Analyze recent sleep data (last 30 days)
    const recentData = this.getRecentSleepData(sleepData, 30);
    const analysis = SleepAnalysisService.analyzeSleepData(recentData, 'monthly');

    // Generate coaching recommendations
    const coaching = SleepRecommendationService.generateSleepCoaching(
      recentData,
      sleepGoals,
      analysis
    );

    // Add performance correlations if available
    if (performanceData && performanceData.length > 0) {
      const correlations = PerformanceCorrelationService.analyzeSleepPerformanceCorrelation(
        recentData,
        performanceData
      );
      coaching.personalizedInsights.push(...correlations);
    }

    return coaching;
  }

  /**
   * Generate sleep insights for today
   */
  static generateTodaysSleepInsights(
    sleepData: SleepData[],
    sleepGoals: SleepGoals
  ): SleepInsight[] {
    const insights: SleepInsight[] = [];
    const lastNight = this.getLastNightSleep(sleepData);

    if (!lastNight) {
      insights.push({
        id: `no-data-${Date.now()}`,
        type: 'optimization_opportunity',
        message: 'No sleep data available for last night',
        recommendation: 'Make sure your sleep tracking device is connected and working',
        priority: 'medium',
        timestamp: new Date(),
        relatedFactors: ['tracking'],
        actionable: true,
        evidenceStrength: 1.0
      });
      return insights;
    }

    // Sleep duration insight
    const actualDuration = lastNight.totalSleepTime / 60; // Convert to hours
    const targetDuration = sleepGoals.targetSleepDuration;

    if (actualDuration < targetDuration - 0.5) {
      insights.push({
        id: `duration-short-${Date.now()}`,
        type: 'sleep_debt',
        message: `You slept ${actualDuration.toFixed(1)} hours, which is ${(targetDuration - actualDuration).toFixed(1)} hours less than your goal`,
        recommendation: 'Consider going to bed earlier tonight to catch up on sleep',
        priority: 'high',
        timestamp: new Date(),
        relatedFactors: ['duration', 'bedtime'],
        actionable: true,
        evidenceStrength: 0.9
      });
    } else if (actualDuration > targetDuration + 1) {
      insights.push({
        id: `duration-long-${Date.now()}`,
        type: 'optimization_opportunity',
        message: `You slept ${actualDuration.toFixed(1)} hours, which is more than your usual target`,
        recommendation: 'This might indicate you needed extra recovery. Monitor how you feel today',
        priority: 'low',
        timestamp: new Date(),
        relatedFactors: ['duration', 'recovery'],
        actionable: false,
        evidenceStrength: 0.7
      });
    }

    // Sleep efficiency insight
    if (lastNight.sleepEfficiency < 85) {
      insights.push({
        id: `efficiency-low-${Date.now()}`,
        type: 'optimization_opportunity',
        message: `Your sleep efficiency was ${lastNight.sleepEfficiency}%, indicating restless sleep`,
        recommendation: 'Review your sleep environment and wind-down routine',
        priority: 'medium',
        timestamp: new Date(),
        relatedFactors: ['efficiency', 'environment', 'routine'],
        actionable: true,
        evidenceStrength: 0.8
      });
    }

    // Sleep quality insight
    if (lastNight.sleepQuality < 7) {
      insights.push({
        id: `quality-low-${Date.now()}`,
        type: 'optimization_opportunity',
        message: `You rated your sleep quality as ${lastNight.sleepQuality}/10`,
        recommendation: 'Consider what factors might have affected your sleep quality',
        priority: 'medium',
        timestamp: new Date(),
        relatedFactors: ['quality', 'subjective'],
        actionable: true,
        evidenceStrength: 0.6
      });
    }

    return insights;
  }

  /**
   * Create a personalized sleep schedule
   */
  static createSleepSchedule(
    userId: string,
    sleepGoals: SleepGoals,
    preferences: {
      weekendFlexibility?: boolean;
      workSchedule?: 'standard' | 'shift' | 'flexible';
      travelFrequency?: 'none' | 'occasional' | 'frequent';
    }
  ): SleepSchedule {
    const weeklySchedule: DailySleepSchedule[] = [];

    // Create schedule for each day of the week
    for (let day = 0; day < 7; day++) {
      const isWeekend = day === 0 || day === 6; // Sunday or Saturday
      const allowFlexibility = preferences.weekendFlexibility && isWeekend;

      // Calculate wind-down start time
      const bedtimeMinutes = this.parseTimeString(sleepGoals.targetBedtime);
      const windDownMinutes = bedtimeMinutes - sleepGoals.windDownDuration;
      const windDownTime = this.minutesToTimeString(windDownMinutes);

      weeklySchedule.push({
        dayOfWeek: day,
        targetBedtime: allowFlexibility 
          ? this.adjustTimeString(sleepGoals.targetBedtime, 60) // 1 hour later on weekends
          : sleepGoals.targetBedtime,
        targetWakeTime: allowFlexibility
          ? this.adjustTimeString(sleepGoals.targetWakeTime, 60) // 1 hour later on weekends
          : sleepGoals.targetWakeTime,
        windDownStart: windDownTime,
        isFlexible: allowFlexibility
      });
    }

    return {
      id: `schedule-${userId}-${Date.now()}`,
      userId,
      name: 'Personal Sleep Schedule',
      isActive: true,
      weeklySchedule,
      flexibility: {
        bedtimeVariation: preferences.weekendFlexibility ? 60 : 30, // minutes
        wakeTimeVariation: preferences.weekendFlexibility ? 60 : 30,
        weekendAdjustment: preferences.weekendFlexibility || false,
        travelAdaptation: preferences.travelFrequency !== 'none'
      },
      adaptations: []
    };
  }

  /**
   * Track wind-down routine completion
   */
  static trackWindDownRoutine(
    routineSteps: RoutineStep[],
    completedSteps: string[]
  ): {
    completionRate: number;
    missedSteps: RoutineStep[];
    recommendations: string[];
  } {
    const totalSteps = routineSteps.length;
    const completedCount = completedSteps.length;
    const completionRate = (completedCount / totalSteps) * 100;

    const missedSteps = routineSteps.filter(step => 
      !completedSteps.includes(step.id)
    );

    const recommendations: string[] = [];

    if (completionRate < 50) {
      recommendations.push('Try to complete at least half of your wind-down routine for better sleep');
    }

    if (missedSteps.some(step => step.category === 'technology_shutdown')) {
      recommendations.push('Turning off screens before bed is crucial for good sleep');
    }

    if (missedSteps.some(step => step.category === 'environment_prep')) {
      recommendations.push('Preparing your sleep environment helps signal your body it\'s time to rest');
    }

    return {
      completionRate: Math.round(completionRate),
      missedSteps,
      recommendations
    };
  }

  /**
   * Get sleep readiness score for today
   */
  static calculateSleepReadiness(
    recentSleepData: SleepData[],
    todaysFactors: {
      stressLevel?: number; // 1-10
      caffeineIntake?: number; // mg
      exerciseIntensity?: number; // 1-10
      screenTimeBeforeBed?: number; // minutes
    }
  ): {
    score: number; // 0-100
    factors: Array<{
      name: string;
      impact: 'positive' | 'negative' | 'neutral';
      weight: number;
    }>;
    recommendations: string[];
  } {
    let score = 70; // Base score
    const factors = [];
    const recommendations = [];

    // Recent sleep quality impact
    if (recentSleepData.length > 0) {
      const avgQuality = recentSleepData
        .slice(-3) // Last 3 nights
        .reduce((sum, sleep) => sum + sleep.sleepScore, 0) / Math.min(3, recentSleepData.length);

      if (avgQuality > 80) {
        score += 15;
        factors.push({ name: 'Recent Sleep Quality', impact: 'positive', weight: 0.3 });
      } else if (avgQuality < 60) {
        score -= 15;
        factors.push({ name: 'Recent Sleep Quality', impact: 'negative', weight: 0.3 });
        recommendations.push('Focus on improving your sleep environment and routine');
      }
    }

    // Stress level impact
    if (todaysFactors.stressLevel !== undefined) {
      if (todaysFactors.stressLevel > 7) {
        score -= 20;
        factors.push({ name: 'High Stress Level', impact: 'negative', weight: 0.25 });
        recommendations.push('Try relaxation techniques before bed to manage stress');
      } else if (todaysFactors.stressLevel < 4) {
        score += 10;
        factors.push({ name: 'Low Stress Level', impact: 'positive', weight: 0.15 });
      }
    }

    // Caffeine impact
    if (todaysFactors.caffeineIntake !== undefined && todaysFactors.caffeineIntake > 100) {
      score -= 15;
      factors.push({ name: 'High Caffeine Intake', impact: 'negative', weight: 0.2 });
      recommendations.push('Avoid caffeine 6 hours before bedtime');
    }

    // Exercise impact
    if (todaysFactors.exerciseIntensity !== undefined) {
      if (todaysFactors.exerciseIntensity > 7) {
        score -= 10; // High intensity exercise close to bedtime
        factors.push({ name: 'Intense Exercise', impact: 'negative', weight: 0.15 });
        recommendations.push('Avoid intense exercise 3 hours before bedtime');
      } else if (todaysFactors.exerciseIntensity > 3) {
        score += 10; // Moderate exercise is beneficial
        factors.push({ name: 'Moderate Exercise', impact: 'positive', weight: 0.15 });
      }
    }

    // Screen time impact
    if (todaysFactors.screenTimeBeforeBed !== undefined && todaysFactors.screenTimeBeforeBed > 60) {
      score -= 10;
      factors.push({ name: 'Excessive Screen Time', impact: 'negative', weight: 0.1 });
      recommendations.push('Reduce screen time 1 hour before bed');
    }

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      factors,
      recommendations
    };
  }

  // Helper methods
  private static getRecentSleepData(sleepData: SleepData[], days: number): SleepData[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return sleepData
      .filter(sleep => sleep.date >= cutoffDate)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private static getLastNightSleep(sleepData: SleepData[]): SleepData | null {
    if (sleepData.length === 0) return null;

    // Sort by date descending and get the most recent
    const sortedData = sleepData.sort((a, b) => b.date.getTime() - a.date.getTime());
    return sortedData[0];
  }

  private static parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private static adjustTimeString(timeString: string, adjustmentMinutes: number): string {
    const minutes = this.parseTimeString(timeString) + adjustmentMinutes;
    return this.minutesToTimeString(minutes);
  }
}