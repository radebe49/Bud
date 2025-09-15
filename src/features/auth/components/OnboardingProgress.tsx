/**
 * Enhanced Onboarding Progress Component
 * Inspired by modern health app designs with smooth animations
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 428;

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  const progressAnims = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animate progress dots
    progressAnims.forEach((anim, index) => {
      const isActive = index < currentStep;
      const delay = index * 100;

      Animated.timing(anim, {
        toValue: isActive ? 1 : 0,
        duration: 400,
        delay,
        useNativeDriver: false,
      }).start();
    });
  }, [currentStep]);

  const renderProgressDot = (index: number) => {
    const isActive = index < currentStep;
    const isCurrent = index === currentStep - 1;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.progressDot,
          {
            width: progressAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [8, isCurrent ? 32 : 8],
            }),
            backgroundColor: progressAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255, 255, 255, 0.4)', 'white'],
            }),
            shadowOpacity: progressAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => renderProgressDot(index))}
      </View>
      
      <Text style={styles.progressText}>
        {currentStep} of {totalSteps}
        {stepLabels && stepLabels[currentStep - 1] && (
          <Text style={styles.stepLabel}> • {stepLabels[currentStep - 1]}</Text>
        )}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: isLargeScreen ? 24 : 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: isLargeScreen ? 16 : 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  stepLabel: {
    fontSize: isLargeScreen ? 15 : 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});