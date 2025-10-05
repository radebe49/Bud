import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthDataPoint, DataSource } from '../types/healthTypes';
import { SyncQueueItem } from './healthDataIntegration';

export interface OfflineHealthData {
  id: string;
  data: HealthDataPoint[];
  timestamp: Date;
  synced: boolean;
  source: DataSource;
}

export interface SyncStatus {
  lastSyncTime: Date | null;
  pendingItems: number;
  failedItems: number;
  totalItems: number;
}

export class OfflineHealthStorage {
  private readonly STORAGE_KEYS = {
    HEALTH_DATA: 'offline_health_data',
    SYNC_QUEUE: 'sync_queue',
    SYNC_STATUS: 'sync_status',
    LAST_SYNC: 'last_sync_time'
  };

  async storeHealthData(data: HealthDataPoint[], source: DataSource): Promise<string> {
    try {
      const offlineData: OfflineHealthData = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data,
        timestamp: new Date(),
        synced: false,
        source
      };

      // Get existing offline data
      const existingData = await this.getAllOfflineData();
      existingData.push(offlineData);

      // Store updated data
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.HEALTH_DATA,
        JSON.stringify(existingData)
      );

      // Add to sync queue
      await this.addToSyncQueue(offlineData);

      return offlineData.id;
    } catch (error) {
      console.error('Error storing offline health data:', error);
      throw error;
    }
  }

  async getAllOfflineData(): Promise<OfflineHealthData[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.HEALTH_DATA);
      if (!data) return [];

      const parsedData = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return parsedData.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        data: item.data.map((point: any) => ({
          ...point,
          timestamp: new Date(point.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error retrieving offline health data:', error);
      return [];
    }
  }

  async getUnsyncedData(): Promise<OfflineHealthData[]> {
    const allData = await this.getAllOfflineData();
    return allData.filter(item => !item.synced);
  }

  async markAsSynced(id: string): Promise<void> {
    try {
      const allData = await this.getAllOfflineData();
      const updatedData = allData.map(item => 
        item.id === id ? { ...item, synced: true } : item
      );

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.HEALTH_DATA,
        JSON.stringify(updatedData)
      );

      // Update sync status
      await this.updateSyncStatus();
    } catch (error) {
      console.error('Error marking data as synced:', error);
      throw error;
    }
  }

  async addToSyncQueue(data: OfflineHealthData): Promise<void> {
    try {
      const queueItem: SyncQueueItem = {
        id: data.id,
        data: data.data,
        timestamp: data.timestamp,
        retryCount: 0,
        source: data.source
      };

      const existingQueue = await this.getSyncQueue();
      existingQueue.push(queueItem);

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(existingQueue)
      );
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
      if (!data) return [];

      const parsedData = JSON.parse(data);
      return parsedData.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        data: item.data.map((point: any) => ({
          ...point,
          timestamp: new Date(point.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error retrieving sync queue:', error);
      return [];
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const updatedQueue = queue.filter(item => item.id !== id);

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(updatedQueue)
      );
    } catch (error) {
      console.error('Error removing from sync queue:', error);
      throw error;
    }
  }

  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const updatedQueue = queue.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(updatedQueue)
      );
    } catch (error) {
      console.error('Error updating sync queue item:', error);
      throw error;
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_STATUS);
      if (!data) {
        return {
          lastSyncTime: null,
          pendingItems: 0,
          failedItems: 0,
          totalItems: 0
        };
      }

      const parsedData = JSON.parse(data);
      return {
        ...parsedData,
        lastSyncTime: parsedData.lastSyncTime ? new Date(parsedData.lastSyncTime) : null
      };
    } catch (error) {
      console.error('Error retrieving sync status:', error);
      return {
        lastSyncTime: null,
        pendingItems: 0,
        failedItems: 0,
        totalItems: 0
      };
    }
  }

  async updateSyncStatus(): Promise<void> {
    try {
      const allData = await this.getAllOfflineData();
      const syncQueue = await this.getSyncQueue();
      
      const totalItems = allData.length;
      const syncedItems = allData.filter(item => item.synced).length;
      const pendingItems = syncQueue.length;
      const failedItems = syncQueue.filter(item => item.retryCount >= 3).length;

      const status: SyncStatus = {
        lastSyncTime: syncedItems > 0 ? new Date() : null,
        pendingItems,
        failedItems,
        totalItems
      };

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SYNC_STATUS,
        JSON.stringify(status)
      );
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  async getHealthDataByDateRange(startDate: Date, endDate: Date): Promise<HealthDataPoint[]> {
    try {
      const allData = await this.getAllOfflineData();
      const filteredData: HealthDataPoint[] = [];

      allData.forEach(offlineData => {
        const relevantPoints = offlineData.data.filter(point => 
          point.timestamp >= startDate && point.timestamp <= endDate
        );
        filteredData.push(...relevantPoints);
      });

      // Sort by timestamp
      return filteredData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.error('Error retrieving health data by date range:', error);
      return [];
    }
  }

  async getHealthDataByMetric(metric: string): Promise<HealthDataPoint[]> {
    try {
      const allData = await this.getAllOfflineData();
      const filteredData: HealthDataPoint[] = [];

      allData.forEach(offlineData => {
        const relevantPoints = offlineData.data.filter(point => point.metric === metric);
        filteredData.push(...relevantPoints);
      });

      return filteredData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.error('Error retrieving health data by metric:', error);
      return [];
    }
  }

  async clearOldData(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const allData = await this.getAllOfflineData();
      const recentData = allData.filter(item => 
        item.timestamp > cutoffDate || !item.synced
      );

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.HEALTH_DATA,
        JSON.stringify(recentData)
      );

      // Also clean up sync queue of old failed items
      const syncQueue = await this.getSyncQueue();
      const recentQueue = syncQueue.filter(item => 
        item.timestamp > cutoffDate && item.retryCount < 3
      );

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(recentQueue)
      );

      await this.updateSyncStatus();
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }

  async getStorageSize(): Promise<{ totalSize: number; itemCount: number }> {
    try {
      const allData = await this.getAllOfflineData();
      const syncQueue = await this.getSyncQueue();
      
      const dataSize = JSON.stringify(allData).length;
      const queueSize = JSON.stringify(syncQueue).length;
      
      return {
        totalSize: dataSize + queueSize,
        itemCount: allData.length + syncQueue.length
      };
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return { totalSize: 0, itemCount: 0 };
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.HEALTH_DATA,
        this.STORAGE_KEYS.SYNC_QUEUE,
        this.STORAGE_KEYS.SYNC_STATUS,
        this.STORAGE_KEYS.LAST_SYNC
      ]);
    } catch (error) {
      console.error('Error clearing all offline data:', error);
      throw error;
    }
  }
}

export const offlineHealthStorage = new OfflineHealthStorage();