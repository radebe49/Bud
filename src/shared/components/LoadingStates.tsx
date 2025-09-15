import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ANIMATION_DURATIONS, 
  isLargeScreen,
  getScaleForScreen,
  getSpacingForScreen
} from '../utils/animations';

interface ShimmerProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export const Shimmer: React.FC<ShimmerProps> = ({ 
  width, 
  height, 
  borderRadius = 8, 
  style 
}) => {
  const shimmerValue = new Animated.Value(0);

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.skeletonShimmer,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    
    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View 
      style={[
        styles.shimmerContainer,
        {
          width,
          height: getScaleForScreen(height),
          borderRadius: getScaleForScreen(borderRadius),
        },
        style
      ]}
    >
      <Animated.View style={[styles.shimmerOverlay, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
};

interface MessageSkeletonProps {
  isUser?: boolean;
}

export const MessageSkeleton: React.FC<MessageSkeletonProps> = ({ isUser = false }) => {
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.budMessage]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Shimmer width={getScaleForScreen(36)} height={36} borderRadius={18} />
        </View>
      )}
      
      <View style={styles.messageContent}>
        <Shimmer 
          width={isLargeScreen ? '85%' : '78%'} 
          height={isLargeScreen ? 60 : 50} 
          borderRadius={24} 
        />
      </View>
      
      {isUser && <View style={styles.spacer} />}
    </View>
  );
};

interface CardSkeletonProps {
  size?: 'small' | 'medium' | 'large';
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ size = 'medium' }) => {
  const getCardDimensions = () => {
    switch (size) {
      case 'small':
        return { width: '47%' as const, height: 100 };
      case 'large':
        return { width: '100%' as const, height: 140 };
      default:
        return { width: '47%' as const, height: 120 };
    }
  };

  const { width, height } = getCardDimensions();

  return (
    <View style={[styles.cardContainer, { width }]}>
      <Shimmer width="100%" height={height} borderRadius={16} />
    </View>
  );
};

interface ProgressRingSkeletonProps {
  size: number;
}

export const ProgressRingSkeleton: React.FC<ProgressRingSkeletonProps> = ({ size }) => {
  const pulseValue = new Animated.Value(1);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: ANIMATION_DURATIONS.progressRingPulse / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.progressRingPulse / 2,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, []);

  return (
    <Animated.View style={[styles.progressRingContainer, { transform: [{ scale: pulseValue }] }]}>
      <Shimmer 
        width={getScaleForScreen(size)} 
        height={size} 
        borderRadius={size / 2} 
      />
    </Animated.View>
  );
};

interface LoadingDotsProps {
  size?: number;
  color?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  size = 8, 
  color = '#007AFF' 
}) => {
  const dot1Scale = new Animated.Value(1);
  const dot2Scale = new Animated.Value(1);
  const dot3Scale = new Animated.Value(1);

  useEffect(() => {
    const duration = ANIMATION_DURATIONS.typingDot;
    
    const dot1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Scale, { toValue: 1.2, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(dot1Scale, { toValue: 1, duration: duration / 2, useNativeDriver: true })
      ])
    );
    
    const dot2Animation = Animated.loop(
      Animated.sequence([
        Animated.delay(duration / 3),
        Animated.timing(dot2Scale, { toValue: 1.2, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(dot2Scale, { toValue: 1, duration: duration / 2, useNativeDriver: true })
      ])
    );
    
    const dot3Animation = Animated.loop(
      Animated.sequence([
        Animated.delay((duration * 2) / 3),
        Animated.timing(dot3Scale, { toValue: 1.2, duration: duration / 2, useNativeDriver: true }),
        Animated.timing(dot3Scale, { toValue: 1, duration: duration / 2, useNativeDriver: true })
      ])
    );
    
    dot1Animation.start();
    dot2Animation.start();
    dot3Animation.start();
    
    return () => {
      dot1Animation.stop();
      dot2Animation.stop();
      dot3Animation.stop();
    };
  }, []);

  const dotSize = getScaleForScreen(size);

  return (
    <View style={styles.loadingDotsContainer}>
      <Animated.View 
        style={[
          styles.loadingDot, 
          { 
            width: dotSize, 
            height: dotSize, 
            borderRadius: dotSize / 2, 
            backgroundColor: color,
            transform: [{ scale: dot1Scale }]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.loadingDot, 
          { 
            width: dotSize, 
            height: dotSize, 
            borderRadius: dotSize / 2, 
            backgroundColor: color,
            transform: [{ scale: dot2Scale }]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.loadingDot, 
          { 
            width: dotSize, 
            height: dotSize, 
            borderRadius: dotSize / 2, 
            backgroundColor: color,
            transform: [{ scale: dot3Scale }]
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerContainer: {
    backgroundColor: '#E5E5EA',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
  },
  shimmerGradient: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: getSpacingForScreen(20),
    alignItems: 'flex-end',
    paddingHorizontal: getSpacingForScreen(20),
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  budMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: getSpacingForScreen(12),
    marginBottom: getSpacingForScreen(4),
  },
  messageContent: {
    flex: 1,
  },
  spacer: {
    width: getSpacingForScreen(48),
  },
  cardContainer: {
    marginBottom: getSpacingForScreen(16),
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getSpacingForScreen(4),
  },
  loadingDot: {
    marginHorizontal: getSpacingForScreen(2),
  },
});