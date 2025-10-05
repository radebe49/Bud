import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineHealthStorage } from '../offlineHealthStorage';
import { HealthDataPoint, DataSource } from '../../types/healthTypes';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('OfflineHealthStorage', () => {
  let storage: OfflineHealthStorage;
  let mockHealthData: HealthDataPoint[];

  beforeEach(() => {
    storage = new OfflineHealthStorage();
    mockAsyncStorage.getItem.mockClear();
    mockAsyncStorage.setItem.mockClear();
    mockAsyncStorage.multiRemove.mockClear();

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
      }
    ];
  });

  describe('Data Storage', () => {
    it('should store health data offline', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');
      mockAsyncStorage.setItem.mockResolvedValue();

      const id = await storage.storeHealthData(mockHealthData, 'healthkit');

      expect(id).toBeDefined();
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2); // Health data + sync queue
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(storage.storeHealthData(mockHealthData, 'healthkit'))
        .rejects.toThrow('Storage error');
    });
  });

  describe('Data Retrieval', () => {
    it('should retrieve all offline data', async () => {
      const mockStoredData = [
        {
          id: 'offline_123',
          data: mockHealthData,
          timestamp: '2024-01-01T10:00:00Z',
          synced: false,
          source: 'healthkit'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      const data = await storage.getAllOfflineData();

      expect(data).toHaveLength(1);
      expect(data[0].id).toBe('offline_123');
      expect(data[0].synced).toBe(false);
      expect(data[0].timestamp).toBeInstanceOf(Date);
    });

    it('should return empty array when no data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const data = await storage.getAllOfflineData();

      expect(data).toEqual([]);
    });

    it('should handle corrupted data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const data = await storage.getAllOfflineData();

      expect(data).toEqual([]);
    });
  });

  describe('Sync Status Management', () => {
    it('should mark data as synced', async () => {
      const mockStoredData = [
        {
          id: 'offline_123',
          data: mockHealthData,
          timestamp: '2024-01-01T10:00:00Z',
          synced: false,
          source: 'healthkit'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));
      mockAsyncStorage.setItem.mockResolvedValue();

      await storage.markAsSynced('offline_123');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'offline_health_data',
        expect.stringContaining('"synced":true')
      );
    });

    it('should get unsynced data only', async () => {
      const mockStoredData = [
        {
          id: 'offline_123',
          data: mockHealthData,
          timestamp: '2024-01-01T10:00:00Z',
          synced: false,
          source: 'healthkit'
        },
        {
          id: 'offline_456',
          data: mockHealthData,
          timestamp: '2024-01-01T11:00:00Z',
          synced: true,
          source: 'google_fit'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      const unsyncedData = await storage.getUnsyncedData();

      expect(unsyncedData).toHaveLength(1);
      expect(unsyncedData[0].id).toBe('offline_123');
      expect(unsyncedData[0].synced).toBe(false);
    });
  });

  describe('Sync Queue Management', () => {
    it('should manage sync queue items', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');
      mockAsyncStorage.setItem.mockResolvedValue();

      const offlineData = {
        id: 'offline_123',
        data: mockHealthData,
        timestamp: new Date(),
        synced: false,
        source: 'healthkit' as DataSource
      };

      await storage.addToSyncQueue(offlineData);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'sync_queue',
        expect.stringContaining('offline_123')
      );
    });

    it('should remove items from sync queue', async () => {
      const mockQueueData = [
        {
          id: 'offline_123',
          data: mockHealthData,
          timestamp: '2024-01-01T10:00:00Z',
          retryCount: 0,
          source: 'healthkit'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockQueueData));
      mockAsyncStorage.setItem.mockResolvedValue();

      await storage.removeFromSyncQueue('offline_123');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'sync_queue',
        '[]'
      );
    });

    it('should update sync queue item retry count', async () => {
      const mockQueueData = [
        {
          id: 'offline_123',
          data: mockHealthData,
          timestamp: '2024-01-01T10:00:00Z',
          retryCount: 0,
          source: 'healthkit'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockQueueData));
      mockAsyncStorage.setItem.mockResolvedValue();

      await storage.updateSyncQueueItem('offline_123', { retryCount: 1 });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'sync_queue',
        expect.stringContaining('"retryCount":1')
      );
    });
  });

  describe('Data Filtering', () => {
    it('should filter data by date range', async () => {
      const mockStoredData = [
        {
          id: 'offline_123',
          data: [
            {
              ...mockHealthData[0],
              timestamp: '2024-01-01T10:00:00Z'
            },
            {
              ...mockHealthData[1],
              timestamp: '2024-01-02T10:00:00Z'
            }
          ],
          timestamp: '2024-01-01T10:00:00Z',
          synced: false,
          source: 'healthkit'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T23:59:59Z');

      const filteredData = await storage.getHealthDataByDateRange(startDate, endDate);

      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].timestamp.toISOString()).toBe('2024-01-01T10:00:00.000Z');
    });

    it('should filter data by metric type', async () => {
      const mockStoredData = [
        {
          id: 'offline_123',
          data: mockHealthData,
          timestamp: '2024-01-01T10:00:00Z',
          synced: false,
          source: 'healthkit'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      const heartRateData = await storage.getHealthDataByMetric('heart_rate');

      expect(heartRateData).toHaveLength(1);
      expect(heartRateData[0].metric).toBe('heart_rate');
      expect(heartRateData[0].value).toBe(72);
    });
  });

  describe('Data Cleanup', () => {
    it('should clear old data while preserving unsynced data', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago

      const mockStoredData = [
        {
          id: 'old_synced',
          data: mockHealthData,
          timestamp: oldDate.toISOString(),
          synced: true,
          source: 'healthkit'
        },
        {
          id: 'old_unsynced',
          data: mockHealthData,
          timestamp: oldDate.toISOString(),
          synced: false,
          source: 'healthkit'
        },
        {
          id: 'recent',
          data: mockHealthData,
          timestamp: new Date().toISOString(),
          synced: false,
          source: 'healthkit'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredData));
      mockAsyncStorage.setItem.mockResolvedValue();

      await storage.clearOldData(30);

      // Should keep unsynced old data and recent data
      const setItemCalls = mockAsyncStorage.setItem.mock.calls;
      const healthDataCall = setItemCalls.find(call => call[0] === 'offline_health_data');
      const savedData = JSON.parse(healthDataCall![1] as string);

      expect(savedData).toHaveLength(2);
      expect(savedData.find((item: any) => item.id === 'old_synced')).toBeUndefined();
      expect(savedData.find((item: any) => item.id === 'old_unsynced')).toBeDefined();
      expect(savedData.find((item: any) => item.id === 'recent')).toBeDefined();
    });

    it('should clear all data', async () => {
      await storage.clearAllData();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'offline_health_data',
        'sync_queue',
        'sync_status',
        'last_sync_time'
      ]);
    });
  });

  describe('Storage Information', () => {
    it('should calculate storage size', async () => {
      const mockStoredData = [
        {
          id: 'offline_123',
          data: mockHealthData,
          timestamp: '2024-01-01T10:00:00Z',
          synced: false,
          source: 'healthkit'
        }
      ];

      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'offline_health_data') {
          return Promise.resolve(JSON.stringify(mockStoredData));
        }
        if (key === 'sync_queue') {
          return Promise.resolve('[]');
        }
        return Promise.resolve(null);
      });

      const storageInfo = await storage.getStorageSize();

      expect(storageInfo.totalSize).toBeGreaterThan(0);
      expect(storageInfo.itemCount).toBe(1);
    });
  });
});