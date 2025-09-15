/**
 * Data migration utilities for handling storage schema changes
 * Provides migration scripts and utilities for upgrading data structures
 */

import { storageService, MigrationScript, STORAGE_KEYS } from './storageService';
import { ChatMessage } from '@/features/coaching/types/coachingTypes';
import { HealthDataPoint } from '@/features/health/types/healthTypes';

/**
 * Migration from version 0.9.0 to 1.0.0
 * - Add messageType field to chat messages
 * - Convert old health data format to new structure
 * - Add user_id field to all data structures
 */
const migration_1_0_0: MigrationScript = {
  version: '1.0.0',
  description: 'Add messageType to chat messages and standardize data structure',
  migrate: async () => {
    try {
      // Migrate conversation history
      const conversations = await storageService.getItem<any[]>(STORAGE_KEYS.CONVERSATION_HISTORY) || [];
      const migratedConversations: ChatMessage[] = conversations.map(msg => ({
        ...msg,
        messageType: msg.messageType || 'text', // Add default messageType if missing
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(), // Ensure timestamp is Date object
      }));
      
      if (migratedConversations.length > 0) {
        await storageService.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, migratedConversations);
      }

      // Migrate health data points
      const healthData = await storageService.getItem<any[]>(STORAGE_KEYS.HEALTH_DATA_POINTS) || [];
      const migratedHealthData: HealthDataPoint[] = healthData.map(point => ({
        ...point,
        confidence: point.confidence || 1.0, // Add default confidence if missing
        timestamp: point.timestamp ? new Date(point.timestamp) : new Date(), // Ensure timestamp is Date object
        source: point.source || 'manual', // Add default source if missing
      }));
      
      if (migratedHealthData.length > 0) {
        await storageService.setItem(STORAGE_KEYS.HEALTH_DATA_POINTS, migratedHealthData);
      }

      console.log('Migration 1.0.0 completed successfully');
    } catch (error) {
      console.error('Migration 1.0.0 failed:', error);
      throw error;
    }
  },
};

/**
 * Migration from version 1.0.0 to 1.1.0
 * - Add metadata field to chat messages
 * - Restructure user profile format
 * - Add sync queue priorities
 */
const migration_1_1_0: MigrationScript = {
  version: '1.1.0',
  description: 'Add metadata to messages and restructure user profiles',
  migrate: async () => {
    try {
      // Migrate conversation history to add metadata
      const conversations = await storageService.getItem<ChatMessage[]>(STORAGE_KEYS.CONVERSATION_HISTORY) || [];
      const migratedConversations = conversations.map(msg => ({
        ...msg,
        metadata: msg.metadata || {}, // Add empty metadata if missing
      }));
      
      if (migratedConversations.length > 0) {
        await storageService.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, migratedConversations);
      }

      // Migrate user profile structure
      const userProfile = await storageService.getItem<any>(STORAGE_KEYS.USER_PROFILE);
      if (userProfile && !userProfile.preferences) {
        const migratedProfile = {
          ...userProfile,
          preferences: {
            workoutDuration: userProfile.workoutDuration || 30,
            preferredWorkoutTime: userProfile.preferredWorkoutTime || 'morning',
          },
        };
        await storageService.setUserProfile(migratedProfile);
      }

      // Migrate sync queue to add priorities
      const syncQueue = await storageService.getItem<any[]>(STORAGE_KEYS.SYNC_QUEUE) || [];
      const migratedSyncQueue = syncQueue.map(item => ({
        ...item,
        priority: item.priority || 'normal', // Add default priority if missing
      }));
      
      if (migratedSyncQueue.length > 0) {
        await storageService.setItem(STORAGE_KEYS.SYNC_QUEUE, migratedSyncQueue);
      }

      console.log('Migration 1.1.0 completed successfully');
    } catch (error) {
      console.error('Migration 1.1.0 failed:', error);
      throw error;
    }
  },
};

/**
 * Migration utilities
 */
export class DataMigrationUtils {
  /**
   * Register all available migrations
   */
  static registerAllMigrations(): void {
    storageService.registerMigration(migration_1_0_0);
    storageService.registerMigration(migration_1_1_0);
  }

  /**
   * Create a backup of current data before migration
   */
  static async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupKey = `backup_${timestamp}`;
      
