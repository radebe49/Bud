/**
 * Sleep Analysis Service Tests
 */

import { SleepAnalysisService } from '../sleepAnalysisService';
import { SleepData } from '../../types/sleepTypes';

describe('SleepAnalysisService', () => {
  const mockSleepData: SleepData[] = [
    {
      id: '1',
      userId: 'user1',
      date: new Date('2024-01-01'),
      bedtime: new Date('2024-01-01T22:30:00'),
      sleepTime: new Date('2024-01-01T23:00:00'),
      wakeTime: new Date('2024-01-02T06:30:00'),
      getUpTime: new Date('2024-01-02T07:00:00'),
      totalTimeInBed: 510, // 8.5 hours
      totalSleepTime: 450, // 7.5 hours
      sleepEfficiency: 88,
      sleepStages: [
        {
          stage: 'deep',
          startTime: new Date('2024-01-01T23:30:00'),
          duration: 90
        }
      ],
      sleepQuality: 8,
      sleepScore: 85,
      disturbances: [],
      environment: {
        temperature: 20,
        humidity: 45
      }
    },
    {
      id: '2',
      userId: 'user1',
      date: new Date('2024-01-02'),
      bedtime: new Date('2024-01-02T22:45:00'),
      sleepTime: new Date('2024-01-02T23:15:00'),
      wakeTime: new Date('2024-01-03T06:45:00'),
      getUpTime: new Date('2024-01-03T07:15:00'),
      totalTimeInBed: 510,
      totalSleepTime: 420, // 7 hours
      sleepEfficiency: 82,
      sleepStages: [],
      sleepQuality: 7,
      sleepScore: 78,
      disturbances: [],
      environment: {}
    }
  ];

  describe('analyzeSleepData', () => {
    it('should analyze sleep data correctly', () => {
      const analysis = SleepAnalysisService.analyzeSleepData(mockSleepData, 'weekly');

      expect(analysis.period).toBe('weekly');
      expect(analysis.averageSleepDuration).toBe(7.3); // (7.5 + 7) / 2
      expect(analysis.averageSleepEfficiency).toBe(85); // (88 + 82) / 2
      expect(analysis.averageSleepScore).toBe(82); // (85 + 78) / 2
      expect(analysis.sleepDebt).toBeGreaterThanOrEqual(0);
      expect(analysis.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(analysis.trends).toBeInstanceOf(Array);
      expect(analysis.patterns).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('should return empty analysis for no data', () => {
      const analysis = SleepAnalysisService.analyzeSleepData([], 'daily');

      expect(analysis.averageSleepDuration).toBe(0);
      expect(analysis.averageSleepEfficiency).toBe(0);
      expect(analysis.averageSleepScore).toBe(0);
      expect(analysis.sleepDebt).toBe(0);
      expect(analysis.consistencyScore).toBe(0);
      expect(analysis.recommendations).toContain('Start tracking your sleep to get personalized insights');
    });

    it('should calculate sleep debt correctly', () => {
      const shortSleepData = mockSleepData.map(sleep => ({
        ...sleep,
        totalSleepTime: 300 // 5 hours
      }));

      const analysis = SleepAnalysisService.analyzeSleepData(shortSleepData, 'weekly');
      
      // Should have sleep debt since sleeping only 5 hours vs 8 hour target
      expect(analysis.sleepDebt).toBeGreaterThan(0);
    });

    it('should generate appropriate recommendations', () => {
      const poorSleepData = mockSleepData.map(sleep => ({
        ...sleep,
        sleepEfficiency: 70,
        totalSleepTime: 360 // 6 hours
      }));

      const analysis = SleepAnalysisService.analyzeSleepData(poorSleepData, 'weekly');
      
      expect(analysis.recommendations).toContain('Improve sleep efficiency by optimizing your sleep environment');
      expect(analysis.recommendations).toContain('Aim for 7-9 hours of sleep per night for optimal recovery');
    });
  });

  describe('generateSleepInsights', () => {
    it('should generate insights for sleep debt', () => {
      const shortSleepData = mockSleepData.map(sleep => ({
        ...sleep,
        totalSleepTime: 300 // 5 hours - creates sleep debt
      }));

      const insights = SleepAnalysisService.generateSleepInsights(shortSleepData);
      
      const sleepDebtInsight = insights.find(insight => insight.type === 'sleep_debt');
      expect(sleepDebtInsight).toBeDefined();
      expect(sleepDebtInsight?.priority).toBe('high');
    });

    it('should generate insights for consistency issues', () => {
      const inconsistentSleepData = [
        {
          ...mockSleepData[0],
          bedtime: new Date('2024-01-01T22:00:00')
        },
        {
          ...mockSleepData[1],
          bedtime: new Date('2024-01-02T01:00:00') // 3 hours later
        }
      ];

      const insights = SleepAnalysisService.generateSleepInsights(inconsistentSleepData);
      
      const consistencyInsight = insights.find(insight => insight.type === 'consistency_issue');
      expect(consistencyInsight).toBeDefined();
    });

    it('should return empty array for no data', () => {
      const insights = SleepAnalysisService.generateSleepInsights([]);
      expect(insights).toEqual([]);
    });
  });
});