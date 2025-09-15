import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '@/components/ThemedText';
import { 
  ANIMATION_DURATIONS, 
  SPRING_CONFIGS, 
  EASING_CURVES,
  createProgressAnimation,
  createPulseAnimation,
  isLargeScreen 
} from '../utils/animations';

// Temporarily disabled animations

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  color: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  label?: string;
  value?: string;
  animated?: boolean;
  animationDelay?: number;
  showPulse?: boolean;
  onAnimationComplete?: () => void;
}

export function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor = '#E5E5EA',
  children,
  label,
  value,
  animated = true,
  animationDelay = 0,
  showPulse = false,
  onAnimationComplete,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  
  useEffect(() => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  }, [onAnimationComplete]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        {children || (
          <View style={styles.textContainer}>
            {value && (
              <ThemedText style={[styles.value, { fontSize: isLargeScreen ? 20 : 18, color: color }]}>
                {value}
              </ThemedText>
            )}
            {label && (
              <ThemedText style={[styles.label, { fontSize: isLargeScreen ? 14 : 12, color: color }]}>
                {label}
              </ThemedText>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 2,
  },
});