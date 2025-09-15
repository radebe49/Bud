/**
 * Global TypeScript interfaces and types used across the application
 */

// Base types
export type UUID = string;
export type Timestamp = Date;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Common UI types
export interface SelectOption {
  label: string;
  value: string | number;
}

// Health metric types
export type MetricType = 
  | 'heart_rate'
  | 'heart_rate_variability'
  | 'sleep_score'
  | 'recovery_score'
  | 'stress_level'
  | 'activity_level'
  | 'calories_consumed'
  | 'calories_burned'
  | 'water_intake'
  | 'weight'
  | 'body_fat_percentage'
  | 'steps'
  | 'distance'
  | 'active_minutes';

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';

export type DataSource = 'manual' | 'healthkit' | 'google_fit' | 'fitbit' | 'oura' | 'garmin' | 'myfitnesspal' | 'cronometer';

// Time-related types
export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  days: DayOfWeek[];
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Preference types
export type CommunicationStyle = 'encouraging' | 'direct' | 'analytical' | 'casual';
export type WorkoutType = 'strength' | 'cardio' | 'yoga' | 'pilates' | 'hiit' | 'running' | 'cycling' | 'swimming';
export type Equipment = 'dumbbells' | 'barbell' | 'resistance_bands' | 'kettlebells' | 'pull_up_bar' | 'yoga_mat' | 'none';

// Goal types
export interface Goal {
  id: UUID;
  type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness' | 'stress_reduction' | 'sleep_improvement';
  target: number;
  unit: string;
  deadline?: Timestamp;
  priority: 'primary' | 'secondary';
  status: 'active' | 'completed' | 'paused';
}

// Health condition types
export interface HealthCondition {
  id: UUID;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  medications?: string[];
  restrictions?: string[];
}

// Device integration types
export interface ConnectedDevice {
  id: UUID;
  type: DataSource;
  name: string;
  isConnected: boolean;
  lastSync?: Timestamp;
  permissions: string[];
}

// Notification types
export interface NotificationPreferences {
  workoutReminders: boolean;
  mealReminders: boolean;
  sleepReminders: boolean;
  hydrationReminders: boolean;
  motivationalMessages: boolean;
  quietHours: TimeSlot;
}