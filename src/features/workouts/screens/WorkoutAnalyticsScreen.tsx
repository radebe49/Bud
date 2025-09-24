import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProgressRing } from '@/shared/components/ProgressRing';
import { MetricCard } from '@/shared/components/MetricCard';
import { WorkoutHistoryCard, AchievementBadge } from '../components';
import { workoutService } from '../services/workoutService';
import type { 
  WorkoutSession, 
  Achievement, 
  ProgressMetric,
  WorkoutStreak 
} from '../types/workoutTypes';

const { width } = Dimensions.get('window');

interface WorkoutAnalyticsScreenProps {
  onClose: () => void;
}

export function WorkoutAnalyticsScreen({ onClose }: WorkoutAnalyticsScreenProps) {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<WorkoutStreak | null>(null);
  const [performanceTrends, setPerformanceTrends] = useState<{
    trends: ProgressMetric[];
    insights: string[];
    recommendations: string[];
  } | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [
        historyData,
        achievementsData,
        streakData,
        trendsData
      ] = await Promise.all([
        workoutService.getWorkoutHistory(20),
        workoutService.getAchievements(),
        workoutService.getWorkoutStreak(),
        workoutService.getPerformanceTrends('current-user', selectedTimeframe)
      ]);

      setWorkoutHistory(historyData);
      setAchievements(achievementsData);
      setStreak(streakData);
      setPerformanceTrends(trendsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const timeframeOptions = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'quarter', label: 'Quarter' }
  ];

  const calculateTotalStats = () => {
    const totalWorkouts = workoutHistory.length;
    const totalDuration = workoutHistory.reduce((sum, session) => sum + session.duration, 0);
    const totalCalories = workoutHistory.reduce((sum, session) => sum + session.caloriesBurned, 0);
    const averageRating = workoutHistory.length > 0 
      ? workoutHistory.reduce((sum, session) => sum + (session.rating || 0), 0) / workoutHistory.length
      : 0;

    return { totalWorkouts, totalDuration, totalCalories, averageRating };
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.headerButton}>
        <IconSymbol name="xmark" size={24} color="#6B7280" />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>Workout Analytics</ThemedText>
      <View style={styles.headerButton} />
    </View>
  );

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      <View style={styles.timeframeSelector}>
        {timeframeOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => setSelectedTimeframe(option.id as any)}
            style={[
              styles.timeframeOption,
              selectedTimeframe === option.id && styles.selectedTimeframeOption
            ]}
          >
            <ThemedText style={[
              styles.timeframeText,
              selectedTimeframe === option.id && styles.selectedTimeframeText
            ]}>
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOverviewStats = () => {
    const stats = calculateTotalStats();
    
    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Overview</ThemedText>
        
        <View style={styles.statsGrid}>
          <MetricCard
            title="Total Workouts"
            value={stats.totalWorkouts.toString()}
            unit="sessions"
            icon="figure.run"
            iconColor="#4F46E5"
            trend="up"
            trendValue="+12%"
            backgroundColor="#FFFFFF"
            gradient={['#EEF2FF', '#FFFFFF']}
          />
          
          <MetricCard
            title="Total Time"
            value={Math.floor(stats.totalDuration / 60).toString()}
            unit="hours"
            icon="clock.fill"
            iconColor="#10B981"
            trend="up"
            trendValue="+8h"
            backgroundColor="#FFFFFF"
            gradient={['#F0FDF4', '#FFFFFF']}
          />
          
          <MetricCard
            title="Calories Burned"
            value={stats.totalCalories.toLocaleString()}
            unit="cal"
            icon="flame.fill"
            iconColor="#EF4444"
            trend="up"
            trendValue="+450"
            backgroundColor="#FFFFFF"
            gradient={['#FEF2F2', '#FFFFFF']}
          />
          
          <MetricCard
            title="Avg Rating"
            value={stats.averageRating.toFixed(1)}
            unit="/ 5"
            icon="star.fill"
            iconColor="#F59E0B"
            trend="stable"
            trendValue="Great!"
            backgroundColor="#FFFFFF"
            gradient={['#FFFBEB', '#FFFFFF']}
          />
        </View>
      </View>
    );
  };

  const renderStreakCard = () => {
    if (!streak) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Current Streak</ThemedText>
        
        <View style={styles.streakCard}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.streakContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.streakLeft}>
              <View style={styles.streakIcon}>
                <IconSymbol name="flame.fill" size={32} color="#FFFFFF" />
              </View>
              <View>
                <ThemedText style={styles.streakValue}>{streak.currentStreak}</ThemedText>
                <ThemedText style={styles.streakLabel}>Day Streak</ThemedText>
              </View>
            </View>
            
            <View style={styles.streakRight}>
              <View style={styles.streakStat}>
                <ThemedText style={styles.streakStatValue}>{streak.longestStreak}</ThemedText>
                <ThemedText style={styles.streakStatLabel}>Best Streak</ThemedText>
              </View>
              <View style={styles.streakProgress}>
                <ProgressRing
                  size={80}
                  strokeWidth={6}
                  progress={streak.weeklyCompleted / streak.weeklyGoal}
                  color="#FFFFFF"
                  backgroundColor="rgba(255,255,255,0.3)"
                  value={`${streak.weeklyCompleted}/${streak.weeklyGoal}`}
                  label=""
                />
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderAchievements = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Achievements</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAllText}>View All</ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.achievementsContainer}
      >
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="large"
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderInsights = () => {
    if (!performanceTrends) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>AI Insights</ThemedText>
        
        <View style={styles.insightsContainer}>
          {performanceTrends.insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <LinearGradient
                colors={['#F0FDF4', '#FFFFFF']}
                style={styles.insightContent}
              >
                <View style={styles.insightIcon}>
                  <IconSymbol name="lightbulb.fill" size={20} color="#10B981" />
                </View>
                <ThemedText style={styles.insightText}>{insight}</ThemedText>
              </LinearGradient>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRecommendations = () => {
    if (!performanceTrends) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Recommendations</ThemedText>
        
        <View style={styles.recommendationsContainer}>
          {performanceTrends.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationCard}>
              <LinearGradient
                colors={['#EEF2FF', '#FFFFFF']}
                style={styles.recommendationContent}
              >
                <View style={styles.recommendationIcon}>
                  <IconSymbol name="target" size={20} color="#4F46E5" />
                </View>
                <ThemedText style={styles.recommendationText}>{recommendation}</ThemedText>
                <TouchableOpacity style={styles.recommendationAction}>
                  <IconSymbol name="chevron.right" size={16} color="#4F46E5" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderWorkoutHistory = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Recent Workouts</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAllText}>View All</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.historyContainer}>
        {workoutHistory.slice(0, 5).map((session) => (
          <WorkoutHistoryCard
            key={session.id}
            session={session}
            onPress={() => console.log('View workout details:', session.id)}
          />
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ProgressRing
            size={60}
            strokeWidth={6}
            progress={0.7}
            color="#4F46E5"
            animated={true}
          />
          <ThemedText style={styles.loadingText}>Loading analytics...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTimeframeSelector()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOverviewStats()}
        {renderStreakCard()}
        {renderAchievements()}
        {renderInsights()}
        {renderRecommendations()}
        {renderWorkoutHistory()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  timeframeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  timeframeOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTimeframeOption: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedTimeframeText: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  streakCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderRadius: 20,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  streakRight: {
    alignItems: 'center',
    gap: 12,
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  streakStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  streakProgress: {
    // Progress ring styles handled by component
  },
  achievementsContainer: {
    paddingRight: 20,
    gap: 16,
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  recommendationAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContainer: {
    gap: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});