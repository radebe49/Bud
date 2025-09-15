/**
 * Welcome screen - First screen of onboarding flow
 * Introduces the app and Bud character
 * Clean white background design inspired by modern health apps
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const { width, height } = Dimensions.get('window');
const isLargeScreen = width >= 428; // 6.7 inch detection

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
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
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Bud Character Section */}
        <Animated.View 
          style={[
            styles.characterSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.budAvatar}>
            <Text style={styles.budEmoji}>🤖</Text>
          </View>
          <Text style={styles.budName}>Meet Bud</Text>
          <Text style={styles.budSubtitle}>Your AI Health Coach</Text>
        </Animated.View>

        {/* Welcome Message */}
        <Animated.View 
          style={[
            styles.messageSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeTitle}>
            Welcome to Your{'\n'}Personal Health Journey
          </Text>
          <Text style={styles.welcomeDescription}>
            I'm Bud, your AI health coach. I'm here to provide personalized guidance, 
            motivation, and support to help you achieve your wellness goals.
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
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>💬</Text>
            </View>
            <Text style={styles.featureText}>Natural conversations about your health</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🎯</Text>
            </View>
            <Text style={styles.featureText}>Personalized workout and nutrition plans</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📊</Text>
            </View>
            <Text style={styles.featureText}>Smart insights from your health data</Text>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View 
          style={[
            styles.buttonSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Let's Get Started</Text>
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressDots}>
              <View style={[styles.progressDot, styles.activeDot]} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
            </View>
            <Text style={styles.progressText}>1 of 3</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: isLargeScreen ? 32 : 24,
    paddingVertical: isLargeScreen ? 60 : 40,
    justifyContent: 'space-between',
  },
  characterSection: {
    alignItems: 'center',
    marginTop: isLargeScreen ? 60 : 40,
  },
  budAvatar: {
    width: isLargeScreen ? 120 : 100,
    height: isLargeScreen ? 120 : 100,
    borderRadius: isLargeScreen ? 60 : 50,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 24 : 20,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  budEmoji: {
    fontSize: isLargeScreen ? 48 : 40,
    color: 'white',
  },
  budName: {
    fontSize: isLargeScreen ? 32 : 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  budSubtitle: {
    fontSize: isLargeScreen ? 18 : 16,
    color: '#666666',
    fontWeight: '500',
  },
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: isLargeScreen ? 20 : 16,
  },
  welcomeTitle: {
    fontSize: isLargeScreen ? 32 : 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: isLargeScreen ? 20 : 16,
    lineHeight: isLargeScreen ? 40 : 36,
    letterSpacing: -0.5,
  },
  welcomeDescription: {
    fontSize: isLargeScreen ? 16 : 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: isLargeScreen ? 24 : 22,
    fontWeight: '400',
  },
  featuresSection: {
    paddingHorizontal: isLargeScreen ? 20 : 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 16 : 12,
    backgroundColor: '#f8f9fa',
    padding: isLargeScreen ? 16 : 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  featureIconContainer: {
    width: isLargeScreen ? 40 : 36,
    height: isLargeScreen ? 40 : 36,
    borderRadius: isLargeScreen ? 20 : 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: isLargeScreen ? 16 : 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: isLargeScreen ? 20 : 18,
  },
  featureText: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
    lineHeight: isLargeScreen ? 20 : 18,
  },
  buttonSection: {
    paddingHorizontal: isLargeScreen ? 20 : 16,
  },
  continueButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: isLargeScreen ? 18 : 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.2,
  },
  progressSection: {
    alignItems: 'center',
    marginTop: isLargeScreen ? 32 : 24,
  },
  progressDots: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4ECDC4',
    width: 24,
    borderRadius: 4,
  },
  progressText: {
    fontSize: isLargeScreen ? 14 : 13,
    color: '#666666',
    fontWeight: '500',
  },
});