/**
 * Performance Correlation Service
 * Analyzes correlations between sleep quality and next-day performance metrics
 */

import { SleepData, SleepInsight } from '../types/sleepTypes';

interface PerformanceMetric {
  date: Date;
  workoutPerformance?: number; // 1-10 scale
  energyLevel?: number; // 1-10 scale
  mood?: number; // 1-10 scale
  cognitivePerformance?: number; // 1-10 scale
  stressLevel?: number; // 1-10 scale
  heartRateVariability?: number; // ms
  restingHeartRate?: number; // bpm
}

interface CorrelationResult {
  metric: string;
  correlation: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
  significance: number; // 0-1
  sampleSize: number;
}

export class PerformanceCorrelationService {
  /**
   * Analyze correlation between sleep and next-day performance
   */
  static analyzeSleepPerformanceCorrelation(
    sleepData: SleepData[],
    performanceData: PerformanceMetric[]
  ): SleepInsight[] {
    const insights: SleepInsight[] = [];

    if (sleepData.length < 7 || performanceData.length < 7) {
      return insights; // Need at least a week of data for meaningful correlations
    }

    // Match sleep data with next-day performance
    const matchedData = this.matchSleepWithPerformance(sleepData, performanceData);

    if (matchedData.length < 5) {
      return insights; // Need at least 5 matched data points
    }

    // Analyze correlations for different metrics
    const correlations = this.calculateCorrelations(matchedData);

    // Generate insights based on significant correlations
    correlations.forEach(correlation => {
      if (correlation.significance > 0.7 && Math.abs(correlation.correlation) > 0.3) {
        const insight = this.generateCorrelationInsight(correlation);
        if (insight) {
          insights.push(insight);
        }
      }
    });

    return insights;
  }

  /**
   * Match sleep data with next-day performance data
   */
  private static matchSleepWithPerformance(
    sleepData: SleepData[],
    performanceData: PerformanceMetric[]
  ): Array<{
    sleep: SleepData;
    performance: PerformanceMetric;
  }> {
    const matched = [];

    for (const sleep of sleepData) {
      // Find performance data for the day after sleep
      const nextDay = new Date(sleep.date);
      nextDay.setDate(nextDay.getDate() + 1);

      const performance = performanceData.find(perf => 
        this.isSameDay(perf.date, nextDay)
      );

      if (performance) {
        matched.push({ sleep, performance });
      }
    }

    return matched;
  }

