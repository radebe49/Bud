/**
 * Example integration of the enhanced storage service with offline-first functionality
 * This file demonstrates how to use the storage service in the app
 */

import { storageService, supabaseStorageService, DataMigrationUtils } from './index';
import { ChatMessage } from '@/features/coaching/types/coachingTypes';
import { HealthDataPoint } from '@/features/health/types/healthTypes';

/**
 * Initialize the storage system with migrations and sync
 */
export async function initializeStorageSystem(): Promise<void> {
  try {
    // Register all migrations
    DataMigrationUtils.registerAllMigrations();
    
    // Initialize local storage with migrations and cleanup
    await storageService.initialize();
    
    // Initialize Supabase sync service
    await supabaseStorageService.initialize();
    
    console.log('Storage system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize storage system:', error);
    throw error;
  }
}

/**
 * Example: Save a chat message with automatic sync
 */
export async function saveChatMessage(message: ChatMessage): Promise<void> {
  try {
    // Save to local storage (offline-first)
    await storageService.saveConversationMessage(message);
    
    // Message is automatically added to sync queue for Supabase
    console.log('Chat message saved locally and queued for sync');
  } catch (error) {
    console.error('Failed to save chat message:', error);
    throw error;
  }
}

/**
 * Example: Save health data with automatic sync
 */
export async function saveHealthData(dataPoint: HealthDataPoint): Promise<void> {
  try {
    // Save to local storage (offline-first)
    await storageService.saveHealthDataPoint(dataPoint);
    
    // Data is automatically added to sync queue for Supabase
    console.log('Health data saved locally and queued for sync');
  } catch (error) {
    console.error('Failed to save health data:', error);
    throw error;
  }
}

/**
 * Example: Get conversation history (always from local storage for speed)
 */
export async function getConversationHistory(): Promise<ChatMessage[]> {
  try {
    return await storageService.getConversationHistory();
  } catch (error) {
    console.error('Failed to get conversation history:', error);
    return [];
  }
}

/**
 * Example: Get health data (always from local storage for speed)
 */
export async function getHealthData(): Promise<HealthDataPoint[]> {
  try {
    return await storageService.getHealthDataPoints();
  } catch (error) {
    console.error('Failed to get health data:', error);
    return [];
  }
}

/**
 * Example: Force sync with Supabase
 */
export async function forceSyncWithCloud(): Promise<void> {
  try {
    const result = await supabaseStorageService.forcSync();
    
    if (result.success) {
      console.log(`Sync completed: ${result.syncedItems} items synced`);
    } else {
      console.warn(`Sync completed with errors: ${result.errors.join(', ')}`);
    }
  } catch (error) {
    console.error('Failed to sync with cloud:', error);
  }
}

/**
 * Example: Get sync status
 */
export async function getSyncStatus(): Promise<void> {
  try {
    const status = await supabaseStorageService.getSyncStatus();
    
    console.log('Sync Status:', {
      isOnline: status.isOnline,
      pendingItems: status.pendingItems,
      isSyncing: status.isSyncing,
    });
  } catch (error) {
    console.error('Failed to get sync status:', error);
  }
}

/**
 * Example: Download user data from cloud (useful for new device setup)
 */
export async function downloadUserDataFromCloud(): Promise<void> {
  try {
    await supabaseStorageService.downloadUserData();
    console.log('User data downloaded from cloud successfully');
  } catch (error) {
    console.error('Failed to download user data:', error);
  }
}

/**
 * Example: Get storage statistics
 */
export async function getStorageStatistics(): Promise<void> {
  try {
    const stats = await storageService.getStorageStats();
    
    console.log('Storage Statistics:', {
      conversationMessages: stats.conversationMessages,
      healthDataPoints: stats.healthDataPoints,
      dailySummaries: stats.dailySummaries,
      syncQueueItems: stats.syncQueueItems,
      lastCleanup: stats.lastCleanup,
      storageVersion: stats.storageVersion,
    });
  } catch (error) {
    console.error('Failed to get storage statistics:', error);
  }
}

/**
 * Example: Perform safe migration (with backup and validation)
 */
export async function performSafeMigration(): Promise<void> {
  try {
    const result = await DataMigrationUtils.performSafeMigration();
    
    if (result.success) {
      console.log('Migration completed successfully');
      if (result.backupKey) {
        console.log(`Backup created: ${result.backupKey}`);
      }
    } else {
      console.error('Migration failed:', result.errors.join(', '));
    }
  } catch (error) {
    console.error('Failed to perform migration:', error);
  }
}

/**
 * Example: Clean up old data manually
 */
export async function performManualCleanup(): Promise<void> {
  try {
    await storageService.forceCleanup();
    console.log('Manual cleanup completed successfully');
  } catch (error) {
    console.error('Failed to perform manual cleanup:', error);
  }
}

/**
 * Example usage in app initialization
 */
export async function exampleAppInitialization(): Promise<void> {
  try {
    // 1. Initialize storage system
    await initializeStorageSystem();
    
    // 2. Get storage statistics
    await getStorageStatistics();
    
    // 3. Check sync status
    await getSyncStatus();
    
    // 4. Download any missing data from cloud (if online)
    const syncStatus = await supabaseStorageService.getSyncStatus();
    if (syncStatus.isOnline) {
      await downloadUserDataFromCloud();
    }
    
    console.log('App storage initialization completed');
  } catch (error) {
    console.error('App storage initialization failed:', error);
    // App can still work offline with local storage
  }
}

/**
 * Example usage during app runtime
 */
export async function exampleRuntimeUsage(): Promise<void> {
  // Save some data
  const message: ChatMessage = {
    id: 'msg-1',
    content: 'Hello Bud!',
    sender: 'user',
    timestamp: new Date(),
    messageType: 'text',
  };
  
  await saveChatMessage(message);
  
  const healthData: HealthDataPoint = {
    id: 'health-1',
    userId: 'user-1',
    metric: 'heart_rate',
    value: 72,
    unit: 'bpm',
    timestamp: new Date(),
    source: 'manual',
    confidence: 1.0,
  };
  
  await saveHealthData(healthData);
  
  // Retrieve data
  const conversations = await getConversationHistory();
  const health = await getHealthData();
  
  console.log(`Retrieved ${conversations.length} messages and ${health.length} health data points`);
  
  // Force sync if needed
  await forceSyncWithCloud();
}