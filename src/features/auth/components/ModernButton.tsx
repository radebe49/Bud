/**
 * Modern Button Component
 * Inspired by clean health app designs with enhanced animations
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 428;

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'large',
  icon,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`${size}Button`]];
    
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, styles[`${size}Text`]];
    
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }
    
    return baseStyle;
  };

  const renderButtonContent = () => (
    <LinearGradient
      colors={
        disabled
          ? ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']
          : variant === 'primary'
          ? ['#FFFFFF', '#F8F9FA']
          : variant === 'secondary'
          ? ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']
          : ['transparent', 'transparent']
      }
      style={[styles.buttonGradient, styles[`${size}Gradient`]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
    </LinearGradient>
  );

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        {renderButtonContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: isLargeScreen ? 24 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  smallButton: {
    borderRadius: isLargeScreen ? 16 : 12,
  },
  mediumButton: {
    borderRadius: isLargeScreen ? 20 : 16,
  },
  largeButton: {
    borderRadius: isLargeScreen ? 24 : 20,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  smallGradient: {
    paddingVertical: isLargeScreen ? 12 : 10,
    paddingHorizontal: isLargeScreen ? 20 : 16,
    minHeight: isLargeScreen ? 44 : 40,
  },
  mediumGradient: {
    paddingVertical: isLargeScreen ? 16 : 14,
    paddingHorizontal: isLargeScreen ? 28 : 24,
    minHeight: isLargeScreen ? 52 : 48,
  },
  largeGradient: {
    paddingVertical: isLargeScreen ? 22 : 20,
    paddingHorizontal: isLargeScreen ? 36 : 28,
    minHeight: isLargeScreen ? 60 : 56,
  },
  buttonText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  smallText: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#667eea',
  },
  mediumText: {
    fontSize: isLargeScreen ? 16 : 15,
    color: '#667eea',
  },
  largeText: {
    fontSize: isLargeScreen ? 18 : 16,
    color: '#667eea',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  iconContainer: {
    marginRight: 8,
  },
});