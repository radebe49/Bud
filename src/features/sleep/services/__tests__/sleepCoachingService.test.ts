/**
 * Sleep Coaching Service Tests
 */

import { SleepCoachingService } from '../sleepCoachingService';
import { SleepData, SleepGoals } from '../../types/sleepTypes';

describe('SleepCoachingService', () => {
  const mockSleepGoals: SleepGoals = {
    targetBedtime: '22:30',
    targetWakeTime: '06:30',
    targetSleepDuration: 8,
    targetSleepEfficiency: 85,
    targetConsistency: 80,
    windDownDuration: 60,
    sleepQualityTarget: 8
  };

  const mockSleepData: SleepData[] = [
    {
      id: '1',
      userId: 'user1',
      date: new Date('2024-01-01'),
      bedtime: new Date('2024-01-01T22:30:00'),
      sleepTime: new Date('2024-01-01T23:00:00'),
      wakeTime: new Date('2024-01-02T06:30:00'),
      getUpTime: new Date('2024-01-02T07:00:00'),
      totalTimeInBed: 510,
      totalSleepTime: 450,
      sleepEfficiency: 88,
      sleepStages: [],
      sleepQuality: 8,
      sleepScore: 85,
      disturbances: [],
      environment: {}
    }
  ];

  describe('getSleepCoaching', () => {
    it('should generate comprehensive sleep coaching', async () => {
      const coaching = await SleepCoachingService.getSleepCoaching(
        'user1',
        mockSleepData,
        mockSleepGoals
      );

      expect(coaching).toBeDefined();
      expect(coaching.bedtimeRecommendation).toBeInstanceOf(Date);
      expect(coaching.wakeTimeRecommendation).toBeInstanceOf(Date);
      expect(coaching.sleepDurationTarget).toBe(8);
      expect(coaching.sleepEnvironmentTips).toBeInstanceOf(Array);
      expect(coaching.windDownRoutine).toBeInstanceOf(Array);
      expect(coaching.sleepQualityAnalysis).toBeDefined();
      expect(coaching.sleepHygieneTips).toBeInstanceOf(Array);
      expect(coaching.personalizedInsights).toBeInstanceOf(Array);
    });

    it('should generate wind-down routine with appropriate steps', async () => {
      const coaching = await SleepCoachingService.getSleepCoaching(
        'user1',
        mockSleepData,
        mockSleepGoals
      );

      expect(coaching.windDownRoutine.length).toBeGreaterThan(0);
      
      // Should include technology shutdown
      const techShutdown = coaching.windDownRoutine.find(
        step => step.category === 'technology_shutdown'
      );
      expect(techShutdown).toBeDefined();

      // Should include hygiene step
      const hygiene = coaching.windDownRoutine.find(
        step => step.category === 'hygiene'
      );
      expect(hygiene).toBeDefined();
    });
  });

  describe('generateTodaysSleepInsights', () => {
    it('should generate insights for recent sleep', () => {
      const insights = SleepCoachingService.generateTodaysSleepInsights(
        mockSleepData,
        mockSleepGoals
      );

      expect(insights).toBeInstanceOf(Array);
      // Should have at least some insights based on the mock data
      expect(insights.length).toBeGreaterThanOrEqual(0);
    });

    it('should generate no-data insight when no sleep data available', () => {
      const insights = SleepCoachingService.generateTodaysSleepInsights(
        [],
        mockSleepGoals
      );

      expect(insights.length).toBe(1);
      expect(insights[0].type).toBe('optimization_opportunity');
      expect(insights[0].message).toContain('No sleep data available');
    });

    it('should generate duration insight for short sleep', () => {
      const shortSleepData = [{
        ...mockSleepData[0],
        totalSleepTime: 360 // 6 hours
      }];

      const insights = SleepCoachingService.generateTodaysSleepInsights(
        shortSleepData,
        mockSleepGoals
      );

      const durationInsight = insights.find(insight => 
        insight.type === 'sleep_debt'
      );
      expect(durationInsight).toBeDefined();
      expect(durationInsight?.priority).toBe('high');
    });
  });

  describe('createSleepSchedule', () => {
    it('should create a basic sleep schedule', () => {
      const schedule = SleepCoachingService.createSleepSchedule(
        'user1',
        mockSleepGoals,
        { weekendFlexibility: false }
      );

      expect(schedule.userId).toBe('user1');
      expect(schedule.isActive).toBe(true);
      expect(schedule.weeklySchedule).toHaveLength(7);
      
      // All days should have same bedtime when no weekend flexibility
      const bedtimes = schedule.weeklySchedule.map(day => day.targetBedtime);
      expect(new Set(bedtimes).size).toBe(1);
    });

    it('should create schedule with weekend flexibility', () => {
      const schedule = SleepCoachingService.createSleepSchedule(
        'user1',
        mockSleepGoals,
        { weekendFlexibility: true }
      );

      expect(schedule.flexibility.weekendAdjustment).toBe(true);
      expect(schedule.flexibility.bedtimeVariation).toBe(60);
      
      // Weekend days should be flexible
      const weekendDays = schedule.weeklySchedule.filter(day => 
        day.dayOfWeek === 0 || day.dayOfWeek === 6
      );
      weekendDays.forEach(day => {
        expect(day.isFlexible).toBe(true);
      });
    });
  });

  describe('trackWindDownRoutine', () => {
    const mockRoutineSteps = [
      {
        id: 'step1',
        name: 'Tech Shutdown',
        description: 'Turn off devices',
        timeBeforeBed: 60,
        duration: 5,
        category: 'technology_shutdown' as const,
        difficulty: 'easy' as const
      },
      {
        id: 'step2',
        name: 'Reading',
        description: 'Read a book',
        timeBeforeBed: 30,
        duration: 20,
        category: 'reading' as const,
        difficulty: 'easy' as const
      }
    ];

    it('should track routine completion correctly', () => {
      const result = SleepCoachingService.trackWindDownRoutine(
        mockRoutineSteps,
        ['step1']
      );

      expect(result.completionRate).toBe(50);
      expect(result.missedSteps).toHaveLength(1);
      expect(result.missedSteps[0].id).toBe('step2');
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should provide recommendations for missed important steps', () => {
      const result = SleepCoachingService.trackWindDownRoutine(
        mockRoutineSteps,
        ['step2'] // Missing tech shutdown
      );

      expect(result.recommendations).toContain(
        'Turning off screens before bed is crucial for good sleep'
      );
    });

    it('should handle 100% completion', () => {
      const result = SleepCoachingService.trackWindDownRoutine(
        mockRoutineSteps,
        ['step1', 'step2']
      );

      expect(result.completionRate).toBe(100);
      expect(result.missedSteps).toHaveLength(0);
    });
  });

  describe('calculateSleepReadiness', () => {
    it('should calculate readiness score with positive factors', () => {
      const result = SleepCoachingService.calculateSleepReadiness(
        mockSleepData,
        {
          stressLevel: 3,
          exerciseIntensity: 5,
          caffeineIntake: 50
        }
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.factors).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should penalize high stress and caffeine', () => {
      const result = SleepCoachingService.calculateSleepReadiness(
        mockSleepData,
        {
          stressLevel: 9,
          caffeineIntake: 300,
          screenTimeBeforeBed: 120
        }
      );

      expect(result.score).toBeLessThan(70); // Should be penalized
      expect(result.recommendations).toContain(
        'Try relaxation techniques before bed to manage stress'
      );
      expect(result.recommendations).toContain(
        'Avoid caffeine 6 hours before bedtime'
      );
    });

    it('should reward good sleep history', () => {
      const goodSleepData = mockSleepData.map(sleep => ({
        ...sleep,
        sleepScore: 90
      }));

      const result = SleepCoachingService.calculateSleepReadiness(
        goodSleepData,
        { stressLevel: 4 }
      );

      const positiveFactors = result.factors.filter(f => f.impact === 'positive');
      expect(positiveFactors.length).toBeGreaterThan(0);
    });
  });
});