  /**
   * Calculate correlations between sleep metrics and performance metrics
   */
  private static calculateCorrelations(
    matchedData: Array<{ sleep: SleepData; performance: PerformanceMetric }>
  ): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];

    // Sleep metrics to analyze
    const sleepMetrics = [
      { key: 'sleepDuration', getValue: (sleep: SleepData) => sleep.totalSleepTime / 60 },
      { key: 'sleepEfficiency', getValue: (sleep: SleepData) => sleep.sleepEfficiency },
      { key: 'sleepScore', getValue: (sleep: SleepData) => sleep.sleepScore },
      { key: 'sleepQuality', getValue: (sleep: SleepData) => sleep.sleepQuality },
      { key: 'deepSleepPercentage', getValue: (sleep: SleepData) => this.getDeepSleepPercentage(sleep) }
    ];

    // Performance metrics to analyze
    const performanceMetrics = [
      { key: 'workoutPerformance', getValue: (perf: PerformanceMetric) => perf.workoutPerformance },
      { key: 'energyLevel', getValue: (perf: PerformanceMetric) => perf.energyLevel },
      { key: 'mood', getValue: (perf: PerformanceMetric) => perf.mood },
      { key: 'cognitivePerformance', getValue: (perf: PerformanceMetric) => perf.cognitivePerformance },
      { key: 'stressLevel', getValue: (perf: PerformanceMetric) => perf.stressLevel },
      { key: 'heartRateVariability', getValue: (perf: PerformanceMetric) => perf.heartRateVariability },
      { key: 'restingHeartRate', getValue: (perf: PerformanceMetric) => perf.restingHeartRate }
    ];

    // Calculate correlations between each sleep metric and performance metric
    sleepMetrics.forEach(sleepMetric => {
      performanceMetrics.forEach(perfMetric => {
        const sleepValues = matchedData
          .map(data => sleepMetric.getValue(data.sleep))
          .filter(val => val !== undefined && val !== null) as number[];

        const perfValues = matchedData
          .map(data => perfMetric.getValue(data.performance))
          .filter(val => val !== undefined && val !== null) as number[];

        if (sleepValues.length >= 5 && perfValues.length >= 5 && sleepValues.length === perfValues.length) {
          const correlation = this.calculatePearsonCorrelation(sleepValues, perfValues);
          
          if (!isNaN(correlation)) {
            correlations.push({
              metric: `${sleepMetric.key}_vs_${perfMetric.key}`,
              correlation,
              strength: this.getCorrelationStrength(Math.abs(correlation)),
              significance: this.calculateSignificance(correlation, sleepValues.length),
              sampleSize: sleepValues.length
            });
          }
        }
      });
    });

    return correlations;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n !== y.length || n === 0) return NaN;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get correlation strength category
   */
  private static getCorrelationStrength(absCorrelation: number): 'weak' | 'moderate' | 'strong' {
    if (absCorrelation < 0.3) return 'weak';
    if (absCorrelation < 0.7) return 'moderate';
    return 'strong';
  }

  /**
   * Calculate statistical significance (simplified)
   */
  private static calculateSignificance(correlation: number, sampleSize: number): number {
    // Simplified significance calculation
    // In practice, you'd use proper statistical tests
    const tStat = Math.abs(correlation) * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    
    // Rough approximation of p-value significance
    if (sampleSize < 10) return 0.5;
    if (tStat > 2.5) return 0.95;
    if (tStat > 2.0) return 0.8;
    if (tStat > 1.5) return 0.7;
    return 0.5;
  }

  /**
   * Generate insight from correlation result
   */
  private static generateCorrelationInsight(correlation: CorrelationResult): SleepInsight | null {
    const [sleepMetric, perfMetric] = correlation.metric.split('_vs_');
    
    let message = '';
    let recommendation = '';
    let priority: 'low' | 'medium' | 'high' = 'medium';

    // Sleep duration correlations
    if (sleepMetric === 'sleepDuration') {
      if (perfMetric === 'workoutPerformance' && correlation.correlation > 0.4) {
        message = 'Your workout performance improves significantly with longer sleep duration';
        recommendation = 'Prioritize getting your target sleep duration before workout days';
        priority = 'high';
      } else if (perfMetric === 'energyLevel' && correlation.correlation > 0.4) {
        message = 'Your energy levels are strongly linked to how long you sleep';
        recommendation = 'Maintain consistent sleep duration to optimize daily energy';
        priority = 'high';
      }
    }

    // Sleep quality correlations
    if (sleepMetric === 'sleepQuality') {
      if (perfMetric === 'mood' && correlation.correlation > 0.4) {
        message = 'Your mood is significantly affected by sleep quality';
        recommendation = 'Focus on sleep environment and routine to improve sleep quality';
        priority = 'high';
      } else if (perfMetric === 'cognitivePerformance' && correlation.correlation > 0.4) {
        message = 'Your cognitive performance correlates with sleep quality';
        recommendation = 'Prioritize sleep quality on days requiring high mental performance';
        priority = 'medium';
      }
    }

    // Sleep efficiency correlations
    if (sleepMetric === 'sleepEfficiency') {
      if (perfMetric === 'stressLevel' && correlation.correlation < -0.4) {
        message = 'Poor sleep efficiency is linked to higher stress levels the next day';
        recommendation = 'Address factors causing restless sleep to reduce daily stress';
        priority = 'medium';
      }
    }

    if (!message) return null;

    return {
      id: `correlation-${correlation.metric}-${Date.now()}`,
      type: 'performance_impact',
      message,
      recommendation,
      priority,
      timestamp: new Date(),
      relatedFactors: [sleepMetric, perfMetric],
      actionable: true,
      evidenceStrength: correlation.significance
    };
  }

  /**
   * Get deep sleep percentage from sleep data
   */
  private static getDeepSleepPercentage(sleep: SleepData): number {
    if (!sleep.sleepStages || sleep.sleepStages.length === 0) return 0;

    const deepSleepMinutes = sleep.sleepStages
      .filter(stage => stage.stage === 'deep')
      .reduce((sum, stage) => sum + stage.duration, 0);

    return (deepSleepMinutes / sleep.totalSleepTime) * 100;
  }

  /**
   * Check if two dates are the same day
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Generate weekly performance summary based on sleep
   */
  static generateWeeklyPerformanceSummary(
    sleepData: SleepData[],
    performanceData: PerformanceMetric[]
  ): {
    averagePerformance: number;
    bestPerformanceDay: { date: Date; performance: number; sleepScore: number };
    worstPerformanceDay: { date: Date; performance: number; sleepScore: number };
    insights: string[];
  } {
    const matchedData = this.matchSleepWithPerformance(sleepData, performanceData);
    
    if (matchedData.length === 0) {
      return {
        averagePerformance: 0,
        bestPerformanceDay: { date: new Date(), performance: 0, sleepScore: 0 },
        worstPerformanceDay: { date: new Date(), performance: 0, sleepScore: 0 },
        insights: ['Not enough data to generate performance summary']
      };
    }

    // Calculate average performance metrics
    const avgWorkout = matchedData
      .filter(d => d.performance.workoutPerformance)
      .reduce((sum, d) => sum + (d.performance.workoutPerformance || 0), 0) / matchedData.length;

    const avgEnergy = matchedData
      .filter(d => d.performance.energyLevel)
      .reduce((sum, d) => sum + (d.performance.energyLevel || 0), 0) / matchedData.length;

    const avgMood = matchedData
      .filter(d => d.performance.mood)
      .reduce((sum, d) => sum + (d.performance.mood || 0), 0) / matchedData.length;

    const averagePerformance = (avgWorkout + avgEnergy + avgMood) / 3;

    // Find best and worst performance days
    const performanceScores = matchedData.map(d => ({
      date: d.performance.date,
      performance: ((d.performance.workoutPerformance || 0) + 
                   (d.performance.energyLevel || 0) + 
                   (d.performance.mood || 0)) / 3,
      sleepScore: d.sleep.sleepScore
    }));

    const bestDay = performanceScores.reduce((best, current) => 
      current.performance > best.performance ? current : best
    );

    const worstDay = performanceScores.reduce((worst, current) => 
      current.performance < worst.performance ? current : worst
    );

    // Generate insights
    const insights = [];
    
    if (bestDay.sleepScore > worstDay.sleepScore + 10) {
      insights.push('Your best performance day followed a night of high-quality sleep');
    }

    if (averagePerformance > 7) {
      insights.push('You had a great week of performance! Your sleep habits are paying off');
    } else if (averagePerformance < 5) {
      insights.push('Your performance was below average this week. Consider focusing on sleep quality');
    }

    return {
      averagePerformance: Number(averagePerformance.toFixed(1)),
      bestPerformanceDay: bestDay,
      worstPerformanceDay: worstDay,
      insights
    };
  }
}