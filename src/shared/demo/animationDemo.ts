/**
 * Animation Demo for Large Screen UI Enhancements
 * Demonstrates all the polished animations and visual improvements
 */

import {
  ANIMATION_DURATIONS,
  SPRING_CONFIGS,
  EASING_CURVES,
  isLargeScreen,
  getScaleForScreen,
  getSpacingForScreen
} from '../utils/animations';

export interface AnimationDemoConfig {
  messageAnimations: {
    staggerDelay: number;
    entranceDuration: number;
    slideDistance: number;
  };
  progressRingAnimations: {
    fillDuration: number;
    pulseDuration: number;
    showPulse: boolean;
  };
  cardAnimations: {
    staggerDelay: number;
    pressScale: number;
    hoverScale: number;
  };
  screenTransitions: {
    orientationDuration: number;
    slideDirection: 'horizontal' | 'vertical';
  };
  loadingStates: {
    shimmerDuration: number;
    dotAnimationSpeed: number;
    skeletonVariations: string[];
  };
}

export const createAnimationDemo = (): AnimationDemoConfig => {
  return {
    messageAnimations: {
      staggerDelay: isLargeScreen ? 150 : 100,
      entranceDuration: ANIMATION_DURATIONS.messageAppear,
      slideDistance: getSpacingForScreen(30),
    },

    progressRingAnimations: {
      fillDuration: ANIMATION_DURATIONS.progressRingFill,
      pulseDuration: ANIMATION_DURATIONS.progressRingPulse,
      showPulse: isLargeScreen, // Enhanced emphasis on large screens
    },

    cardAnimations: {
      staggerDelay: isLargeScreen ? 100 : 80,
      pressScale: 0.98,
      hoverScale: isLargeScreen ? 1.02 : 1.01,
    },

    screenTransitions: {
      orientationDuration: ANIMATION_DURATIONS.orientationChange,
      slideDirection: 'horizontal',
    },

    loadingStates: {
      shimmerDuration: ANIMATION_DURATIONS.skeletonShimmer,
      dotAnimationSpeed: ANIMATION_DURATIONS.typingDot,
      skeletonVariations: [
        'message-user',
        'message-bud',
        'card-small',
        'card-medium',
        'card-large',
        'progress-ring',
      ],
    },
  };
};

export const demoMessages = [
  {
    id: '1',
    sender: 'bud' as const,
    content: 'Welcome to your enhanced health coaching experience! 🎉',
    messageType: 'celebration' as const,
    timestamp: Date.now(),
    metadata: {
      relatedMetrics: ['onboarding'],
    },
  },
  {
    id: '2',
    sender: 'bud' as const,
    content: 'I notice you\'ve been consistently hitting your step goals. Your progress is looking great with a 15% improvement this week!',
    messageType: 'progress_update' as const,
    timestamp: Date.now() + 1000,
    metadata: {
      relatedMetrics: ['steps', 'weekly_progress'],
    },
  },
  {
    id: '3',
    sender: 'user' as const,
    content: 'That\'s awesome! I\'ve been feeling more energetic lately.',
    messageType: 'text' as const,
    timestamp: Date.now() + 2000,
  },
  {
    id: '4',
    sender: 'bud' as const,
    content: 'Based on your sleep patterns, I recommend adjusting your bedtime routine. Would you like some personalized suggestions?',
    messageType: 'recommendation' as const,
    timestamp: Date.now() + 3000,
    metadata: {
      relatedMetrics: ['sleep_quality', 'bedtime_routine'],
    },
  },
  {
    id: '5',
    sender: 'bud' as const,
    content: 'Your heart rate variability shows excellent recovery. This indicates your training intensity is well-balanced.',
    messageType: 'insight_banner' as const,
    timestamp: Date.now() + 4000,
    metadata: {
      relatedMetrics: ['hrv', 'recovery', 'training_load'],
    },
  },
];

