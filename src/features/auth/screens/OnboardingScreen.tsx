/**
 * OnboardingScreen - Main screen that wraps the onboarding flow
 * This screen will be shown when the user first opens the app
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { router } from 'expo-router';

export const OnboardingScreen: React.FC = () => {
  const handleOnboardingComplete = (_userProfile: any) => {
    // Navigate to the main app after onboarding completion
    // The app will transition to the main tabs
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});