/**
 * Supabase integration service for syncing local storage with cloud database
 * Provides offline-first functionality with automatic sync when online
 */

import { supabase } from './supabaseClient';
import { storageService, SyncQueueItem } from './storageService';
import { ChatMessage, ConversationContext } from '@/features/coaching/types/coachingTypes';
import { HealthDataPoint, DailyHealthSummary } from '@/features/health/types/healthTypes';
import { UUID } from '@/shared/types/globalTypes';

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: string[];
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingItems: number;
  isSyncing: boolean;
}

class SupabaseStorageService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Initialize Supabase storage service and start automatic sync
   */
  async initialize(): Promise<void> {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await this.startAutoSync();
      }
    } catch (error) {
      console.warn('Supabase initialization failed, continuing in offline mode:', error);
    }
  }

  /**
   * Start automatic sync process
   */
  async startAutoSync(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Initial sync
    await this.syncPendingItems();

    // Set up periodic sync
    this.syncInterval = setInterval(async () => {
      await this.syncPendingItems();
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop automatic sync process
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all pending items in the sync queue
   */
  async syncPendingItems(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: true, syncedItems: 0, failedItems: 0, errors: [] };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      failedItems: 0,
      errors: [],
    };

    try {
      const syncQueue = await storageService.getSyncQueue<SyncQueueItem>();
      
      if (syncQueue.length === 0) {
        return result;
      }

      // Check if we're online
      const isOnline = await this.checkOnlineStatus();
      if (!isOnline) {
        return result;
      }

      // Process items by priority
      const sortedQueue = syncQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      for (const item of sortedQueue) {
        try {
          await this.syncItem(item);
          await storageService.removeSyncQueueItem(item.id);
          result.syncedItems++;
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          result.failedItems++;
          result.errors.push(`Item ${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Update retry count
          await storageService.updateSyncQueueItem(item.id, {
            retryCount: item.retryCount + 1,
          });

          // Remove item if max retries exceeded
          if (item.retryCount >= 3) {
            await storageService.removeSyncQueueItem(item.id);
            console.warn(`Removing item ${item.id} after max retries`);
          }
        }
      }

      result.success = result.failedItems === 0;
    } catch (error) {
      console.error('Sync process failed:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Sync individual item based on type and action
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    switch (item.type) {
      case 'health_data':
        await this.syncHealthData(item, user.id);
        break;
      case 'conversation':
        await this.syncConversationData(item, user.id);
        break;
      case 'user_profile':
        await this.syncUserProfile(item, user.id);
        break;
      case 'settings':
        await this.syncSettings(item, user.id);
        break;
      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }
  }

  /**
   * Sync health data to Supabase
   */
  private async syncHealthData(item: SyncQueueItem, userId: string): Promise<void> {
    const data = item.data;

    if (this.isHealthDataPoint(data)) {
      switch (item.action) {
        case 'create':
          await supabase
            .from('health_data_points')
            .insert({
              ...data,
              user_id: userId,
            });
          break;
        case 'update':
          await supabase
            .from('health_data_points')
            .update(data)
            .eq('id', data.id)
            .eq('user_id', userId);
          break;
        case 'delete':
          await supabase
            .from('health_data_points')
            .delete()
            .eq('id', data.id)
            .eq('user_id', userId);
          break;
      }
    } else if (this.isDailyHealthSummary(data)) {
      switch (item.action) {
        case 'create':
        case 'update':
          await supabase
            .from('daily_health_summaries')
            .upsert({
              ...data,
              user_id: userId,
            });
          break;
        case 'delete':
          await supabase
            .from('daily_health_summaries')
            .delete()
            .eq('date', data.date)
            .eq('user_id', userId);
          break;
      }
    }
  }

  /**
   * Sync conversation data to Supabase
   */
  private async syncConversationData(item: SyncQueueItem, userId: string): Promise<void> {
    const data = item.data;

    if (this.isChatMessage(data)) {
      switch (item.action) {
        case 'create':
          await supabase
            .from('chat_messages')
            .insert({
              ...data,
              user_id: userId,
            });
          break;
        case 'update':
          await supabase
            .from('chat_messages')
            .update(data)
            .eq('id', data.id)
            .eq('user_id', userId);
          break;
        case 'delete':
          await supabase
            .from('chat_messages')
            .delete()
            .eq('id', data.id)
            .eq('user_id', userId);
          break;
      }
    } else if (this.isConversationContext(data)) {
      await supabase
        .from('conversation_contexts')
        .upsert({
          ...data,
          user_id: userId,
        });
    }
  }

  /**
   * Sync user profile data to Supabase
   */
  private async syncUserProfile(item: SyncQueueItem, userId: string): Promise<void> {
    const data = item.data;

    switch (item.action) {
      case 'create':
      case 'update':
        await supabase
          .from('user_profiles')
          .upsert({
            ...data,
            user_id: userId,
          });
        break;
      case 'delete':
        await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', userId);
        break;
    }
  }

  /**
   * Sync app settings to Supabase
   */
  private async syncSettings(item: SyncQueueItem, userId: string): Promise<void> {
    const data = item.data;

    switch (item.action) {
      case 'create':
      case 'update':
        await supabase
          .from('user_settings')
          .upsert({
            ...data,
            user_id: userId,
          });
        break;
      case 'delete':
        await supabase
          .from('user_settings')
          .delete()
          .eq('user_id', userId);
        break;
    }
  }

  /**
   * Download data from Supabase to local storage
   */
  async downloadUserData(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Download health data
      const { data: healthData } = await supabase
        .from('health_data_points')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (healthData) {
        for (const point of healthData) {
          // Don't add to sync queue when downloading
          const localHealthData = await storageService.getHealthDataPoints();
          const exists = localHealthData.some(p => p.id === point.id);
          if (!exists) {
            localHealthData.push(point);
            await storageService.setItem('health_data_points', localHealthData);
          }
        }
      }

      // Download conversation history
      const { data: conversations } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (conversations) {
        const localConversations = await storageService.getConversationHistory();
        const newMessages = conversations.filter(msg => 
          !localConversations.some(local => local.id === msg.id)
        );
        
        if (newMessages.length > 0) {
          const updatedConversations = [...localConversations, ...newMessages]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          await storageService.setItem('conversation_history', updatedConversations);
        }
      }

      // Download user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await storageService.setUserProfile(profile);
      }

    } catch (error) {
      console.error('Failed to download user data:', error);
      throw error;
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const syncQueue = await storageService.getSyncQueue<SyncQueueItem>();
    const isOnline = await this.checkOnlineStatus();
    
    return {
      isOnline,
      lastSync: null, // TODO: Implement last sync tracking
      pendingItems: syncQueue.length,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Force immediate sync
   */
  async forcSync(): Promise<SyncResult> {
    return await this.syncPendingItems();
  }

  /**
   * Check if device is online
   */
  private async checkOnlineStatus(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('health_data_points').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Type guards
  private isHealthDataPoint(data: any): data is HealthDataPoint {
    return data && typeof data.metric === 'string' && typeof data.value === 'number';
  }

  private isDailyHealthSummary(data: any): data is DailyHealthSummary {
    return data && typeof data.date === 'string' && data.metrics;
  }

  private isChatMessage(data: any): data is ChatMessage {
    return data && typeof data.content === 'string' && data.sender && data.messageType;
  }

  private isConversationContext(data: any): data is ConversationContext {
    return data && data.sessionId && data.userId && data.currentTopic;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopAutoSync();
  }
}

// Create and export singleton instance
export const supabaseStorageService = new SupabaseStorageService();