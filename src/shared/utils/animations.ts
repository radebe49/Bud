/**
 * Animation utilities optimized for large screens (6.7 inch displays)
 * Enhanced timing and scaling for better visual experience on larger displays
 * 
 * NOTE: Temporarily disabled Reanimated to fix SDK 54 compatibility issues
 */

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Screen size detection for large displays
export const isLargeScreen = screenWidth >= 428; // 6.7 inch and above
export const isXLargeScreen = screenWidth >= 480; // Future larger devices

// Enhanced animation durations for large screens
export const ANIMATION_DURATIONS = {
  // Screen transitions - slightly longer for large screens
  screenTransition: isLargeScreen ? 350 : 300,
  
  // Message animations - enhanced for better visibility
  messageAppear: isLargeScreen ? 250 : 200,
  messageSlideIn: isLargeScreen ? 300 : 250,
  
  // Progress ring animations - longer for dramatic effect on large screens
  progressRingFill: isLargeScreen ? 1000 : 800,
  progressRingPulse: isLargeScreen ? 600 : 500,
  
  // Card interactions - responsive to touch
  cardPress: 150,
  cardHover: 100,
  
  // Orientation changes - smooth transitions
  orientationChange: 250,
  
  // Micro-interactions
  buttonPress: 100,
  iconBounce: 400,
  
  // Loading states
  loadingPulse: 1200,
  skeletonShimmer: 1500,
  
  // Typing indicator - enhanced for large screens
  typingDot: isLargeScreen ? 500 : 400,
};

// Enhanced easing curves for large screen interactions (stub implementations)
export const EASING_CURVES = {
  // Smooth entrance animations
  easeOutCubic: 'easeOutCubic',
  easeInOutCubic: 'easeInOutCubic',
  
  // Spring-like animations for interactive elements
  easeOutBack: 'easeOutBack',
  easeOutElastic: 'easeOutElastic',
  
  // Smooth transitions
  easeInOutQuart: 'easeInOutQuart',
  
  // Progress animations
  easeOutQuint: 'easeOutQuint',
};

// Spring configurations optimized for large screens
export const SPRING_CONFIGS = {
  // Gentle spring for large elements
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  },
  
  // Bouncy spring for interactive feedback
  bouncy: {
    damping: 15,
    stiffness: 200,
    mass: 0.8,
  },
  
  // Smooth spring for screen transitions
  smooth: {
    damping: 25,
    stiffness: 180,
    mass: 1.2,
  },
  
  // Quick spring for micro-interactions
  quick: {
    damping: 18,
    stiffness: 250,
    mass: 0.6,
  },
};

// Stub animation functions (no-op implementations)
export const createMessageAnimation = (delay: number = 0) => {
  return 1; // Return static value
};

export const createProgressAnimation = (
  toValue: number,
  duration: number = ANIMATION_DURATIONS.progressRingFill,
  onComplete?: () => void
) => {
  if (onComplete) {
    setTimeout(onComplete, duration);
  }
  return toValue;
};

export const createPulseAnimation = (
  scale: number = 1.05,
  duration: number = ANIMATION_DURATIONS.progressRingPulse
) => {
  return 1; // Return static value
};

export const createBounceAnimation = (
  scale: number = 1.1,
  duration: number = ANIMATION_DURATIONS.iconBounce
) => {
  return 1; // Return static value
};

export const createSlideInAnimation = (
  fromX: number = screenWidth,
  duration: number = ANIMATION_DURATIONS.messageSlideIn
) => {
  return 0; // Return static value
};

export const createFadeInAnimation = (
  duration: number = ANIMATION_DURATIONS.messageAppear,
  delay: number = 0
) => {
  return 1; // Return static value
};

export const createShimmerAnimation = (
  duration: number = ANIMATION_DURATIONS.skeletonShimmer
) => {
  return 1; // Return static value
};

export const createTypingDotAnimation = (
  delay: number = 0,
  duration: number = ANIMATION_DURATIONS.typingDot
) => {
  return 1; // Return static value
};

// Screen transition animations
export const createScreenTransition = (
  direction: 'left' | 'right' | 'up' | 'down' = 'right'
) => {
  return {
    enter: 0,
    exit: 0,
  };
};

// Orientation change animation
export const createOrientationAnimation = () => {
  return 1; // Return static value
};

// Interactive feedback animations
export const createPressAnimation = (scale: number = 0.95) => {
  return 1; // Return static value
};

// Interpolation helpers for large screens (stub implementations)
export const createScaleInterpolation = (
  animatedValue: any,
  inputRange: number[] = [0, 1],
  outputRange: number[] = [0.8, 1]
) => {
  return outputRange[1]; // Return max value
};

export const createOpacityInterpolation = (
  animatedValue: any,
  inputRange: number[] = [0, 1],
  outputRange: number[] = [0, 1]
) => {
  return outputRange[1]; // Return max value
};

export const createTranslateInterpolation = (
  animatedValue: any,
  distance: number = 50,
  inputRange: number[] = [0, 1]
) => {
  return 0; // Return final position
};

// Large screen specific scaling factors
export const getScaleForScreen = (baseScale: number = 1) => {
  if (isXLargeScreen) return baseScale * 1.15;
  if (isLargeScreen) return baseScale * 1.1;
  return baseScale;
};

export const getSpacingForScreen = (baseSpacing: number) => {
  if (isXLargeScreen) return baseSpacing * 1.2;
  if (isLargeScreen) return baseSpacing * 1.1;
  return baseSpacing;
};

// Animation presets for common UI patterns (stub implementations)
export const ANIMATION_PRESETS = {
  // Message bubble entrance
  messageBubble: {
    opacity: 1,
    transform: [
      { translateY: 0 },
      { scale: 1 }
    ],
  },
  
  // Card press feedback
  cardPress: {
    transform: [{ scale: 1 }],
  },
  
  // Progress ring fill
  progressRing: {
    strokeDashoffset: 0,
  },
  
  // Loading shimmer
  shimmer: {
    opacity: 1,
  },
  
  // Screen transition
  screenSlide: {
    enter: 0,
    exit: 0,
  },
};