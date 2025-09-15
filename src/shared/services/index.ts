/**
 * Shared services exports
 */

export { storageService, STORAGE_KEYS, STORAGE_CONFIG } from './storageService';
export type { SyncQueueItem, StorageError, MigrationScript } from './storageService';

export { supabaseStorageService } from './supabaseStorageService';
export type { SyncResult, SyncStatus } from './supabaseStorageService';

export { DataMigrationUtils } from './dataMigrations';

export { supabase } from './supabaseClient';

// Re-export existing services
export { apiService } from './apiService';
export { mockHealthDataService } from './mockHealthDataService';
export { workoutUpdateNotifier } from './workoutUpdateNotifier';