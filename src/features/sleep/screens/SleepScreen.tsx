/**
 * Sleep Screen
 * Main screen for sleep coaching and analysis
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { SleepCoachingCard } from '../components/SleepCoachingCard';
import { SleepInsightsCard } from '../components/SleepInsightsCard';
import { WindDownRoutine } from '../components/WindDownRoutine';
import { SleepCoachingService } from '../services/sleepCoachingService';
import { 
  SleepData, 
  SleepGoals, 
  SleepCoaching, 
  SleepAnalysis,
  SleepInsight,
  RoutineStep
} from '../types/sleepTypes';

// Mock data for demonstration
const mockSleepGoals: SleepGoals = {
  targetBedtime: '22:30',
  targetWakeTime: '06:30',
  targetSleepDuration: 8,
  targetSleepEfficiency: 85,
  targetConsistency: 80,
  windDownDuration: 60,
  sleepQualityTarget: 8
};

const mockSleepData: SleepData[] = [
  {
    id: '1',
    userId: 'user1',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    bedtime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 22.5 * 60 * 60 * 1000),
    sleepTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000),
    wakeTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 6.5 * 60 * 60 * 1000),
    getUpTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
    totalTimeInBed: 510, // 8.5 hours
    totalSleepTime: 450, // 7.5 hours
    sleepEfficiency: 88,
    sleepStages: [
      {
        stage: 'light',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000),
        duration: 120
      },
      {
        stage: 'deep',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 60 * 1000),
        duration: 90
      },
      {
        stage: 'rem',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 26.5 * 60 * 60 * 1000),
        duration: 120
      }
    ],
    sleepQuality: 7,
    sleepScore: 78,
    disturbances: [],
    environment: {
      temperature: 20,
      humidity: 45,
      noiseLevel: 35,
      lightLevel: 5,
      roomDarkness: 8
    }
  }
];

export const SleepScreen: React.FC = () => {
  const [coaching, setCoaching] = useState<SleepCoaching | null>(null);
  const [insights, setInsights] = useState<SleepInsight[]>([]);
  const [showWindDown, setShowWindDown] = useState(false);
  const [activeTab, setActiveTab] = useState<'coaching' | 'insights'>('coaching');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSleepCoaching();
  }, []);

  const loadSleepCoaching = async () => {
    try {
      setLoading(true);
      
      // Get sleep coaching
      const coachingData = await SleepCoachingService.getSleepCoaching(
        'user1',
        mockSleepData,
        mockSleepGoals
      );
      
      // Get today's insights
      const todaysInsights = SleepCoachingService.generateTodaysSleepInsights(
        mockSleepData,
        mockSleepGoals
      );

      setCoaching(coachingData);
      setInsights(todaysInsights);
    } catch (error) {
      console.error('Error loading sleep coaching:', error);
      Alert.alert('Error', 'Failed to load sleep coaching data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWindDown = () => {
    setShowWindDown(true);
  };

  const handleWindDownStepComplete = (stepId: string, completed: boolean) => {
    console.log(`Step ${stepId} ${completed ? 'completed' : 'uncompleted'}`);
    // Here you would typically save the completion status
  };

  const handleWindDownComplete = (completionRate: number) => {
    console.log(`Wind-down routine ${completionRate}% complete`);
    
    if (completionRate === 100) {
      // Show completion celebration or navigate to sleep tracking
      Alert.alert(
        'Great Job!',
        'Your wind-down routine is complete. Sweet dreams! 🌙',
        [{ text: 'OK', onPress: () => setShowWindDown(false) }]
      );
    }
  };

  const handleInsightTap = (insight: SleepInsight) => {
    Alert.alert(
      'Sleep Insight',
      `${insight.message}\n\nRecommendation: ${insight.recommendation}`,
      [{ text: 'Got it' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading sleep coaching...</Text>
      </View>
    );
  }

  if (!coaching) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load sleep coaching</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSleepCoaching}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sleep Coaching</Text>
        <Text style={styles.headerSubtitle}>
          Personalized guidance for better rest
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'coaching' && styles.activeTab
          ]}
          onPress={() => setActiveTab('coaching')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'coaching' && styles.activeTabText
          ]}>
            Coaching
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'insights' && styles.activeTab
          ]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'insights' && styles.activeTabText
          ]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'coaching' ? (
          <SleepCoachingCard
            coaching={coaching}
            onViewDetails={() => setActiveTab('insights')}
            onStartWindDown={handleStartWindDown}
          />
        ) : (
          <SleepInsightsCard
            analysis={coaching.sleepQualityAnalysis}
            insights={insights}
            onInsightTap={handleInsightTap}
          />
        )}
      </ScrollView>

      {/* Wind-Down Routine Modal */}
      <Modal
        visible={showWindDown}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowWindDown(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <WindDownRoutine
            routineSteps={coaching.windDownRoutine}
            bedtime={coaching.bedtimeRecommendation}
            onStepComplete={handleWindDownStepComplete}
            onRoutineComplete={handleWindDownComplete}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
});