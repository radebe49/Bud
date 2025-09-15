import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProgressRing } from './ProgressRing';

interface QuickStat {
  id: string;
  title: string;
  value: string;
  unit?: string;
  icon: string;
  iconColor: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

interface MetricsCrossCardProps {
  readinessScore: number;
  readinessTitle: string;
  readinessDescription: string;
  stats: QuickStat[];
  onPress?: () => void;
}

export const MetricsCrossCard: React.FC<MetricsCrossCardProps> = ({
  readinessScore,
  readinessTitle,
  readinessDescription,
  stats,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.content}>
        {/* Left side - Readiness Score */}
        <ThemedView style={styles.readinessSection}>
          <ProgressRing
            size={100}
            strokeWidth={6}
            progress={readinessScore / 100}
            color="#34C759"
            value={`${readinessScore}`}
            label="Readiness"
          />
          {(readinessTitle || readinessDescription) && (
            <ThemedView style={styles.readinessInfo}>
              {readinessTitle && (
                <ThemedText style={styles.readinessTitle}>{readinessTitle}</ThemedText>
              )}
              {readinessDescription && (
                <ThemedText style={styles.readinessDescription} numberOfLines={2}>
                  {readinessDescription}
                </ThemedText>
              )}
            </ThemedView>
          )}
        </ThemedView>

        {/* Right side - Stats Grid */}
        <ThemedView style={styles.statsSection}>
          {stats.map((stat) => (
            <ThemedView key={stat.id} style={styles.statItem}>
              <ThemedView style={styles.statHeader}>
                <IconSymbol 
                  name={stat.icon as any} 
                  size={16} 
                  color={stat.iconColor} 
                />
                <ThemedText style={styles.statTitle}>{stat.title}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statValue}>
                <ThemedText style={styles.statNumber}>
                  {stat.value}
                  {stat.unit && <ThemedText style={styles.statUnit}> {stat.unit}</ThemedText>}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 24,
  },
  content: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  readinessSection: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 20,
  },
  readinessInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  readinessTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  readinessDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsSection: {
    flex: 1,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  statValue: {
    alignItems: 'flex-end',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.7,
  },
});