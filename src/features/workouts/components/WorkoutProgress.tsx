import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ProgressRing } from '@/shared/components/ProgressRing';
import { WorkoutStreak as WorkoutStreakType } from '../types/workoutTypes';

interface WorkoutProgressProps {
  streak: WorkoutStreakType;
}

export function WorkoutProgress({ streak }: WorkoutProgressProps) {
  const weeklyProgress = streak.weeklyCompleted / streak.weeklyGoal;
  const progressPercentage = Math.round(weeklyProgress * 100);
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.progressSection}>
        <ProgressRing
          size={140}
          strokeWidth={12}
          progress={weeklyProgress}
          color="#007AFF"
          value={`${progressPercentage}%`}
          label=""
        />
        <View style={styles.centerContent}>
          <ThemedText style={styles.progressText}>
            {streak.weeklyCompleted} of {streak.weeklyGoal}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.labelText}>Weekly Cardio</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  progressSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 85, // Position below the percentage
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
});