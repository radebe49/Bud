/**
 * Tests for data migration utilities
 */

import { DataMigrationUtils, migration_1_0_0, migration_1_1_0 } from '../dataMigrations';
import { storageService, STORAGE_KEYS } from '../storageService';

// Mock storage service
jest.mock('../storageService', () => ({
  storageService: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    getUserProfile: jest.fn(),
    setUserProfile: jest.fn(),
    getAppSettings: jest.fn(),
    setAppSettings: jest.fn(),
    getConversationHistory: jest.fn(),
    getHealthDataPoints: jest.fn(),
    getSyncQueue: jest.fn(),
    removeItem: jest.fn(),
    registerMigration: jest.fn(),
    initialize: jest.fn(),
    getStorageStats: jest.fn(),
  },
  STORAGE_KEYS: {
    CONVERSATION_HISTORY: 'conversation_history',
    HEALTH_DATA_POINTS: 'health_data_points',
    USER_PROFILE: 'user_profile',
    SYNC_QUEUE: 'sync_queue',
  },
}));

describe('DataMigrationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Migration 1.0.0', () => {
    it('should migrate conversation history to add messageType', async () => {
      const oldConversations = [
        {
          id: 'msg-1',
          content: 'Hello',
          sender: 'user',
          timestamp: '2023-01-01T00:00:00.000Z',
          // missing messageType
        },
        {
          id: 'msg-2',
          content: 'Hi there!',
          sender: 'bud',
          timestamp: '2023-01-01T00:01:00.000Z',
          messageType: 'text', // already has messageType
        },
      ];

      (storageService.getItem as jest.Mock).mockResolvedValue(oldConversations);

      await migration_1_0_0.migrate();

      expect(storageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CONVERSATION_HISTORY,
        expect.arrayContaining([
          expect.objectContaining({
            id: 'msg-1',
            messageType: 'text', // should be added
          }),
          expect.objectContaining({
            id: 'msg-2',
            messageType: 'text', // should remain
          }),
        ])
      );
    });

    it('should migrate health data to add missing fields', async () => {
      const oldHealthData = [
        {
          id: 'health-1',
          metric: 'heart_rate',
          value: 72,
          unit: 'bpm',
          timestamp: '2023-01-01T00:00:00.000Z',
          // missing confidence and source
        },
        {
          id: 'health-2',
          metric: 'steps',
          value: 5000,
          unit: 'steps',
          timestamp: '2023-01-01T00:00:00.000Z',
          confidence: 0.9,
          source: 'healthkit', // already has fields
        },
      ];

      (storageService.getItem as jest.Mock)
        .mockResolvedValueOnce([]) // conversations
        .mockResolvedValueOnce(oldHealthData); // health data

      await migration_1_0_0.migrate();

      expect(storageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.HEALTH_DATA_POINTS,
        expect.arrayContaining([
          expect.objectContaining({
            id: 'health-1',
            confidence: 1.0, // should be added
            source: 'manual', // should be added
          }),
          expect.objectContaining({
            id: 'health-2',
            confidence: 0.9, // should remain
            source: 'healthkit', // should remain
          }),
        ])
      );
    });

    it('should handle empty data gracefully', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue([]);

      await migration_1_0_0.migrate();

      // Should not call setItem for empty arrays
      expect(storageService.setItem).not.toHaveBeenCalled();
    });

    it('should handle migration errors', async () => {
      (storageService.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(migration_1_0_0.migrate()).rejects.toThrow('Storage error');
    });
  });

  describe('Migration 1.1.0', () => {
    it('should add metadata to chat messages', async () => {
      const conversations = [
        {
          id: 'msg-1',
          content: 'Hello',
          sender: 'user',
          messageType: 'text',
          // missing metadata
        },
      ];

      (storageService.getItem as jest.Mock)
        .mockResolvedValueOnce(conversations) // conversations
        .mockResolvedValueOnce(null) // user profile
        .mockResolvedValueOnce([]); // sync queue

      await migration_1_1_0.migrate();

      expect(storageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CONVERSATION_HISTORY,
        expect.arrayContaining([
          expect.objectContaining({
            id: 'msg-1',
            metadata: {}, // should be added
          }),
        ])
      );
    });

    it('should restructure user profile', async () => {
      const oldProfile = {
        name: 'Test User',
        workoutDuration: 45,
        preferredWorkoutTime: 'evening',
        // missing preferences structure
      };

      (storageService.getItem as jest.Mock)
        .mockResolvedValueOnce([]) // conversations
        .mockResolvedValueOnce(oldProfile) // user profile
        .mockResolvedValueOnce([]); // sync queue

      await migration_1_1_0.migrate();

      expect(storageService.setUserProfile).toHaveBeenCalledWith({
        name: 'Test User',
        workoutDuration: 45,
        preferredWorkoutTime: 'evening',
        preferences: {
          workoutDuration: 45,
          preferredWorkoutTime: 'evening',
        },
      });
    });

    it('should add priorities to sync queue items', async () => {
      const syncQueue = [
        {
          id: 'sync-1',
          type: 'health_data',
          action: 'create',
          data: {},
          // missing priority
        },
      ];

      (storageService.getItem as jest.Mock)
        .mockResolvedValueOnce([]) // conversations
        .mockResolvedValueOnce(null) // user profile
        .mockResolvedValueOnce(syncQueue); // sync queue

      await migration_1_1_0.migrate();

      expect(storageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SYNC_QUEUE,
        expect.arrayContaining([
          expect.objectContaining({
            id: 'sync-1',
            priority: 'normal', // should be added
          }),
        ])
      );
    });
  });

  describe('Backup and Restore', () => {
    it('should create backup successfully', async () => {
      const mockData = {
        conversations: [{ id: 'msg-1' }],
        healthData: [{ id: 'health-1' }],
        userProfile: { name: 'Test' },
        appSettings: { theme: 'dark' },
        syncQueue: [{ id: 'sync-1' }],
      };

      (storageService.getConversationHistory as jest.Mock).mockResolvedValue(mockData.conversations);
      (storageService.getHealthDataPoints as jest.Mock).mockResolvedValue(mockData.healthData);
      (storageService.getUserProfile as jest.Mock).mockResolvedValue(mockData.userProfile);
      (storageService.getAppSettings as jest.Mock).mockResolvedValue(mockData.appSettings);
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue(mockData.syncQueue);

      const backupKey = await DataMigrationUtils.createBackup();

      expect(backupKey).toMatch(/^backup_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/);
      expect(storageService.setItem).toHaveBeenCalledWith(
        backupKey,
        expect.objectContaining(mockData)
      );
    });

    it('should restore from backup successfully', async () => {
      const backupData = {
        conversations: [{ id: 'msg-1' }],
        healthData: [{ id: 'health-1' }],
        userProfile: { name: 'Test' },
        appSettings: { theme: 'dark' },
        syncQueue: [{ id: 'sync-1' }],
      };

      (storageService.getItem as jest.Mock).mockResolvedValue(backupData);

      await DataMigrationUtils.restoreFromBackup('backup_test');

      expect(storageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CONVERSATION_HISTORY,
        backupData.conversations
      );
      expect(storageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.HEALTH_DATA_POINTS,
        backupData.healthData
      );
      expect(storageService.setUserProfile).toHaveBeenCalledWith(backupData.userProfile);
      expect(storageService.setAppSettings).toHaveBeenCalledWith(backupData.appSettings);
    });

    it('should handle missing backup', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue(null);

      await expect(DataMigrationUtils.restoreFromBackup('nonexistent')).rejects.toThrow(
        'Backup not found: nonexistent'
      );
    });
  });

  describe('Data Validation', () => {
    it('should validate data integrity successfully', async () => {
      const validConversations = [
        {
          id: 'msg-1',
          content: 'Hello',
          sender: 'user',
          messageType: 'text',
        },
      ];

      const validHealthData = [
        {
          id: 'health-1',
          metric: 'heart_rate',
          value: 72,
        },
      ];

      const validSyncQueue = [
        {
          id: 'sync-1',
          type: 'health_data',
          action: 'create',
          priority: 'normal',
        },
      ];

      (storageService.getConversationHistory as jest.Mock).mockResolvedValue(validConversations);
      (storageService.getHealthDataPoints as jest.Mock).mockResolvedValue(validHealthData);
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue(validSyncQueue);

      const result = await DataMigrationUtils.validateDataIntegrity();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid data', async () => {
      const invalidConversations = [
        {
          id: 'msg-1',
          // missing content, sender, messageType
        },
      ];

      const invalidHealthData = [
        {
          id: 'health-1',
          // missing metric and value
        },
      ];

      (storageService.getConversationHistory as jest.Mock).mockResolvedValue(invalidConversations);
      (storageService.getHealthDataPoints as jest.Mock).mockResolvedValue(invalidHealthData);
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([]);

      const result = await DataMigrationUtils.validateDataIntegrity();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid chat message: msg-1');
      expect(result.errors).toContain('Invalid health data point: health-1');
    });
  });

  describe('Safe Migration', () => {
    it('should perform safe migration successfully', async () => {
      // Mock successful backup creation
      (storageService.getConversationHistory as jest.Mock).mockResolvedValue([]);
      (storageService.getHealthDataPoints as jest.Mock).mockResolvedValue([]);
      (storageService.getUserProfile as jest.Mock).mockResolvedValue(null);
      (storageService.getAppSettings as jest.Mock).mockResolvedValue(null);
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([]);
      (storageService.getStorageStats as jest.Mock).mockResolvedValue({});

      const result = await DataMigrationUtils.performSafeMigration();

      expect(result.success).toBe(true);
      expect(result.backupKey).toBeDefined();
      expect(result.errors).toHaveLength(0);
      expect(storageService.registerMigration).toHaveBeenCalledTimes(2);
      expect(storageService.initialize).toHaveBeenCalled();
    });

    it('should handle migration failure and restore backup', async () => {
      // Mock backup creation
      (storageService.getConversationHistory as jest.Mock).mockResolvedValue([]);
      (storageService.getHealthDataPoints as jest.Mock).mockResolvedValue([]);
      (storageService.getUserProfile as jest.Mock).mockResolvedValue(null);
      (storageService.getAppSettings as jest.Mock).mockResolvedValue(null);
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([]);

      // Mock migration failure
      (storageService.initialize as jest.Mock).mockRejectedValue(new Error('Migration failed'));

      // Mock backup data for restore
      (storageService.getItem as jest.Mock).mockResolvedValue({
        conversations: [],
        healthData: [],
        userProfile: null,
        appSettings: null,
        syncQueue: [],
      });

      const result = await DataMigrationUtils.performSafeMigration();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Migration failed');
      expect(result.errors).toContain('Migration failed, restored from backup');
    });
  });

  describe('Registration', () => {
    it('should register all migrations', () => {
      DataMigrationUtils.registerAllMigrations();

      expect(storageService.registerMigration).toHaveBeenCalledWith(migration_1_0_0);
      expect(storageService.registerMigration).toHaveBeenCalledWith(migration_1_1_0);
    });
  });
});