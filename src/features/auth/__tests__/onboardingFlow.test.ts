/**
 * Test suite for onboarding flow functionality
 */

import { onboardingService } from '../services/onboardingService';
import { HealthGoal, Equipment, FitnessLevel } from '../types/authTypes';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock EncryptedStorage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('OnboardingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Goal Options', () => {
    it('should return valid goal options', () => {
      const goals = onboardingService.getGoalOptions();
      
      expect(goals).toHaveLength(6);
      expect(goals[0]).toHaveProperty('id');
      expect(goals[0]).toHaveProperty('title');
      expect(goals[0]).toHaveProperty('description');
      expect(goals[0]).toHaveProperty('icon');
      expect(goals[0]).toHaveProperty('color');
    });

    it('should include all expected goal types', () => {
      const goals = onboardingService.getGoalOptions();
      const goalIds = goals.map(g => g.id);
      
      expect(goalIds).toContain('lose_weight');
      expect(goalIds).toContain('build_muscle');
      expect(goalIds).toContain('improve_fitness');
      expect(goalIds).toContain('better_sleep');
      expect(goalIds).toContain('reduce_stress');
      expect(goalIds).toContain('increase_energy');
    });
  });

  describe('Equipment Options', () => {
    it('should return valid equipment options', () => {
      const equipment = onboardingService.getEquipmentOptions();
      
      expect(equipment.length).toBeGreaterThan(0);
      expect(equipment[0]).toHaveProperty('id');
      expect(equipment[0]).toHaveProperty('title');
      expect(equipment[0]).toHaveProperty('description');
      expect(equipment[0]).toHaveProperty('icon');
    });

    it('should include no equipment option', () => {
      const equipment = onboardingService.getEquipmentOptions();
      const equipmentIds = equipment.map(e => e.id);
      
      expect(equipmentIds).toContain('none');
    });
  });

  describe('Fitness Level Options', () => {
    it('should return valid fitness level options', () => {
      const levels = onboardingService.getFitnessLevelOptions();
      
      expect(levels).toHaveLength(3);
      expect(levels[0]).toHaveProperty('id');
      expect(levels[0]).toHaveProperty('title');
      expect(levels[0]).toHaveProperty('description');
      expect(levels[0]).toHaveProperty('icon');
    });

    it('should include all fitness levels', () => {
      const levels = onboardingService.getFitnessLevelOptions();
      const levelIds = levels.map(l => l.id);
      
      expect(levelIds).toContain('beginner');
      expect(levelIds).toContain('intermediate');
      expect(levelIds).toContain('advanced');
    });
  });

  describe('Welcome Message Generation', () => {
    it('should generate appropriate message for single goal', () => {
      const goals: HealthGoal[] = ['lose_weight'];
      const message = onboardingService.generateWelcomeMessage(goals);
      
      expect(message).toContain('weight goals');
      expect(message).toContain('journey together');
    });

    it('should generate appropriate message for multiple goals', () => {
      const goals: HealthGoal[] = ['lose_weight', 'build_muscle'];
      const message = onboardingService.generateWelcomeMessage(goals);
      
      expect(message).toContain('weight goals');
      expect(message).toContain('wellness goals');
    });

    it('should generate default message for no goals', () => {
      const goals: HealthGoal[] = [];
      const message = onboardingService.generateWelcomeMessage(goals);
      
      expect(message).toContain('health and wellness journey');
    });
  });

  describe('Onboarding Completion', () => {
    it('should complete onboarding with valid data', async () => {
      const onboardingData = {
        goals: ['lose_weight'] as HealthGoal[],
        equipment: ['dumbbells'] as Equipment[],
        fitnessLevel: 'intermediate' as FitnessLevel,
        preferences: {
          workoutDuration: 45,
          workoutFrequency: 4,
          preferredWorkoutTime: 'morning' as const,
          communicationStyle: 'encouraging' as const,
        },
        completed: true,
      };

      const userProfile = await onboardingService.completeOnboarding(onboardingData);
      
      expect(userProfile).toHaveProperty('id');
      expect(userProfile).toHaveProperty('onboardingData');
      expect(userProfile).toHaveProperty('createdAt');
      expect(userProfile).toHaveProperty('updatedAt');
      expect(userProfile.onboardingData.completed).toBe(true);
    });
  });
});