import { DailyHealthSummary, HealthMetrics, HealthInsight, Achievement } from '@/features/health/types/healthTypes';

interface DashboardData {
  dailySummary: DailyHealthSummary;
  recentActivities: ActivityItem[];
  achievements: Achievement[];
  quickStats: QuickStat[];
}

type IconName = 
  | 'trophy.fill'
  | 'heart.fill'
  | 'brain.head.profile'
  | 'moon.fill'
  | 'flame.fill'
  | 'figure.walk'
  | 'drop.fill'
  | 'fork.knife'
  | 'moon.stars.fill';

interface ActivityItem {
  id: string;
  type: 'achievement' | 'activity' | 'insight';
  icon: IconName;
  iconColor: string;
  title: string;
  description: string;
  time: string;
}

interface QuickStat {
  id: string;
  title: string;
  value: string;
  unit?: string;
  icon: IconName;
  iconColor: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

class MockHealthDataService {
  private generateMockMetrics(): HealthMetrics {
    return {
      heartRate: 72,
      sleepScore: 85,
      recoveryScore: 78,
      stressLevel: 3,
      activityLevel: 7,
      caloriesConsumed: 1850,
      caloriesBurned: 2200,
      waterIntake: 2100, // ml
      steps: 8500,
      activeMinutes: 45,
      timestamp: new Date(),
    };
  }

  private generateMockInsights(): HealthInsight[] {
    return [
      {
        id: '1',
        type: 'trend_improvement',
        title: 'Sleep Quality Improving',
        description: 'Your sleep score has increased by 12% this week',
        priority: 'medium',
        actionable: true,
        recommendations: ['Keep your current bedtime routine'],
        relatedMetrics: ['sleep_score'],
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'recommendation',
        title: 'Hydration Reminder',
        description: 'You\'re 300ml behind your daily water goal',
        priority: 'low',
        actionable: true,
        recommendations: ['Drink a glass of water now'],
        relatedMetrics: ['water_intake'],
        timestamp: new Date(),
      },
    ];
  }

  private generateMockAchievements(): Achievement[] {
    return [
      {
        id: '1',
        type: 'streak',
        title: '7-Day Workout Streak',
        description: 'Completed workouts for 7 consecutive days',
        icon: 'flame.fill',
        unlockedAt: new Date(),
        relatedMetric: 'active_minutes',
        value: 7,
      },
      {
        id: '2',
        type: 'milestone',
        title: 'Sleep Champion',
        description: 'Achieved 8+ hours of sleep for 5 nights',
        icon: 'moon.stars.fill',
        unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        relatedMetric: 'sleep_score',
        value: 5,
      },
    ];
  }

  private generateRecentActivities(): ActivityItem[] {
    return [
      {
        id: '1',
        type: 'achievement',
        icon: 'trophy.fill',
        iconColor: '#FFD700',
        title: 'New Personal Best!',
        description: 'Completed 10,000 steps for the first time',
        time: '2 hours ago',
      },
      {
        id: '2',
        type: 'activity',
        icon: 'heart.fill',
        iconColor: '#FF3B30',
        title: 'Morning Workout',
        description: '30-minute HIIT session completed',
        time: '4 hours ago',
      },
      {
        id: '3',
        type: 'insight',
        icon: 'brain.head.profile',
        iconColor: '#007AFF',
        title: 'Bud\'s Insight',
        description: 'Your energy levels are highest between 9-11 AM',
        time: '6 hours ago',
      },
      {
        id: '4',
        type: 'activity',
        icon: 'moon.fill',
        iconColor: '#5856D6',
        title: 'Great Sleep',
        description: '8h 15m of quality sleep (Score: 85)',
        time: '8 hours ago',
      },
    ];
  }

  private generateQuickStats(): QuickStat[] {
    return [
      {
        id: '1',
        title: 'Cardio',
        value: '45',
        unit: 'min',
        icon: 'flame.fill',
        iconColor: '#FF9500',
        trend: 'up',
        trendValue: '+12%',
      },
      {
        id: '2',
        title: 'Sleep',
        value: '8h 15m',
        icon: 'moon.fill',
        iconColor: '#5856D6',
        trend: 'up',
        trendValue: '+5%',
      },
      {
        id: '3',
        title: 'Water',
        value: '2.1',
        unit: 'L',
        icon: 'drop.fill',
        iconColor: '#007AFF',
        trend: 'down',
        trendValue: '-10%',
      },
    ];
  }

  getDashboardData(): DashboardData {
    const metrics = this.generateMockMetrics();
    const insights = this.generateMockInsights();
    
    const dailySummary: DailyHealthSummary = {
      date: new Date().toISOString().split('T')[0],
      metrics,
      insights,
      readinessScore: 78,
      recommendations: [
        'Great job on your sleep! Keep up the consistent bedtime routine.',
        'Consider a light workout today - your recovery score looks good.',
        'Don\'t forget to stay hydrated throughout the day.',
      ],
    };

    return {
      dailySummary,
      recentActivities: this.generateRecentActivities(),
      achievements: this.generateMockAchievements(),
      quickStats: this.generateQuickStats(),
    };
  }

  getReadinessScore(): number {
    return 78; // Mock readiness score
  }

  getTodaysGoalProgress(): { completed: number; total: number } {
    return { completed: 3, total: 5 };
  }
}

export const mockHealthDataService = new MockHealthDataService();