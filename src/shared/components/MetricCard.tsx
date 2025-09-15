import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ANIMATION_DURATIONS, 
  SPRING_CONFIGS, 
  EASING_CURVES,
  createPressAnimation,
  createFadeInAnimation,
  isLargeScreen,
  getScaleForScreen,
  getSpacingForScreen
} from '../utils/animations';

type IconName = 
  | 'house.fill'
  | 'heart.fill'
  | 'moon.fill'
  | 'fork.knife'
  | 'drop.fill'
  | 'figure.walk'
  | 'flame.fill'
  | 'chart.bar.fill'
  | 'arrow.up'
  | 'arrow.down'
  | 'minus';

// Temporarily disabled animations

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: IconName;
  iconColor: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  onPress?: () => void;
  backgroundColor?: string;
  gradient?: string[];
  size?: 'small' | 'medium' | 'large';
  animationDelay?: number;
  showPulse?: boolean;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  iconColor,
  trend,
  trendValue,
  onPress,
  backgroundColor = '#FFFFFF',
  gradient,
  size = 'medium',
  animationDelay = 0,
  showPulse = false,
}: MetricCardProps) {
  // Temporarily disabled animations
  useEffect(() => {
    // No animations for now
  }, [animationDelay, showPulse]);
  const getTrendIcon = (): IconName => {
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
        return '#00C851';
      case 'down':
        return '#FF4444';
      default:
        return '#8E8E93';
    }
  };

  const getCardStyles = () => {
    switch (size) {
      case 'small':
        return styles.smallCard;
      case 'large':
        return styles.largeCard;
      default:
        return styles.mediumCard;
    }
  };

  const getIconSize = () => {
    const baseSize = (() => {
      switch (size) {
        case 'small':
          return 20;
        case 'large':
          return 32;
        default:
          return 24;
      }
    })();
    return getScaleForScreen(baseSize);
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  const cardContent = (
    <>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <IconSymbol name={icon} size={getIconSize()} color={iconColor} />
        </View>
        <ThemedText style={[styles.title, size === 'small' && styles.smallTitle]}>
          {title}
        </ThemedText>
      </View>
      
      <View style={styles.valueContainer}>
        <View style={styles.valueRow}>
          <ThemedText style={[styles.value, size === 'small' && styles.smallValue]}>
            {value}
          </ThemedText>
          {unit && (
            <ThemedText style={[styles.unit, size === 'small' && styles.smallUnit]}>
              {unit}
            </ThemedText>
          )}
        </View>
      </View>

      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <View style={[styles.trendBadge, { backgroundColor: `${getTrendColor()}15` }]}>
            <IconSymbol 
              name={getTrendIcon()} 
              size={10} 
              color={getTrendColor()} 
            />
            <ThemedText style={[styles.trendText, { color: getTrendColor() }]}>
              {trendValue}
            </ThemedText>
          </View>
        </View>
      )}
    </>
  );

  if (gradient) {
    return (
      <CardComponent
        style={[styles.container, getCardStyles()]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient}
          style={[styles.gradientContainer, {
            borderRadius: getScaleForScreen(16),
            padding: getSpacingForScreen(20),
            minHeight: getScaleForScreen(size === 'small' ? 100 : size === 'large' ? 140 : 120),
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {cardContent}
        </LinearGradient>
      </CardComponent>
    );
  }

  return (
    <CardComponent
      style={[styles.container, getCardStyles(), { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {cardContent}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: getScaleForScreen(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: getScaleForScreen(2),
    },
    shadowOpacity: 0.06,
    shadowRadius: getScaleForScreen(8),
    elevation: 2,
  },
  gradientContainer: {
    justifyContent: 'space-between',
  },
  smallCard: {
    padding: getSpacingForScreen(16),
    minHeight: getScaleForScreen(100),
    width: '47%',
  },
  mediumCard: {
    padding: getSpacingForScreen(18),
    minHeight: getScaleForScreen(120),
    width: '47%',
  },
  largeCard: {
    padding: getSpacingForScreen(24),
    minHeight: getScaleForScreen(140),
    width: '100%',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: getSpacingForScreen(12),
  },
  iconContainer: {
    width: getScaleForScreen(40),
    height: getScaleForScreen(40),
    borderRadius: getScaleForScreen(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacingForScreen(8),
  },
  title: {
    fontSize: getScaleForScreen(14),
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: -0.1,
  },
  smallTitle: {
    fontSize: getScaleForScreen(13),
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: getScaleForScreen(26),
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  smallValue: {
    fontSize: getScaleForScreen(24),
  },
  unit: {
    fontSize: getScaleForScreen(16),
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: getSpacingForScreen(4),
  },
  smallUnit: {
    fontSize: getScaleForScreen(14),
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getSpacingForScreen(8),
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacingForScreen(8),
    paddingVertical: getSpacingForScreen(4),
    borderRadius: getScaleForScreen(12),
    gap: getSpacingForScreen(4),
  },
  trendText: {
    fontSize: getScaleForScreen(12),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});