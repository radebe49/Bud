import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { ProgressRing } from '../../src/shared/components/ProgressRing';
import { FixedHeader, ThreeRingProgress, TrendGrid, Tag, MetricCard } from '../../src/shared/components';
import { 
  HealthInsightCard
} from '../../src/features/health/components';
import { healthDataService } from '../../src/features/health/services/healthDataService';

const { width } = Dimensions.get('window');

export default function HealthScreen() {
  const [dashboardData, setDashboardData] = useState(healthDataService.getHealthDashboardData());
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<'week' | 'month'>('week');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulate data refresh
    const refreshData = () => {
      setDashboardData(healthDataService.getHealthDashboardData());
    };

    refreshData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleInsightPress = (insightId: string) => {
    // Handle insight card press - could navigate to detailed view
    // TODO: Navigate to detailed insight view
    console.log('Insight pressed:', insightId);
  };



  const renderVitalityCard = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.vitalityCard}>
        <View style={styles.vitalityContent}>
          <View style={styles.vitalityLeft}>
            <ThemedText style={styles.scoreTitle}>Vitality Index</ThemedText>
            <ThemedText style={styles.scoreValue}>{dashboardData.overallScore}</ThemedText>
            <ThemedText style={styles.scoreDescription}>
              Your overall health is looking great today!
            </ThemedText>
          </View>
          
          <View style={styles.vitalityRight}>
            <ProgressRing
              size={100}
              strokeWidth={8}
              progress={dashboardData.overallScore / 100}
              color="#06B6D4"
              backgroundColor="#F0F9FF"
              value={dashboardData.overallScore.toString()}
              label=""
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderHealthRings = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Health Overview</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAllText}>Details</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.healthRingsContainer}>
        <ThreeRingProgress
          size={100}
          strokeWidth={8}
          rings={[
            {
              title: 'Sleep',
              value: 85,
              total: 100,
              unit: '%',
              color: '#8B5CF6',
              percentage: 85,
            },
            {
              title: 'Activity',
              value: 72,
              total: 100,
              unit: '%',
              color: '#10B981',
              percentage: 72,
            },
            {
              title: 'Recovery',
              value: 68,
              total: 100,
              unit: '%',
              color: '#F59E0B',
              percentage: 68,
            },
          ]}
        />
      </View>
    </View>
  );

  const renderMetricsGrid = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Key Metrics</ThemedText>
      
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Heart Rate"
          value="72"
          unit="bpm"
          icon="heart.fill"
          iconColor="#EF4444"
          trend="stable"
          trendValue="Normal"
          backgroundColor="#FFFFFF"
          gradient={['#FEF2F2', '#FFFFFF']}
        />
        
        <MetricCard
          title="Blood Pressure"
          value="120/80"
          unit="mmHg"
          icon="chart.bar.fill"
          iconColor="#3B82F6"
          trend="stable"
          trendValue="Optimal"
          backgroundColor="#FFFFFF"
          gradient={['#EFF6FF', '#FFFFFF']}
        />
        
        <MetricCard
          title="Body Weight"
          value="68.5"
          unit="kg"
          icon="figure.walk"
          iconColor="#10B981"
          trend="down"
          trendValue="-0.5kg"
          backgroundColor="#FFFFFF"
          gradient={['#F0FDF4', '#FFFFFF']}
        />
        
        <MetricCard
          title="Hydration"
          value="2.1"
          unit="L"
          icon="drop.fill"
          iconColor="#06B6D4"
          trend="up"
          trendValue="+300ml"
          backgroundColor="#FFFFFF"
          gradient={['#F0F9FF', '#FFFFFF']}
        />
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Health Actions</ThemedText>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="heart.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Heart Rate</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Check vitals</ThemedText>
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
              <IconSymbol name="moon.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Sleep Log</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Track rest</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="chart.bar.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Body Stats</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Log measurements</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="cross.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Symptoms</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Log how you feel</ThemedText>
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
        {renderVitalityCard()}
        {renderHealthRings()}

        {/* AI Health Insights */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>AI Health Insights</ThemedText>
            <View style={styles.aiTag}>
              <IconSymbol name="brain.head.profile" size={12} color="#06B6D4" />
              <ThemedText style={styles.aiTagText}>Bud</ThemedText>
            </View>
          </View>
          
          {dashboardData.insights.length > 0 && (
            <HealthInsightCard
              insight={dashboardData.insights[0]}
              onPress={() => handleInsightPress(dashboardData.insights[0].id)}
            />
          )}
        </View>

        {/* Interactive Trend Charts */}
        <View style={styles.sectionContainer}>
          <View style={styles.trendsHeader}>
            <ThemedText style={styles.sectionTitle}>
              Health Trends
            </ThemedText>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedTrendPeriod === 'week' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedTrendPeriod('week')}
              >
                <ThemedText style={[
                  styles.periodButtonText,
                  selectedTrendPeriod === 'week' && styles.periodButtonTextActive
                ]}>
                  Week
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedTrendPeriod === 'month' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedTrendPeriod('month')}
              >
                <ThemedText style={[
                  styles.periodButtonText,
                  selectedTrendPeriod === 'month' && styles.periodButtonTextActive
                ]}>
                  Month
                </ThemedText>
              </TouchableOpacity>
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
                title: 'Activity Minutes',
                data: dashboardData.trends.activity,
                color: '#10B981',
                unit: 'min',
                trend: 'up',
                trendValue: '+8%',
              },
              {
                title: 'Resting Heart Rate',
                data: dashboardData.trends.heartRate,
                color: '#EF4444',
                unit: 'bpm',
                trend: 'down',
                trendValue: '-5 bpm',
              },
            ]}
          />
        </View>
        
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
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  vitalityCard: {
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
  vitalityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vitalityLeft: {
    flex: 1,
    marginRight: 20,
  },
  vitalityRight: {
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
  healthRingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: -20,
    marginLeft: 0,
    marginRight: 0,
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
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodButtonActive: {
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
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#06B6D4',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});