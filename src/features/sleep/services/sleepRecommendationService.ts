/**
 * Sleep Recommendation Service
 * Generates bedtime and wake time recommendations based on user data and goals
 */

import { 
  SleepData, 
  SleepGoals, 
  SleepCoaching,
  EnvironmentTip,
  EnvironmentCategory,
  SleepEnvironment,
  SleepAnalysis
} from '../types/sleepTypes';

export class SleepRecommendationService {
  /**
   * Generate comprehensive sleep coaching recommendations
   */
  static generateSleepCoaching(
    recentSleepData: SleepData[],
    sleepGoals: SleepGoals,
    analysis: SleepAnalysis
  ): SleepCoaching {
    const bedtimeRecommendation = this.calculateOptimalBedtime(recentSleepData, sleepGoals);
    const wakeTimeRecommendation = this.calculateOptimalWakeTime(recentSleepData, sleepGoals);

    return {
      bedtimeRecommendation,
      wakeTimeRecommendation,
      sleepDurationTarget: sleepGoals.targetSleepDuration,
      sleepEnvironmentTips: this.generateEnvironmentTips(recentSleepData),
      windDownRoutine: this.generateWindDownRoutine(sleepGoals),
      sleepQualityAnalysis: analysis,
      sleepHygieneTips: this.generateSleepHygieneTips(analysis),
      personalizedInsights: this.generatePersonalizedInsights(recentSleepData, analysis)
    };
  }

  /**
   * Calculate optimal bedtime based on goals and recent patterns
   */
  private static calculateOptimalBedtime(
    recentSleepData: SleepData[],
    goals: SleepGoals
  ): Date {
    const targetWakeTime = this.parseTimeString(goals.targetWakeTime);
    const targetSleepDuration = goals.targetSleepDuration * 60; // Convert to minutes
    const windDownTime = goals.windDownDuration;

    // Calculate bedtime: wake time - sleep duration - wind down time
    const totalTimeNeeded = targetSleepDuration + windDownTime;
    const bedtimeMinutes = targetWakeTime - totalTimeNeeded;

    // Create date object for today with calculated bedtime
    const today = new Date();
    const bedtime = new Date(today);
    
    if (bedtimeMinutes < 0) {
      // Bedtime is previous day
      bedtime.setDate(today.getDate() - 1);
      bedtime.setHours(Math.floor((bedtimeMinutes + 24 * 60) / 60));
      bedtime.setMinutes((bedtimeMinutes + 24 * 60) % 60);
    } else {
      bedtime.setHours(Math.floor(bedtimeMinutes / 60));
      bedtime.setMinutes(bedtimeMinutes % 60);
    }
    
    bedtime.setSeconds(0);
    bedtime.setMilliseconds(0);

    // Adjust based on recent sleep patterns if available
    if (recentSleepData.length > 0) {
      const avgActualBedtime = this.calculateAverageBedtime(recentSleepData);
      const adjustment = this.calculateGradualAdjustment(avgActualBedtime, bedtime);
      bedtime.setTime(bedtime.getTime() + adjustment);
    }

    return bedtime;
  }

  /**
   * Calculate optimal wake time
   */
  private static calculateOptimalWakeTime(
    recentSleepData: SleepData[],
    goals: SleepGoals
  ): Date {
    const targetWakeTime = this.parseTimeString(goals.targetWakeTime);
    
    const today = new Date();
    const wakeTime = new Date(today);
    wakeTime.setHours(Math.floor(targetWakeTime / 60));
    wakeTime.setMinutes(targetWakeTime % 60);
    wakeTime.setSeconds(0);
    wakeTime.setMilliseconds(0);

    // Adjust for tomorrow if the time has passed today
    if (wakeTime.getTime() < Date.now()) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }

