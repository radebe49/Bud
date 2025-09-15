import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ProgressRing } from '@/shared/components/ProgressRing';

interface HealthScoreCardProps {
  title: string;
  score: number; // 0-100
  description: string;
  color: string;
  size?: number;
}

export function HealthScoreCard({
  title,
  score,
  description,
  color,
  size = 80,
}: HealthScoreCardProps) {
  const getScoreLabel = (score: number): string => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#34C759';
    if (score >= 70) return '#30D158';
    if (score >= 55) return '#FF9500';
    if (score >= 40) return '#FF6B35';
    return '#FF3B30';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </View>

      <View style={styles.scoreContainer}>
        <ProgressRing
          size={size}
          strokeWidth={8}
          progress={score / 100}
          color={getScoreColor(score)}
          value={score.toString()}
          label={getScoreLabel(score)}
        />
        
        <View style={styles.scoreDetails}>
          <ThemedText style={styles.scoreValue}>{score}</ThemedText>
          <ThemedText style={styles.scoreLabel}>Health Score</ThemedText>
          <ThemedText style={[styles.scoreStatus, { color: getScoreColor(score) }]}>
            {getScoreLabel(score)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownDot, { backgroundColor: '#34C759' }]} />
          <ThemedText style={styles.breakdownText}>Sleep Quality</ThemedText>
          <ThemedText style={styles.breakdownValue}>85%</ThemedText>
        </View>
        
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownDot, { backgroundColor: '#007AFF' }]} />
          <ThemedText style={styles.breakdownText}>Activity Level</ThemedText>
          <ThemedText style={styles.breakdownValue}>72%</ThemedText>
        </View>
        
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownDot, { backgroundColor: '#FF9500' }]} />
          <ThemedText style={styles.breakdownText}>Recovery</ThemedText>
          <ThemedText style={styles.breakdownValue}>68%</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreDetails: {
    flex: 1,
    marginLeft: 20,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  scoreStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  breakdown: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});