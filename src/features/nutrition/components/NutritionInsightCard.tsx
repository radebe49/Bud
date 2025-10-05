import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '../../../../components/ui/IconSymbol';
import type { NutritionInsight } from '../types/nutritionTypes';

interface NutritionInsightCardProps {
  insight: NutritionInsight;
  onPress?: () => void;
}

export function NutritionInsightCard({ insight, onPress }: NutritionInsightCardProps) {
  const getInsightIcon = (type: string): string => {
    const icons: Record<string, string> = {
      calorie_deficit: 'minus.circle.fill',
      calorie_surplus: 'plus.circle.fill',
      macro_balance: 'chart.pie.fill',
      hydration: 'drop.fill',
      meal_timing: 'clock.fill',
      nutrient_deficiency: 'exclamationmark.triangle.fill',
      food_quality: 'leaf.fill',
      eating_pattern: 'calendar.circle.fill',
      performance_correlation: 'bolt.fill',
    };
    return icons[type] || 'info.circle.fill';
  };

  const getInsightColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: '#34C759',
      medium: '#FF9500',
      high: '#FF3B30',
    };
    return colors[priority] || '#007AFF';
  };

  const getPriorityLabel = (priority: string): string => {
    const labels: Record<string, string> = {
      low: 'Good to know',
      medium: 'Consider this',
      high: 'Important',
    };
    return labels[priority] || 'Info';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { borderLeftColor: getInsightColor(insight.priority) }
      ]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconSymbol 
            name={getInsightIcon(insight.type)} 
            size={20} 
            color={getInsightColor(insight.priority)} 
          />
        </View>
        
        <View style={styles.headerText}>
          <Text style={styles.priorityLabel}>
            {getPriorityLabel(insight.priority)}
          </Text>
          <Text style={styles.timestamp}>
            {insight.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {insight.actionable && (
          <View style={styles.actionableBadge}>
            <IconSymbol name="hand.tap.fill" size={12} color="#007AFF" />
          </View>
        )}
      </View>

      <Text style={styles.message}>{insight.message}</Text>
      
      {insight.recommendation && (
        <View style={styles.recommendationContainer}>
          <IconSymbol name="lightbulb.fill" size={14} color="#FF9500" />
          <Text style={styles.recommendation}>{insight.recommendation}</Text>
        </View>
      )}

      {insight.relatedMetrics && insight.relatedMetrics.length > 0 && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsLabel}>Related to:</Text>
          <Text style={styles.metricsText}>
            {insight.relatedMetrics.join(', ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  actionableBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
    marginBottom: 12,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metricsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginRight: 6,
  },
  metricsText: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
});