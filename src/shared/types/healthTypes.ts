/**
 * Core health data types and interfaces
 * Used across health monitoring, coaching, and analytics features
 */

export interface HealthMetrics {
    heartRate: number;
    heartRateVariability: number;
    sleepScore: number;
    recoveryScore: number;
    stressLevel: number;
    activityLevel: number;
    caloriesConsumed: number;
    caloriesBurned: number;
    waterIntake: number; // in ml
    macronutrients: MacroNutrients;
    timestamp: Date;
}

export interface MacroNutrients {
    protein: number; // in grams
    carbohydrates: number; // in grams
    fats: number; // in grams
    fiber: number; // in grams
    sugar: number; // in grams
}

export interface MicroNutrients {
    vitaminC: number; // in mg
    vitaminD: number; // in IU
    calcium: number; // in mg
    iron: number; // in mg
    potassium: number; // in mg
    sodium: number; // in mg
}

export interface HealthDataPoint {
    id: string;
    userId: string;
    metric: MetricType;
    value: number;
    unit: string;
    timestamp: Date;
    source: DataSource;
    confidence: number; // 0-1 scale
}

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
    | 'muscle_mass';

export type DataSource =
    | 'apple_health'
    | 'google_fit'
    | 'fitbit'
    | 'oura'
    | 'garmin'
    | 'manual_entry'
    | 'app_calculation';

export interface DailyHealthSummary {
    date: Date;
    totalCaloriesConsumed: number;
    totalCaloriesBurned: number;
    netCalories: number;
    macronutrients: MacroNutrients;
    waterIntake: number;
    sleepHours: number;
    sleepQuality: number; // 0-100 scale
    averageHeartRate: number;
    stepsCount: number;
    activeMinutes: number;
    readinessScore: number; // 0-100 scale
}

export interface WeeklyHealthSummary {
    weekStartDate: Date;
    weekEndDate: Date;
    averageDailyCalories: number;
    averageSleepHours: number;
    averageReadinessScore: number;
    totalActiveMinutes: number;
    workoutsCompleted: number;
    weightChange: number;
    trends: HealthTrend[];
}

export interface HealthTrend {
    metric: MetricType;
    direction: 'increasing' | 'decreasing' | 'stable';
    changePercentage: number;
    significance: 'low' | 'medium' | 'high';
    timeframe: 'daily' | 'weekly' | 'monthly';
}

export interface HealthAnomaly {
    id: string;
    metric: MetricType;
    value: number;
    expectedRange: { min: number; max: number };
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    description: string;
    recommendations: string[];
}

export interface MetricVisualization {
    type: 'line' | 'bar' | 'circular' | 'trend';
    data: MetricDataPoint[];
    insights: string[];
    recommendations: string[];
    timeRange: TimeRange;
}

export interface MetricDataPoint {
    timestamp: Date;
    value: number;
    label?: string;
}

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';

export interface AggregatedHealthData {
    daily: DailyHealthSummary;
    weekly: WeeklyHealthSummary;
    trends: HealthTrend[];
    anomalies: HealthAnomaly[];
}