    return wakeTime;
  }

  /**
   * Generate environment optimization tips
   */
  private static generateEnvironmentTips(recentSleepData: SleepData[]): EnvironmentTip[] {
    const tips: EnvironmentTip[] = [];

    // Analyze recent environment data if available
    const environmentData = recentSleepData
      .map(sleep => sleep.environment)
      .filter(env => env !== undefined);

    if (environmentData.length === 0) {
      // Default tips when no environment data is available
      return this.getDefaultEnvironmentTips();
    }

    // Temperature optimization
    const avgTemp = environmentData
      .filter(env => env.temperature !== undefined)
      .reduce((sum, env) => sum + (env.temperature || 0), 0) / environmentData.length;

    if (avgTemp > 22) { // Above 72°F
      tips.push({
        category: 'temperature',
        recommendation: 'Lower your bedroom temperature to 18-21°C (65-70°F) for optimal sleep',
        priority: 'high',
        estimatedImpact: 8,
        implementationDifficulty: 'easy'
      });
    }

    // Light level optimization
    const avgLightLevel = environmentData
      .filter(env => env.lightLevel !== undefined)
      .reduce((sum, env) => sum + (env.lightLevel || 0), 0) / environmentData.length;

    if (avgLightLevel > 10) { // Too bright
      tips.push({
        category: 'lighting',
        recommendation: 'Use blackout curtains or an eye mask to create complete darkness',
        priority: 'high',
        estimatedImpact: 7,
        implementationDifficulty: 'medium'
      });
    }

    // Noise level optimization
    const avgNoiseLevel = environmentData
      .filter(env => env.noiseLevel !== undefined)
      .reduce((sum, env) => sum + (env.noiseLevel || 0), 0) / environmentData.length;

    if (avgNoiseLevel > 40) { // Above recommended level
      tips.push({
        category: 'noise',
        recommendation: 'Consider using earplugs or a white noise machine to reduce disturbances',
        priority: 'medium',
        estimatedImpact: 6,
        implementationDifficulty: 'easy'
      });
    }

    return tips.length > 0 ? tips : this.getDefaultEnvironmentTips();
  }

  /**
   * Get default environment tips when no data is available
   */
  private static getDefaultEnvironmentTips(): EnvironmentTip[] {
    return [
      {
        category: 'temperature',
        recommendation: 'Keep your bedroom temperature between 18-21°C (65-70°F)',
        priority: 'high',
        estimatedImpact: 8,
        implementationDifficulty: 'easy'
      },
      {
        category: 'lighting',
        recommendation: 'Make your bedroom as dark as possible with blackout curtains',
        priority: 'high',
        estimatedImpact: 7,
        implementationDifficulty: 'medium'
      },
      {
        category: 'noise',
        recommendation: 'Minimize noise with earplugs or white noise',
        priority: 'medium',
        estimatedImpact: 6,
        implementationDifficulty: 'easy'
      },
      {
        category: 'electronics',
        recommendation: 'Remove electronic devices from the bedroom',
        priority: 'medium',
        estimatedImpact: 5,
        implementationDifficulty: 'medium'
      }
    ];
  }

  /**
   * Generate wind-down routine based on goals
   */
  private static generateWindDownRoutine(goals: SleepGoals) {
    const windDownDuration = goals.windDownDuration;
    const routineSteps = [];

    // Technology shutdown (always first)
    routineSteps.push({
      id: 'tech-shutdown',
      name: 'Digital Sunset',
      description: 'Turn off all screens and electronic devices',
      timeBeforeBed: windDownDuration,
      duration: 5,
      category: 'technology_shutdown' as const,
      difficulty: 'easy' as const
    });

    // Environment preparation
    routineSteps.push({
      id: 'environment-prep',
      name: 'Prepare Sleep Environment',
      description: 'Dim lights, adjust temperature, and prepare your bedroom',
      timeBeforeBed: windDownDuration - 10,
      duration: 10,
      category: 'environment_prep' as const,
      difficulty: 'easy' as const
    });

    // Relaxation activity based on available time
    if (windDownDuration >= 60) {
      routineSteps.push({
        id: 'reading',
        name: 'Light Reading',
        description: 'Read a book or magazine with soft lighting',
        timeBeforeBed: windDownDuration - 20,
        duration: 20,
        category: 'reading' as const,
        difficulty: 'easy' as const
      });

      routineSteps.push({
        id: 'stretching',
        name: 'Gentle Stretching',
        description: 'Light stretches or yoga poses to relax your body',
        timeBeforeBed: windDownDuration - 45,
        duration: 15,
        category: 'stretching' as const,
        difficulty: 'easy' as const
      });
    } else if (windDownDuration >= 30) {
      routineSteps.push({
        id: 'breathing',
        name: 'Deep Breathing',
        description: '4-7-8 breathing technique or meditation',
        timeBeforeBed: windDownDuration - 25,
        duration: 10,
        category: 'breathing' as const,
        difficulty: 'easy' as const
      });
    }

    // Personal hygiene (always last)
    routineSteps.push({
      id: 'hygiene',
      name: 'Bedtime Routine',
      description: 'Brush teeth, wash face, and other personal care',
      timeBeforeBed: 15,
      duration: 15,
      category: 'hygiene' as const,
      difficulty: 'easy' as const
    });

    return routineSteps;
  }

  /**
   * Generate sleep hygiene tips
   */
  private static generateSleepHygieneTips(analysis: SleepAnalysis): string[] {
    const tips: string[] = [];

    if (analysis.averageSleepEfficiency < 85) {
      tips.push('Only use your bed for sleep and intimacy');
      tips.push('If you can\'t fall asleep within 20 minutes, get up and do a quiet activity');
    }

    if (analysis.consistencyScore < 70) {
      tips.push('Go to bed and wake up at the same time every day, including weekends');
      tips.push('Avoid "sleeping in" to catch up on lost sleep');
    }

    if (analysis.averageSleepDuration < 7) {
      tips.push('Aim for 7-9 hours of sleep per night');
      tips.push('Avoid caffeine 6 hours before bedtime');
    }

    // Always include these general tips
    tips.push('Avoid large meals, alcohol, and excessive fluids before bedtime');
    tips.push('Get regular exercise, but not close to bedtime');
    tips.push('Create a relaxing bedtime ritual');

    return tips;
  }

  /**
   * Generate personalized insights based on data
   */
  private static generatePersonalizedInsights(
    recentSleepData: SleepData[],
    analysis: SleepAnalysis
  ): any[] {
    const insights = [];

    // Sleep debt insight
    if (analysis.sleepDebt > 2) {
      insights.push({
        type: 'sleep_debt',
        message: `You have ${analysis.sleepDebt} hours of sleep debt`,
        recommendation: 'Go to bed 30 minutes earlier for the next week',
        priority: 'high'
      });
    }

    // Consistency insight
    if (analysis.consistencyScore < 70) {
      insights.push({
        type: 'consistency',
        message: 'Your sleep schedule varies significantly',
        recommendation: 'Try to maintain the same bedtime and wake time daily',
        priority: 'medium'
      });
    }

    // Quality insight
    if (analysis.averageSleepScore < 70) {
      insights.push({
        type: 'quality',
        message: 'Your sleep quality could be improved',
        recommendation: 'Focus on your sleep environment and wind-down routine',
        priority: 'medium'
      });
    }

    return insights;
  }

  // Helper methods
  private static parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static calculateAverageBedtime(sleepData: SleepData[]): Date {
    const totalMinutes = sleepData.reduce((sum, sleep) => {
      return sum + (sleep.bedtime.getHours() * 60 + sleep.bedtime.getMinutes());
    }, 0);

    const avgMinutes = totalMinutes / sleepData.length;
    const avgDate = new Date();
    avgDate.setHours(Math.floor(avgMinutes / 60));
    avgDate.setMinutes(avgMinutes % 60);
    avgDate.setSeconds(0);
    avgDate.setMilliseconds(0);

    return avgDate;
  }

  private static calculateGradualAdjustment(currentTime: Date, targetTime: Date): number {
    const difference = targetTime.getTime() - currentTime.getTime();
    
    // Limit adjustment to 15 minutes per day to avoid shock
    const maxDailyAdjustment = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    if (Math.abs(difference) <= maxDailyAdjustment) {
      return difference;
    }
    
    return difference > 0 ? maxDailyAdjustment : -maxDailyAdjustment;
  }
}