/**
 * Modern Onboarding Card Component
 * Inspired by clean health app designs from Figma screenshots
 * Features smooth animations and haptic feedback
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ModernOnboardingCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
  animationDelay?: number;
}

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 428;

export const ModernOnboardingCard: React.FC<ModernOnboardingCardProps> = ({
  title,
  description,
  icon,
  color,
  isSelected,
  onPress,
  animationDelay = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: animationDelay,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Selection animation
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.02 : 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  }, [isSelected]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: isSelected ? 1 : 1.02,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
    ]).start();

    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.selectedCard,
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            isSelected
              ? ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']
              : ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)']
          }
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
            
            <View style={styles.textContainer}>
              <Text style={[styles.title, isSelected && styles.selectedTitle]}>
                {title}
              </Text>
              <Text style={[styles.description, isSelected && styles.selectedDescription]}>
                {description}
              </Text>
            </View>

            {isSelected && (
              <Animated.View style={styles.checkmark}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8F9FA']}
                  style={styles.checkmarkGradient}
                >
                  <Text style={styles.checkmarkText}>✓</Text>
                </LinearGradient>
              </Animated.View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: isLargeScreen ? 16 : 12,
  },
  card: {
    borderRadius: isLargeScreen ? 20 : 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: isLargeScreen ? 24 : 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: isLargeScreen ? 64 : 56,
    height: isLargeScreen ? 64 : 56,
    borderRadius: isLargeScreen ? 18 : 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isLargeScreen ? 20 : 16,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: isLargeScreen ? 32 : 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  selectedTitle: {
    color: 'white',
  },
  description: {
    fontSize: isLargeScreen ? 15 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: isLargeScreen ? 22 : 20,
    fontWeight: '500',
  },
  selectedDescription: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  checkmark: {
    width: isLargeScreen ? 36 : 32,
    height: isLargeScreen ? 36 : 32,
    borderRadius: isLargeScreen ? 18 : 16,
    overflow: 'hidden',
  },
  checkmarkGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: isLargeScreen ? 20 : 18,
    color: '#667eea',
    fontWeight: '700',
  },
});