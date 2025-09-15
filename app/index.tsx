/**
 * App entry point - Handles splash screen and initial routing
 */

import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { authService } from '../src/features/auth/services/authService';
import { onboardingService } from '../src/features/auth/services/onboardingService';
import { SplashScreen } from '../src/shared/components/SplashScreen';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Show splash screen for at least 2 seconds
      const splashPromise = new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check authentication and onboarding status
      const [currentUser] = await Promise.all([
        authService.getCurrentUser(),
        splashPromise
      ]);

      if (currentUser) {
        // User is authenticated, check if they've completed onboarding
        const isOnboardingCompleted = await onboardingService.isOnboardingCompleted();
        
        if (isOnboardingCompleted) {
          // Existing user with completed onboarding - go to main app
          router.replace('/(tabs)');
        } else {
          // Authenticated but onboarding not complete - go to onboarding
          router.replace('/onboarding' as any);
        }
      } else {
        // No authenticated user - go to auth flow
        router.replace('/auth' as any);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      // Default to auth flow on error
      router.replace('/auth' as any);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return null;
}