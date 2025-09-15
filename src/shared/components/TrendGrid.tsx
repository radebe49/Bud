import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TrendChart } from '../../features/health/components/TrendChart';

interface TrendDataPoint {
  day: string;
  value: number;
  label?: string;
}

interface TrendData {
  title: string;
  data: TrendDataPoint[];
  color: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
}

interface TrendGridProps {
  trends: TrendData[];
}

export function TrendGrid({ trends }: TrendGridProps) {
  return (
    <View style={styles.grid}>
      {trends.map((trend, index) => (
        <View key={index} style={styles.gridItem}>
          <TrendChart
            title={trend.title}
            data={trend.data}
            color={trend.color}
            unit={trend.unit}
            trend={trend.trend}
            trendValue={trend.trendValue}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
    aspectRatio: 1.1,
  },
});