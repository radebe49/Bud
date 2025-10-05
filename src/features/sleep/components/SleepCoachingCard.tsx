/**
 * Sleep Coaching Card Component
 * Displays sleep coaching recommendations and insights
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SleepCoaching, SleepInsight } from '../types/sleepTypes';

interface SleepCoachingCardProps {
  coaching: SleepCoaching;
  onViewDetails?: () => void;
  onStartWindDown?: () => void;
}

export const SleepCoachingCard: React.FC<SleepCoachingCardProps> = ({
  coaching,
  onViewDetails,
  onStartWindDown
}) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTopInsight = (): SleepInsight | null => {
    if (coaching.personalizedInsights.length === 0) return null;
    
    // Find highest priority insight
    const highPriority = coaching.personalizedInsights.find(insight => insight.priority === 'high');
    return highPriority || coaching.personalizedInsights[0];
  };

  const topInsight = getTopInsight();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sleep Coaching</Text>
        <Text style={styles.subtitle}>Personalized for you</Text>
      </View>

      <View style={styles.recommendations}>
        <View style={styles.timeRecommendation}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Bedtime</Text>
            <Text style={styles.timeValue}>
              {formatTime(coaching.bedtimeRecommendation)}
            </Text>
          </View>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Wake Time</Text>
            <Text style={styles.timeValue}>
              {formatTime(coaching.wakeTimeRecommendation)}
            </Text>
          </View>
        </View>

        {topInsight && (
          <View style={styles.insightContainer}>
            <View style={[
              styles.priorityIndicator, 
              { backgroundColor: getPriorityColor(topInsight.priority) }
            ]} />
            <View style={styles.insightContent}>
              <Text style={styles.insightMessage}>{topInsight.message}</Text>
              <Text style={styles.insightRecommendation}>
                {topInsight.recommendation}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {onStartWindDown && (
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={onStartWindDown}
          >
            <Text style={styles.primaryButtonText}>Start Wind-Down</Text>
          </TouchableOpacity>
        )}
        
        {onViewDetails && (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={onViewDetails}
          >
            <Text style={styles.secondaryButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {coaching.sleepDurationTarget}h
          </Text>
          <Text style={styles.statLabel}>Target</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {coaching.sleepQualityAnalysis.averageSleepScore}
          </Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {coaching.sleepQualityAnalysis.consistencyScore}%
          </Text>
          <Text style={styles.statLabel}>Consistency</Text>
        </View>
      </View>
    </View>
  );
};

const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high': return '#FF6B6B';
    case 'medium': return '#FFD93D';
    case 'low': return '#6BCF7F';
    default: return '#6BCF7F';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  recommendations: {
    marginBottom: 20,
  },
  timeRecommendation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  insightContent: {
    flex: 1,
    marginLeft: 16,
  },
  insightMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  insightRecommendation: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});