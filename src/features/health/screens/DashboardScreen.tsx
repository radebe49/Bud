import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MetricCard } from '@/shared/components/MetricCard';
import { ProgressRing } from '@/shared/components/ProgressRing';
import { ThreeRingProgress } from '@/shared/components/ThreeRingProgress';
import { FixedHeader } from '@/shared/components/FixedHeader';
import { HealthScoreCard } from '../components/HealthScoreCard';
import { TrendChart } from '../components/TrendChart';
import { HealthInsightCard } from '../components/HealthInsightCard';
import { ActivityFeedItem } from '@/shared/components/ActivityFeedItem';

const { width } = Dimensions.get('window');

interface DashboardData {
  healthScore: number;
  steps: number;
  calories: number;
  sleep: number;
  water: number;
  heartRate: number;
  workouts: number;
  activities: any[];
  insights: any[];
}

export const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    healthScore: 85,
    steps: 8432,
    calories: 2150,
    sleep: 7.5,
    water: 6,
    heartRate: 72,
    workouts: 3,
    activities: [],
    insights: [],
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };



  const renderHealthScoreCard = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.healthScoreCard}>
        <View style={styles.healthScoreContent}>
          <View style={styles.healthScoreLeft}>
            <ThemedText style={styles.scoreTitle}>Health Score</ThemedText>
            <ThemedText style={styles.scoreValue}>{dashboardData.healthScore}</ThemedText>
            <ThemedText style={styles.scoreDescription}>
              Excellent! All systems are performing well.
            </ThemedText>
          </View>
          
          <View style={styles.healthScoreRight}>
            <ProgressRing
              size={100}
              strokeWidth={8}
              progress={dashboardData.healthScore / 100}
              color="#10B981"
              backgroundColor="#F0FDF4"
              value={`${dashboardData.healthScore}`}
              label=""
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderActivityRings = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Activity Rings</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAllText}>See All</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.activityRingsContainer}>
        <ThreeRingProgress
          rings={[
            {
              title: 'Move',
              value: dashboardData.steps,
              total: 10000,
              unit: 'steps',
              color: '#FF3B30',
              percentage: (dashboardData.steps / 10000) * 100,
            },
            {
              title: 'Exercise',
              value: dashboardData.workouts,
              total: 5,
              unit: 'workouts',
              color: '#30D158',
              percentage: (dashboardData.workouts / 5) * 100,
            },
            {
              title: 'Stand',
              value: 8,
              total: 10,
              unit: 'hours',
              color: '#007AFF',
              percentage: 80,
            },
          ]}
          size={160}
          strokeWidth={12}
        />
      </View>
    </View>
  );

  const renderMetricsGrid = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Health Metrics</ThemedText>
      
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Sleep"
          value={dashboardData.sleep.toString()}
          unit="hrs"
          icon="moon.fill"
          iconColor="#8B5CF6"
          trend="up"
          trendValue="+0.5h"
          backgroundColor="#FFFFFF"
        />
        
        <MetricCard
          title="Water"
          value={dashboardData.water.toString()}
          unit="glasses"
          icon="drop.fill"
          iconColor="#06B6D4"
          trend="stable"
          trendValue="Goal met"
          backgroundColor="#FFFFFF"
        />
        
        <MetricCard
          title="Heart Rate"
          value={dashboardData.heartRate.toString()}
          unit="bpm"
          icon="heart.fill"
          iconColor="#EF4444"
          trend="down"
          trendValue="-2 bpm"
          backgroundColor="#FFFFFF"
        />
        
        <MetricCard
          title="Calories"
          value={dashboardData.calories.toLocaleString()}
          unit="kcal"
          icon="flame.fill"
          iconColor="#F97316"
          trend="up"
          trendValue="+150"
          backgroundColor="#FFFFFF"
        />
      </View>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Bud Insights</ThemedText>
        <View style={styles.aiTag}>
          <IconSymbol name="brain.head.profile" size={12} color="#10B981" />
          <ThemedText style={styles.aiTagText}>Bud</ThemedText>
        </View>
      </View>
      
      <HealthInsightCard
        title="Stronger Recovery Detected"
        description="Your sleep quality jumped +30 mins this week. Bud recommends pushing intensity slightly higher in tomorrow’s workout."
        icon="moon.fill"
        iconColor="#8B5CF6"
        type="positive"
        actionText="See Recovery Plan"
      />

      <HealthInsightCard
        title="Hydration Boost Needed"
        description="You’re 500ml short of your optimal intake. Staying hydrated improves focus — add 2 glasses this evening to stay on track."
        icon="drop.fill"
        iconColor="#06B6D4"
        type="reminder"
        actionText="Update Hydration"
      />
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="figure.run" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Log Workout</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Track exercise</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#06B6D4', '#0891B2']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="drop.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Add Water</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Stay hydrated</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#F97316', '#EA580C']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="fork.knife" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Log Meal</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Track nutrition</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="message.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Chat with Bud</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Get AI guidance</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FixedHeader />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHealthScoreCard()}
        {renderInsights()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },

  healthScoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  healthScoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthScoreLeft: {
    flex: 1,
    marginRight: 20,
  },
  healthScoreRight: {
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionContainer: {
    paddingHorizontal: 20,
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
    color: '#007AFF',
    fontWeight: '600',
  },
  activityRingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  aiTagText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  quickActionCard: {
    width: '47%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quickActionContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderRadius: 20,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
});