export const demoMetrics = [
  {
    title: 'Steps Today',
    value: '8,247',
    unit: 'steps',
    icon: 'figure.walk' as const,
    iconColor: '#10B981',
    trend: 'up' as const,
    trendValue: '+12%',
    size: 'medium' as const,
    animationDelay: 0,
    showPulse: false,
  },
  {
    title: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    icon: 'heart.fill' as const,
    iconColor: '#EF4444',
    trend: 'stable' as const,
    trendValue: 'Normal',
    size: 'medium' as const,
    animationDelay: 100,
    showPulse: false,
  },
  {
    title: 'Sleep Score',
    value: '85',
    unit: '/100',
    icon: 'moon.fill' as const,
    iconColor: '#8B5CF6',
    trend: 'up' as const,
    trendValue: '+8%',
    size: 'medium' as const,
    animationDelay: 200,
    showPulse: true, // Highlight good sleep
  },
  {
    title: 'Water Intake',
    value: '1.8',
    unit: 'L',
    icon: 'drop.fill' as const,
    iconColor: '#06B6D4',
    trend: 'down' as const,
    trendValue: '-15%',
    size: 'medium' as const,
    animationDelay: 300,
    showPulse: false,
  },
];

export const demoProgressRings = [
  {
    size: getScaleForScreen(80),
    strokeWidth: getScaleForScreen(8),
    progress: 0.75,
    color: '#10B981',
    label: 'Activity',
    value: '75%',
    animated: true,
    animationDelay: 0,
    showPulse: false,
  },
  {
    size: getScaleForScreen(80),
    strokeWidth: getScaleForScreen(8),
    progress: 0.60,
    color: '#EF4444',
    label: 'Exercise',
    value: '60%',
    animated: true,
    animationDelay: 200,
    showPulse: false,
  },
  {
    size: getScaleForScreen(80),
    strokeWidth: getScaleForScreen(8),
    progress: 0.90,
    color: '#8B5CF6',
    label: 'Stand',
    value: '90%',
    animated: true,
    animationDelay: 400,
    showPulse: true, // Highlight achievement
  },
];

export const animationTestSequence = [
  {
    name: 'Message Entrance',
    description: 'Smooth slide-in with fade for message bubbles',
    duration: ANIMATION_DURATIONS.messageAppear + 500,
    component: 'MessageBubble',
  },
  {
    name: 'Progress Ring Fill',
    description: 'Enhanced 800ms fill animation with pulse on completion',
    duration: ANIMATION_DURATIONS.progressRingFill + ANIMATION_DURATIONS.progressRingPulse,
    component: 'ProgressRing',
  },
  {
    name: 'Card Stagger Animation',
    description: 'Staggered entrance with press feedback',
    duration: 400 + (demoMetrics.length * 100),
    component: 'MetricCard',
  },
  {
    name: 'Orientation Change',
    description: 'Smooth 250ms transition for device rotation',
    duration: ANIMATION_DURATIONS.orientationChange,
    component: 'ScreenTransition',
  },
  {
    name: 'Loading States',
    description: 'Shimmer effects and skeleton screens',
    duration: ANIMATION_DURATIONS.skeletonShimmer,
    component: 'LoadingStates',
  },
  {
    name: 'Typing Indicator',
    description: 'Enhanced dot animation for large screens',
    duration: ANIMATION_DURATIONS.typingDot * 3,
    component: 'TypingIndicator',
  },
];

export const performanceMetrics = {
  targetFPS: 60,
  animationBudget: 16.67, // milliseconds per frame
  largeScreenOptimizations: {
    enhancedDurations: isLargeScreen,
    scaledElements: true,
    improvedTouchTargets: true,
    smoothTransitions: true,
  },
  memoryUsage: {
    animatedValues: animationTestSequence.length * 4, // Estimated shared values
    nativeDriver: true,
    reanimatedVersion: '3.x',
  },
};

export const accessibilityEnhancements = {
  reducedMotion: {
    respectsSystemSetting: true,
    fallbackDurations: {
      fast: 150,
      normal: 200,
      slow: 250,
    },
  },
  touchTargets: {
    minimum: getScaleForScreen(44),
    recommended: getScaleForScreen(48),
    comfortable: getScaleForScreen(56),
  },
  visualFeedback: {
    pressStates: true,
    hoverStates: isLargeScreen,
    focusIndicators: true,
  },
};

// Export demo runner function
export const runAnimationDemo = async (
  component: string,
  callback?: (progress: number) => void
) => {
  const sequence = animationTestSequence.find(seq => seq.component === component);
  if (!sequence) return;

  const startTime = Date.now();
  const duration = sequence.duration;

  const updateProgress = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    if (callback) {
      callback(progress);
    }

    if (progress < 1) {
      requestAnimationFrame(updateProgress);
    }
  };

  requestAnimationFrame(updateProgress);
};