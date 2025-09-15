/**
 * Main onboarding flow screen that includes authentication and setup
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthScreen } from './AuthScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { PaywallScreen } from './PaywallScreen';
import { GoalSelectionScreen } from './GoalSelectionScreen';
import { SetupScreen } from './SetupScreen';
import { authService } from '../services/authService';
import { onboardingService } from '../services/onboardingService';
import { mockRevenueCatService } from '../services/mockRevenueCatService';
import { AuthUser, OnboardingData } from '../types/authTypes';

interface OnboardingFlowScreenProps {
  onComplete: (user: AuthUser, profile: any) => void;
}

type OnboardingStep = 'welcome' | 'auth' | 'goals' | 'setup' | 'paywall' | 'complete';

export const OnboardingFlowScreen: React.FC<OnboardingFlowScreenProps> = ({
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  useEffect(() => {
    // Check if user is already authenticated and subscribed
    checkAuthAndSubscriptionStatus();
  }, []);

  const checkAuthAndSubscriptionStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        
        // Check if onboarding is completed
        const isOnboarded = await onboardingService.isOnboardingCompleted();
        if (isOnboarded) {
          // Check subscription status
          const hasSubscription = await mockRevenueCatService.hasActiveSubscription();
          if (hasSubscription) {
            // User is already onboarded and subscribed, complete the flow
            const profile = await onboardingService.getOnboardingData();
            onComplete(user, profile);
          } else {
            // User completed onboarding but not subscribed, show paywall
            setCurrentStep('paywall');
          }
        } else {
          // User is authenticated but not onboarded, start with goals
          setCurrentStep('goals');
        }
      }
    } catch (error) {
      console.error('Error checking auth and subscription status:', error);
    }
  };

  const handleWelcomeContinue = () => {
    setCurrentStep('auth');
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentStep('goals');
  };

  const handleSubscriptionSuccess = async () => {
    // After subscription, complete the flow
    if (currentUser) {
      try {
        // Get the completed onboarding data
        const profile = await onboardingService.getOnboardingData();
        onComplete(currentUser, profile);
      } catch (error) {
        console.error('Error completing flow after subscription:', error);
      }
    }
  };

  const handleGoalsComplete = (goals: any) => {
    setOnboardingData(prev => ({ ...prev, goals }));
    setCurrentStep('setup');
  };

  const handleSetupComplete = async (setupData: any) => {
    try {
      const finalData: OnboardingData = {
        ...onboardingData,
        ...setupData,
        completed: true
      } as OnboardingData;

      // Save onboarding data and proceed to paywall
      setOnboardingData(finalData);
      
      // Complete onboarding first
      const profile = await onboardingService.completeOnboarding(
        finalData,
        currentUser?.email || ''
      );

      // Now show paywall as the final step
      setCurrentStep('paywall');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Handle error appropriately
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onContinue={handleWelcomeContinue} />;
      
      case 'auth':
        return (
          <AuthScreen
            onAuthSuccess={handleAuthSuccess}
            initialMode="signup"
          />
        );
      
      case 'goals':
        return (
          <GoalSelectionScreen
            onComplete={handleGoalsComplete}
            onBack={() => setCurrentStep('auth')}
          />
        );
      
      case 'setup':
        return (
          <SetupScreen
            onComplete={handleSetupComplete}
            onBack={() => setCurrentStep('goals')}
            selectedGoals={onboardingData.goals || []}
          />
        );
      
      case 'paywall':
        return (
          <PaywallScreen
            onSubscriptionSuccess={handleSubscriptionSuccess}
            onRestore={handleSubscriptionSuccess}
          />
        );
      
      default:
        return <WelcomeScreen onContinue={handleWelcomeContinue} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});