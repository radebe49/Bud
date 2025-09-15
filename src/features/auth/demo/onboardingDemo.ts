/**
 * Demo script for testing onboarding flow functionality
 */

import { onboardingService } from '../services/onboardingService';
import { HealthGoal, Equipment, FitnessLevel } from '../types/authTypes';

export class OnboardingDemo {
  static async runDemo() {
    console.log('🚀 Starting Onboarding Demo...\n');

    try {
      // 1. Test goal options
      console.log('📋 Available Goals:');
      const goals = onboardingService.getGoalOptions();
      goals.forEach(goal => {
        console.log(`  ${goal.icon} ${goal.title}: ${goal.description}`);
      });
      console.log('');

      // 2. Test equipment options
      console.log('🏋️ Available Equipment:');
      const equipment = onboardingService.getEquipmentOptions();
      equipment.forEach(eq => {
        console.log(`  ${eq.icon} ${eq.title}: ${eq.description}`);
      });
      console.log('');

      // 3. Test fitness levels
      console.log('💪 Fitness Levels:');
      const levels = onboardingService.getFitnessLevelOptions();
      levels.forEach(level => {
        console.log(`  ${level.icon} ${level.title}: ${level.description}`);
      });
      console.log('');

      // 4. Test welcome message generation
      console.log('💬 Welcome Messages:');
      const testGoals: HealthGoal[][] = [
        [],
        ['lose_weight'],
        ['build_muscle', 'improve_fitness'],
        ['better_sleep', 'reduce_stress', 'increase_energy']
      ];

      testGoals.forEach((goalSet, index) => {
        const message = onboardingService.generateWelcomeMessage(goalSet);
        console.log(`  Scenario ${index + 1} (${goalSet.length} goals): "${message}"`);
      });
      console.log('');

      // 5. Test complete onboarding flow
      console.log('✅ Testing Complete Onboarding Flow...');
      
      const sampleOnboardingData = {
        goals: ['lose_weight', 'build_muscle'] as HealthGoal[],
        equipment: ['dumbbells', 'resistance_bands'] as Equipment[],
        fitnessLevel: 'intermediate' as FitnessLevel,
        preferences: {
          workoutDuration: 45,
          workoutFrequency: 4,
          preferredWorkoutTime: 'morning' as const,
          communicationStyle: 'encouraging' as const,
        },
        completed: true,
      };

      const userProfile = await onboardingService.completeOnboarding(sampleOnboardingData);
      console.log('  ✓ User profile created successfully');
      console.log(`  ✓ Profile ID: ${userProfile.id}`);
      console.log(`  ✓ Goals: ${userProfile.onboardingData.goals.join(', ')}`);
      console.log(`  ✓ Equipment: ${userProfile.onboardingData.equipment.join(', ')}`);
      console.log(`  ✓ Fitness Level: ${userProfile.onboardingData.fitnessLevel}`);
      console.log('');

      // 6. Test onboarding status check
      const isCompleted = await onboardingService.isOnboardingCompleted();
      console.log(`📊 Onboarding Status: ${isCompleted ? 'Completed' : 'Not Completed'}`);
      console.log('');

      // 7. Generate personalized welcome message
      const personalizedMessage = onboardingService.generateWelcomeMessage(userProfile.onboardingData.goals);
      console.log('🎯 Personalized Welcome Message:');
      console.log(`  "${personalizedMessage}"`);
      console.log('');

      console.log('🎉 Onboarding Demo Completed Successfully!');
      
      return {
        success: true,
        userProfile,
        personalizedMessage
      };

    } catch (error) {
      console.error('❌ Demo failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async resetDemo() {
    console.log('🔄 Resetting onboarding demo...');
    try {
      await onboardingService.resetOnboarding();
      console.log('✅ Demo reset successfully');
    } catch (error) {
      console.error('❌ Failed to reset demo:', error);
    }
  }
}

// Export for use in other files
export default OnboardingDemo;