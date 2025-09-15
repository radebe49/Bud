/**
 * Application constants and configuration values
 */

// App configuration
export const APP_CONFIG = {
  NAME: 'Bud Health Coach',
  VERSION: '1.0.0',
  ENVIRONMENT: process.env.EXPO_PUBLIC_APP_ENV || 'development',
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  GROQ_API_URL: process.env.EXPO_PUBLIC_GROQ_API_URL || 'https://api.groq.com/openai/v1',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Health data constants
export const HEALTH_CONSTANTS = {
  // Heart rate ranges (bpm)
  HEART_RATE: {
    MIN: 30,
    MAX: 220,
    RESTING_MIN: 40,
    RESTING_MAX: 100,
  },
  
  // Weight ranges (kg)
  WEIGHT: {
    MIN: 20,
    MAX: 300,
  },
  
  // Height ranges (cm)
  HEIGHT: {
    MIN: 100,
    MAX: 250,
  },
  
  // Age ranges
  AGE: {
    MIN: 13,
    MAX: 120,
  },
  
  // Body fat percentage
  BODY_FAT: {
    MIN: 3,
    MAX: 50,
  },
  
  // Water intake (ml)
  WATER_INTAKE: {
    MIN: 0,
    MAX: 10000,
    DAILY_GOAL_DEFAULT: 2000,
  },
  
  // Calories
  CALORIES: {
    MIN: 0,
    MAX: 10000,
    DAILY_GOAL_DEFAULT: 2000,
  },
  
  // Steps
  STEPS: {
    MIN: 0,
    MAX: 100000,
    DAILY_GOAL_DEFAULT: 10000,
  },
} as const;

// Coaching constants
export const COACHING_CONSTANTS = {
  // Response time targets (milliseconds)
  RESPONSE_TIME: {
    CHAT: 3000,
    REAL_TIME_UPDATE: 300000, // 5 minutes
  },
  
  // Message limits
  MESSAGE_LIMITS: {
    MAX_LENGTH: 1000,
    HISTORY_LIMIT: 100,
  },
  
  // Coaching patterns
  PATTERN_DETECTION: {
    MIN_DATA_POINTS: 7, // 1 week
    CONFIDENCE_THRESHOLD: 0.7,
  },
} as const;

// UI constants
export const UI_CONSTANTS = {
  // Animation durations (milliseconds)
  ANIMATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Touch targets (pixels)
  TOUCH_TARGET: {
    MIN_SIZE: 44,
    COMFORTABLE_SIZE: 48,
  },
  
  // Spacing
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  
  // Border radius
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 16,
    XL: 24,
  },
} as const;

// Storage constants
export const STORAGE_CONSTANTS = {
  // Cache durations (milliseconds)
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Sync intervals (milliseconds)
  SYNC_INTERVAL: {
    REAL_TIME: 30 * 1000,      // 30 seconds
    FREQUENT: 5 * 60 * 1000,   // 5 minutes
    NORMAL: 15 * 60 * 1000,    // 15 minutes
    BACKGROUND: 60 * 60 * 1000, // 1 hour
  },
} as const;

// Notification constants
export const NOTIFICATION_CONSTANTS = {
  // Notification types
  TYPES: {
    WORKOUT_REMINDER: 'workout_reminder',
    MEAL_REMINDER: 'meal_reminder',
    HYDRATION_REMINDER: 'hydration_reminder',
    SLEEP_REMINDER: 'sleep_reminder',
    COACHING_MESSAGE: 'coaching_message',
    ACHIEVEMENT: 'achievement',
  },
  
  // Default quiet hours
  QUIET_HOURS: {
    START: '22:00',
    END: '07:00',
  },
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: false,
  },
  
  // Name validation
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  
  // Email validation
  EMAIL: {
    MAX_LENGTH: 254,
  },
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  BIOMETRIC_AUTH: process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH === 'true',
  PUSH_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
  OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
  DEBUG_LOGGING: process.env.EXPO_PUBLIC_ENABLE_DEBUG_LOGGING === 'true',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: {
    NO_CONNECTION: 'No internet connection. Please check your network settings.',
    TIMEOUT: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
  },
  
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number.',
    INVALID_PHONE: 'Please enter a valid phone number.',
  },
  
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    BIOMETRIC_FAILED: 'Biometric authentication failed. Please try again.',
  },
  
  HEALTH_DATA: {
    SYNC_FAILED: 'Failed to sync health data. Please try again.',
    INVALID_METRIC: 'Invalid health metric value.',
    DEVICE_NOT_CONNECTED: 'Health device not connected.',
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'You have been logged out successfully.',
    REGISTRATION_SUCCESS: 'Account created successfully!',
  },
  
  HEALTH_DATA: {
    SYNC_SUCCESS: 'Health data synced successfully.',
    GOAL_ACHIEVED: 'Congratulations! You achieved your goal!',
    MILESTONE_REACHED: 'Great job! You reached a new milestone!',
  },
  
  GENERAL: {
    SAVE_SUCCESS: 'Changes saved successfully.',
    DELETE_SUCCESS: 'Item deleted successfully.',
    UPDATE_SUCCESS: 'Updated successfully.',
  },
} as const;