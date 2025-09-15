import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ProgressRing } from './ProgressRing';

const { width } = Dimensions.get('window');

interface RingData {
  title: string;
  value: number;
  total: number;
  unit: string;
  color: string;
  percentage: number;
}

interface ThreeRingProgressProps {
  rings: RingData[];
  size?: number;
  strokeWidth?: number;
}

export function ThreeRingProgress({
  rings,
  size = 80,
  strokeWidth = 8,
}: ThreeRingProgressProps) {
  // Safety check to prevent map error
  if (!rings || !Array.isArray(rings)) {
    return null;
  }

  // Calculate responsive spacing based on screen width and number of rings
  const containerPadding = 20;
  const availableWidth = width - (containerPadding * 2);
  const ringSpacing = rings.length === 2 ? availableWidth * 0.15 : availableWidth * 0.05;

  return (
    <View style={[styles.ringsContainer, { gap: ringSpacing }]}>
      {rings.map((ring, index) => (
        <View key={index} style={[styles.ringItem, { flex: 1 }]}>
          <ProgressRing
            size={size}
            strokeWidth={strokeWidth}
            progress={ring.percentage / 100}
            color={ring.color}
          >
            <View style={styles.ringContent}>
              <ThemedText style={[styles.ringTitle, { color: ring.color }]}>
                {ring.title}
              </ThemedText>
              <ThemedText style={[styles.ringValue, { color: ring.color }]}>
                {ring.value}
              </ThemedText>
              <ThemedText style={[styles.ringUnit, { color: ring.color }]}>
                {ring.unit}
              </ThemedText>
            </View>
          </ProgressRing>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  ringItem: {
    alignItems: 'center',
    minWidth: 0, // Allow flex shrinking
  },
  ringTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  ringContent: {
    alignItems: 'center',
  },
  ringValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  ringUnit: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 1,
  },
});