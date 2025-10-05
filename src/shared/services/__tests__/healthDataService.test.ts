import { HealthDataService } from '../healthDataService';
import { HealthDataPoint, HealthMetrics, DataSource } from '../../types/healthTypes';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock the integration service
jest.mock('../healthDataIntegration', () => ({
  healthDataIntegration: {
    registerProvider: jest.fn(),
    requestAllPermissions: jest.fn(),
    syncHealthData: jest.fn(),
    subscribeToAllUpdates: jest.fn(),
    getProviderStatus: jest.fn(),
    processSyncQueue: jest.fn(),
  },
  HealthDataIntegrationService: jest.fn(),
}));

// Mock the offline storage
jest.mock('../offlineHealthStorage', () => ({
  offlineHealthStorage: {
    storeHealthData: jest.fn(),
    getUnsyncedData: jest.fn(),
    markAsSynced: jest.fn(),
    updateSyncStatus: jest.fn(),
    getHealthDataByDateRange: jest.fn(),
    getSyncStatus: jest.fn(),
    getStorageSize: jest.fn(),
    clearOldData: jest.fn(),
  },
  OfflineHealthStorage: jest.fn(),
}));

import { healthDataIntegration } from '../healthDataIntegration';
import { offlineHealthStorage } from '../offlineHealthStorage';

const mockIntegration = healthDataIntegration as jest.Mocked<typeof healthDataIntegration>;
const mockOfflineStorage = offlineHealthStorage as jest.Mocked<typeof offlineHealthStorage>;

