/**
 * User profile and preference types
 * Used for user management, onboarding, and personalization
 */

export interface UserProfile {
  id: string;
  personalInfo: PersonalInfo;
  goals: UserGoals;
  preferences: UserPreferences;
  healthConditions: HealthCondition[];
  connectedDevices: ConnectedDevice[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: ActivityLevel;
  timezone: string;
}

export type ActivityLevel = 
  | 'sedentary'      // Little to no exercise
  | 'lightly_active' // Light exercise 1-3 days/week
  | 'moderately_active' // Moderate exercise 3-5 days/week
  | 'very_active'    // Hard exercise 6-7 days/week
  | 'extremely_active'; // Very hard exercise, physical job

export interface UserGoals {
  primary: Goal;
  secondary: Goal[];
  timeline: string; // e.g., "3 months", "6 months", "1 year"
  targetWeight?: number; // in kg
  targetBodyFat?: number; // percentage
  weeklyWorkoutTarget: number; // number of workouts per week
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export type GoalType = 
  | 'weight_loss'
  | 'weight_gain'
  | 'muscle_gain'
  | 'endurance'
  | 'strength'
  | 'flexibility'
  | 'sleep_quality'
  | 'stress_reduction'
  | 'nutrition_improvement'
  | 'habit_formation';

export interface UserPreferences {
  workoutTypes: WorkoutType[];
  equipment: Equipment[];
  timeAvailability: TimeSlot[];
  communicationStyle: CommunicationStyle;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  units: UnitPreferences;
}

export type WorkoutType = 
  | 'strength_training'
  | 'cardio'
  | 'yoga'
  | 'pilates'
  | 'hiit'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'martial_arts'
  | 'dance'
  | 'sports';

export type Equipment = 
  | 'none'
  | 'dumbbells'
  | 'barbell'
  | 'resistance_bands'
  | 'kettlebells'
  | 'pull_up_bar'
  | 'yoga_mat'
  | 'treadmill'
  | 'stationary_bike'
  | 'rowing_machine'
  | 'full_gym';

export interface TimeSlot {
  dayOfWeek: number; // 0-6, Sunday = 0
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  preference: 'preferred' | 'available' | 'unavailable';
}

export type CommunicationStyle = 
  | 'motivational'   // Encouraging and energetic
  | 'supportive'     // Gentle and understanding
  | 'direct'         // Straightforward and factual
  | 'casual'         // Friendly and relaxed
  | 'professional';  // Formal and structured

export interface NotificationPreferences {
  workoutReminders: boolean;
  mealReminders: boolean;
  sleepReminders: boolean;
  progressUpdates: boolean;
  motivationalMessages: boolean;
  healthAlerts: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  };
}

export interface PrivacySettings {
  shareDataWithCoach: boolean;
  allowDataAnalytics: boolean;
  shareProgressWithFriends: boolean;
  allowThirdPartyIntegrations: boolean;
  dataRetentionPeriod: number; // in days
}

export interface UnitPreferences {
  weight: 'kg' | 'lbs';
  height: 'cm' | 'ft_in';
  distance: 'km' | 'miles';
  temperature: 'celsius' | 'fahrenheit';
  liquid: 'ml' | 'fl_oz';
}

export interface HealthCondition {
  id: string;
  name: string;
  type: HealthConditionType;
  severity: 'mild' | 'moderate' | 'severe';
  diagnosed: boolean;
  diagnosisDate?: Date;
  medications: string[];
  restrictions: string[];
  notes?: string;
}

export type HealthConditionType = 
  | 'cardiovascular'
  | 'respiratory'
  | 'musculoskeletal'
  | 'metabolic'
  | 'neurological'
  | 'mental_health'
  | 'autoimmune'
  | 'digestive'
  | 'hormonal'
  | 'other';

export interface ConnectedDevice {
  id: string;
  name: string;
  type: DeviceType;
  brand: string;
  model: string;
  connectionStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSyncTime?: Date;
  dataTypes: MetricType[];
  settings: DeviceSettings;
}

export type DeviceType = 
  | 'fitness_tracker'
  | 'smartwatch'
  | 'heart_rate_monitor'
  | 'smart_scale'
  | 'sleep_tracker'
  | 'continuous_glucose_monitor'
  | 'blood_pressure_monitor'
  | 'smartphone';

export interface DeviceSettings {
  syncFrequency: 'real_time' | 'hourly' | 'daily' | 'manual';
  dataSharing: boolean;
  batteryOptimization: boolean;
  notifications: boolean;
}

// Import MetricType from healthTypes to avoid circular dependency
import type { MetricType } from './healthTypes';