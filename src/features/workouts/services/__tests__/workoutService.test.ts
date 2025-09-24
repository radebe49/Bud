import { workoutService } from '../workoutService';
import { workoutAdaptationService } from '../workoutAdaptationService';
import type { HealthMetrics } from '../../../../shared/types/healthTypes';
import type { WorkoutGoal, Equipment } from '../../types/workoutTypes';

// Mock the adaptation service
jest.mock('../workoutAdaptationService');

describe('WorkoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendedWorkouts', () => {
    it('should return workout recommendations', async () => {
      const recommendations = await workoutService.getRecommendedWorkouts();
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Check structure of first recommendation
      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('workoutPlan');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('basedOn');
      }
    });
  });

  describe('getExerciseLibrary', () => {
    it('should return exercise library', async () => {
      const exercises = await workoutService.getExerciseLibrary();
      
      expect(exercises).toBeDefined();
      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBeGreaterThan(0);
      
      // Check structure of first exercise
      if (exercises.length > 0) {
        const exercise = exercises[0];
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('description');
        expect(exercise).toHaveProperty('category');
        expect(exercise).toHaveProperty('equipment');
        expect(exercise).toHaveProperty('difficulty');
        expect(exercise).toHaveProperty('duration');
        expect(exercise).toHaveProperty('caloriesPerMinute');
        expect(exercise).toHaveProperty('instructions');
        expect(exercise).toHaveProperty('muscleGroups');
        expect(exercise).toHaveProperty('modifications');
      }
    });
  });

  describe('generateWorkoutPlan', () => {
    it('should generate a workout plan based on parameters', async () => {
      const goals: WorkoutGoal[] = ['weight_loss', 'endurance'];
      const equipment: Equipment[] = ['none', 'dumbbells'];
      const fitnessLevel = 'intermediate';
      const availableTime = 45;
      const sessionsPerWeek = 4;

      const plan = await workoutService.generateWorkoutPlan(
        goals,
        equipment,
        fitnessLevel,
        availableTime,
        sessionsPerWeek
      );

      expect(plan).toBeDefined();
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('userId');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('description');
      expect(plan).toHaveProperty('weeklyGoals');
      expect(plan).toHaveProperty('dailyWorkouts');
      expect(plan).toHaveProperty('adaptations');
      expect(plan).toHaveProperty('progressMetrics');
      expect(plan).toHaveProperty('createdAt');
      expect(plan).toHaveProperty('updatedAt');
      expect(plan).toHaveProperty('isActive');

      // Check that goals are reflected in the plan
      expect(plan.weeklyGoals.length).toBeGreaterThan(0);
      expect(plan.name).toContain('weight loss');
      expect(plan.name).toContain('endurance');
    });

    it('should handle single goal', async () => {
      const goals: WorkoutGoal[] = ['strength'];
      const equipment: Equipment[] = ['dumbbells'];
      const fitnessLevel = 'beginner';
      const availableTime = 30;
      const sessionsPerWeek = 3;

      const plan = await workoutService.generateWorkoutPlan(
        goals,
        equipment,
        fitnessLevel,
        availableTime,
        sessionsPerWeek
      );

      expect(plan.name).toContain('strength');
      expect(plan.weeklyGoals.length).toBeGreaterThan(0);
    });
  });

  describe('adaptWorkout', () => {
    it('should adapt workout based on health metrics', async () => {
      const mockPlan = {
        id: 'test-plan',
        userId: 'test-user',
        name: 'Test Plan',
        description: 'Test Description',
        weeklyGoals: [],
        dailyWorkouts: [],
        adaptations: [],
        progressMetrics: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      const healthMetrics: HealthMetrics = {
        heartRate: 70,
        heartRateVariability: 25,
        sleepScore: 45, // Poor sleep
        recoveryScore: 35, // Low recovery
        stressLevel: 8, // High stress
        activityLevel: 60,
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

      const mockAdaptations = [
        {
          id: 'test-adaptation',
          reason: 'low_readiness' as const,
          changes: [{
            type: 'intensity_reduction' as const,
            description: 'Test adaptation',
            originalValue: 'high',
            newValue: 'low'
          }],
          appliedDate: new Date()
        }
      ];

      const mockAdaptedPlan = {
        ...mockPlan,
        adaptations: mockAdaptations,
        updatedAt: new Date()
      };

      // Mock the adaptation service methods
      (workoutAdaptationService.generateAdaptations as jest.Mock).mockReturnValue(mockAdaptations);
      (workoutAdaptationService.applyAdaptations as jest.Mock).mockReturnValue(mockAdaptedPlan);

      const adaptedPlan = await workoutService.adaptWorkout(mockPlan, healthMetrics);

      expect(workoutAdaptationService.generateAdaptations).toHaveBeenCalledWith(
        mockPlan,
        healthMetrics,
        undefined
      );
      expect(workoutAdaptationService.applyAdaptations).toHaveBeenCalledWith(
        mockPlan,
        mockAdaptations
      );
      expect(adaptedPlan).toEqual(mockAdaptedPlan);
    });

    it('should handle user feedback in adaptation', async () => {
      const mockPlan = {
        id: 'test-plan',
        userId: 'test-user',
        name: 'Test Plan',
        description: 'Test Description',
        weeklyGoals: [],
        dailyWorkouts: [],
        adaptations: [],
        progressMetrics: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      const healthMetrics: HealthMetrics = {
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

      const userFeedback = 'The workout was too hard';

      await workoutService.adaptWorkout(mockPlan, healthMetrics, userFeedback);

      expect(workoutAdaptationService.generateAdaptations).toHaveBeenCalledWith(
        mockPlan,
        healthMetrics,
        userFeedback
      );
    });
  });

  describe('getExercisesByCategory', () => {
    it('should filter exercises by category', async () => {
      const cardioExercises = await workoutService.getExercisesByCategory('cardio');
      
      expect(cardioExercises).toBeDefined();
      expect(Array.isArray(cardioExercises)).toBe(true);
      
      // All returned exercises should be cardio
      cardioExercises.forEach(exercise => {
        expect(exercise.category).toBe('cardio');
      });
    });

    it('should filter exercises by muscle groups', async () => {
      const chestExercises = await workoutService.getExercisesByCategory(
        undefined,
        ['chest']
      );
      
      expect(chestExercises).toBeDefined();
      expect(Array.isArray(chestExercises)).toBe(true);
      
      // All returned exercises should target chest
      chestExercises.forEach(exercise => {
        expect(exercise.muscleGroups).toContain('chest');
      });
    });

    it('should filter exercises by equipment', async () => {
      const dumbbellExercises = await workoutService.getExercisesByCategory(
        undefined,
        undefined,
        ['dumbbells']
      );
      
      expect(dumbbellExercises).toBeDefined();
      expect(Array.isArray(dumbbellExercises)).toBe(true);
      
      // All returned exercises should use dumbbells or no equipment
      dumbbellExercises.forEach(exercise => {
        expect(
          exercise.equipment.includes('dumbbells') || 
          exercise.equipment.includes('none')
        ).toBe(true);
      });
    });
  });

  describe('startWorkout', () => {
    it('should start a workout session', async () => {
      const workoutPlanId = 'morning-hiit';
      
      const session = await workoutService.startWorkout(workoutPlanId);
      
      expect(session).toBeDefined();
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('workoutPlanId', workoutPlanId);
      expect(session).toHaveProperty('workoutName');
      expect(session).toHaveProperty('startTime');
      expect(session).toHaveProperty('duration', 0);
      expect(session).toHaveProperty('caloriesBurned', 0);
      expect(session).toHaveProperty('exercises', []);
      expect(session).toHaveProperty('completed', false);
    });

    it('should throw error for invalid workout plan', async () => {
      const invalidWorkoutPlanId = 'non-existent-plan';
      
      await expect(workoutService.startWorkout(invalidWorkoutPlanId))
        .rejects.toThrow('Workout plan not found');
    });
  });

  describe('completeWorkout', () => {
    it('should complete a workout session', async () => {
      const sessionId = 'test-session';
      const sessionData = {
        workoutPlanId: 'morning-hiit',
        workoutName: 'Test Workout',
        startTime: new Date(),
        duration: 30,
        caloriesBurned: 300,
        exercises: [{
          exerciseId: 'test-exercise',
          exerciseName: 'Test Exercise',
          duration: 30
        }],
        rating: 4
      };

      const completedSession = await workoutService.completeWorkout(sessionId, sessionData);

      expect(completedSession).toBeDefined();
      expect(completedSession.id).toBe(sessionId);
      expect(completedSession.completed).toBe(true);
      expect(completedSession.endTime).toBeDefined();
      expect(completedSession.duration).toBe(sessionData.duration);
      expect(completedSession.caloriesBurned).toBe(sessionData.caloriesBurned);
      expect(completedSession.rating).toBe(sessionData.rating);
    });
  });

  describe('getWorkoutStreak', () => {
    it('should return workout streak information', async () => {
      const streak = await workoutService.getWorkoutStreak();
      
      expect(streak).toBeDefined();
      expect(streak).toHaveProperty('currentStreak');
      expect(streak).toHaveProperty('longestStreak');
      expect(streak).toHaveProperty('weeklyGoal');
      expect(streak).toHaveProperty('weeklyCompleted');
      expect(typeof streak.currentStreak).toBe('number');
      expect(typeof streak.longestStreak).toBe('number');
      expect(typeof streak.weeklyGoal).toBe('number');
      expect(typeof streak.weeklyCompleted).toBe('number');
    });
  });

  describe('getPerformanceTrends', () => {
    it('should return performance trends and insights', async () => {
      const trends = await workoutService.getPerformanceTrends('test-user', 'month');
      
      expect(trends).toBeDefined();
      expect(trends).toHaveProperty('trends');
      expect(trends).toHaveProperty('insights');
      expect(trends).toHaveProperty('recommendations');
      
      expect(Array.isArray(trends.trends)).toBe(true);
      expect(Array.isArray(trends.insights)).toBe(true);
      expect(Array.isArray(trends.recommendations)).toBe(true);
      
      // Check insights are strings
      trends.insights.forEach(insight => {
        expect(typeof insight).toBe('string');
      });
      
      // Check recommendations are strings
      trends.recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
      });
    });

    it('should handle different timeframes', async () => {
      const weekTrends = await workoutService.getPerformanceTrends('test-user', 'week');
      const quarterTrends = await workoutService.getPerformanceTrends('test-user', 'quarter');
      
      expect(weekTrends).toBeDefined();
      expect(quarterTrends).toBeDefined();
    });
  });

  describe('calculateReadinessScore', () => {
    it('should calculate readiness score from health metrics', async () => {
      const healthMetrics: HealthMetrics = {
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

      (workoutAdaptationService.calculateReadinessScore as jest.Mock).mockReturnValue(78);

      const readinessScore = await workoutService.calculateReadinessScore(healthMetrics);

      expect(workoutAdaptationService.calculateReadinessScore).toHaveBeenCalledWith(healthMetrics);
      expect(readinessScore).toBe(78);
      expect(typeof readinessScore).toBe('number');
    });
  });
});