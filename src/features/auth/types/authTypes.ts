/**
 * Authentication and onboarding related types
 */

import { Goal, ActivityLevel, CommunicationStyle, Equipment as GlobalEquipment } from '../../../shared/types/globalTypes';

// Onboarding flow types
export type Equipment = GlobalEquipment;

export interface OnboardingData {
  goals: HealthGoal[];
  equipment: Equipment[];
  fitnessLevel: FitnessLevel;
  preferences: UserPreferences;
  completed: boolean;
}

export type HealthGoal = 
  | 'lose_weight'
  | 'build_muscle' 
  | 'improve_fitness'
  | 'better_sleep'
  | 'reduce_stress'
  | 'increase_energy';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserPreferences {
  workoutDuration: number; // minutes
  workoutFrequency: number; // times per week
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  communicationStyle: CommunicationStyle;
}

export interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  completed: boolean;
}

// Goal selection options
export interface GoalOption {
  id: HealthGoal;
  title: string;
  description: string;
  icon: string;
  color: string;
}

// Equipment selection options
export interface EquipmentOption {
  id: Equipment;
  title: string;
  description: string;
  icon: string;
}

// Fitness level options
export interface FitnessLevelOption {
  id: FitnessLevel;
  title: string;
  description: string;
  icon: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// User profile after onboarding
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  onboardingData: OnboardingData;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export paywall types for convenience
export * from './paywallTypes';