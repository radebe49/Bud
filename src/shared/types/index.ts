/**
 * Shared types index
 * Exports all shared TypeScript interfaces and types
 */

// Health-related types
export type {
  HealthMetrics,
  MacroNutrients,
  MicroNutrients,
  HealthDataPoint,
  MetricType,
  DataSource,
  DailyHealthSummary,
  WeeklyHealthSummary,
  HealthTrend,
  HealthAnomaly,
  MetricVisualization,
  MetricDataPoint,
  TimeRange,
  AggregatedHealthData
} from './healthTypes';

// User-related types
export type {
  UserProfile,
  PersonalInfo,
  ActivityLevel,
  UserGoals,
  Goal,
  GoalType,
  UserPreferences,
  WorkoutType,
  Equipment,
  TimeSlot,
  CommunicationStyle,
  NotificationPreferences,
  PrivacySettings,
  UnitPreferences,
  HealthCondition,
  HealthConditionType,
  ConnectedDevice,
  DeviceType,
  DeviceSettings
} from './userTypes';

// Re-export existing global types
export type {
  // Add any existing global types here
} from './globalTypes';