describe('HealthDataService', () => {
  let service: HealthDataService;
  let mockHealthData: HealthDataPoint[];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockOfflineStorage.getUnsyncedData.mockResolvedValue([]);
    mockOfflineStorage.getSyncStatus.mockResolvedValue({
      lastSyncTime: null,
      pendingItems: 0,
      failedItems: 0,
      totalItems: 0
    });
    mockOfflineStorage.getStorageSize.mockResolvedValue({ totalSize: 0, itemCount: 0 });
    
    mockHealthData = [
      {
        id: 'test1',
        userId: 'user1',
        metric: 'heart_rate',
        value: 72,
        unit: 'bpm',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        source: 'healthkit' as DataSource,
        confidence: 0.95
      },
      {
        id: 'test2',
        userId: 'user1',
        metric: 'steps',
        value: 8500,
        unit: 'steps',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        source: 'google_fit' as DataSource,
        confidence: 0.98
      },
      {
        id: 'test3',
        userId: 'user1',
        metric: 'calories_consumed',
        value: 2100,
        unit: 'kcal',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        source: 'myfitnesspal' as DataSource,
        confidence: 0.92
      }
    ];

    service = new HealthDataService({
      enabledProviders: ['HealthKit', 'GoogleFit', 'MyFitnessPal'],
      syncInterval: 5, // 5 minutes for testing
      offlineRetentionDays: 7,
      maxRetryAttempts: 2
    });
  });

  afterEach(() => {
    service.dispose();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultService = new HealthDataService();
      expect(defaultService).toBeDefined();
      defaultService.dispose();
    });

    it('should register providers during initialization', () => {
      expect(mockIntegration.registerProvider).toHaveBeenCalled();
    });
  });

  describe('Permission Management', () => {
    it('should request permissions from all providers', async () => {
      const mockPermissions = {
        'HealthKit': true,
        'GoogleFit': true,
        'MyFitnessPal': false
      };

      mockIntegration.requestAllPermissions.mockResolvedValue(mockPermissions);

      const result = await service.requestPermissions();

      expect(result).toEqual(mockPermissions);
      expect(mockIntegration.requestAllPermissions).toHaveBeenCalled();
    });

    it('should handle permission request errors', async () => {
      mockIntegration.requestAllPermissions.mockRejectedValue(new Error('Permission error'));

      const result = await service.requestPermissions();

      expect(result).toEqual({});
    });
  });

  describe('Data Synchronization', () => {
    it('should sync health data when online', async () => {
      mockIntegration.syncHealthData.mockResolvedValue(mockHealthData);

      const result = await service.syncHealthData();

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(3);
      expect(result.failedCount).toBe(0);
      expect(mockIntegration.syncHealthData).toHaveBeenCalled();
    });

    it('should store data offline when offline', async () => {
      // Simulate offline state
      (service as any).isOnline = false;
      
      mockIntegration.syncHealthData.mockResolvedValue(mockHealthData);
      mockOfflineStorage.storeHealthData.mockResolvedValue('offline_123');

      const result = await service.syncHealthData();

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(3);
      expect(mockOfflineStorage.storeHealthData).toHaveBeenCalledWith(mockHealthData, 'mixed');
    });

    it('should handle sync errors gracefully', async () => {
      mockIntegration.syncHealthData.mockRejectedValue(new Error('Sync failed'));

      const result = await service.syncHealthData();

      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toContain('Sync failed');
    });

    it('should use custom date range for sync', async () => {
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T23:59:59Z');

      mockIntegration.syncHealthData.mockResolvedValue(mockHealthData);

      await service.syncHealthData(startDate, endDate);

      expect(mockIntegration.syncHealthData).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  describe('Health Metrics Aggregation', () => {
    it('should aggregate health data into metrics when online', async () => {
      mockIntegration.syncHealthData.mockResolvedValue(mockHealthData);

      const metrics = await service.getHealthMetrics();

      expect(metrics).toBeDefined();
      expect(metrics!.heartRate).toBe(72);
      expect(metrics!.activityLevel).toBe(8500); // steps
      expect(metrics!.caloriesConsumed).toBe(2100);
      expect(metrics!.timestamp).toBeInstanceOf(Date);
    });

    it('should get metrics from offline storage when offline', async () => {
      // Simulate offline state
      (service as any).isOnline = false;
      
      mockOfflineStorage.getHealthDataByDateRange.mockResolvedValue(mockHealthData);

      const metrics = await service.getHealthMetrics();

      expect(metrics).toBeDefined();
      expect(metrics!.heartRate).toBe(72);
      expect(mockOfflineStorage.getHealthDataByDateRange).toHaveBeenCalled();
    });

    it('should handle aggregation errors', async () => {
      mockIntegration.syncHealthData.mockRejectedValue(new Error('Aggregation failed'));

      const metrics = await service.getHealthMetrics();

      expect(metrics).toBeNull();
    });

    it('should aggregate multiple values correctly', async () => {
      const multipleHeartRateData: HealthDataPoint[] = [
        {
          id: 'hr1',
          userId: 'user1',
          metric: 'heart_rate',
          value: 70,
          unit: 'bpm',
          timestamp: new Date(),
          source: 'healthkit' as DataSource,
          confidence: 0.95
        },
        {
          id: 'hr2',
          userId: 'user1',
          metric: 'heart_rate',
          value: 74,
          unit: 'bpm',
          timestamp: new Date(),
          source: 'healthkit' as DataSource,
          confidence: 0.95
        }
      ];

      mockIntegration.syncHealthData.mockResolvedValue(multipleHeartRateData);

      const metrics = await service.getHealthMetrics();

      expect(metrics!.heartRate).toBe(72); // Average of 70 and 74
    });
  });

  describe('Sync Queue Processing', () => {
    it('should process sync queue when online', async () => {
      const unsyncedData = [
        {
          id: 'offline_123',
          data: mockHealthData,
          timestamp: new Date(),
          synced: false,
          source: 'healthkit' as DataSource
        }
      ];

      mockOfflineStorage.getUnsyncedData.mockResolvedValue(unsyncedData);
      mockOfflineStorage.markAsSynced.mockResolvedValue();

      await service.processSyncQueue();

      expect(mockIntegration.processSyncQueue).toHaveBeenCalled();
      expect(mockOfflineStorage.markAsSynced).toHaveBeenCalledWith('offline_123');
    });

    it('should not process sync queue when offline', async () => {
      // Simulate offline state
      (service as any).isOnline = false;

      await service.processSyncQueue();

      expect(mockIntegration.processSyncQueue).not.toHaveBeenCalled();
    });
  });

  describe('Provider Status', () => {
    it('should get provider status', async () => {
      const mockStatus = {
        'HealthKit': { available: true, hasPermissions: true },
        'GoogleFit': { available: true, hasPermissions: false }
      };

      mockIntegration.getProviderStatus.mockResolvedValue(mockStatus);

      const status = await service.getProviderStatus();

      expect(status).toEqual(mockStatus);
    });
  });

  describe('Subscriptions', () => {
    it('should subscribe to health updates', async () => {
      const mockCallback = jest.fn();
      mockIntegration.subscribeToAllUpdates.mockReturnValue(jest.fn());

      const unsubscribe = service.subscribeToHealthUpdates(mockCallback);

      expect(typeof unsubscribe).toBe('function');
      expect(mockIntegration.subscribeToAllUpdates).toHaveBeenCalled();
    });

    it('should call callback with aggregated metrics on updates', async () => {
      const mockCallback = jest.fn();
      let updateCallback: (data: HealthDataPoint[]) => void;

      mockIntegration.subscribeToAllUpdates.mockImplementation((callback) => {
        updateCallback = callback;
        return jest.fn();
      });

      service.subscribeToHealthUpdates(mockCallback);

      // Simulate update
      updateCallback!(mockHealthData);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          heartRate: 72,
          activityLevel: 8500,
          caloriesConsumed: 2100
        })
      );
    });
  });

  describe('Data Management', () => {
    it('should clear old data', async () => {
      mockOfflineStorage.clearOldData.mockResolvedValue();

      await service.clearOldData(14);

      expect(mockOfflineStorage.clearOldData).toHaveBeenCalledWith(14);
    });

    it('should get storage information', async () => {
      const mockStorageInfo = { totalSize: 1024, itemCount: 10 };
      mockOfflineStorage.getStorageSize.mockResolvedValue(mockStorageInfo);

      const info = await service.getStorageInfo();

      expect(info).toEqual(mockStorageInfo);
    });

    it('should get sync status', async () => {
      const mockSyncStatus = {
        lastSyncTime: new Date(),
        pendingItems: 5,
        failedItems: 1,
        totalItems: 20
      };

      mockOfflineStorage.getSyncStatus.mockResolvedValue(mockSyncStatus);

      const status = await service.getSyncStatus();

      expect(status).toEqual(mockSyncStatus);
    });
  });

  describe('Cleanup', () => {
    it('should dispose resources properly', () => {
      const disposeSpy = jest.spyOn(service, 'dispose');

      service.dispose();

      expect(disposeSpy).toHaveBeenCalled();
    });
  });
});