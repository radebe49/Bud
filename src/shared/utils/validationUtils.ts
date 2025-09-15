/**
 * Validation utility functions for data validation and sanitization
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation (basic)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.trim());
};

// Health metric validation
export const isValidHeartRate = (heartRate: number): boolean => {
  return heartRate >= 30 && heartRate <= 220;
};

export const isValidWeight = (weight: number, unit: 'kg' | 'lbs' = 'kg'): boolean => {
  if (unit === 'kg') {
    return weight >= 20 && weight <= 300; // 20kg to 300kg
  }
  return weight >= 44 && weight <= 660; // 44lbs to 660lbs
};

export const isValidHeight = (height: number, unit: 'cm' | 'ft' = 'cm'): boolean => {
  if (unit === 'cm') {
    return height >= 100 && height <= 250; // 100cm to 250cm
  }
  return height >= 3.3 && height <= 8.2; // 3.3ft to 8.2ft
};

export const isValidAge = (age: number): boolean => {
  return age >= 13 && age <= 120;
};

export const isValidBodyFatPercentage = (percentage: number): boolean => {
  return percentage >= 3 && percentage <= 50;
};

export const isValidWaterIntake = (intake: number): boolean => {
  return intake >= 0 && intake <= 10000; // 0ml to 10L
};

export const isValidCalories = (calories: number): boolean => {
  return calories >= 0 && calories <= 10000;
};

export const isValidSteps = (steps: number): boolean => {
  return steps >= 0 && steps <= 100000;
};

// Date validation
export const isValidDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

export const isDateInFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

// String validation and sanitization
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name.trim());
};

// Numeric validation
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value > 0 && !isNaN(value);
};

export const isNonNegativeNumber = (value: number): boolean => {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// Array validation
export const isNonEmptyArray = <T>(array: T[]): boolean => {
  return Array.isArray(array) && array.length > 0;
};

// Object validation
export const hasRequiredFields = <T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): boolean => {
  return requiredFields.every(field => 
    obj.hasOwnProperty(field) && obj[field] !== null && obj[field] !== undefined
  );
};

// Health data specific validation
export interface HealthMetricValidation {
  isValid: boolean;
  errors: string[];
}

export const validateHealthMetrics = (metrics: any): HealthMetricValidation => {
  const errors: string[] = [];

  if (metrics.heartRate !== undefined && !isValidHeartRate(metrics.heartRate)) {
    errors.push('Invalid heart rate value');
  }

  if (metrics.weight !== undefined && !isValidWeight(metrics.weight)) {
    errors.push('Invalid weight value');
  }

  if (metrics.bodyFatPercentage !== undefined && !isValidBodyFatPercentage(metrics.bodyFatPercentage)) {
    errors.push('Invalid body fat percentage');
  }

  if (metrics.waterIntake !== undefined && !isValidWaterIntake(metrics.waterIntake)) {
    errors.push('Invalid water intake value');
  }

  if (metrics.caloriesConsumed !== undefined && !isValidCalories(metrics.caloriesConsumed)) {
    errors.push('Invalid calories consumed value');
  }

  if (metrics.caloriesBurned !== undefined && !isValidCalories(metrics.caloriesBurned)) {
    errors.push('Invalid calories burned value');
  }

  if (metrics.steps !== undefined && !isValidSteps(metrics.steps)) {
    errors.push('Invalid steps value');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Form validation helpers
export const validateForm = <T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => boolean | string>
): { isValid: boolean; errors: Record<keyof T, string> } => {
  const errors = {} as Record<keyof T, string>;

  Object.entries(validators).forEach(([field, validator]) => {
    const value = data[field as keyof T];
    const result = validator(value);
    
    if (typeof result === 'string') {
      errors[field as keyof T] = result;
    } else if (!result) {
      errors[field as keyof T] = `Invalid ${field}`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};