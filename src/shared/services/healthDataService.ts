import NetInfo from '@react-native-community/netinfo';
import { HealthDataIntegrationService, healthDataIntegration } from './healthDataIntegration';
import { HealthKitProvider } from './healthKitProvider';
import { GoogleFitProvider } from './googleFitProvider';
import { FitbitProvider, OuraProvider, MyFitnessPalProvider } from './thirdPartyProviders';
import { OfflineHealthStorage, offlineHealthStorage } from './offlineHealthStorage';
import { HealthDataPoint, HealthMetrics, DataSource } from '../types/healthTypes';

export interface HealthDataServiceConfig {
  enabledProviders: string[];
  syncInterval: number; // in minutes
  offlineRetentionDays: number;
  maxRetryAttempts: number;
}

export interface HealthDataSyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

export class HealthDataService {
  private integration: HealthDataIntegrationService;
  private offlineStorage: OfflineHealthStorage;
  private config: HealthDataServiceConfig;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;
  private subscriptions: (() => void)[] = [];

  constructor(config?: Partial<HealthDataServiceConfig>) {
    this.integration = healthDataIntegration;
    this.offlineStorage = offlineHealthStorage;
    this.config = {
      enabledProviders: ['HealthKit', 'GoogleFit'],
      syncInterval: 15, // 15 minutes
      offlineRetentionDays: 30,
      maxRetryAttempts: 3,
      ...config
    };

    this.initializeProviders();
    this.setupNetworkListener();
    this.startPeriodicSync();
  }

  private async initializeProviders(): Promise<void> {
    try {
      // Initialize platform-specific providers
      const healthKitProvider = new HealthKitProvider();
      const googleFitProvider = new GoogleFitProvider();

      await this.integration.registerProvider(healthKitProvider);
      await this.integration.registerProvider(googleFitProvider);

      // Initialize third-party providers if enabled
      if (this.config.enabledProviders.includes('Fitbit')) {
        const fitbitProvider = new FitbitProvider();
        await this.integration.registerProvider(fitbitProvider);
      }

      if (this.config.enabledProviders.includes('Oura')) {
        const ouraProvider = new OuraProvider();
        await this.integration.registerProvider(ouraProvider);
      }

      if (this.config.enabledProviders.includes('MyFitnessPal')) {
        const mfpProvider = new MyFitnessPalProvider();
        await this.integration.registerProvider(mfpProvider);
      }

      console.log('Health data providers initialized');
    } catch (error) {
      console.error('Error initializing health data providers:', error);
    }
  }

