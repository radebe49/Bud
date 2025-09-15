/**
 * Comprehensive tests for the enhanced storage service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService, STORAGE_KEYS, STORAGE_CONFIG } from '../storageService';
import { ChatMessage } from '@/features/coaching/types/coachingTypes';
import { HealthDataPoint } from '@/features/health/types/healthTypes';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock encrypted storage
jest.mock('react-native-encrypted-storage', () => ({
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset storage service state
    (storageService as any).isInitialized = false;
    (storageService as any).migrationScripts = [];
  });

  describe('Initialization and Migration', () => {
    it('should initialize storage service successfully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.initialize();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.STORAGE_VERSION);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.STORAGE_VERSION,
        JSON.stringify(STORAGE_CONFIG.CURRENT_VERSION)
      );
    });

    it('should run migrations in correct order', async () => {
      const migration1 = {
        version: '0.1.0',
        description: 'First migration',
        migrate: jest.fn().mockResolvedValue(undefined),
      };
      const migration2 = {
        version: '0.2.0',
        description: 'Second migration',
        migrate: jest.fn().mockResolvedValue(undefined),
      };

      storageService.registerMigration(migration2);
      storageService.registerMigration(migration1);

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // storage version
        .mockResolvedValueOnce(null) // migration status
        .mockResolvedValue(null); // other calls

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.initialize();

      expect(migration1.migrate).toHaveBeenCalled();
      expect(migration2.migrate).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(storageService.initialize()).rejects.toThrow();
    });
  });

  describe('Conversation History Management', () => {
    const mockMessage: ChatMessage = {
      id: 'msg-1',
      content: 'Hello Bud!',
      sender: 'user',
      timestamp: new Date(),
      messageType: 'text',
    };

    it('should save conversation message successfully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveConversationMessage(mockMessage);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CONVERSATION_HISTORY,
        JSON.stringify([mockMessage])
      );
    });

    it('should enforce maximum conversation history limit', async () => {
      const existingMessages = Array.from({ length: STORAGE_CONFIG.MAX_CONVERSATION_HISTORY }, (_, i) => ({
        ...mockMessage,
        id: `msg-${i}`,
        content: `Message ${i}`,
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingMessages));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveConversationMessage(mockMessage);

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedMessages = JSON.parse(setItemCall[1]);
      
      expect(savedMessages).toHaveLength(STORAGE_CONFIG.MAX_CONVERSATION_HISTORY);
      expect(savedMessages[savedMessages.length - 1]).toMatchObject({
        id: mockMessage.id,
        content: mockMessage.content,
        sender: mockMessage.sender,
        messageType: mockMessage.messageType,
      });
    });

    it('should retrieve conversation history', async () => {
      const messages = [mockMessage];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(messages));

      const result = await storageService.getConversationHistory();

      expect(result).toHaveLength(messages.length);
      expect(result[0]).toMatchObject({
        id: messages[0].id,
        content: messages[0].content,
        sender: messages[0].sender,
        messageType: messages[0].messageType,
      });
    });

    it('should return empty array when no conversation history exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.getConversationHistory();

      expect(result).toEqual([]);
    });

    it('should handle conversation history retrieval errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await storageService.getConversationHistory();

      expect(result).toEqual([]);
    });

    it('should clear conversation history', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.clearConversationHistory();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CONVERSATION_HISTORY,
        JSON.stringify([])
      );
    });
  });

  describe('Health Data Management', () => {
    const mockHealthDataPoint: HealthDataPoint = {
      id: 'health-1',
      userId: 'user-1',
      metric: 'heart_rate',
      value: 72,
      unit: 'bpm',
      timestamp: new Date(),
      source: 'manual',
      confidence: 1.0,
    };

    it('should save health data point and add to sync queue', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify([])) // health data points
        .mockResolvedValueOnce(JSON.stringify([])); // sync queue
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveHealthDataPoint(mockHealthDataPoint);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.HEALTH_DATA_POINTS,
        JSON.stringify([mockHealthDataPoint])
      );
      
      // Check that sync queue was updated
      const syncQueueCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === STORAGE_KEYS.SYNC_QUEUE
      );
      expect(syncQueueCall).toBeDefined();
    });

    it('should enforce maximum health data points limit', async () => {
      const existingData = Array.from({ length: STORAGE_CONFIG.MAX_HEALTH_DATA_POINTS }, (_, i) => ({
        ...mockHealthDataPoint,
        id: `health-${i}`,
        timestamp: new Date(Date.now() - i * 1000), // Different timestamps
      }));

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(existingData))
        .mockResolvedValueOnce(JSON.stringify([])); // sync queue
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveHealthDataPoint(mockHealthDataPoint);

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === STORAGE_KEYS.HEALTH_DATA_POINTS
      );
      const savedData = JSON.parse(setItemCall[1]);
      
      expect(savedData).toHaveLength(STORAGE_CONFIG.MAX_HEALTH_DATA_POINTS);
    });

    it('should retrieve health data points', async () => {
      const healthData = [mockHealthDataPoint];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(healthData));

      const result = await storageService.getHealthDataPoints();

      expect(result).toHaveLength(healthData.length);
      expect(result[0]).toMatchObject({
        id: healthData[0].id,
        metric: healthData[0].metric,
        value: healthData[0].value,
        unit: healthData[0].unit,
      });
    });
  });

  describe('Sync Queue Management', () => {
    it('should add item to sync queue', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.addToSyncQueue({
        type: 'health_data',
        action: 'create',
        data: { test: 'data' },
        priority: 'normal',
      });

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const syncQueue = JSON.parse(setItemCall[1]);
      
      expect(syncQueue).toHaveLength(1);
      expect(syncQueue[0]).toMatchObject({
        type: 'health_data',
        action: 'create',
        data: { test: 'data' },
        priority: 'normal',
        retryCount: 0,
      });
      expect(syncQueue[0].id).toBeDefined();
      expect(syncQueue[0].timestamp).toBeDefined();
    });

    it('should update sync queue item', async () => {
      const existingItem = {
        id: 'sync-1',
        type: 'health_data',
        action: 'create',
        data: { test: 'data' },
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: 'normal',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([existingItem]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.updateSyncQueueItem('sync-1', { retryCount: 1 });

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const syncQueue = JSON.parse(setItemCall[1]);
      
      expect(syncQueue[0].retryCount).toBe(1);
    });

    it('should remove sync queue item', async () => {
      const existingItems = [
        { id: 'sync-1', type: 'health_data', action: 'create', data: {}, timestamp: new Date().toISOString(), retryCount: 0, priority: 'normal' },
        { id: 'sync-2', type: 'conversation', action: 'create', data: {}, timestamp: new Date().toISOString(), retryCount: 0, priority: 'normal' },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingItems));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.removeSyncQueueItem('sync-1');

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const syncQueue = JSON.parse(setItemCall[1]);
      
      expect(syncQueue).toHaveLength(1);
      expect(syncQueue[0].id).toBe('sync-2');
    });
  });

  describe('Cleanup Functionality', () => {
    it('should perform cleanup when needed', async () => {
      const oldDate = new Date(Date.now() - (STORAGE_CONFIG.CLEANUP_INTERVAL_DAYS + 1) * 24 * 60 * 60 * 1000);
      
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(oldDate.toISOString())) // last cleanup
        .mockResolvedValue(JSON.stringify([])); // other data
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.performCleanupIfNeeded();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_CLEANUP,
        expect.any(String)
      );
    });

    it('should clean old conversation history', async () => {
      const now = new Date();
      const oldMessage = {
        id: 'old-msg',
        content: 'Old message',
        sender: 'user' as const,
        timestamp: new Date(now.getTime() - (STORAGE_CONFIG.CONVERSATION_RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000),
        messageType: 'text' as const,
      };
      const newMessage = {
        id: 'new-msg',
        content: 'New message',
        sender: 'user' as const,
        timestamp: now,
        messageType: 'text' as const,
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify([oldMessage, newMessage])) // conversation history
        .mockResolvedValueOnce(JSON.stringify([])) // health data
        .mockResolvedValueOnce(JSON.stringify([])); // daily summaries
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.performCleanup();

      const conversationCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === STORAGE_KEYS.CONVERSATION_HISTORY
      );
      const cleanedConversations = JSON.parse(conversationCall[1]);
      
      expect(cleanedConversations).toHaveLength(1);
      expect(cleanedConversations[0].id).toBe('new-msg');
    });

    it('should get storage statistics', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify([{}, {}])) // conversations
        .mockResolvedValueOnce(JSON.stringify([{}, {}, {}])) // health data
        .mockResolvedValueOnce(JSON.stringify([{}])) // summaries
        .mockResolvedValueOnce(JSON.stringify([{}, {}])) // sync queue
        .mockResolvedValueOnce(JSON.stringify('2023-01-01T00:00:00.000Z')) // last cleanup
        .mockResolvedValueOnce(JSON.stringify('1.0.0')); // version

      const stats = await storageService.getStorageStats();

      expect(stats).toEqual({
        conversationMessages: 2,
        healthDataPoints: 3,
        dailySummaries: 1,
        syncQueueItems: 2,
        lastCleanup: '2023-01-01T00:00:00.000Z',
        storageVersion: '1.0.0',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));

      await expect(storageService.setItem('test_key', 'test_value')).rejects.toThrow('Failed to store item: test_key');
    });

    it('should handle sync queue errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(storageService.addToSyncQueue({
        type: 'health_data',
        action: 'create',
        data: {},
        priority: 'normal',
      })).rejects.toThrow('Storage addToSyncQueue failed');
    });

    it('should handle cleanup errors without throwing', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(storageService.performCleanupIfNeeded()).resolves.toBeUndefined();
    });
  });

  describe('Batch Operations', () => {
    it('should handle multiple items correctly', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.setMultipleItems([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2', secure: false },
      ]);

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should retrieve multiple items correctly', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify('value1'))
        .mockResolvedValueOnce(JSON.stringify('value2'));

      const result = await storageService.getMultipleItems([
        { key: 'key1' },
        { key: 'key2' },
      ]);

      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });
  });
});