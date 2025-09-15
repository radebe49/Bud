/**
 * Enhanced storage service for offline-first functionality with Supabase integration
 * Provides AsyncStorage wrapper with error handling, conversation history persistence,
 * automatic cleanup, and data migration utilities
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ChatMessage, ConversationContext } from '@/features/coaching/types/coachingTypes';
import { HealthDataPoint, DailyHealthSummary } from '@/features/health/types/healthTypes';
import { UUID } from '@/shared/types/globalTypes';

// Conditionally import encrypted storage for native platforms only
let EncryptedStorage: any = null;
if (Platform.OS !== 'web') {
  try {
    EncryptedStorage = require('react-native-encrypted-storage').default;
  } catch (error) {
    console.warn('EncryptedStorage not available, falling back to AsyncStorage');
  }
}

// Storage keys with versioning for migration support
export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  CURRENT_USER: 'current_user',
  USER_DATABASE: 'user_database',
  
  // Subscription
  SUBSCRIPTION_STATUS: 'subscription_status',
  
  // Health data
  HEALTH_METRICS: 'health_metrics',
  HEALTH_DATA_POINTS: 'health_data_points',
  DAILY_SUMMARIES: 'daily_summaries',
  SYNC_QUEUE: 'sync_queue',
  OFFLINE_DATA: 'offline_data',
  
  // Coaching
  CONVERSATION_HISTORY: 'conversation_history',
  CONVERSATION_CONTEXT: 'conversation_context',
  COACHING_PREFERENCES: 'coaching_preferences',
  
  // App settings
  APP_SETTINGS: 'app_settings',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  
  // Storage management
  STORAGE_VERSION: 'storage_version',
  LAST_CLEANUP: 'last_cleanup',
  MIGRATION_STATUS: 'migration_status',
} as const;

// Storage configuration
export const STORAGE_CONFIG = {
  CURRENT_VERSION: '1.0.0',
  MAX_CONVERSATION_HISTORY: 1000, // Maximum number of messages to keep
  MAX_HEALTH_DATA_POINTS: 10000, // Maximum number of health data points
  CLEANUP_INTERVAL_DAYS: 7, // Days between automatic cleanup
  CONVERSATION_RETENTION_DAYS: 30, // Days to keep conversation history
  HEALTH_DATA_RETENTION_DAYS: 365, // Days to keep health data
} as const;

// Data migration interface
export interface MigrationScript {
  version: string;
  description: string;
  migrate: () => Promise<void>;
}

// Storage error types
export interface StorageError extends Error {
  code: 'STORAGE_ERROR' | 'MIGRATION_ERROR' | 'CLEANUP_ERROR' | 'SYNC_ERROR';
  operation: string;
  key?: string;
}

// Sync queue item interface
export interface SyncQueueItem {
  id: string;
  type: 'health_data' | 'conversation' | 'user_profile' | 'settings';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
  priority: 'low' | 'normal' | 'high';
}

// Enhanced storage service class with offline-first functionality
class StorageService {
  private migrationScripts: MigrationScript[] = [];
  private isInitialized = false;
  /**
   * Initialize storage service with migration and cleanup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.runMigrations();
      await this.performCleanupIfNeeded();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize storage service:', error);
      throw this.createStorageError('STORAGE_ERROR', 'initialize', undefined, error as Error);
    }
  }

  /**
   * Register migration scripts
   */
  registerMigration(migration: MigrationScript): void {
    this.migrationScripts.push(migration);
    // Sort by version to ensure proper order
    this.migrationScripts.sort((a, b) => a.version.localeCompare(b.version));
  }

  /**
   * Run pending migrations
   */
  private async runMigrations(): Promise<void> {
    try {
      const currentVersion = await this.getItem<string>(STORAGE_KEYS.STORAGE_VERSION) || '0.0.0';
      const migrationStatus = await this.getItem<Record<string, boolean>>(STORAGE_KEYS.MIGRATION_STATUS) || {};

      for (const migration of this.migrationScripts) {
        if (migration.version > currentVersion && !migrationStatus[migration.version]) {
          console.log(`Running migration: ${migration.version} - ${migration.description}`);
          await migration.migrate();
          migrationStatus[migration.version] = true;
          await this.setItem(STORAGE_KEYS.MIGRATION_STATUS, migrationStatus);
        }
      }

      await this.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_CONFIG.CURRENT_VERSION);
    } catch (error) {
      throw this.createStorageError('MIGRATION_ERROR', 'runMigrations', undefined, error as Error);
    }
  }

  /**
   * Create standardized storage error
   */
  private createStorageError(
    code: StorageError['code'],
    operation: string,
    key?: string,
    originalError?: Error
  ): StorageError {
    const error = new Error(`Storage ${operation} failed${key ? ` for key: ${key}` : ''}${originalError ? `: ${originalError.message}` : ''}`) as StorageError;
    error.code = code;
    error.operation = operation;
    error.key = key;
    return error;
  }

  // Secure storage methods (for sensitive data)
  async setSecureItem(key: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (EncryptedStorage) {
        await EncryptedStorage.setItem(key, serializedValue);
      } else {
        // Fallback to AsyncStorage on web with a prefix to indicate it's "secure" data
        await AsyncStorage.setItem(`secure_${key}`, serializedValue);
      }
    } catch (error) {
      console.error(`Error storing secure item ${key}:`, error);
      throw new Error(`Failed to store secure item: ${key}`);
    }
  }

  async getSecureItem<T>(key: string): Promise<T | null> {
    try {
      let serializedValue: string | null;
      if (EncryptedStorage) {
        serializedValue = await EncryptedStorage.getItem(key);
      } else {
        // Fallback to AsyncStorage on web
        serializedValue = await AsyncStorage.getItem(`secure_${key}`);
      }
      
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error retrieving secure item ${key}:`, error);
      return null;
    }
  }

  async removeSecureItem(key: string): Promise<void> {
    try {
      if (EncryptedStorage) {
        await EncryptedStorage.removeItem(key);
      } else {
        // Fallback to AsyncStorage on web
        await AsyncStorage.removeItem(`secure_${key}`);
      }
    } catch (error) {
      console.error(`Error removing secure item ${key}:`, error);
      throw new Error(`Failed to remove secure item: ${key}`);
    }
  }

  async clearSecureStorage(): Promise<void> {
    try {
      if (EncryptedStorage) {
        await EncryptedStorage.clear();
      } else {
        // Fallback: clear all secure items from AsyncStorage on web
        const keys = await AsyncStorage.getAllKeys();
        const secureKeys = keys.filter(key => key.startsWith('secure_'));
        await AsyncStorage.multiRemove(secureKeys);
      }
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw new Error('Failed to clear secure storage');
    }
  }

  // Regular storage methods (for non-sensitive data)
  async setItem(key: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error storing item ${key}:`, error);
      throw new Error(`Failed to store item: ${key}`);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const serializedValue = await AsyncStorage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error retrieving item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw new Error(`Failed to remove item: ${key}`);
    }
  }

  async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  // Convenience methods for common operations
  async setAuthToken(token: string): Promise<void> {
    await this.setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken(): Promise<string | null> {
    return this.getSecureItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  async clearAuthData(): Promise<void> {
    await Promise.all([
      this.removeSecureItem(STORAGE_KEYS.AUTH_TOKEN),
      this.removeSecureItem(STORAGE_KEYS.REFRESH_TOKEN),
      this.removeSecureItem(STORAGE_KEYS.USER_PROFILE),
    ]);
  }

  async setUserProfile(profile: any): Promise<void> {
    await this.setSecureItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  async getUserProfile<T>(): Promise<T | null> {
    return this.getSecureItem<T>(STORAGE_KEYS.USER_PROFILE);
  }

  async setAppSettings(settings: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  async getAppSettings<T>(): Promise<T | null> {
    return this.getItem<T>(STORAGE_KEYS.APP_SETTINGS);
  }

  async isOnboardingCompleted(): Promise<boolean> {
    const completed = await this.getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed === true;
  }

  async setOnboardingCompleted(completed: boolean = true): Promise<void> {
    await this.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  }

  // Batch operations
  async setMultipleItems(items: Array<{ key: string; value: any; secure?: boolean }>): Promise<void> {
    const operations = items.map(({ key, value, secure = false }) => {
      return secure ? this.setSecureItem(key, value) : this.setItem(key, value);
    });
    
    await Promise.all(operations);
  }

  async getMultipleItems<T>(keys: Array<{ key: string; secure?: boolean }>): Promise<Record<string, T | null>> {
    const operations = keys.map(async ({ key, secure = false }) => {
      const value = secure ? await this.getSecureItem<T>(key) : await this.getItem<T>(key);
      return { key, value };
    });

    const results = await Promise.all(operations);
    return results.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, T | null>);
  }

  // Health data specific methods
  async cacheHealthData(data: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.HEALTH_METRICS, {
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async getCachedHealthData<T>(): Promise<{ data: T; timestamp: string } | null> {
    return this.getItem<{ data: T; timestamp: string }>(STORAGE_KEYS.HEALTH_METRICS);
  }

  async addToSyncQueue(item: any): Promise<void> {
    const queue = await this.getItem<any[]>(STORAGE_KEYS.SYNC_QUEUE) || [];
    queue.push({
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  async getSyncQueue<T>(): Promise<T[]> {
    return (await this.getItem<T[]>(STORAGE_KEYS.SYNC_QUEUE)) || [];
  }

  async clearSyncQueue(): Promise<void> {
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, []);
  }

  // Conversation history management with automatic cleanup
  async saveConversationMessage(message: ChatMessage): Promise<void> {
    try {
      const history = await this.getConversationHistory();
      history.push(message);

      // Enforce maximum history limit
      if (history.length > STORAGE_CONFIG.MAX_CONVERSATION_HISTORY) {
        history.splice(0, history.length - STORAGE_CONFIG.MAX_CONVERSATION_HISTORY);
      }

      await this.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, history);
    } catch (error) {
      throw this.createStorageError('STORAGE_ERROR', 'saveConversationMessage', STORAGE_KEYS.CONVERSATION_HISTORY, error as Error);
    }
  }

  async getConversationHistory(): Promise<ChatMessage[]> {
    try {
      return (await this.getItem<ChatMessage[]>(STORAGE_KEYS.CONVERSATION_HISTORY)) || [];
    } catch (error) {
      console.error('Error retrieving conversation history:', error);
      return [];
    }
  }

  async clearConversationHistory(): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, []);
    } catch (error) {
      throw this.createStorageError('STORAGE_ERROR', 'clearConversationHistory', STORAGE_KEYS.CONVERSATION_HISTORY, error as Error);
    }
  }

  async saveConversationContext(context: ConversationContext): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.CONVERSATION_CONTEXT, context);
    } catch (error) {
      throw this.createStorageError('STORAGE_ERROR', 'saveConversationContext', STORAGE_KEYS.CONVERSATION_CONTEXT, error as Error);
    }
  }

  async getConversationContext(): Promise<ConversationContext | null> {
    try {
      return await this.getItem<ConversationContext>(STORAGE_KEYS.CONVERSATION_CONTEXT);
    } catch (error) {
      console.error('Error retrieving conversation context:', error);
      return null;
    }
  }

  // Health data management with retention policies
  async saveHealthDataPoint(dataPoint: HealthDataPoint): Promise<void> {
    try {
      const healthData = await this.getHealthDataPoints();
      healthData.push(dataPoint);

      // Enforce maximum data points limit
      if (healthData.length > STORAGE_CONFIG.MAX_HEALTH_DATA_POINTS) {
        // Remove oldest data points
        healthData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        healthData.splice(0, healthData.length - STORAGE_CONFIG.MAX_HEALTH_DATA_POINTS);
      }

      await this.setItem(STORAGE_KEYS.HEALTH_DATA_POINTS, healthData);
      
      // Add to sync queue for Supabase sync
      await this.addToSyncQueue({
        type: 'health_data',
        action: 'create',
        data: dataPoint,
        priority: 'normal'
      });
    } catch (error) {
      throw this.createStorageError('STORAGE_ERROR', 'saveHealthDataPoint', STORAGE_KEYS.HEALTH_DATA_POINTS, error as Error);
    }
  }

  async getHealthDataPoints(): Promise<HealthDataPoint[]> {
    try {
      return (await this.getItem<HealthDataPoint[]>(STORAGE_KEYS.HEALTH_DATA_POINTS)) || [];
    } catch (error) {
      console.error('Error retrieving health data points:', error);
      return [];
    }
  }

  async saveDailySummary(summary: DailyHealthSummary): Promise<void> {
    try {
      const summaries = await this.getDailySummaries();
      const existingIndex = summaries.findIndex(s => s.date === summary.date);
      
      if (existingIndex >= 0) {
        summaries[existingIndex] = summary;
      } else {
        summaries.push(summary);
      }

      await this.setItem(STORAGE_KEYS.DAILY_SUMMARIES, summaries);
      
      // Add to sync queue
      await this.addToSyncQueue({
        type: 'health_data',
        action: existingIndex >= 0 ? 'update' : 'create',
        data: summary,
        priority: 'normal'
      });
    } catch (error) {
      throw this.createStorageError('STORAGE_ERROR', 'saveDailySummary', STORAGE_KEYS.DAILY_SUMMARIES, error as Error);
    }
  }

  async getDailySummaries(): Promise<DailyHealthSummary[]> {
    try {
      return (await this.getItem<DailyHealthSummary[]>(STORAGE_KEYS.DAILY_SUMMARIES)) || [];
    } catch (error) {
      console.error('Error retrieving daily summaries:', error);
      return [];
    }
  }

  // Enhanced sync queue management
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getSyncQueue<SyncQueueItem>();
      const syncItem: SyncQueueItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
      
      queue.push(syncItem);
      await this.setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
    } catch (error) {
      throw this.createStorageError('SYNC_ERROR', 'addToSyncQueue', STORAGE_KEYS.SYNC_QUEUE, error as Error);
    }
  }

  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    try {
      const queue = await this.getSyncQueue<SyncQueueItem>();
      const itemIndex = queue.findIndex(item => item.id === id);
      
      if (itemIndex >= 0) {
        queue[itemIndex] = { ...queue[itemIndex], ...updates };
        await this.setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
      }
    } catch (error) {
      throw this.createStorageError('SYNC_ERROR', 'updateSyncQueueItem', STORAGE_KEYS.SYNC_QUEUE, error as Error);
    }
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue<SyncQueueItem>();
      const filteredQueue = queue.filter(item => item.id !== id);
      await this.setItem(STORAGE_KEYS.SYNC_QUEUE, filteredQueue);
    } catch (error) {
      throw this.createStorageError('SYNC_ERROR', 'removeSyncQueueItem', STORAGE_KEYS.SYNC_QUEUE, error as Error);
    }
  }

  // Automatic cleanup functionality
  async performCleanupIfNeeded(): Promise<void> {
    try {
      const lastCleanup = await this.getItem<string>(STORAGE_KEYS.LAST_CLEANUP);
      const now = new Date();
      const cleanupThreshold = new Date(now.getTime() - (STORAGE_CONFIG.CLEANUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000));

      if (!lastCleanup || new Date(lastCleanup) < cleanupThreshold) {
        await this.performCleanup();
        await this.setItem(STORAGE_KEYS.LAST_CLEANUP, now.toISOString());
      }
    } catch (error) {
      console.error('Cleanup check failed:', error);
      // Don't throw error for cleanup failures to avoid blocking app initialization
    }
  }

  async performCleanup(): Promise<void> {
    try {
      const now = new Date();
      
      // Clean old conversation history
      const conversationThreshold = new Date(now.getTime() - (STORAGE_CONFIG.CONVERSATION_RETENTION_DAYS * 24 * 60 * 60 * 1000));
      const conversations = await this.getConversationHistory();
      const filteredConversations = conversations.filter(msg => 
        new Date(msg.timestamp) > conversationThreshold
      );
      
      if (filteredConversations.length !== conversations.length) {
        await this.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, filteredConversations);
      }

      // Clean old health data
      const healthDataThreshold = new Date(now.getTime() - (STORAGE_CONFIG.HEALTH_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000));
      const healthData = await this.getHealthDataPoints();
      const filteredHealthData = healthData.filter(point => 
        new Date(point.timestamp) > healthDataThreshold
      );
      
      if (filteredHealthData.length !== healthData.length) {
        await this.setItem(STORAGE_KEYS.HEALTH_DATA_POINTS, filteredHealthData);
      }

      // Clean old daily summaries
      const summaries = await this.getDailySummaries();
      const filteredSummaries = summaries.filter(summary => {
        const summaryDate = new Date(summary.date);
        return summaryDate > healthDataThreshold;
      });
      
      if (filteredSummaries.length !== summaries.length) {
        await this.setItem(STORAGE_KEYS.DAILY_SUMMARIES, filteredSummaries);
      }

      console.log('Storage cleanup completed successfully');
    } catch (error) {
      throw this.createStorageError('CLEANUP_ERROR', 'performCleanup', undefined, error as Error);
    }
  }

  // Storage statistics and health check
  async getStorageStats(): Promise<{
    conversationMessages: number;
    healthDataPoints: number;
    dailySummaries: number;
    syncQueueItems: number;
    lastCleanup: string | null;
    storageVersion: string | null;
  }> {
    try {
      const [conversations, healthData, summaries, syncQueue, lastCleanup, version] = await Promise.all([
        this.getConversationHistory(),
        this.getHealthDataPoints(),
        this.getDailySummaries(),
        this.getSyncQueue(),
        this.getItem<string>(STORAGE_KEYS.LAST_CLEANUP),
        this.getItem<string>(STORAGE_KEYS.STORAGE_VERSION),
      ]);

      return {
        conversationMessages: conversations.length,
        healthDataPoints: healthData.length,
        dailySummaries: summaries.length,
        syncQueueItems: syncQueue.length,
        lastCleanup,
        storageVersion: version,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        conversationMessages: 0,
        healthDataPoints: 0,
        dailySummaries: 0,
        syncQueueItems: 0,
        lastCleanup: null,
        storageVersion: null,
      };
    }
  }

  // Force cleanup for testing or manual maintenance
  async forceCleanup(): Promise<void> {
    await this.performCleanup();
    await this.setItem(STORAGE_KEYS.LAST_CLEANUP, new Date().toISOString());
  }
}

// Create and export singleton instance
export const storageService = new StorageService();