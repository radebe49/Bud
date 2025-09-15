/**
 * Health-related TypeScript interfaces and types
 */

import { UUID, Timestamp, MetricType, DataSource } from '@/shared/types/globalTypes';

// Core health metrics
export interface HealthMetrics {
  heartRate?: number;
  heartRateVariability?: number;
  sleepScore?: number;
  recoveryScore?: number;
  stressLevel?: number;
  activityLevel?: number;
  caloriesConsumed?: number;
  caloriesBurned?: number;
  waterIntake?: number; // in ml
  weight?: number; // in kg
  bodyFatPercentage?: number;
  steps?: number;
  distance?: number; // in meters
  activeMinutes?: number;
  timestamp: Timestamp;
}

// Individual health data point
export interface HealthDataPoint {
  id: UUID;
  userId: UUID;
  metric: MetricType;
  value: number;
  unit: string;
  timestamp: Timestamp;
  source: DataSource;
  confidence: number; // 0-1 scale
  metadata?: Record<string, any>;
}

// Aggregated health data
export interface DailyHealthSummary {
  date: string; // YYYY-MM-DD format
  metrics: HealthMetrics;
  insights: HealthInsight[];
  readinessScore: number; // 0-100 scale
  recommendations: string[];
}

export interface WeeklyHealthSummary {
  weekStart: string; // YYYY-MM-DD format
  averageMetrics: HealthMetrics;
  trends: HealthTrend[];
  achievements: Achievement[];
  weeklyGoalProgress: GoalProgress[];
}

// Health insights and trends
export interface HealthInsight {
  id: UUID;
  type: InsightType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  recommendations?: string[];
  relatedMetrics: MetricType[];
  timestamp: Timestamp;
}

export type InsightType = 
  | 'trend_improvement'
  | 'trend_decline'
  | 'anomaly_detected'
  | 'goal_progress'
  | 'correlation_found'
  | 'recommendation'
  | 'warning'
  | 'celebration';

export interface HealthTrend {
  metric: MetricType;
  direction: 'improving' | 'declining' | 'stable';
  magnitude: number; // percentage change
  timeframe: 'daily' | 'weekly' | 'monthly';
  confidence: number; // 0-1 scale
  significance: 'low' | 'medium' | 'high';
}

// Health anomalies and alerts
export interface HealthAnomaly {
  id: UUID;
  metric: MetricType;
  value: number;
  expectedRange: { min: number; max: number };
  severity: 'mild' | 'moderate' | 'severe';
  timestamp: Timestamp;
  possibleCauses?: string[];
  recommendations?: string[];
}

// Achievement and progress tracking
export interface Achievement {
  id: UUID;
  type: 'milestone' | 'streak' | 'personal_best' | 'consistency';
  title: string;
  description: string;
  icon: string;
  unlockedAt: Timestamp;
  relatedMetric?: MetricType;
  value?: number;
}

export interface GoalProgress {
  goalId: UUID;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercentage: number;
  onTrack: boolean;
  estimatedCompletion?: Timestamp;
}

// Health data synchronization
export interface SyncStatus {
  source: DataSource;
  lastSync: Timestamp;
  status: 'success' | 'error' | 'in_progress';
  recordsProcessed?: number;
  errors?: string[];
}

export interface SyncQueue {
  id: UUID;
  source: DataSource;
  dataType: MetricType;
  data: any;
  priority: 'low' | 'normal' | 'high';
  retryCount: number;
  createdAt: Timestamp;
}

// Health data visualization
export interface MetricVisualization {
  type: 'line' | 'bar' | 'circular' | 'trend' | 'heatmap';
  data: MetricDataPoint[];
  timeRange: TimeRange;
  insights: string[];
  recommendations: string[];
}

export interface MetricDataPoint {
  timestamp: Timestamp;
  value: number;
  label?: string;
  color?: string;
}

export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

// Health device integration
export interface DeviceReading {
  deviceId: UUID;
  readings: HealthDataPoint[];
  batteryLevel?: number;
  signalStrength?: number;
  timestamp: Timestamp;
}

export interface DeviceCalibration {
  deviceId: UUID;
  metric: MetricType;
  offset: number;
  multiplier: number;
  lastCalibrated: Timestamp;
}