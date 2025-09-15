/**
 * Tests for Supabase storage service integration
 */

import { supabaseStorageService } from '../supabaseStorageService';
import { storageService } from '../storageService';
import { supabase } from '../supabaseClient';

// Mock Supabase client
jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock storage service
jest.mock('../storageService', () => ({
  storageService: {
    getSyncQueue: jest.fn(),
    removeSyncQueueItem: jest.fn(),
    updateSyncQueueItem: jest.fn(),
    getHealthDataPoints: jest.fn(),
    getConversationHistory: jest.fn(),
    setItem: jest.fn(),
    setUserProfile: jest.fn(),
  },
}));

describe('SupabaseStorageService', () => {
  const mockUser = { id: 'user-123' };
  const mockSupabaseQuery = {
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
  });

  describe('Initialization', () => {
    it('should initialize successfully when user is authenticated', async () => {
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([]);

      await supabaseStorageService.initialize();

      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('should handle initialization failure gracefully', async () => {
      (supabase.auth.getUser as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(supabaseStorageService.initialize()).resolves.toBeUndefined();
    });
  });

  describe('Sync Operations', () => {
    const mockSyncItem = {
      id: 'sync-1',
      type: 'health_data' as const,
      action: 'create' as const,
      data: {
        id: 'health-1',
        userId: 'user-123',
        metric: 'heart_rate',
        value: 72,
        unit: 'bpm',
        timestamp: new Date(),
        source: 'manual',
        confidence: 1.0,
      },
      timestamp: new Date().toISOString(),
      retryCount: 0,
      priority: 'normal' as const,
    };

    it('should sync pending items successfully', async () => {
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([mockSyncItem]);
      mockSupabaseQuery.insert.mockResolvedValue({ data: null, error: null });

      const result = await supabaseStorageService.syncPendingItems();

      expect(result.success).toBe(true);
      expect(result.syncedItems).toBe(1);
      expect(result.failedItems).toBe(0);
      expect(storageService.removeSyncQueueItem).toHaveBeenCalledWith('sync-1');
    });

    it('should handle sync failures and update retry count', async () => {
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([mockSyncItem]);
      mockSupabaseQuery.insert.mockRejectedValue(new Error('Database error'));

      const result = await supabaseStorageService.syncPendingItems();

      expect(result.success).toBe(false);
      expect(result.syncedItems).toBe(0);
      expect(result.failedItems).toBe(1);
      expect(storageService.updateSyncQueueItem).toHaveBeenCalledWith('sync-1', {
        retryCount: 1,
      });
    });

    it('should remove items after max retries', async () => {
      const itemWithMaxRetries = { ...mockSyncItem, retryCount: 3 };
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([itemWithMaxRetries]);
      mockSupabaseQuery.insert.mockRejectedValue(new Error('Database error'));

      await supabaseStorageService.syncPendingItems();

      expect(storageService.removeSyncQueueItem).toHaveBeenCalledWith('sync-1');
    });

    it('should skip sync when offline', async () => {
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([mockSyncItem]);
      // Mock offline status by making the health check fail
      mockSupabaseQuery.select.mockRejectedValue(new Error('Network error'));
      mockSupabaseQuery.limit.mockReturnValue(mockSupabaseQuery);

      const result = await supabaseStorageService.syncPendingItems();

      expect(result.syncedItems).toBe(0);
      expect(result.failedItems).toBe(0);
    });

    it('should process items by priority', async () => {
      const lowPriorityItem = { ...mockSyncItem, id: 'sync-low', priority: 'low' as const };
      const highPriorityItem = { ...mockSyncItem, id: 'sync-high', priority: 'high' as const };
      
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([lowPriorityItem, highPriorityItem]);
      mockSupabaseQuery.insert.mockResolvedValue({ data: null, error: null });

      await supabaseStorageService.syncPendingItems();

      // High priority item should be processed first
      const removeCallOrder = (storageService.removeSyncQueueItem as jest.Mock).mock.calls;
      expect(removeCallOrder[0][0]).toBe('sync-high');
      expect(removeCallOrder[1][0]).toBe('sync-low');
    });
  });

  describe('Health Data Sync', () => {
    it('should sync health data point creation', async () => {
      const healthDataItem = {
        id: 'sync-1',
        type: 'health_data' as const,
        action: 'create' as const,
        data: {
          id: 'health-1',
          metric: 'heart_rate',
          value: 72,
          unit: 'bpm',
          timestamp: new Date(),
          source: 'manual',
          confidence: 1.0,
        },
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: 'normal' as const,
      };

      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([healthDataItem]);
      mockSupabaseQuery.insert.mockResolvedValue({ data: null, error: null });

      await supabaseStorageService.syncPendingItems();

      expect(supabase.from).toHaveBeenCalledWith('health_data_points');
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        ...healthDataItem.data,
        user_id: mockUser.id,
      });
    });

    it('should sync daily health summary upsert', async () => {
      const summaryItem = {
        id: 'sync-1',
        type: 'health_data' as const,
        action: 'create' as const,
        data: {
          date: '2023-01-01',
          metrics: { heartRate: 72 },
          insights: [],
          readinessScore: 85,
          recommendations: [],
        },
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: 'normal' as const,
      };

      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([summaryItem]);
      mockSupabaseQuery.upsert.mockResolvedValue({ data: null, error: null });

      await supabaseStorageService.syncPendingItems();

      expect(supabase.from).toHaveBeenCalledWith('daily_health_summaries');
      expect(mockSupabaseQuery.upsert).toHaveBeenCalledWith({
        ...summaryItem.data,
        user_id: mockUser.id,
      });
    });
  });

  describe('Conversation Data Sync', () => {
    it('should sync chat message creation', async () => {
      const messageItem = {
        id: 'sync-1',
        type: 'conversation' as const,
        action: 'create' as const,
        data: {
          id: 'msg-1',
          content: 'Hello Bud!',
          sender: 'user',
          timestamp: new Date(),
          messageType: 'text',
        },
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: 'normal' as const,
      };

      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([messageItem]);
      mockSupabaseQuery.insert.mockResolvedValue({ data: null, error: null });

      await supabaseStorageService.syncPendingItems();

      expect(supabase.from).toHaveBeenCalledWith('chat_messages');
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        ...messageItem.data,
        user_id: mockUser.id,
      });
    });

    it('should sync conversation context upsert', async () => {
      const contextItem = {
        id: 'sync-1',
        type: 'conversation' as const,
        action: 'update' as const,
        data: {
          sessionId: 'session-1',
          userId: 'user-123',
          currentTopic: 'general',
          recentMetrics: {},
          activeGoals: [],
          conversationHistory: [],
          contextualFactors: [],
          lastInteraction: new Date(),
        },
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: 'normal' as const,
      };

      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([contextItem]);
      mockSupabaseQuery.upsert.mockResolvedValue({ data: null, error: null });

      await supabaseStorageService.syncPendingItems();

      expect(supabase.from).toHaveBeenCalledWith('conversation_contexts');
      expect(mockSupabaseQuery.upsert).toHaveBeenCalledWith({
        ...contextItem.data,
        user_id: mockUser.id,
      });
    });
  });

  describe('Data Download', () => {
    it('should download user data successfully', async () => {
      const mockHealthData = [
        { id: 'health-1', metric: 'heart_rate', value: 72, user_id: mockUser.id },
      ];
      const mockConversations = [
        { id: 'msg-1', content: 'Hello', sender: 'user', user_id: mockUser.id },
      ];
      const mockProfile = { id: 'profile-1', name: 'Test User', user_id: mockUser.id };

      mockSupabaseQuery.select
        .mockResolvedValueOnce({ data: mockHealthData }) // health data
        .mockResolvedValueOnce({ data: mockConversations }) // conversations
        .mockResolvedValueOnce({ data: mockProfile }); // profile

      (storageService.getHealthDataPoints as jest.Mock).mockResolvedValue([]);
      (storageService.getConversationHistory as jest.Mock).mockResolvedValue([]);

      await supabaseStorageService.downloadUserData();

      expect(storageService.setItem).toHaveBeenCalledWith('health_data_points', mockHealthData);
      expect(storageService.setItem).toHaveBeenCalledWith('conversation_history', mockConversations);
      expect(storageService.setUserProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('should handle download errors', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      await expect(supabaseStorageService.downloadUserData()).rejects.toThrow('User not authenticated');
    });

    it('should not duplicate existing data during download', async () => {
      const existingHealthData = [{ id: 'health-1', metric: 'heart_rate', value: 70 }];
      const newHealthData = [
        { id: 'health-1', metric: 'heart_rate', value: 72 }, // duplicate
        { id: 'health-2', metric: 'steps', value: 5000 }, // new
      ];

      mockSupabaseQuery.select.mockResolvedValueOnce({ data: newHealthData });
      (storageService.getHealthDataPoints as jest.Mock).mockResolvedValue(existingHealthData);

      await supabaseStorageService.downloadUserData();

      // Should only add the new item
      expect(storageService.setItem).toHaveBeenCalledWith('health_data_points', [
        ...existingHealthData,
        { id: 'health-2', metric: 'steps', value: 5000 },
      ]);
    });
  });

  describe('Sync Status', () => {
    it('should return correct sync status', async () => {
      const mockSyncQueue = [{ id: 'sync-1' }, { id: 'sync-2' }];
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue(mockSyncQueue);
      mockSupabaseQuery.select.mockResolvedValue({ data: [], error: null });

      const status = await supabaseStorageService.getSyncStatus();

      expect(status.isOnline).toBe(true);
      expect(status.pendingItems).toBe(2);
      expect(status.isSyncing).toBe(false);
    });

    it('should detect offline status', async () => {
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([]);
      mockSupabaseQuery.select.mockRejectedValue(new Error('Network error'));
      mockSupabaseQuery.limit.mockReturnValue(mockSupabaseQuery);

      const status = await supabaseStorageService.getSyncStatus();

      expect(status.isOnline).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([{
        id: 'sync-1',
        type: 'health_data',
        action: 'create',
        data: {},
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: 'normal',
      }]);

      const result = await supabaseStorageService.syncPendingItems();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Item sync-1: User not authenticated');
    });

    it('should handle unknown sync item types', async () => {
      (storageService.getSyncQueue as jest.Mock).mockResolvedValue([{
        id: 'sync-1',
        type: 'unknown_type',
        action: 'create',
        data: {},
        timestamp: new Date().toISOString(),
        retryCount: 0,
        priority: 'normal',
      }]);

      const result = await supabaseStorageService.syncPendingItems();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Item sync-1: Unknown sync item type: unknown_type');
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', () => {
      const stopAutoSyncSpy = jest.spyOn(supabaseStorageService, 'stopAutoSync');
      
      supabaseStorageService.destroy();

      expect(stopAutoSyncSpy).toHaveBeenCalled();
    });
  });
});