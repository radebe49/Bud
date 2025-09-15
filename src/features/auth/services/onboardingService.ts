/**
 * Onboarding service for managing user setup flow
 */

import { storageService, STORAGE_KEYS } from '../../../shared/services/storageService';
import { 
  OnboardingData, 
  UserProfile, 
  HealthGoal, 
  Equipment, 
  FitnessLevel,
  GoalOption,
  EquipmentOption,
  FitnessLevelOption
} from '../types/authTypes';

class OnboardingService {
  // Goal options with visual data
  getGoalOptions(): GoalOption[] {
    return [
      {
        id: 'lose_weight',
        title: 'Lose Weight',
        description: 'Burn calories and shed pounds with personalized plans',
        icon: '⚖️',
        color: '#FF6B6B'
      },
      {
        id: 'build_muscle',
        title: 'Build Muscle',
        description: 'Gain strength and muscle mass with targeted workouts',
        icon: '💪',
        color: '#4ECDC4'
      },
      {
        id: 'improve_fitness',
        title: 'Improve Fitness',
        description: 'Boost your overall health and cardiovascular endurance',
        icon: '🏃‍♂️',
        color: '#45B7D1'
      },
      {
        id: 'better_sleep',
        title: 'Better Sleep',
        description: 'Optimize your sleep quality and recovery',
        icon: '😴',
        color: '#96CEB4'
      },
      {
        id: 'reduce_stress',
        title: 'Reduce Stress',
        description: 'Find balance and manage stress through wellness practices',
        icon: '🧘‍♀️',
        color: '#FFEAA7'
      },
      {
        id: 'increase_energy',
        title: 'Increase Energy',
        description: 'Feel more energized throughout your day',
        icon: '⚡',
        color: '#FD79A8'
      }
    ];
  }

  // Equipment options with visual data
  getEquipmentOptions(): EquipmentOption[] {
    return [
      {
        id: 'none',
        title: 'No Equipment',
        description: 'Bodyweight exercises only',
        icon: '🤸‍♂️'
      },
      {
        id: 'dumbbells',
        title: 'Dumbbells',
        description: 'Adjustable or fixed weight dumbbells',
        icon: '🏋️‍♂️'
      },
      {
        id: 'resistance_bands',
        title: 'Resistance Bands',
        description: 'Portable and versatile training bands',
        icon: '🎯'
      },
      {
        id: 'kettlebells',
        title: 'Kettlebells',
        description: 'Full-body functional training',
        icon: '⚫'
      },
      {
        id: 'yoga_mat',
        title: 'Yoga Mat',
        description: 'For yoga, stretching, and floor exercises',
        icon: '🧘‍♀️'
      },
      {
        id: 'pull_up_bar',
        title: 'Pull-up Bar',
        description: 'Door-mounted or standalone bar',
        icon: '🏗️'
      }
    ];
  }

  // Fitness level options
  getFitnessLevelOptions(): FitnessLevelOption[] {
    return [
      {
        id: 'beginner',
        title: 'Beginner',
        description: 'New to fitness or returning after a break',
        icon: '🌱'
      },
      {
        id: 'intermediate',
        title: 'Intermediate',
        description: 'Regular exercise routine, comfortable with basics',
        icon: '🌿'
      },
      {
        id: 'advanced',
        title: 'Advanced',
        description: 'Experienced with complex movements and high intensity',
        icon: '🌳'
      }
    ];
  }

  // Save onboarding data
  async saveOnboardingData(data: Partial<OnboardingData>): Promise<void> {
    try {
      const existingData = await this.getOnboardingData();
      const updatedData = { ...existingData, ...data };
      await storageService.setItem(STORAGE_KEYS.USER_PROFILE, updatedData);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw new Error('Failed to save onboarding progress');
    }
  }

  // Get current onboarding data
  async getOnboardingData(): Promise<Partial<OnboardingData>> {
    try {
      const data = await storageService.getItem<Partial<OnboardingData>>(STORAGE_KEYS.USER_PROFILE);
      return data || {};
    } catch (error) {
      console.error('Error retrieving onboarding data:', error);
      return {};
    }
  }

  // Complete onboarding and create user profile
  async completeOnboarding(finalData: OnboardingData, userEmail?: string): Promise<UserProfile> {
    try {
      // For MVP, we'll use a default email if none provided
      const email = userEmail || 'user@budhealth.app';

      const userProfile: UserProfile = {
        id: Date.now().toString(), // Simple ID generation for MVP
        email: email,
        onboardingData: { ...finalData, completed: true },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save user profile
      await storageService.setUserProfile(userProfile);
      
      // Mark onboarding as completed
      await storageService.setOnboardingCompleted(true);

      return userProfile;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw new Error('Failed to complete onboarding');
    }
  }

  // Check if onboarding is completed
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      return await storageService.isOnboardingCompleted();
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  // Reset onboarding (for demo purposes)
  async resetOnboarding(): Promise<void> {
    try {
      await storageService.removeItem(STORAGE_KEYS.USER_PROFILE);
      await storageService.setOnboardingCompleted(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw new Error('Failed to reset onboarding');
    }
  }

  // Generate personalized welcome message based on goals
  generateWelcomeMessage(goals: HealthGoal[]): string {
    const goalMessages = {
      lose_weight: "help you reach your weight goals",
      build_muscle: "build strength and muscle",
      improve_fitness: "boost your fitness level",
      better_sleep: "improve your sleep quality",
      reduce_stress: "find balance and reduce stress",
      increase_energy: "boost your energy levels"
    };

    if (goals.length === 0) {
      return "I'm here to support your health and wellness journey!";
    }

    if (goals.length === 1) {
      return `I'm excited to ${goalMessages[goals[0]]}! Let's start this journey together.`;
    }

    const primaryGoal = goals[0];
    return `I'm here to ${goalMessages[primaryGoal]} and support all your wellness goals. Ready to get started?`;
  }
}

export const onboardingService = new OnboardingService();