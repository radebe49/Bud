import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { HealthInsight } from '../types/healthTypes';

type IconName = 
  | 'brain.head.profile'
  | 'flame.fill'
  | 'cross.fill'
  | 'trophy.fill'
  | 'arrow.up'
  | 'arrow.down'
  | 'heart.fill'
  | 'moon.fill'
  | 'bolt.fill'
  | 'checkmark.circle.fill'
  | 'exclamationmark.triangle.fill'
  | 'info.circle.fill'
  | 'bell.fill';

interface HealthInsightCardProps {
  insight?: HealthInsight;
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  type?: 'positive' | 'warning' | 'info' | 'reminder';
  onPress?: () => void;
  actionText?: string;
}

export function HealthInsightCard({ 
  insight, 
  title, 
  description, 
  icon, 
  iconColor, 
  type, 
  onPress,
  actionText 
}: HealthInsightCardProps) {
  // Use props or insight data
  const cardTitle = title || insight?.title || '';
  const cardDescription = description || insight?.description || '';
  const cardIcon = icon || getInsightIcon();
  const cardIconColor = iconColor || getInsightColor();
  const cardType = type || getInsightType();

  function getInsightIcon(): IconName {
    if (!insight) return 'brain.head.profile';
    
    switch (insight.type) {
      case 'trend_improvement':
        return 'arrow.up';
      case 'trend_decline':
        return 'arrow.down';
      case 'recommendation':
        return 'flame.fill';
      case 'warning':
        return 'cross.fill';
      case 'celebration':
        return 'trophy.fill';
      default:
        return 'brain.head.profile';
    }
  }

  function getInsightColor() {
    if (!insight) return '#007AFF';
    
    switch (insight.priority) {
      case 'critical':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'medium':
        return '#007AFF';
      case 'low':
        return '#00C851';
      default:
        return '#8E8E93';
    }
  }

  function getInsightType(): 'positive' | 'warning' | 'info' | 'reminder' {
    if (!insight) return 'info';
    
    switch (insight.type) {
      case 'trend_improvement':
      case 'celebration':
        return 'positive';
      case 'trend_decline':
      case 'warning':
        return 'warning';
      case 'recommendation':
        return 'reminder';
      default:
        return 'info';
    }
  }

  const getGradientColors = () => {
    switch (cardType) {
      case 'positive':
        return ['#F0FDF4', '#FFFFFF'];
      case 'warning':
        return ['#FFFBEB', '#FFFFFF'];
      case 'info':
        return ['#EFF6FF', '#FFFFFF'];
      case 'reminder':
        return ['#F5F3FF', '#FFFFFF'];
      default:
        return ['#F9FAFB', '#FFFFFF'];
    }
  };

  const getBorderColor = () => {
    switch (cardType) {
      case 'positive':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      case 'reminder':
        return '#8B5CF6';
      default:
        return '#E5E7EB';
    }
  };

  const getTypeIcon = () => {
    switch (cardType) {
      case 'positive':
        return 'checkmark.circle.fill';
      case 'warning':
        return 'exclamationmark.triangle.fill';
      case 'info':
        return 'info.circle.fill';
      case 'reminder':
        return 'bell.fill';
      default:
        return 'info.circle.fill';
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={[styles.gradient, { borderLeftColor: getBorderColor() }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.iconSection}>
            <LinearGradient
              colors={[cardIconColor + '20', cardIconColor + '10']}
              style={styles.iconContainer}
            >
              <IconSymbol name={cardIcon as any} size={24} color={cardIconColor} />
            </LinearGradient>
            <View style={styles.typeIndicator}>
              <IconSymbol 
                name={getTypeIcon() as any} 
                size={12} 
                color={getBorderColor()} 
              />
            </View>
          </View>
          
          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>{cardTitle}</ThemedText>
            <ThemedText style={styles.description}>{cardDescription}</ThemedText>
            
            {actionText && (
              <View style={styles.actionContainer}>
                <ThemedText style={[styles.actionText, { color: getBorderColor() }]}>
                  {actionText}
                </ThemedText>
                <IconSymbol 
                  name="arrow.right" 
                  size={12} 
                  color={getBorderColor()} 
                />
              </View>
            )}
          </View>
          
          {onPress && (
            <View style={styles.chevronContainer}>
              <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
            </View>
          )}
        </View>

        {insight?.recommendations && insight.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            {insight.recommendations.slice(0, 2).map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={[styles.bullet, { backgroundColor: getBorderColor() }]} />
                <ThemedText style={styles.recommendationText}>
                  {recommendation}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  gradient: {
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconSection: {
    position: 'relative',
    marginRight: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  recommendationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
});