import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '../../../../components/ThemedText';
import { ThemedView } from '../../../../components/ThemedView';
import { IconSymbol } from '../../../../components/ui/IconSymbol';

const { width: screenWidth } = Dimensions.get('window');

interface TrendDataPoint {
  day: string;
  value: number;
  label?: string;
}

interface TrendChartProps {
  title: string;
  data: TrendDataPoint[];
  color: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  maxValue?: number;
  minValue?: number;
}

export function TrendChart({
  title,
  data,
  color,
  unit,
  trend,
  trendValue,
  maxValue,
  minValue,
}: TrendChartProps) {
  const chartWidth = (screenWidth - 48) / 2 - 16; // Fit 2x2 grid with padding
  const chartHeight = 80;
  const padding = 12;
  
  // Calculate min/max values if not provided
  const values = data.map(d => d.value);
  const dataMin = minValue ?? Math.min(...values);
  const dataMax = maxValue ?? Math.max(...values);
  const range = dataMax - dataMin || 1; // Avoid division by zero

  // Generate path for the trend line
  const generatePath = () => {
    if (data.length === 0) return '';
    
    const points = data.map((point, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
      const y = chartHeight - padding - ((point.value - dataMin) / range) * (chartHeight - 2 * padding);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return points.join(' ');
  };

  // Generate area path for gradient fill
  const generateAreaPath = () => {
    if (data.length === 0) return '';
    
    const linePath = generatePath();
    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];
    
    const firstX = padding;
    const lastX = padding + ((data.length - 1) * (chartWidth - 2 * padding)) / (data.length - 1);
    const bottomY = chartHeight - padding;
    
    return `${linePath} L ${lastX} ${bottomY} L ${firstPoint} ${bottomY} Z`;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'arrow.up';
      case 'down':
        return 'arrow.down';
      default:
        return 'minus';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#34C759';
      case 'down':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {trend && trendValue && (
            <View style={styles.trendContainer}>
              <IconSymbol 
                name={getTrendIcon()} 
                size={12} 
                color={getTrendColor()} 
              />
              <ThemedText style={[styles.trendText, { color: getTrendColor() }]}>
                {trendValue}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={styles.currentValue}>
          {data[data.length - 1]?.value || 0}
          {unit && <ThemedText style={styles.unit}> {unit}</ThemedText>}
        </ThemedText>
      </View>

      <View style={styles.chartContainer}>
        {/* Simple line chart using View components */}
        <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
          {/* Grid lines */}
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[
                  styles.gridLine,
                  {
                    top: (i * (chartHeight - 2 * padding)) / 4 + padding,
                    width: chartWidth - 2 * padding,
                    left: padding,
                  }
                ]}
              />
            ))}
          </View>

          {/* Data points */}
          {data.map((point, index) => {
            const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
            const y = chartHeight - padding - ((point.value - dataMin) / range) * (chartHeight - 2 * padding);
            
            return (
              <View
                key={index}
                style={[
                  styles.dataPoint,
                  {
                    left: x - 3,
                    top: y - 3,
                    backgroundColor: color,
                  }
                ]}
              />
            );
          })}

          {/* Connect lines between points */}
          {data.slice(1).map((point, index) => {
            const prevPoint = data[index];
            const x1 = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
            const y1 = chartHeight - padding - ((prevPoint.value - dataMin) / range) * (chartHeight - 2 * padding);
            const x2 = padding + ((index + 1) * (chartWidth - 2 * padding)) / (data.length - 1);
            const y2 = chartHeight - padding - ((point.value - dataMin) / range) * (chartHeight - 2 * padding);
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            return (
              <View
                key={index}
                style={[
                  styles.connectLine,
                  {
                    left: x1,
                    top: y1,
                    width: length,
                    backgroundColor: color,
                    transform: [{ rotate: `${angle}deg` }],
                  }
                ]}
              />
            );
          })}
        </View>

        {/* X-axis labels */}
        <View style={styles.xAxisContainer}>
          {data.map((point, index) => (
            <ThemedText key={index} style={styles.xAxisLabel}>
              {point.day}
            </ThemedText>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currentValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.7,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#E5E5EA',
    opacity: 0.5,
  },
  dataPoint: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  connectLine: {
    position: 'absolute',
    height: 1.5,
    transformOrigin: '0 50%',
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  xAxisLabel: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
});