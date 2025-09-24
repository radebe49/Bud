import { workoutAdaptationService } from '../workoutAdaptationService';
import type { HealthMetrics } from '../../../../shared/types/healthTypes';
import type { WorkoutPlan, Exercise } from '../../types/workoutTypes';

describe('WorkoutAdaptationService', () => {
  const mockHealthMetrics: HealthMetrics = {
    heartRate: 70,
    heartRateVariability: 45,
    sleepScore: 80,
    recoveryScore: 75,
    stressLevel: 4,
    activityLevel: 70,
    caloriesConsumed: 2000,
    caloriesBurned: 400,
    waterIntake: 2000,
    macronutrients: {
      protein: 100,
      carbohydrates: 200,
      fats: 70,
      fiber: 25,
      sugar: 50
    },
    timestamp: new Date()
  };

  const mockWorkoutPlan: WorkoutPlan = {
    id: 'test-plan',
    userId: 'test-user',
    name: 'Test Plan',
    description: 'Test Description',
    weeklyGoals: [],
    dailyWorkouts: [{
      id: 'daily-1',
      date: new Date(),
      exercises: [],
      duration: 45,
      intensity: 'high',
      completed: false
    }],
    adaptations: [],
    progressMetrics: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  };

  describe('analyzeHealthMetrics', () => {
    it('should identify no adaptations needed for good metrics', () => {
      const goodMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 80,
        sleepScore: 85,
        stressLevel: 3,
        heartRateVariability: 50
      };

      const analysis = workoutAdaptationService.analyzeHealthMetrics(goodMetrics);

      expect(analysis.needsAdaptation).toBe(false);
      expect(analysis.reasons).toHaveLength(0);
      expect(analysis.severity).toBe('low');
    });

    it('should identify low readiness from poor recovery score', () => {
      const poorRecoveryMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 35 // Poor recovery
      };

      const analysis = workoutAdaptationService.analyzeHealthMetrics(poorRecoveryMetrics);

      expect(analysis.needsAdaptation).toBe(true);
      expect(analysis.reasons).toContain('low_readiness');
      expect(analysis.severity).toBe('high');
    });

    it('should identify poor sleep adaptation need', () => {
      const poorSleepMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        sleepScore: 45 // Poor sleep
      };

      const analysis = workoutAdaptationService.analyzeHealthMetrics(poorSleepMetrics);

      expect(analysis.needsAdaptation).toBe(true);
      expect(analysis.reasons).toContain('poor_sleep');
      expect(analysis.severity).toBe('high');
    });

    it('should identify high stress adaptation need', () => {
      const highStressMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        stressLevel: 9 // High stress
      };

      const analysis = workoutAdaptationService.analyzeHealthMetrics(highStressMetrics);

      expect(analysis.needsAdaptation).toBe(true);
      expect(analysis.reasons).toContain('high_stress');
      expect(analysis.severity).toBe('high');
    });

    it('should identify overtraining from low HRV', () => {
      const lowHrvMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        heartRateVariability: 15 // Low HRV
      };

      const analysis = workoutAdaptationService.analyzeHealthMetrics(lowHrvMetrics);

      expect(analysis.needsAdaptation).toBe(true);
      expect(analysis.reasons).toContain('overtraining');
      expect(analysis.severity).toBe('high');
    });

    it('should handle multiple adaptation reasons', () => {
      const multipleIssuesMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 35, // Poor recovery
        sleepScore: 45, // Poor sleep
        stressLevel: 8 // High stress
      };

      const analysis = workoutAdaptationService.analyzeHealthMetrics(multipleIssuesMetrics);

      expect(analysis.needsAdaptation).toBe(true);
      expect(analysis.reasons).toContain('low_readiness');
      expect(analysis.reasons).toContain('poor_sleep');
      expect(analysis.reasons).toContain('high_stress');
      expect(analysis.severity).toBe('high');
    });

    it('should set moderate severity for borderline metrics', () => {
      const moderateMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 55, // Moderate recovery
        sleepScore: 65, // Moderate sleep
        stressLevel: 6 // Moderate stress
      };

      const analysis = workoutAdaptationService.analyzeHealthMetrics(moderateMetrics);

      expect(analysis.needsAdaptation).toBe(true);
      expect(analysis.severity).toBe('moderate');
    });
  });

  describe('generateAdaptations', () => {
    it('should generate no adaptations for good health metrics', () => {
      const goodMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 80,
        sleepScore: 85,
        stressLevel: 3,
        heartRateVariability: 50
      };

      const adaptations = workoutAdaptationService.generateAdaptations(
        mockWorkoutPlan,
        goodMetrics
      );

      expect(adaptations).toHaveLength(0);
    });

    it('should generate adaptations for poor health metrics', () => {
      const poorMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 35,
        sleepScore: 45,
        stressLevel: 8
      };

      const adaptations = workoutAdaptationService.generateAdaptations(
        mockWorkoutPlan,
        poorMetrics
      );

      expect(adaptations.length).toBeGreaterThan(0);
      
      // Should have adaptations for each identified issue
      const reasons = adaptations.map(a => a.reason);
      expect(reasons).toContain('low_readiness');
      expect(reasons).toContain('poor_sleep');
      expect(reasons).toContain('high_stress');
    });

    it('should generate adaptation from user feedback', () => {
      const goodMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 80,
        sleepScore: 85,
        stressLevel: 3
      };

      const userFeedback = 'The workout was too hard for me';

      const adaptations = workoutAdaptationService.generateAdaptations(
        mockWorkoutPlan,
        goodMetrics,
        userFeedback
      );

      expect(adaptations.length).toBeGreaterThan(0);
      expect(adaptations[0].reason).toBe('low_readiness');
      expect(adaptations[0].changes[0].type).toBe('intensity_reduction');
    });

    it('should handle time constraint feedback', () => {
      const adaptations = workoutAdaptationService.generateAdaptations(
        mockWorkoutPlan,
        mockHealthMetrics,
        'I dont have enough time for this workout'
      );

      expect(adaptations.length).toBeGreaterThan(0);
      expect(adaptations[0].reason).toBe('time_constraint');
      expect(adaptations[0].changes[0].type).toBe('duration_reduction');
    });

    it('should handle injury feedback', () => {
      const adaptations = workoutAdaptationService.generateAdaptations(
        mockWorkoutPlan,
        mockHealthMetrics,
        'I have a knee injury and this exercise causes pain'
      );

      expect(adaptations.length).toBeGreaterThan(0);
      expect(adaptations[0].reason).toBe('injury');
      expect(adaptations[0].changes[0].type).toBe('exercise_substitution');
    });
  });

  describe('applyAdaptations', () => {
    it('should apply intensity reduction adaptation', () => {
      const adaptation = {
        id: 'test-adaptation',
        reason: 'low_readiness' as const,
        changes: [{
          type: 'intensity_reduction' as const,
          description: 'Reduce intensity',
          originalValue: 'high',
          newValue: 'moderate'
        }],
        appliedDate: new Date()
      };

      const adaptedPlan = workoutAdaptationService.applyAdaptations(
        mockWorkoutPlan,
        [adaptation]
      );

      expect(adaptedPlan.dailyWorkouts[0].intensity).toBe('moderate');
      expect(adaptedPlan.adaptations).toContain(adaptation);
      expect(adaptedPlan.updatedAt).toBeDefined();
    });

    it('should apply duration reduction adaptation', () => {
      const adaptation = {
        id: 'test-adaptation',
        reason: 'poor_sleep' as const,
        changes: [{
          type: 'duration_reduction' as const,
          description: 'Reduce duration',
          originalValue: '45 min',
          newValue: '30 min'
        }],
        appliedDate: new Date()
      };

      const adaptedPlan = workoutAdaptationService.applyAdaptations(
        mockWorkoutPlan,
        [adaptation]
      );

      // Duration should be reduced (75% of original for 30 min target)
      expect(adaptedPlan.dailyWorkouts[0].duration).toBeLessThan(mockWorkoutPlan.dailyWorkouts[0].duration);
      expect(adaptedPlan.adaptations).toContain(adaptation);
    });

    it('should apply rest day adaptation', () => {
      const adaptation = {
        id: 'test-adaptation',
        reason: 'overtraining' as const,
        changes: [{
          type: 'rest_day' as const,
          description: 'Convert to rest day',
          originalValue: 'Planned workout',
          newValue: 'Rest day'
        }],
        appliedDate: new Date()
      };

      const adaptedPlan = workoutAdaptationService.applyAdaptations(
        mockWorkoutPlan,
        [adaptation]
      );

      expect(adaptedPlan.dailyWorkouts[0].exercises).toHaveLength(0);
      expect(adaptedPlan.dailyWorkouts[0].duration).toBe(0);
      expect(adaptedPlan.dailyWorkouts[0].intensity).toBe('low');
      expect(adaptedPlan.dailyWorkouts[0].adaptedFor).toBe('overtraining');
    });
  });

  describe('calculateReadinessScore', () => {
    it('should calculate high readiness score for good metrics', () => {
      const goodMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 90,
        sleepScore: 85,
        stressLevel: 2,
        heartRateVariability: 60,
        activityLevel: 80
      };

      const readinessScore = workoutAdaptationService.calculateReadinessScore(goodMetrics);

      expect(readinessScore).toBeGreaterThan(70);
      expect(readinessScore).toBeLessThanOrEqual(100);
    });

    it('should calculate low readiness score for poor metrics', () => {
      const poorMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 30,
        sleepScore: 40,
        stressLevel: 9,
        heartRateVariability: 15,
        activityLevel: 20
      };

      const readinessScore = workoutAdaptationService.calculateReadinessScore(poorMetrics);

      expect(readinessScore).toBeLessThan(50);
      expect(readinessScore).toBeGreaterThanOrEqual(0);
    });

    it('should return score between 0 and 100', () => {
      const extremeMetrics: HealthMetrics = {
        ...mockHealthMetrics,
        recoveryScore: 0,
        sleepScore: 0,
        stressLevel: 10,
        heartRateVariability: 0,
        activityLevel: 0
      };

      const readinessScore = workoutAdaptationService.calculateReadinessScore(extremeMetrics);

      expect(readinessScore).toBeGreaterThanOrEqual(0);
      expect(readinessScore).toBeLessThanOrEqual(100);
    });
  });

  describe('getAlternativeExercises', () => {
    const mockExercise: Exercise = {
      id: 'test-exercise',
      name: 'Test Exercise',
      description: 'Test description',
      category: 'strength',
      equipment: ['dumbbells'],
      difficulty: 'intermediate',
      duration: 30,
      caloriesPerMinute: 8,
      instructions: ['Step 1', 'Step 2'],
      muscleGroups: ['chest', 'shoulders'],
      modifications: []
    };

    it('should return knee injury alternatives', () => {
      const alternatives = workoutAdaptationService.getAlternativeExercises(
        mockExercise,
        'knee_injury'
      );

      expect(alternatives.length).toBeGreaterThan(0);
      expect(alternatives[0].name).toContain('Seated');
      expect(alternatives[0].description).toContain('seated');
    });

    it('should return back injury alternatives', () => {
      const alternatives = workoutAdaptationService.getAlternativeExercises(
        mockExercise,
        'back_injury'
      );

      expect(alternatives.length).toBeGreaterThan(0);
      expect(alternatives[0].name).toContain('Low Impact');
      expect(alternatives[0].category).toBe('cardio');
    });

    it('should return shoulder injury alternatives', () => {
      const alternatives = workoutAdaptationService.getAlternativeExercises(
        mockExercise,
        'shoulder_injury'
      );

      expect(alternatives.length).toBeGreaterThan(0);
      expect(alternatives[0].name).toContain('Lower Body');
      expect(alternatives[0].muscleGroups).not.toContain('shoulders');
    });

    it('should return empty array for unknown injury type', () => {
      const alternatives = workoutAdaptationService.getAlternativeExercises(
        mockExercise,
        'unknown_injury'
      );

      expect(alternatives).toHaveLength(0);
    });

    it('should preserve original exercise properties in alternatives', () => {
      const alternatives = workoutAdaptationService.getAlternativeExercises(
        mockExercise,
        'knee_injury'
      );

      expect(alternatives.length).toBeGreaterThan(0);
      expect(alternatives[0].duration).toBe(mockExercise.duration);
      expect(alternatives[0].difficulty).toBe(mockExercise.difficulty);
    });
  });
});