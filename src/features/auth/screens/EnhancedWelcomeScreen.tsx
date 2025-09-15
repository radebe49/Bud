/**
 * Enhanced Welcome Screen
 * Inspired by modern health app designs from Figma screenshots
 * Features improved animations, typography, and visual hierarchy
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ModernButton } from '../components/ModernButton';
import { OnboardingProgress } from '../components/OnboardingProgress';

interface EnhancedWelcomeScreenProps {
  onContinue: () => void;
}

const { width, height } = Dimensions.get('window');
const isLargeScreen = width >= 428;

export const EnhancedWelcomeScreen: React.FC<EnhancedWelcomeScreenProps> = ({ 
  onContinue 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const budAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      // Bud character appears first
      Animated.parallel([
        Animated.timing(budAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Then content fades in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            {/* Decorative Background Elements */}
            <View style={styles.backgroundElements}>
              <Animated.View 
                style={[
                  styles.floatingCircle, 
                  styles.circle1,
                  { opacity: fadeAnim }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.floatingCircle, 
                  styles.circle2,
                  { opacity: fadeAnim }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.floatingCircle, 
                  styles.circle3,
                  { opacity: fadeAnim }
                ]} 
              />
            </View>

            {/* Header Section */}
            <View style={styles.headerSection}>
              {/* Bud Character */}
              <Animated.View 
                style={[
                  styles.budContainer,
                  {
                    opacity: budAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8F9FA']}
                  style={styles.budAvatar}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.budInnerCircle}
                  >
                    <Text style={styles.budEmoji}>🌱</Text>
                  </LinearGradient>
                </LinearGradient>
                
                <Animated.View
                  style={[
                    styles.budTextContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <Text style={styles.budName}>Meet Bud</Text>
                  <Text style={styles.budSubtitle}>Your AI Health Coach</Text>
                </Animated.View>
              </Animated.View>
            </View>

            {/* Main Content */}
            <Animated.View 
              style={[
                styles.mainContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.welcomeTitle}>
                Welcome to Your{'\n'}Health Journey
              </Text>
              <Text style={styles.welcomeDescription}>
                I'm here to provide personalized guidance, motivation, and support 
                to help you achieve your wellness goals through natural conversations 
                and smart insights.
              </Text>
            </Animated.View>

            {/* Features Preview */}
            <Animated.View 
              style={[
                styles.featuresSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {[
                {
                  icon: 'message.fill',
                  text: 'Natural health conversations',
                  delay: 0,
                },
                {
                  icon: 'target',
                  text: 'Personalized fitness plans',
                  delay: 100,
                },
                {
                  icon: 'chart.bar.fill',
                  text: 'Smart health insights',
                  delay: 200,
                },
              ].map((feature, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.featureItem,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: Animated.timing(new Animated.Value(30), {
                            toValue: 0,
                            duration: 500,
                            delay: 800 + feature.delay,
                            useNativeDriver: true,
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                    style={styles.featureIconContainer}
                  >
                    <IconSymbol name={feature.icon as any} size={20} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </Animated.View>
              ))}
            </Animated.View>

            {/* Bottom Section */}
            <Animated.View 
              style={[
                styles.bottomSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <ModernButton
                title="Let's Get Started"
                onPress={onContinue}
                size="large"
                icon={<IconSymbol name="arrow.right" size={20} color="#667eea" />}
                style={styles.continueButton}
              />

              <OnboardingProgress
                currentStep={1}
                totalSteps={3}
                stepLabels={['Welcome', 'Goals', 'Setup']}
              />
            </Animated.View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: isLargeScreen ? 32 : 24,
    paddingVertical: isLargeScreen ? 20 : 16,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 100,
  },
  circle1: {
    width: isLargeScreen ? 120 : 100,
    height: isLargeScreen ? 120 : 100,
    top: height * 0.12,
    right: -60,
  },
  circle2: {
    width: isLargeScreen ? 80 : 60,
    height: isLargeScreen ? 80 : 60,
    top: height * 0.35,
    left: -40,
  },
  circle3: {
    width: isLargeScreen ? 100 : 80,
    height: isLargeScreen ? 100 : 80,
    bottom: height * 0.25,
    right: -50,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: isLargeScreen ? 40 : 32,
    paddingBottom: isLargeScreen ? 32 : 24,
  },
  budContainer: {
    alignItems: 'center',
  },
  budAvatar: {
    width: isLargeScreen ? 160 : 140,
    height: isLargeScreen ? 160 : 140,
    borderRadius: isLargeScreen ? 80 : 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 24 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  budInnerCircle: {
    width: isLargeScreen ? 140 : 120,
    height: isLargeScreen ? 140 : 120,
    borderRadius: isLargeScreen ? 70 : 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budEmoji: {
    fontSize: isLargeScreen ? 56 : 48,
  },
  budTextContainer: {
    alignItems: 'center',
  },
  budName: {
    fontSize: isLargeScreen ? 40 : 36,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  budSubtitle: {
    fontSize: isLargeScreen ? 22 : 20,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  mainContent: {
    alignItems: 'center',
    paddingHorizontal: isLargeScreen ? 20 : 16,
    marginBottom: isLargeScreen ? 40 : 32,
  },
  welcomeTitle: {
    fontSize: isLargeScreen ? 36 : 32,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    marginBottom: isLargeScreen ? 24 : 20,
    lineHeight: isLargeScreen ? 44 : 40,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeDescription: {
    fontSize: isLargeScreen ? 18 : 17,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: isLargeScreen ? 28 : 26,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  featuresSection: {
    paddingHorizontal: isLargeScreen ? 20 : 16,
    marginBottom: isLargeScreen ? 40 : 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 20 : 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: isLargeScreen ? 20 : 16,
    borderRadius: isLargeScreen ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIconContainer: {
    width: isLargeScreen ? 48 : 44,
    height: isLargeScreen ? 48 : 44,
    borderRadius: isLargeScreen ? 24 : 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: isLargeScreen ? 16 : 12,
  },
  featureText: {
    fontSize: isLargeScreen ? 16 : 15,
    color: 'white',
    fontWeight: '600',
    flex: 1,
    lineHeight: isLargeScreen ? 22 : 20,
    letterSpacing: -0.1,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: isLargeScreen ? 20 : 16,
  },
  continueButton: {
    marginHorizontal: isLargeScreen ? 20 : 16,
    marginBottom: isLargeScreen ? 32 : 24,
  },
});