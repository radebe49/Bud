/**
 * Sleep Data Analysis Service
 * Provides pattern recognition and analysis algorithms for sleep data
 */

import { 
  SleepData, 
  SleepAnalysis, 
  SleepTrend, 
  SleepPattern, 
  SleepMetric,
  PatternType,
  SleepInsight,
  InsightType
} from '../types/sleepTypes';

export class SleepAnalysisService {
  /**
   * Analyze sleep data over a specified period
   */
  static analyzeSleepData(
    sleepData: SleepData[], 
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): SleepAnalysis {
    if (sleepData.length === 0) {
      return this.getEmptyAnalysis(period);
    }

    const sortedData = sleepData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return {
      period,
      averageSleepDuration: this.calculateAverageDuration(sortedData),
      averageSleepEfficiency: this.calculateAverageEfficiency(sortedData),
      averageSleepScore: this.calculateAverageScore(sortedData),
      sleepDebt: this.calculateSleepDebt(sortedData),
      consistencyScore: this.calculateConsistencyScore(sortedData),
      trends: this.identifyTrends(sortedData),
      patterns: this.identifyPatterns(sortedData),
      recommendations: this.generateRecommendations(sortedData)
    };
  }

  /**
   * Calculate average sleep duration in hours
   */
  private static calculateAverageDuration(data: SleepData[]): number {
    const totalMinutes = data.reduce((sum, sleep) => sum + sleep.totalSleepTime, 0);
    return Number((totalMinutes / data.length / 60).toFixed(1));
  }

  /**
   * Calculate average sleep efficiency percentage
   */
  private static calculateAverageEfficiency(data: SleepData[]): number {
    const totalEfficiency = data.reduce((sum, sleep) => sum + sleep.sleepEfficiency, 0);
    return Number((totalEfficiency / data.length).toFixed(1));
  }

  /**
   * Calculate average sleep score
   */
  private static calculateAverageScore(data: SleepData[]): number {
    const totalScore = data.reduce((sum, sleep) => sum + sleep.sleepScore, 0);
    return Number((totalScore / data.length).toFixed(0));
  }

  /**
   * Calculate sleep debt in hours
   */
  private static calculateSleepDebt(data: SleepData[]): number {
    const targetSleepHours = 8; // Standard recommendation
    const actualSleepHours = data.reduce((sum, sleep) => sum + (sleep.totalSleepTime / 60), 0);
    const targetTotalHours = data.length * targetSleepHours;
    return Math.max(0, Number((targetTotalHours - actualSleepHours).toFixed(1)));
  }

  /**
   * Calculate sleep consistency score (0-100)
   */
  private static calculateConsistencyScore(data: SleepData[]): number {
    if (data.length < 2) return 100;

    const bedtimes = data.map(sleep => this.timeToMinutes(sleep.bedtime));
    const wakeTimes = data.map(sleep => this.timeToMinutes(sleep.wakeTime));

    const bedtimeVariance = this.calculateVariance(bedtimes);
    const wakeTimeVariance = this.calculateVariance(wakeTimes);

    // Lower variance = higher consistency score
    const maxVariance = 120; // 2 hours in minutes
    const avgVariance = (bedtimeVariance + wakeTimeVariance) / 2;
    const consistencyScore = Math.max(0, 100 - (avgVariance / maxVariance) * 100);

    return Number(consistencyScore.toFixed(0));
  }

  /**
   * Identify sleep trends over time
   */
  private static identifyTrends(data: SleepData[]): SleepTrend[] {
    if (data.length < 7) return [];

    const trends: SleepTrend[] = [];
    const metrics: SleepMetric[] = ['duration', 'efficiency', 'quality', 'consistency'];

    metrics.forEach(metric => {
      const trend = this.calculateTrend(data, metric);
      if (trend) {
        trends.push(trend);
      }
    });

    return trends;
  }

  /**
   * Calculate trend for a specific metric
   */
  private static calculateTrend(data: SleepData[], metric: SleepMetric): SleepTrend | null {
    const values = data.map(sleep => this.getMetricValue(sleep, metric));
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const changeAmount = secondAvg - firstAvg;
    const changePercentage = (changeAmount / firstAvg) * 100;

    if (Math.abs(changePercentage) < 5) return null; // Ignore small changes

    return {
      metric,
      direction: changeAmount > 0 ? 'improving' : 'declining',
      changeAmount: Number(changeAmount.toFixed(2)),
      changePercentage: Number(changePercentage.toFixed(1)),
      significance: Math.abs(changePercentage) > 15 ? 'high' : 'medium',
      timeframe: data.length > 30 ? 'monthly' : 'weekly'
    };
  }

  /**
   * Identify sleep patterns
   */
  private static identifyPatterns(data: SleepData[]): SleepPattern[] {
    const patterns: SleepPattern[] = [];

    // Check for consistent bedtime pattern
    const consistentBedtime = this.checkConsistentBedtime(data);
    if (consistentBedtime) patterns.push(consistentBedtime);

    // Check for weekend shift pattern
    const weekendShift = this.checkWeekendShift(data);
    if (weekendShift) patterns.push(weekendShift);

    // Check for exercise correlation
    const exerciseCorrelation = this.checkExerciseCorrelation(data);
    if (exerciseCorrelation) patterns.push(exerciseCorrelation);

    return patterns;
  }

