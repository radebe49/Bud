/**
 * OnboardingFlow - Main component that orchestrates the 3-screen onboarding process
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { GoalSelectionScreen } from '../screens/GoalSelectionScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { onboardingService } from '../services/onboardingService';
import { HealthGoal, Equipment, FitnessLevel, OnboardingData, UserPreferences } from '../types/authTypes';

interface OnboardingFlowProps {
  onComplete: (userProfile: any) => void;
}

type OnboardingStep = 'welcome' | 'goals' | 'setup' | 'paywall';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  const handleWelcomeContinue = () => {
    setCurrentStep('goals');
  };

  const handleGoalsSelected = async (selectedGoals: HealthGoal[]) => {
    const updatedData = {
      ...onboardingData,
      goals: selectedGoals,
    };
    setOnboardingData(updatedData);
    
    // Save progress
    await onboardingService.saveOnboardingData(updatedData);
    
    setCurrentStep('setup');
  };

  const handleSetupComplete = async (equipment: Equipment[], fitnessLevel: FitnessLevel) => {
    // Create default preferences
    const preferences: UserPreferences = {
      workoutDuration: fitnessLevel === 'beginner' ? 30 : fitnessLevel === 'intermediate' ? 45 : 60,
      workoutFrequency: fitnessLevel === 'beginner' ? 3 : fitnessLevel === 'intermediate' ? 4 : 5,
      preferredWorkoutTime: 'flexible',
      communicationStyle: 'encouraging',
    };

    const updatedData = {
      ...onboardingData,
      equipment,
      fitnessLevel,
      preferences,
    };
    setOnboardingData(updatedData);
    
    // Save progress and move to paywall
    await onboardingService.saveOnboardingData(updatedData);
    setCurrentStep('paywall');
  };

  const handlePaywallComplete = async () => {
    const finalData: OnboardingData = {
      ...onboardingData,
      completed: true,
    } as OnboardingData;

    try {
      // Complete onboarding and create user profile
      const userProfile = await onboardingService.completeOnboarding(finalData);
      onComplete(userProfile);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Handle error - could show error message to user
    }
  };

  const handleBackToWelcome = () => {
    setCurrentStep('welcome');
  };

  const handleBackToGoals = () => {
    setCurrentStep('goals');
  };

  const handleBackToSetup = () => {
    setCurrentStep('setup');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onContinue={handleWelcomeContinue} />;
      
      case 'goals':
        return (
          <GoalSelectionScreen
            onContinue={handleGoalsSelected}
            onBack={handleBackToWelcome}
          />
        );
      
      case 'setup':
        return (
          <SetupScreen
            onComplete={handleSetupComplete}
            onBack={handleBackToGoals}
          />
        );
      
      case 'paywall':
        return (
          <PaywallScreen
            onPurchase={handlePaywallComplete}
            onBack={handleBackToSetup}
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