  private setupNetworkListener(): void {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        // Just came back online, process sync queue
        this.processSyncQueue();
      }
    });

    this.subscriptions.push(unsubscribe);
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncHealthData();
    }, this.config.syncInterval * 60 * 1000);
  }

  async requestPermissions(): Promise<{ [key: string]: boolean }> {
    try {
      return await this.integration.requestAllPermissions();
    } catch (error) {
      console.error('Error requesting health data permissions:', error);
      return {};
    }
  }

  async syncHealthData(startDate?: Date, endDate?: Date): Promise<HealthDataSyncResult> {
    const result: HealthDataSyncResult = {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      errors: []
    };

    try {
      const end = endDate || new Date();
      const start = startDate || new Date(end.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

      const healthData = await this.integration.syncHealthData(start, end);
      
      if (this.isOnline) {
        // Online: sync directly
        result.syncedCount = healthData.length;
        result.success = true;
      } else {
        // Offline: store locally
        await this.offlineStorage.storeHealthData(healthData, 'mixed');
        result.syncedCount = healthData.length;
        result.success = true;
      }

      // Process any queued items if online
      if (this.isOnline) {
        await this.processSyncQueue();
      }

    } catch (error) {
      console.error('Error syncing health data:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.failedCount = 1;
    }

    return result;
  }

  async processSyncQueue(): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    try {
      await this.integration.processSyncQueue();
      
      // Also process offline storage queue
      const unsyncedData = await this.offlineStorage.getUnsyncedData();
      
      for (const offlineData of unsyncedData) {
        try {
          // In real implementation, upload to backend
          console.log(`Syncing offline data: ${offlineData.id}`);
          await this.offlineStorage.markAsSynced(offlineData.id);
        } catch (error) {
          console.error(`Failed to sync offline data ${offlineData.id}:`, error);
        }
      }

      await this.offlineStorage.updateSyncStatus();
    } catch (error) {
      console.error('Error processing sync queue:', error);
    }
  }

  async getHealthMetrics(startDate?: Date, endDate?: Date): Promise<HealthMetrics | null> {
    try {
      const end = endDate || new Date();
      const start = startDate || new Date(end.getTime() - 24 * 60 * 60 * 1000);

      let healthData: HealthDataPoint[] = [];

      if (this.isOnline) {
        // Try to get fresh data
        healthData = await this.integration.syncHealthData(start, end);
      } else {
        // Get from offline storage
        healthData = await this.offlineStorage.getHealthDataByDateRange(start, end);
      }

      return this.aggregateHealthMetrics(healthData);
    } catch (error) {
      console.error('Error getting health metrics:', error);
      return null;
    }
  }

  private aggregateHealthMetrics(data: HealthDataPoint[]): HealthMetrics {
    const metrics: HealthMetrics = {
      heartRate: 0,
      heartRateVariability: 0,
      sleepScore: 0,
      recoveryScore: 0,
      stressLevel: 0,
      activityLevel: 0,
      caloriesConsumed: 0,
      caloriesBurned: 0,
      waterIntake: 0,
      macronutrients: {
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        fiber: 0,
        sugar: 0
      },
      timestamp: new Date()
    };

    // Aggregate data by metric type
    const metricGroups = new Map<string, HealthDataPoint[]>();
    
    data.forEach(point => {
      if (!metricGroups.has(point.metric)) {
        metricGroups.set(point.metric, []);
      }
      metricGroups.get(point.metric)!.push(point);
    });

    // Calculate averages/sums for each metric
    metricGroups.forEach((points, metric) => {
      const values = points.map(p => p.value);
      
      switch (metric) {
        case 'heart_rate':
          metrics.heartRate = this.calculateAverage(values);
          break;
        case 'heart_rate_variability':
          metrics.heartRateVariability = this.calculateAverage(values);
          break;
        case 'sleep_score':
          metrics.sleepScore = this.calculateAverage(values);
          break;
        case 'readiness_score':
          metrics.recoveryScore = this.calculateAverage(values);
          break;
        case 'steps':
          metrics.activityLevel = this.calculateSum(values);
          break;
        case 'calories_consumed':
          metrics.caloriesConsumed = this.calculateSum(values);
          break;
        case 'calories_burned':
          metrics.caloriesBurned = this.calculateSum(values);
          break;
        case 'protein':
          metrics.macronutrients.protein = this.calculateSum(values);
          break;
        case 'carbohydrates':
          metrics.macronutrients.carbohydrates = this.calculateSum(values);
          break;
        case 'fat':
          metrics.macronutrients.fats = this.calculateSum(values);
          break;
      }
    });

    return metrics;
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateSum(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0);
  }

  async getProviderStatus(): Promise<{ [key: string]: { available: boolean; hasPermissions: boolean } }> {
    return await this.integration.getProviderStatus();
  }

  async getSyncStatus() {
    return await this.offlineStorage.getSyncStatus();
  }

  subscribeToHealthUpdates(callback: (metrics: HealthMetrics) => void): () => void {
    const unsubscribe = this.integration.subscribeToAllUpdates(async (data: HealthDataPoint[]) => {
      const metrics = this.aggregateHealthMetrics(data);
      callback(metrics);
    });

    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  async clearOldData(olderThanDays?: number): Promise<void> {
    await this.offlineStorage.clearOldData(olderThanDays || this.config.offlineRetentionDays);
  }

  async getStorageInfo() {
    return await this.offlineStorage.getStorageSize();
  }

  dispose(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }
}

// Export singleton instance
export const healthDataService = new HealthDataService();