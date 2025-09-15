import { 
  HealthMetrics, 
  HealthInsight, 
  DailyHealthSummary, 
  HealthTrend,
  Achievement 
} from '../types/healthTypes';

interface TrendDataPoint {
  day: string;
  value: number;
  label?: string;
}

interface HealthDashboardData {
  overallScore: number;
  insights: HealthInsight[];
  trends: {
    sleep: TrendDataPoint[];
    energy: TrendDataPoint[];
    activity: TrendDataPoint[];
    heartRate: TrendDataPoint[];
  };
  currentMetrics: HealthMetrics;
  achievements: Achievement[];
}

class HealthDataService {
  private generateWeeklyTrendData(baseValue: number, variance: number = 0.2): TrendDataPoint[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      value: Math.round(baseValue + (Math.random() - 0.5) * variance * baseValue),
    }));
  }

  private generateHealthInsights(): HealthInsight[] {
    return [
      {
        id: '1',
        type: 'trend_improvement',
        title: 'Sleep Quality Trending Up',
        description: 'Your sleep score has improved by 15% over the past week. Your consistent bedtime routine is paying off!',
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Continue your current bedtime routine',
          'Consider reducing screen time 1 hour before bed',
        ],
        relatedMetrics: ['sleep_score'],
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'recommendation',
        title: 'Optimize Your Workout Timing',
        description: 'Your energy levels are highest between 9-11 AM. Consider scheduling workouts during this window.',
        priority: 'low',
        actionable: true,
        recommendations: [
          'Schedule morning workouts between 9-11 AM',
          'Track energy levels after morning exercise',
        ],
        relatedMetrics: ['activity_level'],
        timestamp: new Date(),
      },
      {
        id: '3',
        type: 'warning',
        title: 'Hydration Below Target',
        description: 'You\'ve been 20% below your daily water intake goal for 3 consecutive days.',
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Set hourly water reminders',
          'Keep a water bottle at your desk',
          'Drink a glass of water before each meal',
        ],
        relatedMetrics: ['water_intake'],
        timestamp: new Date(),
      },
      {
        id: '4',
        type: 'celebration',
        title: 'Heart Rate Recovery Excellent',
        description: 'Your resting heart rate has decreased by 5 BPM this month - a sign of improved cardiovascular fitness!',
        priority: 'low',
        actionable: false,
        recommendations: [],
        relatedMetrics: ['heart_rate'],
        timestamp: new Date(),
      },
    ];
  }

  private generateCurrentMetrics(): HealthMetrics {
    return {
      heartRate: 68,
      sleepScore: 82,
      recoveryScore: 75,
      stressLevel: 3,
      activityLevel: 7,
      caloriesConsumed: 1950,
      caloriesBurned: 2350,
      waterIntake: 1800, // ml (below target)
      steps: 9200,
      activeMinutes: 52,
      timestamp: new Date(),
    };
  }

  private generateAchievements(): Achievement[] {
    return [
      {
        id: '1',
        type: 'streak',
        title: '10-Day Sleep Streak',
        description: 'Achieved 7+ hours of sleep for 10 consecutive nights',
        icon: 'moon.stars.fill',
        unlockedAt: new Date(),
        relatedMetric: 'sleep_score',
        value: 10,
      },
      {
        id: '2',
        type: 'milestone',
        title: 'Resting Heart Rate Champion',
        description: 'Lowered resting heart rate by 10 BPM',
        icon: 'heart.fill',
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        relatedMetric: 'heart_rate',
        value: 10,
      },
      {
        id: '3',
        type: 'personal_best',
        title: 'Step Counter Pro',
        description: 'New personal best: 12,500 steps in a single day',
        icon: 'figure.walk',
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        relatedMetric: 'steps',
        value: 12500,
      },
    ];
  }

  getHealthDashboardData(): HealthDashboardData {
    return {
      overallScore: 78,
      insights: this.generateHealthInsights(),
      trends: {
        sleep: this.generateWeeklyTrendData(7.5, 0.3).map(point => ({
          ...point,
          value: Math.round(point.value * 10) / 10, // Round to 1 decimal
        })),
        energy: this.generateWeeklyTrendData(7, 0.4),
        activity: this.generateWeeklyTrendData(45, 0.5),
        heartRate: this.generateWeeklyTrendData(70, 0.1),
      },
      currentMetrics: this.generateCurrentMetrics(),
      achievements: this.generateAchievements(),
    };
  }

  getWeeklyHealthSummary() {
    const trends: HealthTrend[] = [
      {
        metric: 'sleep_score',
        direction: 'improving',
        magnitude: 15,
        timeframe: 'weekly',
        confidence: 0.85,
        significance: 'medium',
      },
      {
        metric: 'heart_rate',
        direction: 'improving',
        magnitude: 8,
        timeframe: 'weekly',
        confidence: 0.92,
        significance: 'high',
      },
      {
        metric: 'water_intake',
        direction: 'declining',
        magnitude: 12,
        timeframe: 'weekly',
        confidence: 0.78,
        significance: 'medium',
      },
      {
        metric: 'activity_level',
        direction: 'stable',
        magnitude: 2,
        timeframe: 'weekly',
        confidence: 0.65,
        significance: 'low',
      },
    ];

    return {
      weekStart: new Date().toISOString().split('T')[0],
      trends,
      achievements: this.generateAchievements(),
    };
  }

  getDailyHealthSummary(): DailyHealthSummary {
    return {
      date: new Date().toISOString().split('T')[0],
      metrics: this.generateCurrentMetrics(),
      insights: this.generateHealthInsights(),
      readinessScore: 78,
      recommendations: [
        'Your sleep quality is excellent - keep up the consistent routine!',
        'Consider a moderate workout today based on your recovery score.',
        'Focus on hydration - aim for 2.5L of water today.',
        'Your heart rate variability suggests good recovery.',
      ],
    };
  }

  getHealthScore(): number {
    return 78;
  }

  getMetricTrend(metric: string): TrendDataPoint[] {
    const data = this.getHealthDashboardData();
    switch (metric) {
      case 'sleep':
        return data.trends.sleep;
      case 'energy':
        return data.trends.energy;
      case 'activity':
        return data.trends.activity;
      case 'heartRate':
        return data.trends.heartRate;
      default:
        return [];
    }
  }
}

export const healthDataService = new HealthDataService();