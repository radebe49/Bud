import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { ThemedText } from '../../components/ThemedText';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { 
  FixedHeader, 
  MetricCard, 
  ProgressRing, 
  TrendGrid 
} from '../../src/shared/components';
import { 
  HealthInsightCard 
} from '../../src/features/health/components';
import { healthDataService } from '../../src/features/health/services/healthDataService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [dashboardData, setDashboardData] = useState(healthDataService.getHealthDashboardData());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setDashboardData(healthDataService.getHealthDashboardData());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setDashboardData(healthDataService.getHealthDashboardData());
      setRefreshing(false);
    }, 1000);
  };

  const handleMetricPress = (metric: string) => {
    // Navigate to detailed metric view
    router.push(`/health/metric/${metric}`);
  };

  const handleInsightPress = (insightId: string) => {
    // Navigate to detailed insight view
    router.push(`/health/insight/${insightId}`);
  };

  const renderWelcomeSection = () => {
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
    
    return (
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.greeting}>{greeting}</ThemedText>
        <ThemedText style={styles.subtitle}>Here's your health overview</ThemedText>
      </View>
    );
  };

  const renderHealthScore = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity 
        style={styles.healthScoreCard}
        onPress={() => handleMetricPress('health-score')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#F0F9FF', '#FFFFFF']}
          style={styles.healthScoreGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.healthScoreContent}>
            <View style={styles.healthScoreLeft}>
              <ThemedText style={styles.scoreTitle}>Health Score</ThemedText>
              <ThemedText style={styles.scoreValue}>{dashboardData.overallScore}</ThemedText>
              <ThemedText style={styles.scoreDescription}>
                {dashboardData.overallScore >= 80 ? 'Excellent health status' : 
                 dashboardData.overallScore >= 60 ? 'Good health status' : 
                 'Focus on improvement areas'}
              </ThemedText>
            </View>
            
            <View style={styles.healthScoreRight}>
              <ProgressRing
                size={100}
                strokeWidth={8}
                progress={dashboardData.overallScore / 100}
                color="#06B6D4"
                backgroundColor="#E0F2FE"
                value={dashboardData.overallScore.toString()}
                label=""
              />
            </View>
          </View>
          
          <View style={styles.chevronContainer}>
            <IconSymbol name="chevron.right" size={16} color="#06B6D4" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderKeyMetrics = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Key Metrics</ThemedText>
        <TouchableOpacity onPress={() => router.push('/health')}>
          <ThemedText style={styles.seeAllText}>View All</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Sleep Quality"
          value={dashboardData.currentMetrics.sleepScore?.toString() || '0'}
          unit="score"
          icon="moon.fill"
          iconColor="#8B5CF6"
          trend="up"
          trendValue="+5%"
          onPress={() => handleMetricPress('sleep')}
        />
        
        <MetricCard
          title="Heart Rate"
          value={dashboardData.currentMetrics.heartRate?.toString() || '0'}
          unit="bpm"
          icon="heart.fill"
          iconColor="#EF4444"
          trend="stable"
          trendValue="Normal"
          onPress={() => handleMetricPress('heart-rate')}
        />
        
        <MetricCard
          title="Activity"
          value={dashboardData.currentMetrics.steps?.toString() || '0'}
          unit="steps"
          icon="figure.walk"
          iconColor="#10B981"
          trend="up"
          trendValue="+12%"
          onPress={() => handleMetricPress('activity')}
        />
        
        <MetricCard
          title="Hydration"
          value={(dashboardData.currentMetrics.waterIntake / 1000).toFixed(1)}
          unit="L"
          icon="drop.fill"
          iconColor="#06B6D4"
          trend="down"
          trendValue="-0.3L"
          onPress={() => handleMetricPress('hydration')}
        />
      </View>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>AI Insights</ThemedText>
        <View style={styles.aiTag}>
          <IconSymbol name="brain.head.profile" size={12} color="#06B6D4" />
          <ThemedText style={styles.aiTagText}>Bud</ThemedText>
        </View>
      </View>
      
      {dashboardData.insights.slice(0, 2).map((insight) => (
        <HealthInsightCard
          key={insight.id}
          insight={insight}
          onPress={() => handleInsightPress(insight.id)}
        />
      ))}
      
      {dashboardData.insights.length > 2 && (
        <TouchableOpacity 
          style={styles.viewMoreInsights}
          onPress={() => router.push('/health/insights')}
        >
          <ThemedText style={styles.viewMoreText}>
            View {dashboardData.insights.length - 2} more insights
          </ThemedText>
          <IconSymbol name="arrow.right" size={14} color="#06B6D4" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTrends = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.trendsHeader}>
        <ThemedText style={styles.sectionTitle}>Health Trends</ThemedText>
        <View style={styles.timeframeSelector}>
          {(['today', 'week', 'month'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <ThemedText style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe && styles.timeframeButtonTextActive
              ]}>
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TrendGrid
        trends={[
          {
            title: 'Sleep Quality',
            data: dashboardData.trends.sleep,
            color: '#8B5CF6',
            unit: 'hrs',
            trend: 'up',
            trendValue: '+15%',
          },
          {
            title: 'Energy Levels',
            data: dashboardData.trends.energy,
            color: '#F59E0B',
            unit: '/10',
            trend: 'stable',
            trendValue: '±2%',
          },
          {
            title: 'Activity',
            data: dashboardData.trends.activity,
            color: '#10B981',
            unit: 'min',
            trend: 'up',
            trendValue: '+8%',
          },
          {
            title: 'Heart Rate',
            data: dashboardData.trends.heartRate,
            color: '#EF4444',
            unit: 'bpm',
            trend: 'down',
            trendValue: '-3 bpm',
          },
        ]}
      />
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/askbud')}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="message.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Ask Bud</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Get AI guidance</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/workouts')}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="figure.run" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Workout</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Start training</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/nutrition')}
        >
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
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/health')}
        >
          <LinearGradient
            colors={['#06B6D4', '#0891B2']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="chart.bar.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Health Data</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>View details</ThemedText>
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
        {renderWelcomeSection()}
        {renderHealthScore()}
        {renderKeyMetrics()}
        {renderInsights()}
        {renderTrends()}
        {renderQuickActions()}
        
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
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
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
    color: '#06B6D4',
    fontWeight: '600',
  },
  healthScoreCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  healthScoreGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  healthScoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    color: '#06B6D4',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  chevronContainer: {
    alignSelf: 'flex-end',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  aiTagText: {
    fontSize: 12,
    color: '#06B6D4',
    fontWeight: '600',
  },
  viewMoreInsights: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#06B6D4',
    fontWeight: '600',
  },
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeframeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeframeButtonTextActive: {
    color: '#06B6D4',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
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