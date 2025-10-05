import { HealthDataIntegrationService } from '../healthDataIntegration';
import { HealthKitProvider } from '../healthKitProvider';
import { GoogleFitProvider } from '../googleFitProvider';
import { HealthDataPoint, DataSource } from '../../types/healthTypes';

// Mock providers
class MockHealthProvider {
  name: string;
  mockData: HealthDataPoint[];
  shouldFail: boolean;

  constructor(name: string, mockData: HealthDataPoint[] = [], shouldFail = false) {
    this.name = name;
    this.mockData = mockData;
    this.shouldFail = shouldFail;
  }

  async isAvailable(): Promise<boolean> {
    return !this.shouldFail;
  }

  async requestPermissions(): Promise<boolean> {
    return !this.shouldFail;
  }

  async getHealthData(startDate: Date, endDate: Date): Promise<HealthDataPoint[]> {
    if (this.shouldFail) {
      throw new Error(`${this.name} provider failed`);
    }
    return this.mockData;
  }

  subscribeToUpdates(callback: (data: HealthDataPoint[]) => void): () => void {
    return () => {};
  }
}

describe('HealthDataIntegrationService', () => {
  let service: HealthDataIntegrationService;
  let mockProvider1: MockHealthProvider;
  let mockProvider2: MockHealthProvider;

  beforeEach(() => {
    service = new HealthDataIntegrationService();
    
    const mockData1: HealthDataPoint[] = [
      {
        id: 'test1',
        userId: 'user1',
        metric: 'heart_rate',
        value: 72,
        unit: 'bpm',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        source: 'healthkit' as DataSource,
        confidence: 0.95
      }
    ];

    const mockData2: HealthDataPoint[] = [
      {
        id: 'test2',
        userId: 'user1',
        metric: 'steps',
        value: 8500,
        unit: 'steps',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        source: 'google_fit' as DataSource,
        confidence: 0.98
      }
    ];

    mockProvider1 = new MockHealthProvider('MockProvider1', mockData1);
    mockProvider2 = new MockHealthProvider('MockProvider2', mockData2);
  });

  describe('Provider Registration', () => {
    it('should register available providers', async () => {
      await service.registerProvider(mockProvider1);
      const providers = service.getAvailableProviders();
      expect(providers).toContain('MockProvider1');
    });

    it('should not register unavailable providers', async () => {
      const failingProvider = new MockHealthProvider('FailingProvider', [], true);
      await service.registerProvider(failingProvider);
      const providers = service.getAvailableProviders();
      expect(providers).not.toContain('FailingProvider');
    });
  });

  describe('Permission Requests', () => {
    it('should request permissions from all providers', async () => {
      await service.registerProvider(mockProvider1);
      await service.registerProvider(mockProvider2);

      const results = await service.requestAllPermissions();
      
      expect(results['MockProvider1']).toBe(true);
      expect(results['MockProvider2']).toBe(true);
    });

    it('should handle permission failures gracefully', async () => {
      // Create a provider that will be registered but fail permissions
      const failingProvider = new MockHealthProvider('FailingProvider', [], false);
      failingProvider.requestPermissions = async () => {
        throw new Error('Permission denied');
      };
      
      await service.registerProvider(mockProvider1);
      await service.registerProvider(failingProvider);

      const results = await service.requestAllPermissions();
      
      expect(results['MockProvider1']).toBe(true);
      expect(results['FailingProvider']).toBe(false);
    });
  });

  describe('Data Synchronization', () => {
    it('should sync data from all providers', async () => {
      await service.registerProvider(mockProvider1);
      await service.registerProvider(mockProvider2);

      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T23:59:59Z');

      const data = await service.syncHealthData(startDate, endDate);
      
      expect(data).toHaveLength(2);
      expect(data.find(d => d.metric === 'heart_rate')).toBeDefined();
      expect(data.find(d => d.metric === 'steps')).toBeDefined();
    });

    it('should handle provider failures during sync', async () => {
      const failingProvider = new MockHealthProvider('FailingProvider', [], true);
      await service.registerProvider(mockProvider1);
      await service.registerProvider(failingProvider);

      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T23:59:59Z');

      const data = await service.syncHealthData(startDate, endDate);
      
      expect(data).toHaveLength(1);
      expect(data[0].metric).toBe('heart_rate');
    });
  });

  describe('Data Conflict Resolution', () => {
    it('should resolve conflicts by preferring higher confidence', async () => {
      const conflictData1: HealthDataPoint[] = [
        {
          id: 'conflict1',
          userId: 'user1',
          metric: 'heart_rate',
          value: 70,
          unit: 'bpm',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          source: 'healthkit' as DataSource,
          confidence: 0.90
        }
      ];

      const conflictData2: HealthDataPoint[] = [
        {
          id: 'conflict2',
          userId: 'user1',
          metric: 'heart_rate',
          value: 75,
          unit: 'bpm',
          timestamp: new Date('2024-01-01T10:02:00Z'), // Within 5-minute window
          source: 'google_fit' as DataSource,
          confidence: 0.95
        }
      ];

      const provider1 = new MockHealthProvider('Provider1', conflictData1);
      const provider2 = new MockHealthProvider('Provider2', conflictData2);

      await service.registerProvider(provider1);
      await service.registerProvider(provider2);

      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T23:59:59Z');

      const data = await service.syncHealthData(startDate, endDate);
      
      expect(data).toHaveLength(1);
      expect(data[0].value).toBe(75); // Higher confidence value
      expect(data[0].confidence).toBe(0.95);
    });

    it('should resolve conflicts by preferring more recent data when confidence is equal', async () => {
      const conflictData1: HealthDataPoint[] = [
        {
          id: 'conflict1',
          userId: 'user1',
          metric: 'heart_rate',
          value: 70,
          unit: 'bpm',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          source: 'healthkit' as DataSource,
          confidence: 0.95
        }
      ];

      const conflictData2: HealthDataPoint[] = [
        {
          id: 'conflict2',
          userId: 'user1',
          metric: 'heart_rate',
          value: 75,
          unit: 'bpm',
          timestamp: new Date('2024-01-01T10:02:00Z'), // More recent
          source: 'google_fit' as DataSource,
          confidence: 0.95
        }
      ];

      const provider1 = new MockHealthProvider('Provider1', conflictData1);
      const provider2 = new MockHealthProvider('Provider2', conflictData2);

      await service.registerProvider(provider1);
      await service.registerProvider(provider2);

      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T23:59:59Z');

      const data = await service.syncHealthData(startDate, endDate);
      
      expect(data).toHaveLength(1);
      expect(data[0].value).toBe(75); // More recent value
      expect(data[0].timestamp.getTime()).toBe(new Date('2024-01-01T10:02:00Z').getTime());
    });
  });

  describe('Provider Status', () => {
    it('should return status for all providers', async () => {
      await service.registerProvider(mockProvider1);
      await service.registerProvider(mockProvider2);

      const status = await service.getProviderStatus();
      
      expect(status['MockProvider1']).toBeDefined();
      expect(status['MockProvider1'].available).toBe(true);
      expect(status['MockProvider2']).toBeDefined();
      expect(status['MockProvider2'].available).toBe(true);
    });
  });

  describe('Subscriptions', () => {
    it('should allow subscribing to health data updates', async () => {
      await service.registerProvider(mockProvider1);

      const mockCallback = jest.fn();
      const unsubscribe = service.subscribeToAllUpdates(mockCallback);

      expect(typeof unsubscribe).toBe('function');
      
      // Clean up
      unsubscribe();
    });
  });
});