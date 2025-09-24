import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Alert, View, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { 
  WorkoutCard, 
  WorkoutHistoryCard, 
  WorkoutProgress 
} from '../../src/features/workouts';
import { 
  WorkoutTrackingScreen,
  WorkoutPlanningScreen,
  WorkoutAnalyticsScreen
} from '../../src/features/workouts/screens';
import { FixedHeader, ThreeRingProgress, Tag, MetricCard, ProgressRing } from '../../src/shared/components';
import { HealthInsightCard } from '../../src/features/health/components';
import { workoutService } from '../../src/features/workouts';
import { workoutUpdateNotifier } from '../../src/shared/services/workoutUpdateNotifier';
import type { 
  WorkoutRecommendation, 
  WorkoutSession, 
  WorkoutStreak as WorkoutStreakType,
  WorkoutPlan 
} from '@/features/workouts/types/workoutTypes';

const { width } = Dimensions.get('window');

export default function CardioScreen() {
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [streak, setStreak] = useState<WorkoutStreakType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWorkoutTracking, setShowWorkoutTracking] = useState(false);
  const [showWorkoutPlanning, setShowWorkoutPlanning] = useState(false);
  const [showWorkoutAnalytics, setShowWorkoutAnalytics] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [
        recommendationsData,
        historyData,
        streakData
      ] = await Promise.all([
        workoutService.getRecommendedWorkouts(),
        workoutService.getWorkoutHistory(5),
        workoutService.getWorkoutStreak()
      ]);

      setRecommendations(recommendationsData);
      setWorkoutHistory(historyData);
      setStreak(streakData);
    } catch (loadError) {
      console.error('Error loading workout data:', loadError);
      Alert.alert('Error', 'Failed to load workout data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Subscribe to workout recommendation updates
    const unsubscribe = workoutUpdateNotifier.subscribe(() => {
      // Reload recommendations when they're updated from chat
      loadData();
    });
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleWorkoutPress = async (workoutId: string) => {
    setActiveWorkoutId(workoutId);
    setShowWorkoutTracking(true);
  };

  const handleWorkoutComplete = (session: WorkoutSession) => {
    setShowWorkoutTracking(false);
    setActiveWorkoutId(null);
    loadData(); // Refresh data
    Alert.alert(
      'Workout Complete!',
      `Great job! You burned ${session.caloriesBurned} calories in ${session.duration} minutes.`,
      [{ text: 'OK' }]
    );
  };

  const handleWorkoutCancel = () => {
    setShowWorkoutTracking(false);
    setActiveWorkoutId(null);
  };

  const handlePlanCreated = (plan: WorkoutPlan) => {
    setShowWorkoutPlanning(false);
    loadData(); // Refresh recommendations
    Alert.alert(
      'Plan Created!',
      `Your personalized workout plan "${plan.name}" is ready!`,
      [{ text: 'OK' }]
    );
  };

  const handleQuickActionPress = (action: string) => {
    switch (action) {
      case 'start_run':
        handleWorkoutPress('running');
        break;
      case 'hiit_session':
        handleWorkoutPress('hiit-bodyweight');
        break;
      case 'zone2':
        handleWorkoutPress('cycling');
        break;
      case 'recovery':
        handleWorkoutPress('yoga-flow');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };



  const handleHistoryPress = (session: WorkoutSession) => {
    Alert.alert(
      session.workoutName,
      `Completed on ${session.startTime.toLocaleDateString()}\nDuration: ${session.duration} minutes\nCalories burned: ${session.caloriesBurned}${session.notes ? `\n\nNotes: ${session.notes}` : ''}`,
      [{ text: 'OK' }]
    );
  };



  const renderCardioScoreCard = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.cardioScoreCard}>
        <View style={styles.cardioScoreContent}>
          <View style={styles.cardioScoreLeft}>
            <ThemedText style={styles.scoreTitle}>Cardio Readiness</ThemedText>
            <ThemedText style={styles.scoreValue}>92</ThemedText>
            <ThemedText style={styles.scoreDescription}>
              Excellent! Your heart rate variability is optimal for cardio.
            </ThemedText>
          </View>
          
          <View style={styles.cardioScoreRight}>
            <ProgressRing
              size={100}
              strokeWidth={8}
              progress={0.92}
              color="#4F46E5"
              backgroundColor="#EEF2FF"
              value="92"
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
        <ThemedText style={styles.sectionTitle}>Today's Progress</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAllText}>Details</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.activityRingsContainer}>
        <ThreeRingProgress
          size={120}
          strokeWidth={8}
          rings={[
            {
              title: 'Calories',
              value: 420,
              total: 600,
              unit: 'cal',
              color: '#FF6B35',
              percentage: 70,
            },
            {
              title: 'Duration',
              value: 62,
              total: 100,
              unit: '%',
              color: '#4F46E5',
              percentage: 62,
            },
          ]}
        />
      </View>
    </View>
  );

  const renderMetricsGrid = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Cardio Metrics</ThemedText>
      
      <View style={styles.metricsGrid}>
        <MetricCard
          title="VO2 Max"
          value="48.2"
          unit="ml/kg/min"
          icon="heart.fill"
          iconColor="#EF4444"
          trend="up"
          trendValue="+2.1"
          backgroundColor="#FFFFFF"
          gradient={['#FEF2F2', '#FFFFFF']}
        />
        
        <MetricCard
          title="Recovery"
          value="85"
          unit="%"
          icon="moon.fill"
          iconColor="#8B5CF6"
          trend="stable"
          trendValue="Good"
          backgroundColor="#FFFFFF"
          gradient={['#F5F3FF', '#FFFFFF']}
        />
        
        <MetricCard
          title="Zone 2"
          value="18"
          unit="min"
          icon="chart.bar.fill"
          iconColor="#10B981"
          trend="up"
          trendValue="+5 min"
          backgroundColor="#FFFFFF"
          gradient={['#F0FDF4', '#FFFFFF']}
        />
        
        <MetricCard
          title="Peak HR"
          value="178"
          unit="bpm"
          icon="flame.fill"
          iconColor="#F97316"
          trend="down"
          trendValue="-3 bpm"
          backgroundColor="#FFFFFF"
          gradient={['#FFF7ED', '#FFFFFF']}
        />
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>Quick Start</ThemedText>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => handleQuickActionPress('start_run')}
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="figure.run" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Start Run</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Outdoor tracking</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => handleQuickActionPress('hiit_session')}
        >
          <LinearGradient
            colors={['#EF4444', '#F97316']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="flame.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>HIIT Session</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>20 min intense</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => handleQuickActionPress('zone2')}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="heart.fill" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Zone 2</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Steady cardio</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => handleQuickActionPress('recovery')}
        >
          <LinearGradient
            colors={['#8B5CF6', '#A855F7']}
            style={styles.quickActionContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="figure.walk" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.quickActionText}>Recovery</ThemedText>
            <ThemedText style={styles.quickActionSubtext}>Light activity</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
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
          <ThemedText style={styles.loadingText}>Loading your cardio data...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

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
        {renderCardioScoreCard()}
        {renderActivityRings()}

        {/* AI Insights */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>AI Insights</ThemedText>
            <View style={styles.aiTag}>
              <IconSymbol name="brain.head.profile" size={12} color="#4F46E5" />
              <ThemedText style={styles.aiTagText}>Bud</ThemedText>
            </View>
          </View>
          
          <HealthInsightCard
            title="Perfect Recovery Window"
            description="Your heart rate variability shows excellent recovery. This is an ideal time for a moderate intensity workout."
            icon="heart.fill"
            iconColor="#EF4444"
            type="positive"
            actionText="Start Workout"
            onPress={() => {
              console.log('Cardio insight pressed');
            }}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.sectionContainer}>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowWorkoutPlanning(true)}
            >
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>Create Plan</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowWorkoutAnalytics(true)}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconSymbol name="chart.bar.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>Analytics</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recommended Workouts</ThemedText>
            <TouchableOpacity onPress={() => setShowWorkoutPlanning(true)}>
              <IconSymbol name="chevron.right" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {recommendations.map((recommendation) => (
            <WorkoutCard
              key={recommendation.id}
              workout={recommendation.workoutPlan}
              recommendation={recommendation}
              onPress={() => handleWorkoutPress(recommendation.workoutPlan.id)}
              showRecommendationReason={true}
            />
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Sessions</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAllText}>View All</ThemedText>
            </TouchableOpacity>
          </View>
          {workoutHistory.length > 0 ? (
            workoutHistory.map((session) => (
              <WorkoutHistoryCard
                key={session.id}
                session={session}
                onPress={() => handleHistoryPress(session)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#F8FAFC', '#FFFFFF']}
                style={styles.emptyStateContent}
              >
                <View style={styles.emptyStateIcon}>
                  <IconSymbol name="heart.fill" size={32} color="#9CA3AF" />
                </View>
                <ThemedText style={styles.emptyStateTitle}>No workouts yet</ThemedText>
                <ThemedText style={styles.emptyStateText}>
                  Start your first cardio session today!
                </ThemedText>
              </LinearGradient>
            </View>
          )}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Workout Tracking Modal */}
      {showWorkoutTracking && activeWorkoutId && (
        <Modal
          visible={showWorkoutTracking}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <WorkoutTrackingScreen
            workoutId={activeWorkoutId}
            onComplete={handleWorkoutComplete}
            onCancel={handleWorkoutCancel}
          />
        </Modal>
      )}

      {/* Workout Planning Modal */}
      {showWorkoutPlanning && (
        <Modal
          visible={showWorkoutPlanning}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <WorkoutPlanningScreen
            onPlanCreated={handlePlanCreated}
            onCancel={() => setShowWorkoutPlanning(false)}
          />
        </Modal>
      )}

      {/* Workout Analytics Modal */}
      {showWorkoutAnalytics && (
        <Modal
          visible={showWorkoutAnalytics}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <WorkoutAnalyticsScreen
            onClose={() => setShowWorkoutAnalytics(false)}
          />
        </Modal>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  cardioScoreCard: {
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
  cardioScoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardioScoreLeft: {
    flex: 1,
    marginRight: 20,
  },
  cardioScoreRight: {
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
    color: '#4F46E5',
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
    color: '#4F46E5',
    fontWeight: '600',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  aiTagText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  activityRingsContainer: {
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
  emptyState: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateContent: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 20,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 100,
  },
});