/**
 * All Set Screen - Success screen after completing paywall
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

interface AllSetScreenProps {
  onProceedToApp: () => void;
}

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 428;

export const AllSetScreen: React.FC<AllSetScreenProps> = ({
  onProceedToApp
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Welcome to Bud! Your personalized health coach is ready to help you achieve your wellness goals.
          </Text>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={onProceedToApp}
        >
          <Text style={styles.proceedButtonText}>Proceed to App</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: isLargeScreen ? 48 : 40,
  },
  checkmarkCircle: {
    width: isLargeScreen ? 120 : 100,
    height: isLargeScreen ? 120 : 100,
    borderRadius: isLargeScreen ? 60 : 50,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkmark: {
    fontSize: isLargeScreen ? 48 : 40,
    color: 'white',
    fontWeight: 'bold',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: isLargeScreen ? 60 : 48,
    paddingHorizontal: isLargeScreen ? 20 : 16,
  },
  title: {
    fontSize: isLargeScreen ? 32 : 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: isLargeScreen ? 16 : 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: isLargeScreen ? 18 : 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: isLargeScreen ? 28 : 24,
    fontWeight: '400',
  },
  proceedButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: isLargeScreen ? 18 : 16,
    paddingHorizontal: isLargeScreen ? 48 : 40,
    borderRadius: isLargeScreen ? 16 : 12,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: isLargeScreen ? 200 : 180,
  },
  proceedButtonText: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});