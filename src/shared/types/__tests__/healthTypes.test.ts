/**
 * Type safety tests for health-related interfaces
 * Ensures TypeScript interfaces are properly defined and type-safe
 */

import type {
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
  TimeRange
} from '../healthTypes';

describe('Health Types Type Safety', () => {
  
  describe('HealthMetrics', () => {
    it('should create valid HealthMetrics object', () => {
      const healthMetrics: HealthMetrics = {
        heartRate: 75,
        heartRateVariability: 45,
        sleepScore: 85,
        recoveryScore: 90,
        stressLevel: 3,
        activityLevel: 7,
        caloriesConsumed: 2000,
        caloriesBurned: 500,
        waterIntake: 2500,
        macronutrients: {
          protein: 120,
          carbohydrates: 250,
          fats: 80,
          fiber: 25,
          sugar: 50
        },
        timestamp: new Date()
      };

      expect(healthMetrics).toBeDefined();
      expect(typeof healthMetrics.heartRate).toBe('number');
      expect(typeof healthMetrics.timestamp).toBe('object');
      expect(healthMetrics.timestamp instanceof Date).toBe(true);
    });

    it('should enforce required properties', () => {
      // This test ensures TypeScript compilation fails if required properties are missing
      // @ts-expect-error - Missing required properties
      const incompleteMetrics: HealthMetrics = {
        heartRate: 75
        // Missing other required properties
      };
    });
  });

  describe('MacroNutrients', () => {
    it('should create valid MacroNutrients object', () => {
      const macros: MacroNutrients = {
        protein: 120,
        carbohydrates: 250,
        fats: 80,
        fiber: 25,
        sugar: 50
      };

      expect(macros).toBeDefined();
      expect(typeof macros.protein).toBe('number');
      expect(typeof macros.carbohydrates).toBe('number');
      expect(typeof macros.fats).toBe('number');
      expect(typeof macros.fiber).toBe('number');
      expect(typeof macros.sugar).toBe('number');
    });
  });

  describe('MicroNutrients', () => {
    it('should create valid MicroNutrients object', () => {
      const micros: MicroNutrients = {
        vitaminC: 90,
        vitaminD: 600,
        calcium: 1000,
        iron: 18,
        potassium: 3500,
        sodium: 2300
      };

      expect(micros).toBeDefined();
      expect(typeof micros.vitaminC).toBe('number');
      expect(typeof micros.calcium).toBe('number');
    });
  });

  describe('HealthDataPoint', () => {
    it('should create valid HealthDataPoint object', () => {
      const dataPoint: HealthDataPoint = {
        id: 'dp-123',
        userId: 'user-456',
        metric: 'heart_rate',
        value: 75,
        unit: 'bpm',
        timestamp: new Date(),
        source: 'apple_health',
        confidence: 0.95
      };

      expect(dataPoint).toBeDefined();
      expect(typeof dataPoint.id).toBe('string');
      expect(typeof dataPoint.value).toBe('number');
      expect(typeof dataPoint.confidence).toBe('number');
    });

    it('should enforce MetricType enum values', () => {
      const validMetricTypes: MetricType[] = [
        'heart_rate',
        'heart_rate_variability',
        'sleep_score',
        'recovery_score',
        'stress_level',
        'activity_level',
        'calories_consumed',
        'calories_burned',
        'water_intake',
        'weight',
        'body_fat_percentage',
        'muscle_mass'
      ];

      validMetricTypes.forEach(metricType => {
        const dataPoint: HealthDataPoint = {
          id: 'test',
          userId: 'test',
          metric: metricType,
          value: 100,
          unit: 'test',
          timestamp: new Date(),
          source: 'manual_entry',
          confidence: 1
        };
        expect(dataPoint.metric).toBe(metricType);
      });
    });

    it('should enforce DataSource enum values', () => {
      const validDataSources: DataSource[] = [
        'apple_health',
        'google_fit',
        'fitbit',
        'oura',
        'garmin',
        'manual_entry',
        'app_calculation'
      ];

      validDataSources.forEach(source => {
        const dataPoint: HealthDataPoint = {
          id: 'test',
          userId: 'test',
          metric: 'heart_rate',
          value: 75,
          unit: 'bpm',
          timestamp: new Date(),
          source: source,
          confidence: 1
        };
        expect(dataPoint.source).toBe(source);
      });
    });
  });

  describe('DailyHealthSummary', () => {
    it('should create valid DailyHealthSummary object', () => {
      const summary: DailyHealthSummary = {
        date: new Date(),
        totalCaloriesConsumed: 2000,
        totalCaloriesBurned: 500,
        netCalories: 1500,
        macronutrients: {
          protein: 120,
          carbohydrates: 250,
          fats: 80,
          fiber: 25,
          sugar: 50
        },
        waterIntake: 2500,
        sleepHours: 8,
        sleepQuality: 85,
        averageHeartRate: 75,
        stepsCount: 10000,
        activeMinutes: 60,
        readinessScore: 85
      };

      expect(summary).toBeDefined();
      expect(summary.date instanceof Date).toBe(true);
      expect(typeof summary.totalCaloriesConsumed).toBe('number');
      expect(typeof summary.readinessScore).toBe('number');
    });
  });

  describe('HealthTrend', () => {
    it('should create valid HealthTrend object', () => {
      const trend: HealthTrend = {
        metric: 'heart_rate',
        direction: 'increasing',
        changePercentage: 5.2,
        significance: 'medium',
        timeframe: 'weekly'
      };

      expect(trend).toBeDefined();
      expect(['increasing', 'decreasing', 'stable']).toContain(trend.direction);
      expect(['low', 'medium', 'high']).toContain(trend.significance);
      expect(['daily', 'weekly', 'monthly']).toContain(trend.timeframe);
    });
  });

  describe('HealthAnomaly', () => {
    it('should create valid HealthAnomaly object', () => {
      const anomaly: HealthAnomaly = {
        id: 'anomaly-123',
        metric: 'heart_rate',
        value: 120,
        expectedRange: { min: 60, max: 100 },
        severity: 'medium',
        timestamp: new Date(),
        description: 'Heart rate elevated above normal range',
        recommendations: ['Consider rest', 'Monitor closely']
      };

      expect(anomaly).toBeDefined();
      expect(typeof anomaly.id).toBe('string');
      expect(typeof anomaly.value).toBe('number');
      expect(Array.isArray(anomaly.recommendations)).toBe(true);
      expect(['low', 'medium', 'high', 'critical']).toContain(anomaly.severity);
    });
  });

  describe('MetricVisualization', () => {
    it('should create valid MetricVisualization object', () => {
      const visualization: MetricVisualization = {
        type: 'line',
        data: [
          { timestamp: new Date(), value: 75 },
          { timestamp: new Date(), value: 78 }
        ],
        insights: ['Heart rate trending upward'],
        recommendations: ['Monitor during exercise'],
        timeRange: '7d'
      };

      expect(visualization).toBeDefined();
      expect(['line', 'bar', 'circular', 'trend']).toContain(visualization.type);
      expect(Array.isArray(visualization.data)).toBe(true);
      expect(Array.isArray(visualization.insights)).toBe(true);
      expect(['24h', '7d', '30d', '90d', '1y']).toContain(visualization.timeRange);
    });
  });

  describe('TimeRange', () => {
    it('should enforce valid TimeRange values', () => {
      const validTimeRanges: TimeRange[] = ['24h', '7d', '30d', '90d', '1y'];
      
      validTimeRanges.forEach(range => {
        const timeRange: TimeRange = range;
        expect(timeRange).toBe(range);
      });

      // @ts-expect-error - Invalid time range
      const invalidRange: TimeRange = '2y';
    });
  });

  describe('Type compatibility', () => {
    it('should allow partial types for updates', () => {
      const partialMetrics: Partial<HealthMetrics> = {
        heartRate: 80,
        waterIntake: 2000
      };

      expect(partialMetrics.heartRate).toBe(80);
      expect(partialMetrics.sleepScore).toBeUndefined();
    });

    it('should work with Pick utility type', () => {
      type BasicMetrics = Pick<HealthMetrics, 'heartRate' | 'sleepScore' | 'timestamp'>;
      
      const basicMetrics: BasicMetrics = {
        heartRate: 75,
        sleepScore: 85,
        timestamp: new Date()
      };

      expect(basicMetrics).toBeDefined();
      expect(typeof basicMetrics.heartRate).toBe('number');
    });

    it('should work with Omit utility type', () => {
      type MetricsWithoutTimestamp = Omit<HealthMetrics, 'timestamp'>;
      
      const metricsWithoutTimestamp: MetricsWithoutTimestamp = {
        heartRate: 75,
        heartRateVariability: 45,
        sleepScore: 85,
        recoveryScore: 90,
        stressLevel: 3,
        activityLevel: 7,
        caloriesConsumed: 2000,
        caloriesBurned: 500,
        waterIntake: 2500,
        macronutrients: {
          protein: 120,
          carbohydrates: 250,
          fats: 80,
          fiber: 25,
          sugar: 50
        }
      };

      expect(metricsWithoutTimestamp).toBeDefined();
      expect((metricsWithoutTimestamp as any).timestamp).toBeUndefined();
    });
  });
});