  /**
   * Check for consistent bedtime pattern
   */
  private static checkConsistentBedtime(data: SleepData[]): SleepPattern | null {
    const bedtimes = data.map(sleep => this.timeToMinutes(sleep.bedtime));
    const variance = this.calculateVariance(bedtimes);

    if (variance < 30) { // Within 30 minutes variance
      return {
        type: 'consistent_bedtime',
        description: 'You maintain a consistent bedtime schedule',
        frequency: 0.9,
        impact: 'positive',
        recommendations: ['Keep maintaining your consistent bedtime routine']
      };
    }

    return null;
  }

  /**
   * Check for weekend shift pattern
   */
  private static checkWeekendShift(data: SleepData[]): SleepPattern | null {
    const weekdayData = data.filter(sleep => {
      const day = sleep.date.getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    });

    const weekendData = data.filter(sleep => {
      const day = sleep.date.getDay();
      return day === 0 || day === 6; // Saturday and Sunday
    });

    if (weekdayData.length < 3 || weekendData.length < 2) return null;

    const weekdayAvgBedtime = weekdayData.reduce((sum, sleep) => 
      sum + this.timeToMinutes(sleep.bedtime), 0) / weekdayData.length;
    
    const weekendAvgBedtime = weekendData.reduce((sum, sleep) => 
      sum + this.timeToMinutes(sleep.bedtime), 0) / weekendData.length;

    const difference = Math.abs(weekendAvgBedtime - weekdayAvgBedtime);

    if (difference > 60) { // More than 1 hour difference
      return {
        type: 'weekend_shift',
        description: 'Your sleep schedule shifts significantly on weekends',
        frequency: 0.8,
        impact: 'negative',
        recommendations: [
          'Try to maintain consistent sleep times on weekends',
          'Limit weekend bedtime shifts to 1 hour maximum'
        ]
      };
    }

    return null;
  }

  /**
   * Check for exercise correlation (placeholder - would need exercise data)
   */
  private static checkExerciseCorrelation(data: SleepData[]): SleepPattern | null {
    // This would require exercise data correlation
    // For now, return null as we don't have exercise data in sleep records
    return null;
  }

  /**
   * Generate recommendations based on analysis
   */
  private static generateRecommendations(data: SleepData[]): string[] {
    const recommendations: string[] = [];
    const avgEfficiency = this.calculateAverageEfficiency(data);
    const avgDuration = this.calculateAverageDuration(data);
    const consistencyScore = this.calculateConsistencyScore(data);

    if (avgEfficiency < 85) {
      recommendations.push('Improve sleep efficiency by optimizing your sleep environment');
    }

    if (avgDuration < 7) {
      recommendations.push('Aim for 7-9 hours of sleep per night for optimal recovery');
    }

    if (consistencyScore < 70) {
      recommendations.push('Maintain consistent bedtime and wake times, even on weekends');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your sleep patterns look good! Keep up the healthy habits');
    }

    return recommendations;
  }

  /**
   * Generate personalized sleep insights
   */
  static generateSleepInsights(data: SleepData[]): SleepInsight[] {
    const insights: SleepInsight[] = [];
    
    if (data.length === 0) return insights;

    const analysis = this.analyzeSleepData(data);

    // Sleep debt insight
    if (analysis.sleepDebt > 2) {
      insights.push({
        id: `sleep-debt-${Date.now()}`,
        type: 'sleep_debt',
        message: `You have accumulated ${analysis.sleepDebt} hours of sleep debt`,
        recommendation: 'Consider going to bed 30 minutes earlier for the next week',
        priority: 'high',
        timestamp: new Date(),
        relatedFactors: ['duration', 'consistency'],
        actionable: true,
        evidenceStrength: 0.9
      });
    }

    // Consistency insight
    if (analysis.consistencyScore < 70) {
      insights.push({
        id: `consistency-${Date.now()}`,
        type: 'consistency_issue',
        message: 'Your sleep schedule varies significantly day to day',
        recommendation: 'Try to go to bed and wake up at the same time daily',
        priority: 'medium',
        timestamp: new Date(),
        relatedFactors: ['bedtime', 'wake_time'],
        actionable: true,
        evidenceStrength: 0.8
      });
    }

    // Efficiency insight
    if (analysis.averageSleepEfficiency < 85) {
      insights.push({
        id: `efficiency-${Date.now()}`,
        type: 'optimization_opportunity',
        message: 'Your sleep efficiency could be improved',
        recommendation: 'Review your sleep environment and wind-down routine',
        priority: 'medium',
        timestamp: new Date(),
        relatedFactors: ['environment', 'routine'],
        actionable: true,
        evidenceStrength: 0.7
      });
    }

    return insights;
  }

  // Helper methods
  private static timeToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private static getMetricValue(sleep: SleepData, metric: SleepMetric): number {
    switch (metric) {
      case 'duration':
        return sleep.totalSleepTime / 60; // Convert to hours
      case 'efficiency':
        return sleep.sleepEfficiency;
      case 'quality':
        return sleep.sleepQuality;
      case 'consistency':
        return 100; // Would need multiple days to calculate
      default:
        return 0;
    }
  }

  private static getEmptyAnalysis(period: 'daily' | 'weekly' | 'monthly'): SleepAnalysis {
    return {
      period,
      averageSleepDuration: 0,
      averageSleepEfficiency: 0,
      averageSleepScore: 0,
      sleepDebt: 0,
      consistencyScore: 0,
      trends: [],
      patterns: [],
      recommendations: ['Start tracking your sleep to get personalized insights']
    };
  }
}