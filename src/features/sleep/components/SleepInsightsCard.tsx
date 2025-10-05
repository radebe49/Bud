/**
 * Sleep Insights Card Component
 * Displays sleep analysis insights and patterns
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SleepAnalysis, SleepTrend, SleepPattern, SleepInsight } from '../types/sleepTypes';

interface SleepInsightsCardProps {
  analysis: SleepAnalysis;
  insights: SleepInsight[];
  onInsightTap?: (insight: SleepInsight) => void;
}

export const SleepInsightsCard: React.FC<SleepInsightsCardProps> = ({
  analysis,
  insights,
  onInsightTap
}) => {
  const getTrendIcon = (direction: 'improving' | 'declining' | 'stable'): string => {
    switch (direction) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getTrendColor = (direction: 'improving' | 'declining' | 'stable'): string => {
    switch (direction) {
      case 'improving': return '#6BCF7F';
      case 'declining': return '#FF6B6B';
      case 'stable': return '#FFD93D';
    }
  };

  const getPatternIcon = (type: string): string => {
    switch (type) {
      case 'consistent_bedtime': return '🕘';
      case 'weekend_shift': return '📅';
      case 'exercise_correlation': return '🏃‍♂️';
      case 'stress_related': return '😰';
      case 'caffeine_impact': return '☕';
      case 'screen_time_impact': return '📱';
      default: return '💤';
    }
  };

  const formatMetricName = (metric: string): string => {
    return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#6BCF7F';
    if (score >= 60) return '#FFD93D';
    return '#FF6B6B';
  };

  const priorityInsights = insights
    .filter(insight => insight.priority === 'high')
    .slice(0, 2);

  const topTrends = analysis.trends
    .filter(trend => trend.significance === 'high')
    .slice(0, 3);

  const significantPatterns = analysis.patterns
    .filter(pattern => pattern.frequency > 0.7)
    .slice(0, 2);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Sleep Score Overview */}
      <View style={styles.scoreSection}>
        <Text style={styles.sectionTitle}>Sleep Overview</Text>
        <View style={styles.scoreGrid}>
          <View style={styles.scoreItem}>
            <Text style={[
              styles.scoreValue,
              { color: getScoreColor(analysis.averageSleepScore) }
            ]}>
              {analysis.averageSleepScore}
            </Text>
            <Text style={styles.scoreLabel}>Sleep Score</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreValue}>
              {analysis.averageSleepDuration}h
            </Text>
            <Text style={styles.scoreLabel}>Avg Duration</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={[
              styles.scoreValue,
              { color: getScoreColor(analysis.averageSleepEfficiency) }
            ]}>
              {analysis.averageSleepEfficiency}%
            </Text>
            <Text style={styles.scoreLabel}>Efficiency</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={[
              styles.scoreValue,
              { color: getScoreColor(analysis.consistencyScore) }
            ]}>
              {analysis.consistencyScore}%
            </Text>
            <Text style={styles.scoreLabel}>Consistency</Text>
          </View>
        </View>
        
        {analysis.sleepDebt > 0 && (
          <View style={styles.debtWarning}>
            <Text style={styles.debtText}>
              ⚠️ Sleep Debt: {analysis.sleepDebt} hours
            </Text>
          </View>
        )}
      </View>

      {/* Priority Insights */}
      {priorityInsights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {priorityInsights.map((insight) => (
            <TouchableOpacity
              key={insight.id}
              style={styles.insightItem}
              onPress={() => onInsightTap?.(insight)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.priorityIndicator,
                { backgroundColor: getPriorityColor(insight.priority) }
              ]} />
              <View style={styles.insightContent}>
                <Text style={styles.insightMessage}>
                  {insight.message}
                </Text>
                <Text style={styles.insightRecommendation}>
                  💡 {insight.recommendation}
                </Text>
                <View style={styles.insightMeta}>
                  <Text style={styles.insightType}>
                    {formatMetricName(insight.type)}
                  </Text>
                  <Text style={styles.evidenceStrength}>
                    {Math.round(insight.evidenceStrength * 100)}% confidence
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Trends */}
      {topTrends.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Trends</Text>
          {topTrends.map((trend, index) => (
            <View key={index} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendIcon}>
                  {getTrendIcon(trend.direction)}
                </Text>
                <View style={styles.trendInfo}>
                  <Text style={styles.trendMetric}>
                    {formatMetricName(trend.metric)}
                  </Text>
                  <Text style={[
                    styles.trendDirection,
                    { color: getTrendColor(trend.direction) }
                  ]}>
                    {trend.direction} by {Math.abs(trend.changePercentage)}%
                  </Text>
                </View>
                <View style={[
                  styles.significanceBadge,
                  { backgroundColor: trend.significance === 'high' ? '#FF6B6B' : '#FFD93D' }
                ]}>
                  <Text style={styles.significanceText}>
                    {trend.significance}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Patterns */}
      {significantPatterns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Patterns</Text>
          {significantPatterns.map((pattern, index) => (
            <View key={index} style={styles.patternItem}>
              <View style={styles.patternHeader}>
                <Text style={styles.patternIcon}>
                  {getPatternIcon(pattern.type)}
                </Text>
                <View style={styles.patternInfo}>
                  <Text style={styles.patternDescription}>
                    {pattern.description}
                  </Text>
                  <Text style={[
                    styles.patternImpact,
                    { color: pattern.impact === 'positive' ? '#6BCF7F' : '#FF6B6B' }
                  ]}>
                    {pattern.impact === 'positive' ? '✓' : '⚠️'} {pattern.impact} impact
                  </Text>
                </View>
                <Text style={styles.patternFrequency}>
                  {Math.round(pattern.frequency * 100)}%
                </Text>
              </View>
              {pattern.recommendations.length > 0 && (
                <View style={styles.patternRecommendations}>
                  {pattern.recommendations.map((rec, recIndex) => (
                    <Text key={recIndex} style={styles.patternRecommendation}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* General Recommendations */}
      {analysis.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationsList}>
            {analysis.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  💡 {recommendation}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
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
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scoreSection: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scoreItem: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  debtWarning: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  debtText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  insightItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  priorityIndicator: {
    width: 4,
    borderRadius: 2,
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
    marginBottom: 8,
  },
  insightRecommendation: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 8,
  },
  insightMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightType: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  evidenceStrength: {
    fontSize: 12,
    color: '#666666',
  },
  trendItem: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendIcon: {
    fontSize: 20,
  },
  trendInfo: {
    flex: 1,
  },
  trendMetric: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  trendDirection: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  significanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  significanceText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  patternItem: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  patternIcon: {
    fontSize: 20,
  },
  patternInfo: {
    flex: 1,
  },
  patternDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  patternImpact: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  patternFrequency: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  patternRecommendations: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  patternRecommendation: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    marginBottom: 4,
  },
  recommendationsList: {
    gap: 8,
  },
  recommendationItem: {
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  recommendationText: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
  },
});