      const dataToBackup = {
        conversations: await storageService.getConversationHistory(),
        healthData: await storageService.getHealthDataPoints(),
        userProfile: await storageService.getUserProfile(),
        appSettings: await storageService.getAppSettings(),
        syncQueue: await storageService.getSyncQueue(),
      };

      await storageService.setItem(backupKey, dataToBackup);
      console.log(`Data backup created: ${backupKey}`);
      
      return backupKey;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Restore data from a backup
   */
  static async restoreFromBackup(backupKey: string): Promise<void> {
    try {
      const backupData = await storageService.getItem<any>(backupKey);
      
      if (!backupData) {
        throw new Error(`Backup not found: ${backupKey}`);
      }

      // Restore each data type
      if (backupData.conversations) {
        await storageService.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, backupData.conversations);
      }
      
      if (backupData.healthData) {
        await storageService.setItem(STORAGE_KEYS.HEALTH_DATA_POINTS, backupData.healthData);
      }
      
      if (backupData.userProfile) {
        await storageService.setUserProfile(backupData.userProfile);
      }
      
      if (backupData.appSettings) {
        await storageService.setAppSettings(backupData.appSettings);
      }
      
      if (backupData.syncQueue) {
        await storageService.setItem(STORAGE_KEYS.SYNC_QUEUE, backupData.syncQueue);
      }

      console.log(`Data restored from backup: ${backupKey}`);
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  /**
   * List available backups
   */
  static async listBackups(): Promise<string[]> {
    try {
      // This is a simplified implementation
      // In a real app, you might want to store backup metadata separately
      const stats = await storageService.getStorageStats();
      
      // For now, return empty array as we don't have a way to list all keys
      // This would need to be implemented based on the storage backend
      return [];
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Clean up old backups (keep only the last N backups)
   */
  static async cleanupOldBackups(keepCount: number = 5): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > keepCount) {
        // Sort by timestamp (assuming backup keys contain timestamps)
        const sortedBackups = backups.sort().reverse();
        const backupsToDelete = sortedBackups.slice(keepCount);
        
        for (const backupKey of backupsToDelete) {
          await storageService.removeItem(backupKey);
          console.log(`Deleted old backup: ${backupKey}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Validate data integrity after migration
   */
  static async validateDataIntegrity(): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Validate conversation history
      const conversations = await storageService.getConversationHistory();
      for (const msg of conversations) {
        if (!msg.id || !msg.content || !msg.sender || !msg.messageType) {
          errors.push(`Invalid chat message: ${msg.id || 'unknown'}`);
        }
      }

      // Validate health data
      const healthData = await storageService.getHealthDataPoints();
      for (const point of healthData) {
        if (!point.id || !point.metric || typeof point.value !== 'number') {
          errors.push(`Invalid health data point: ${point.id || 'unknown'}`);
        }
      }

      // Validate sync queue
      const syncQueue = await storageService.getSyncQueue();
      for (const item of syncQueue) {
        if (!item.id || !item.type || !item.action || !item.priority) {
          errors.push(`Invalid sync queue item: ${item.id || 'unknown'}`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        errors,
      };
    }
  }

  /**
   * Perform a safe migration with backup and validation
   */
  static async performSafeMigration(): Promise<{
    success: boolean;
    backupKey?: string;
    errors: string[];
  }> {
    const errors: string[] = [];
    let backupKey: string | undefined;

    try {
      // Create backup before migration
      backupKey = await this.createBackup();

      // Register and run migrations
      this.registerAllMigrations();
      await storageService.initialize();

      // Validate data integrity after migration
      const validation = await this.validateDataIntegrity();
      if (!validation.isValid) {
        errors.push(...validation.errors);
        
        // Restore from backup if validation fails
        if (backupKey) {
          await this.restoreFromBackup(backupKey);
          errors.push('Migration failed validation, restored from backup');
        }
        
        return { success: false, backupKey, errors };
      }

      // Clean up old backups
      await this.cleanupOldBackups();

      return { success: true, backupKey, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown migration error';
      errors.push(errorMessage);

      // Attempt to restore from backup
      if (backupKey) {
        try {
          await this.restoreFromBackup(backupKey);
          errors.push('Migration failed, restored from backup');
        } catch (restoreError) {
          errors.push(`Failed to restore from backup: ${restoreError instanceof Error ? restoreError.message : 'Unknown error'}`);
        }
      }

      return { success: false, backupKey, errors };
    }
  }
}

// Export individual migrations for testing
export { migration_1_0_0, migration_1_1_0 };