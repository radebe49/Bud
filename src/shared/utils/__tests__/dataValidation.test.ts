/**
 * Unit tests for data validation utilities
 * Tests all validation functions for core data models
 */

import {
  validateHealthMetrics,
  validateMacroNutrients,
  validateUserProfile,
  validatePersonalInfo,
  validateUserGoals,
  validateFoodItem,
  validateMealEntry,
  validateSleepData,
  validateExercise,
  validateChatMessage,
  validateRequiredFields,
  validateDateRange,
  ValidationResult
} from '../dataValidation';

import type { HealthMetrics, MacroNutrients } from '../../types/healthTypes';
import type { PersonalInfo } from '../../types/userTypes';
import type { FoodItem, MealEntry } from '../../../features/nutrition/types/nutritionTypes';
import type { SleepData } from '../../../features/sleep/types/sleepTypes';
import type { Exercise } from '../../../features/workouts/types/workoutTypes';
import type { ChatMessage } from '../../../features/coaching/types/conversationTypes';

describe('Data Validation Tests', () => {
  
  describe('validateHealthMetrics', () => {
    it('should validate correct health metrics', () => {
      const validMetrics: Partial<HealthMetrics> = {
        heartRate: 75,
        heartRateVariability: 45,
        sleepScore: 85,
        stressLevel: 3,
        waterIntake: 2000,
        macronutrients: {
          protein: 120,
          carbohydrates: 250,
          fats: 80,
          fiber: 25,
          sugar: 50
        }
      };

      const result = validateHealthMetrics(validMetrics);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid heart rate', () => {
      const invalidMetrics: Partial<HealthMetrics> = {
        heartRate: 250 // Too high
      };

      const result = validateHealthMetrics(invalidMetrics);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('heartRate');
      expect(result.errors[0].code).toBe('INVALID_HEART_RATE');
    });

    it('should reject invalid sleep score', () => {
      const invalidMetrics: Partial<HealthMetrics> = {
        sleepScore: 150 // Too high
      };

      const result = validateHealthMetrics(invalidMetrics);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('sleepScore');
    });

    it('should reject invalid water intake', () => {
      const invalidMetrics: Partial<HealthMetrics> = {
        waterIntake: -100 // Negative
      };

      const result = validateHealthMetrics(invalidMetrics);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('waterIntake');
    });
  });

  describe('validateMacroNutrients', () => {
    it('should validate correct macronutrients', () => {
      const validMacros: MacroNutrients = {
        protein: 120,
        carbohydrates: 250,
        fats: 80,
        fiber: 25,
        sugar: 50
      };

      const result = validateMacroNutrients(validMacros);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative protein', () => {
      const invalidMacros: Partial<MacroNutrients> = {
        protein: -10
      };

      const result = validateMacroNutrients(invalidMacros);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('protein');
    });

    it('should reject excessive carbohydrates', () => {
      const invalidMacros: Partial<MacroNutrients> = {
        carbohydrates: 1500 // Too high
      };

      const result = validateMacroNutrients(invalidMacros);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('carbohydrates');
    });
  });

  describe('validatePersonalInfo', () => {
    it('should validate correct personal info', () => {
      const validInfo: PersonalInfo = {
        age: 30,
        gender: 'male',
        height: 175,
        weight: 70,
        activityLevel: 'moderately_active',
        timezone: 'America/New_York'
      };

      const result = validatePersonalInfo(validInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid age', () => {
      const invalidInfo: Partial<PersonalInfo> = {
        age: 10 // Too young
      };

      const result = validatePersonalInfo(invalidInfo);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('age');
      expect(result.errors[0].code).toBe('INVALID_AGE');
    });

    it('should reject invalid height', () => {
      const invalidInfo: Partial<PersonalInfo> = {
        height: 50 // Too short
      };

      const result = validatePersonalInfo(invalidInfo);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('height');
    });

    it('should reject invalid gender', () => {
      const invalidInfo: Partial<PersonalInfo> = {
        gender: 'invalid' as any
      };

      const result = validatePersonalInfo(invalidInfo);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('gender');
      expect(result.errors[0].code).toBe('INVALID_GENDER');
    });
  });

  describe('validateFoodItem', () => {
    it('should validate correct food item', () => {
      const validFood: Partial<FoodItem> = {
        name: 'Apple',
        quantity: 1,
        calories: 95,
        macros: {
          protein: 0.5,
          carbohydrates: 25,
          fats: 0.3,
          fiber: 4,
          sugar: 19
        }
      };

      const result = validateFoodItem(validFood);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing name', () => {
      const invalidFood: Partial<FoodItem> = {
        quantity: 1,
        calories: 95
      };

      const result = validateFoodItem(invalidFood);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should reject invalid quantity', () => {
      const invalidFood: Partial<FoodItem> = {
        name: 'Apple',
        quantity: -1 // Negative
      };

      const result = validateFoodItem(invalidFood);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('quantity');
    });

    it('should reject excessive calories', () => {
      const invalidFood: Partial<FoodItem> = {
        name: 'Apple',
        calories: 15000 // Too high
      };

      const result = validateFoodItem(invalidFood);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('calories');
    });
  });

  describe('validateMealEntry', () => {
    it('should validate correct meal entry', () => {
      const validMeal: Partial<MealEntry> = {
        mealType: 'breakfast',
        foods: [{
          id: '1',
          name: 'Oatmeal',
          quantity: 1,
          unit: 'cup',
          calories: 150,
          macros: {
            protein: 5,
            carbohydrates: 27,
            fats: 3,
            fiber: 4,
            sugar: 1
          },
          servingSize: { amount: 1, unit: 'cup' },
          foodCategory: 'grains',
          verified: true
        }]
      };

      const result = validateMealEntry(validMeal);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid meal type', () => {
      const invalidMeal: Partial<MealEntry> = {
        mealType: 'invalid_meal' as any
      };

      const result = validateMealEntry(invalidMeal);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('mealType');
      expect(result.errors[0].code).toBe('INVALID_MEAL_TYPE');
    });
  });

  describe('validateSleepData', () => {
    it('should validate correct sleep data', () => {
      const bedtime = new Date('2024-01-01T22:00:00');
      const wakeTime = new Date('2024-01-02T07:00:00');
      
      const validSleep: Partial<SleepData> = {
        bedtime,
        wakeTime,
        totalSleepTime: 480, // 8 hours
        sleepEfficiency: 85,
        sleepQuality: 8
      };

      const result = validateSleepData(validSleep);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject wake time before bedtime', () => {
      const bedtime = new Date('2024-01-01T22:00:00');
      const wakeTime = new Date('2024-01-01T21:00:00'); // Before bedtime
      
      const invalidSleep: Partial<SleepData> = {
        bedtime,
        wakeTime
      };

      const result = validateSleepData(invalidSleep);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('wakeTime');
      expect(result.errors[0].code).toBe('INVALID_SLEEP_TIMES');
    });

    it('should reject invalid sleep efficiency', () => {
      const invalidSleep: Partial<SleepData> = {
        sleepEfficiency: 150 // Over 100%
      };

      const result = validateSleepData(invalidSleep);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('sleepEfficiency');
    });
  });

  describe('validateExercise', () => {
    it('should validate correct exercise', () => {
      const validExercise: Partial<Exercise> = {
        name: 'Push-ups',
        duration: 15,
        caloriesPerMinute: 8,
        difficulty: 'intermediate'
      };

      const result = validateExercise(validExercise);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing name', () => {
      const invalidExercise: Partial<Exercise> = {
        duration: 15
      };

      const result = validateExercise(invalidExercise);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should reject invalid duration', () => {
      const invalidExercise: Partial<Exercise> = {
        name: 'Push-ups',
        duration: 400 // Too long
      };

      const result = validateExercise(invalidExercise);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('duration');
    });

    it('should reject invalid difficulty', () => {
      const invalidExercise: Partial<Exercise> = {
        name: 'Push-ups',
        difficulty: 'expert' as any
      };

      const result = validateExercise(invalidExercise);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('difficulty');
      expect(result.errors[0].code).toBe('INVALID_DIFFICULTY');
    });
  });

  describe('validateChatMessage', () => {
    it('should validate correct chat message', () => {
      const validMessage: Partial<ChatMessage> = {
        content: 'Hello, how are you feeling today?',
        sender: 'bud',
        messageType: 'question'
      };

      const result = validateChatMessage(validMessage);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty content', () => {
      const invalidMessage: Partial<ChatMessage> = {
        content: '',
        sender: 'user'
      };

      const result = validateChatMessage(invalidMessage);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('content');
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should reject content that is too long', () => {
      const invalidMessage: Partial<ChatMessage> = {
        content: 'a'.repeat(5001), // Too long
        sender: 'user'
      };

      const result = validateChatMessage(invalidMessage);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('content');
      expect(result.errors[0].code).toBe('CONTENT_TOO_LONG');
    });

    it('should reject invalid sender', () => {
      const invalidMessage: Partial<ChatMessage> = {
        content: 'Hello',
        sender: 'invalid' as any
      };

      const result = validateChatMessage(invalidMessage);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('sender');
      expect(result.errors[0].code).toBe('INVALID_SENDER');
    });
  });

  describe('validateRequiredFields', () => {
    it('should validate when all required fields are present', () => {
      const data = {
        name: 'John',
        age: 30,
        email: 'john@example.com'
      };

      const result = validateRequiredFields(data, ['name' as keyof typeof data, 'age' as keyof typeof data, 'email' as keyof typeof data]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject when required fields are missing', () => {
      const data = {
        name: 'John'
        // age and email missing
      };

      const result = validateRequiredFields(data, ['name' as keyof typeof data, 'age' as keyof typeof data, 'email' as keyof typeof data]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe('age');
      expect(result.errors[1].field).toBe('email');
    });

    it('should reject empty string values', () => {
      const data = {
        name: '',
        age: 30
      };

      const result = validateRequiredFields(data, ['name' as keyof typeof data, 'age' as keyof typeof data]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject when end date is before start date', () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');

      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('dateRange');
      expect(result.errors[0].code).toBe('INVALID_DATE_RANGE');
    });

    it('should reject when end date is too far in the future', () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 2); // 2 years from now

      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('endDate');
      expect(result.errors[0].code).toBe('DATE_TOO_FAR_FUTURE');
    });

    it('should use field prefix when provided', () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');

      const result = validateDateRange(startDate, endDate, 'workout.');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('workout.dateRange');
    });
  });
});