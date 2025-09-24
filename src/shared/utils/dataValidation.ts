/**
 * Data validation utilities for health coach data models
 * Provides type-safe validation functions for all core interfaces
 */

import type { HealthMetrics, MacroNutrients, HealthDataPoint } from '../types/healthTypes';
import type { UserProfile, PersonalInfo, Goal } from '../types/userTypes';
import type { MealEntry, FoodItem, NutritionTracking } from '../../features/nutrition/types/nutritionTypes';
import type { ConversationContext, ChatMessage } from '../../features/coaching/types/conversationTypes';
import type { SleepData, SleepCoaching } from '../../features/sleep/types/sleepTypes';
import type { WorkoutPlan, Exercise, DailyWorkout } from '../../features/workouts/types/workoutTypes';

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Health Metrics Validation
export function validateHealthMetrics(data: Partial<HealthMetrics>): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.heartRate !== undefined) {
    if (data.heartRate < 30 || data.heartRate > 220) {
      errors.push({
        field: 'heartRate',
        message: 'Heart rate must be between 30 and 220 BPM',
        code: 'INVALID_HEART_RATE'
      });
    }
  }

  if (data.heartRateVariability !== undefined) {
    if (data.heartRateVariability < 0 || data.heartRateVariability > 200) {
      errors.push({
        field: 'heartRateVariability',
        message: 'Heart rate variability must be between 0 and 200ms',
        code: 'INVALID_HRV'
      });
    }
  }

  if (data.sleepScore !== undefined) {
    if (data.sleepScore < 0 || data.sleepScore > 100) {
      errors.push({
        field: 'sleepScore',
        message: 'Sleep score must be between 0 and 100',
        code: 'INVALID_SLEEP_SCORE'
      });
    }
  }

  if (data.stressLevel !== undefined) {
    if (data.stressLevel < 0 || data.stressLevel > 10) {
      errors.push({
        field: 'stressLevel',
        message: 'Stress level must be between 0 and 10',
        code: 'INVALID_STRESS_LEVEL'
      });
    }
  }

  if (data.waterIntake !== undefined) {
    if (data.waterIntake < 0 || data.waterIntake > 10000) {
      errors.push({
        field: 'waterIntake',
        message: 'Water intake must be between 0 and 10000ml',
        code: 'INVALID_WATER_INTAKE'
      });
    }
  }

  if (data.macronutrients) {
    const macroValidation = validateMacroNutrients(data.macronutrients);
    errors.push(...macroValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Macro Nutrients Validation
export function validateMacroNutrients(data: Partial<MacroNutrients>): ValidationResult {
  const errors: ValidationError[] = [];

  const validateMacro = (value: number | undefined, field: string, max: number = 1000) => {
    if (value !== undefined) {
      if (value < 0 || value > max) {
        errors.push({
          field,
          message: `${field} must be between 0 and ${max}g`,
          code: `INVALID_${field.toUpperCase()}`
        });
      }
    }
  };

  validateMacro(data.protein, 'protein', 500);
  validateMacro(data.carbohydrates, 'carbohydrates', 1000);
  validateMacro(data.fats, 'fats', 300);
  validateMacro(data.fiber, 'fiber', 100);
  validateMacro(data.sugar, 'sugar', 200);

  return {
    isValid: errors.length === 0,
    errors
  };
}

// User Profile Validation
export function validateUserProfile(data: Partial<UserProfile>): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.personalInfo) {
    const personalInfoValidation = validatePersonalInfo(data.personalInfo);
    errors.push(...personalInfoValidation.errors);
  }

  if (data.goals) {
    const goalsValidation = validateUserGoals(data.goals);
    errors.push(...goalsValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Personal Info Validation
export function validatePersonalInfo(data: Partial<PersonalInfo>): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.age !== undefined) {
    if (data.age < 13 || data.age > 120) {
      errors.push({
        field: 'age',
        message: 'Age must be between 13 and 120 years',
        code: 'INVALID_AGE'
      });
    }
  }

  if (data.height !== undefined) {
    if (data.height < 100 || data.height > 250) {
      errors.push({
        field: 'height',
        message: 'Height must be between 100 and 250 cm',
        code: 'INVALID_HEIGHT'
      });
    }
  }

  if (data.weight !== undefined) {
    if (data.weight < 30 || data.weight > 300) {
      errors.push({
        field: 'weight',
        message: 'Weight must be between 30 and 300 kg',
        code: 'INVALID_WEIGHT'
      });
    }
  }

  const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
  if (data.gender && !validGenders.includes(data.gender)) {
    errors.push({
      field: 'gender',
      message: 'Invalid gender value',
      code: 'INVALID_GENDER'
    });
  }

  const validActivityLevels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'];
  if (data.activityLevel && !validActivityLevels.includes(data.activityLevel)) {
    errors.push({
      field: 'activityLevel',
      message: 'Invalid activity level',
      code: 'INVALID_ACTIVITY_LEVEL'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// User Goals Validation
export function validateUserGoals(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.weeklyWorkoutTarget !== undefined) {
    if (data.weeklyWorkoutTarget < 0 || data.weeklyWorkoutTarget > 14) {
      errors.push({
        field: 'weeklyWorkoutTarget',
        message: 'Weekly workout target must be between 0 and 14',
        code: 'INVALID_WORKOUT_TARGET'
      });
    }
  }

  if (data.targetWeight !== undefined) {
    if (data.targetWeight < 30 || data.targetWeight > 300) {
      errors.push({
        field: 'targetWeight',
        message: 'Target weight must be between 30 and 300 kg',
        code: 'INVALID_TARGET_WEIGHT'
      });
    }
  }

  if (data.targetBodyFat !== undefined) {
    if (data.targetBodyFat < 3 || data.targetBodyFat > 50) {
      errors.push({
        field: 'targetBodyFat',
        message: 'Target body fat must be between 3% and 50%',
        code: 'INVALID_TARGET_BODY_FAT'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Food Item Validation
export function validateFoodItem(data: Partial<FoodItem>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Food name is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (data.quantity !== undefined) {
    if (data.quantity <= 0 || data.quantity > 10000) {
      errors.push({
        field: 'quantity',
        message: 'Quantity must be between 0 and 10000',
        code: 'INVALID_QUANTITY'
      });
    }
  }

  if (data.calories !== undefined) {
    if (data.calories < 0 || data.calories > 10000) {
      errors.push({
        field: 'calories',
        message: 'Calories must be between 0 and 10000',
        code: 'INVALID_CALORIES'
      });
    }
  }

  if (data.macros) {
    const macroValidation = validateMacroNutrients(data.macros);
    errors.push(...macroValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Meal Entry Validation
export function validateMealEntry(data: Partial<MealEntry>): ValidationResult {
  const errors: ValidationError[] = [];

  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout', 'late_night'];
  if (data.mealType && !validMealTypes.includes(data.mealType)) {
    errors.push({
      field: 'mealType',
      message: 'Invalid meal type',
      code: 'INVALID_MEAL_TYPE'
    });
  }

  if (data.foods) {
    data.foods.forEach((food, index) => {
      const foodValidation = validateFoodItem(food);
      foodValidation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `foods[${index}].${error.field}`
        });
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sleep Data Validation
export function validateSleepData(data: Partial<SleepData>): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.bedtime && data.wakeTime) {
    const bedtime = new Date(data.bedtime);
    const wakeTime = new Date(data.wakeTime);
    
    if (wakeTime <= bedtime) {
      errors.push({
        field: 'wakeTime',
        message: 'Wake time must be after bedtime',
        code: 'INVALID_SLEEP_TIMES'
      });
    }
  }

  if (data.totalSleepTime !== undefined) {
    if (data.totalSleepTime < 0 || data.totalSleepTime > 1440) { // 24 hours in minutes
      errors.push({
        field: 'totalSleepTime',
        message: 'Total sleep time must be between 0 and 1440 minutes',
        code: 'INVALID_SLEEP_DURATION'
      });
    }
  }

  if (data.sleepEfficiency !== undefined) {
    if (data.sleepEfficiency < 0 || data.sleepEfficiency > 100) {
      errors.push({
        field: 'sleepEfficiency',
        message: 'Sleep efficiency must be between 0 and 100%',
        code: 'INVALID_SLEEP_EFFICIENCY'
      });
    }
  }

  if (data.sleepQuality !== undefined) {
    if (data.sleepQuality < 1 || data.sleepQuality > 10) {
      errors.push({
        field: 'sleepQuality',
        message: 'Sleep quality must be between 1 and 10',
        code: 'INVALID_SLEEP_QUALITY'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Exercise Validation
export function validateExercise(data: Partial<Exercise>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Exercise name is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (data.duration !== undefined) {
    if (data.duration <= 0 || data.duration > 300) { // 5 hours max
      errors.push({
        field: 'duration',
        message: 'Duration must be between 0 and 300 minutes',
        code: 'INVALID_DURATION'
      });
    }
  }

  if (data.caloriesPerMinute !== undefined) {
    if (data.caloriesPerMinute < 0 || data.caloriesPerMinute > 50) {
      errors.push({
        field: 'caloriesPerMinute',
        message: 'Calories per minute must be between 0 and 50',
        code: 'INVALID_CALORIES_PER_MINUTE'
      });
    }
  }

  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  if (data.difficulty && !validDifficulties.includes(data.difficulty)) {
    errors.push({
      field: 'difficulty',
      message: 'Invalid difficulty level',
      code: 'INVALID_DIFFICULTY'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Chat Message Validation
export function validateChatMessage(data: Partial<ChatMessage>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.content || data.content.trim().length === 0) {
    errors.push({
      field: 'content',
      message: 'Message content is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (data.content && data.content.length > 5000) {
    errors.push({
      field: 'content',
      message: 'Message content must be less than 5000 characters',
      code: 'CONTENT_TOO_LONG'
    });
  }

  const validSenders = ['user', 'bud'];
  if (data.sender && !validSenders.includes(data.sender)) {
    errors.push({
      field: 'sender',
      message: 'Invalid sender type',
      code: 'INVALID_SENDER'
    });
  }

  const validMessageTypes = ['text', 'quick_reply', 'suggestion', 'insight', 'question', 'celebration', 'concern', 'reminder', 'system'];
  if (data.messageType && !validMessageTypes.includes(data.messageType)) {
    errors.push({
      field: 'messageType',
      message: 'Invalid message type',
      code: 'INVALID_MESSAGE_TYPE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utility function to validate required fields
export function validateRequiredFields<T>(data: Partial<T>, requiredFields: (keyof T)[]): ValidationResult {
  const errors: ValidationError[] = [];

  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push({
        field: String(field),
        message: `${String(field)} is required`,
        code: 'REQUIRED_FIELD'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utility function to validate date ranges
export function validateDateRange(startDate: Date, endDate: Date, fieldPrefix: string = ''): ValidationResult {
  const errors: ValidationError[] = [];

  if (startDate >= endDate) {
    errors.push({
      field: `${fieldPrefix}dateRange`,
      message: 'End date must be after start date',
      code: 'INVALID_DATE_RANGE'
    });
  }

  const now = new Date();
  const maxFutureDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now

  if (endDate > maxFutureDate) {
    errors.push({
      field: `${fieldPrefix}endDate`,
      message: 'End date cannot be more than 1 year in the future',
      code: 'DATE_TOO_FAR_FUTURE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}