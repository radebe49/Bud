/**
 * AppInitializer - Handles app startup logic and routing
 * Checks onboarding status and routes to appropriate screen
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { onboardingService } from '../../features/auth/services/onboardingService';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if onboarding is completed
      const isOnboardingCompleted = await onboardingService.isOnboardingCompleted();
      
      if (!isOnboardingCompleted) {
        // Navigate to onboarding if not completed
        router.replace('/onboarding' as any);
      } else {
        // Navigate to main app if onboarding is completed
        router.replace('/(tabs)');
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      // Default to onboarding on error
      router.replace('/onboarding' as any);
      setIsInitialized(true);
    }
  };

  if (!isInitialized) {
    // Show loading screen while checking onboarding status
    return (
      <View style={styles.loadingContainer}>
        {/* You could add a loading spinner here */}
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#4ECDC4', // Match onboarding gradient start color
  },
});