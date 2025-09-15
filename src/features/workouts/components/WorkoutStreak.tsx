import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { WorkoutStreak as WorkoutStreakType } from '../types/workoutTypes';

interface WorkoutStreakProps {
  streak: WorkoutStreakType;
}

export function WorkoutStreak({ streak }: WorkoutStreakProps) {
  const weeklyProgress = (streak.weeklyCompleted / streak.weeklyGoal) * 100;
  const isOnStreak = streak.currentStreak > 0;
  
  const getStreakMessage = () => {
    if (streak.currentStreak === 0) {
      return "Start your streak today!";
    } else if (streak.currentStreak === 1) {
      return "Great start! Keep it going!";
    } else if (streak.currentStreak < 7) {
      return "You're on fire! 🔥";
    } else {
      return "Incredible streak! 🏆";
    }
  };

  const getDaysUntilGoal = () => {
    const remaining = streak.weeklyGoal - streak.weeklyCompleted;
    if (remaining <= 0) return "Goal achieved! 🎉";
    if (remaining === 1) return "1 more workout to reach your weekly goal";
    return `${remaining} more workouts to reach your weekly goal`;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <IconSymbol 
            name="flame.fill"
            size={20} 
            color={isOnStreak ? "#FF9500" : "#8E8E93"} 
          />
          <ThemedText style={styles.title}>Workout Streak</ThemedText>
        </View>
      </View>

      <View style={styles.streakSection}>
        <View style={styles.currentStreak}>
          <ThemedText style={[
            styles.streakNumber,
            isOnStreak ? styles.activeStreak : styles.inactiveStreak
          ]}>
            {streak.currentStreak}
          </ThemedText>
          <ThemedText style={styles.streakLabel}>
            {streak.currentStreak === 1 ? 'Day' : 'Days'}
          </ThemedText>
        </View>
        
        <View style={styles.streakInfo}>
          <ThemedText style={styles.streakMessage}>
            {getStreakMessage()}
          </ThemedText>
          <View style={styles.recordContainer}>
            <IconSymbol name="trophy.fill" size={14} color="#FFD700" />
            <ThemedText style={styles.recordText}>
              Best: {streak.longestStreak} days
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.weeklySection}>
        <View style={styles.weeklyHeader}>
          <ThemedText style={styles.weeklyTitle}>This Week</ThemedText>
          <ThemedText style={styles.weeklyCount}>
            {streak.weeklyCompleted}/{streak.weeklyGoal}
          </ThemedText>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${Math.min(weeklyProgress, 100)}%` }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressPercentage}>
            {Math.round(weeklyProgress)}%
          </ThemedText>
        </View>
        
        <ThemedText style={styles.goalMessage}>
          {getDaysUntilGoal()}
        </ThemedText>
      </View>

      {streak.lastWorkoutDate && (
        <View style={styles.lastWorkoutSection}>
          <ThemedText style={styles.lastWorkoutText}>
            Last workout: {streak.lastWorkoutDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentStreak: {
    alignItems: 'center',
    marginRight: 20,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
  },
  activeStreak: {
    color: '#FF9500',
  },
  inactiveStreak: {
    color: '#8E8E93',
  },
  streakLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streakInfo: {
    flex: 1,
  },
  streakMessage: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  recordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  weeklySection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weeklyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  weeklyCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
    minWidth: 35,
    textAlign: 'right',
  },
  goalMessage: {
    fontSize: 12,
    color: '#666',
  },
  lastWorkoutSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  lastWorkoutText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});