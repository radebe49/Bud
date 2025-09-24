/**
 * Sleep tracking and coaching types
 * Used for sleep analysis, optimization, and coaching features
 */

export interface SleepData {
  id: string;
  userId: string;
  date: Date;
  bedtime: Date;
  sleepTime: Date; // When actually fell asleep
  wakeTime: Date;
  getUpTime: Date; // When got out of bed
  totalTimeInBed: number; // in minutes
  totalSleepTime: number; // in minutes
  sleepEfficiency: number; // percentage (total sleep time / time in bed)
  sleepStages: SleepStage[];
  sleepQuality: number; // 1-10 subjective rating
  sleepScore: number; // 0-100 calculated score
  disturbances: SleepDisturbance[];
  environment: SleepEnvironment;
  notes?: string;
}

export interface SleepStage {
  stage: SleepStageType;
  startTime: Date;
  duration: number; // in minutes
  quality?: number; // 1-10 if available from device
}

export type SleepStageType = 
  | 'awake'
  | 'light'
  | 'deep'
  | 'rem'
  | 'unknown';

export interface SleepDisturbance {
  time: Date;
  type: DisturbanceType;
  duration?: number; // in minutes
  intensity?: number; // 1-10
  cause?: string;
}

export type DisturbanceType = 
  | 'noise'
  | 'light'
  | 'temperature'
  | 'bathroom'
  | 'partner'
  | 'pet'
  | 'stress'
  | 'pain'
  | 'unknown';

export interface SleepEnvironment {
  temperature?: number; // in celsius
  humidity?: number; // percentage
  noiseLevel?: number; // in decibels
  lightLevel?: number; // in lux
  airQuality?: number; // 1-10 scale
  mattressComfort?: number; // 1-10 scale
  roomDarkness?: number; // 1-10 scale, 10 = completely dark
}

export interface SleepCoaching {
  bedtimeRecommendation: Date;
  wakeTimeRecommendation: Date;
  sleepDurationTarget: number; // in hours
  sleepEnvironmentTips: EnvironmentTip[];
  windDownRoutine: RoutineStep[];
  sleepQualityAnalysis: SleepAnalysis;
  sleepHygieneTips: string[];
  personalizedInsights: SleepInsight[];
}

export interface EnvironmentTip {
  category: EnvironmentCategory;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number; // 1-10
  implementationDifficulty: 'easy' | 'medium' | 'hard';
}

export type EnvironmentCategory = 
  | 'temperature'
  | 'lighting'
  | 'noise'
  | 'air_quality'
  | 'bedding'
  | 'electronics'
  | 'room_setup';

export interface RoutineStep {
  id: string;
  name: string;
  description: string;
  timeBeforeBed: number; // minutes before bedtime
  duration: number; // in minutes
  category: RoutineCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  effectiveness?: number; // 1-10 based on user feedback
}

export type RoutineCategory = 
  | 'relaxation'
  | 'hygiene'
  | 'environment_prep'
  | 'mindfulness'
  | 'reading'
  | 'stretching'
  | 'breathing'
  | 'technology_shutdown';

export interface SleepAnalysis {
  period: 'daily' | 'weekly' | 'monthly';
  averageSleepDuration: number; // in hours
  averageSleepEfficiency: number; // percentage
  averageSleepScore: number; // 0-100
  sleepDebt: number; // in hours
  consistencyScore: number; // 0-100
  trends: SleepTrend[];
  patterns: SleepPattern[];
  recommendations: string[];
}

export interface SleepTrend {
  metric: SleepMetric;
  direction: 'improving' | 'declining' | 'stable';
  changeAmount: number;
  changePercentage: number;
  significance: 'low' | 'medium' | 'high';
  timeframe: 'weekly' | 'monthly';
}

export type SleepMetric = 
  | 'duration'
  | 'efficiency'
  | 'quality'
  | 'consistency'
  | 'deep_sleep_percentage'
  | 'rem_sleep_percentage'
  | 'sleep_latency'
  | 'wake_frequency';

export interface SleepPattern {
  type: PatternType;
  description: string;
  frequency: number; // how often this pattern occurs (0-1)
  impact: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
}

export type PatternType = 
  | 'consistent_bedtime'
  | 'weekend_shift'
  | 'seasonal_variation'
  | 'stress_related'
  | 'exercise_correlation'
  | 'caffeine_impact'
  | 'screen_time_impact'
  | 'meal_timing_impact';

export interface SleepInsight {
  id: string;
  type: InsightType;
  message: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  relatedFactors: string[];
  actionable: boolean;
  evidenceStrength: number; // 0-1
}

export type InsightType = 
  | 'sleep_debt'
  | 'consistency_issue'
  | 'environment_factor'
  | 'routine_effectiveness'
  | 'lifestyle_correlation'
  | 'performance_impact'
  | 'health_correlation'
  | 'optimization_opportunity';

export interface SleepGoals {
  targetBedtime: string; // HH:MM format
  targetWakeTime: string; // HH:MM format
  targetSleepDuration: number; // in hours
  targetSleepEfficiency: number; // percentage
  targetConsistency: number; // 0-100 score
  windDownDuration: number; // in minutes
  sleepQualityTarget: number; // 1-10
}

export interface SleepSchedule {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  weeklySchedule: DailySleepSchedule[];
  flexibility: ScheduleFlexibility;
  adaptations: ScheduleAdaptation[];
}

export interface DailySleepSchedule {
  dayOfWeek: number; // 0-6, Sunday = 0
  targetBedtime: string; // HH:MM
  targetWakeTime: string; // HH:MM
  windDownStart: string; // HH:MM
  isFlexible: boolean;
}

export interface ScheduleFlexibility {
  bedtimeVariation: number; // minutes of acceptable variation
  wakeTimeVariation: number; // minutes of acceptable variation
  weekendAdjustment: boolean;
  travelAdaptation: boolean;
}

export interface ScheduleAdaptation {
  trigger: AdaptationTrigger;
  adjustment: ScheduleAdjustment;
  duration: number; // in days
  reason: string;
}

export type AdaptationTrigger = 
  | 'travel'
  | 'work_schedule_change'
  | 'daylight_saving'
  | 'seasonal_change'
  | 'health_condition'
  | 'life_event';

export interface ScheduleAdjustment {
  bedtimeShift: number; // minutes (positive = later, negative = earlier)
  wakeTimeShift: number; // minutes
  gradualTransition: boolean;
  transitionDays: number;
}

export interface SleepTracking {
  method: TrackingMethod;
  device?: string;
  accuracy: number; // 0-1 confidence in data
  dataTypes: SleepDataType[];
  lastSync?: Date;
}

export type TrackingMethod = 
  | 'wearable'
  | 'smartphone'
  | 'smart_mattress'
  | 'bedside_device'
  | 'manual_entry';

export type SleepDataType = 
  | 'duration'
  | 'stages'
  | 'heart_rate'
  | 'movement'
  | 'environment'
  | 'subjective_quality';

export interface SleepChallenge {
  id: string;
  name: string;
  description: string;
  duration: number; // in days
  goals: SleepChallengeGoal[];
  rewards: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: ChallengeCateogry;
}

export type ChallengeCateogry = 
  | 'consistency'
  | 'duration'
  | 'quality'
  | 'routine'
  | 'environment'
  | 'lifestyle';

export interface SleepChallengeGoal {
  metric: SleepMetric;
  target: number;
  currentValue?: number;
  achieved: boolean;
}