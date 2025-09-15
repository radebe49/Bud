import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { 
  ANIMATION_DURATIONS, 
  SPRING_CONFIGS, 
  EASING_CURVES,
  createOrientationAnimation,
  isLargeScreen
} from '../utils/animations';

interface ScreenTransitionProps {
  children: React.ReactNode;
  transitionKey?: string;
  direction?: 'horizontal' | 'vertical';
  onTransitionComplete?: () => void;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  transitionKey,
  direction = 'horizontal',
  onTransitionComplete,
}) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      
      // Smooth orientation change animation
      scale.value = withSequence(
        withTiming(0.95, {
          duration: ANIMATION_DURATIONS.orientationChange / 2,
          easing: EASING_CURVES.easeInOutCubic,
        }),
        withSpring(1, SPRING_CONFIGS.smooth, (finished) => {
          if (finished && onTransitionComplete) {
            runOnJS(onTransitionComplete)();
          }
        })
      );
    });

    return () => subscription?.remove();
  }, [onTransitionComplete]);

  useEffect(() => {
    if (transitionKey) {
      // Screen transition animation
      const distance = direction === 'horizontal' ? dimensions.width : dimensions.height;
      
      // Exit animation
      if (direction === 'horizontal') {
        translateX.value = withTiming(-distance, {
          duration: ANIMATION_DURATIONS.screenTransition / 2,
          easing: EASING_CURVES.easeInOutCubic,
        });
      } else {
        translateY.value = withTiming(-distance, {
          duration: ANIMATION_DURATIONS.screenTransition / 2,
          easing: EASING_CURVES.easeInOutCubic,
        });
      }
      
      opacity.value = withTiming(0, {
        duration: ANIMATION_DURATIONS.screenTransition / 2,
        easing: EASING_CURVES.easeInOutCubic,
      });

      // Enter animation
      setTimeout(() => {
        if (direction === 'horizontal') {
          translateX.value = distance;
          translateX.value = withTiming(0, {
            duration: ANIMATION_DURATIONS.screenTransition / 2,
            easing: EASING_CURVES.easeOutCubic,
          });
        } else {
          translateY.value = distance;
          translateY.value = withTiming(0, {
            duration: ANIMATION_DURATIONS.screenTransition / 2,
            easing: EASING_CURVES.easeOutCubic,
          });
        }
        
        opacity.value = withTiming(1, {
          duration: ANIMATION_DURATIONS.screenTransition / 2,
          easing: EASING_CURVES.easeOutCubic,
        }, (finished) => {
          if (finished && onTransitionComplete) {
            runOnJS(onTransitionComplete)();
          }
        });
      }, ANIMATION_DURATIONS.screenTransition / 2);
    }
  }, [transitionKey, direction, dimensions, onTransitionComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

interface FadeTransitionProps {
  children: React.ReactNode;
  visible: boolean;
  duration?: number;
  onTransitionComplete?: () => void;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  visible,
  duration = ANIMATION_DURATIONS.messageAppear,
  onTransitionComplete,
}) => {
  const opacity = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : 0.95);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration,
      easing: EASING_CURVES.easeInOutCubic,
    });
    
    scale.value = withSpring(visible ? 1 : 0.95, SPRING_CONFIGS.gentle, (finished) => {
      if (finished && onTransitionComplete) {
        runOnJS(onTransitionComplete)();
      }
    });
  }, [visible, duration, onTransitionComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

interface SlideTransitionProps {
  children: React.ReactNode;
  visible: boolean;
  direction: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  onTransitionComplete?: () => void;
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  visible,
  direction,
  distance = 50,
  duration = ANIMATION_DURATIONS.messageSlideIn,
  onTransitionComplete,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    const getInitialTransform = () => {
      switch (direction) {
        case 'up':
          return { x: 0, y: distance };
        case 'down':
          return { x: 0, y: -distance };
        case 'left':
          return { x: distance, y: 0 };
        case 'right':
          return { x: -distance, y: 0 };
        default:
          return { x: 0, y: 0 };
      }
    };

    const initial = getInitialTransform();
    
    if (visible) {
      translateX.value = initial.x;
      translateY.value = initial.y;
      
      translateX.value = withTiming(0, {
        duration,
        easing: EASING_CURVES.easeOutCubic,
      });
      
      translateY.value = withTiming(0, {
        duration,
        easing: EASING_CURVES.easeOutCubic,
      });
      
      opacity.value = withTiming(1, {
        duration,
        easing: EASING_CURVES.easeOutCubic,
      }, (finished) => {
        if (finished && onTransitionComplete) {
          runOnJS(onTransitionComplete)();
        }
      });
    } else {
      translateX.value = withTiming(initial.x, {
        duration: duration / 2,
        easing: EASING_CURVES.easeInOutCubic,
      });
      
      translateY.value = withTiming(initial.y, {
        duration: duration / 2,
        easing: EASING_CURVES.easeInOutCubic,
      });
      
      opacity.value = withTiming(0, {
        duration: duration / 2,
        easing: EASING_CURVES.easeInOutCubic,
      });
    }
  }, [visible, direction, distance, duration, onTransitionComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});