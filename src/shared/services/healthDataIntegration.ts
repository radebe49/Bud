import { Platform } from 'react-native';
import { HealthMetrics, DataSource, HealthDataPoint } from '../types/healthTypes';

export interface HealthDataProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  getHealthData(startDate: Date, endDate: Date): Promise<HealthDataPoint[]>;
  subscribeToUpdates(callback: (data: HealthDataPoint[]) => void): () => void;
}

export interface SyncQueueItem {
  id: string;
  data: HealthDataPoint[];
  timestamp: Date;
  retryCount: number;
  source: DataSource;
}

export class HealthDataIntegrationService {
  private providers: Map<string, HealthDataProvider> = new Map();
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  constructor() {
    this.initializePlatformProviders();
    this.setupNetworkListener();
  }

  private initializePlatformProviders() {
    if (Platform.OS === 'ios') {
      // HealthKit will be initialized here
      console.log('iOS HealthKit provider will be initialized');
    } else if (Platform.OS === 'android') {
      // Google Fit will be initialized here
      console.log('Android Google Fit provider will be initialized');
    }
  }

  private setupNetworkListener() {
    // Network state monitoring will be implemented
    // For now, assume online
    this.isOnline = true;
  }

  async registerProvider(provider: HealthDataProvider): Promise<void> {
    const isAvailable = await provider.isAvailable();
    if (isAvailable) {
      this.providers.set(provider.name, provider);
    } else {
      console.log(`Provider ${provider.name} is not available`);
    }
  }

  async requestAllPermissions(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const [name, provider] of this.providers) {
      try {
        results[name] = await provider.requestPermissions();
      } catch (error) {
        console.error(`Failed to request permissions for ${name}:`, error);
        results[name] = false;
      }
    }
    
    return results;
  }

  async syncHealthData(startDate: Date, endDate: Date): Promise<HealthDataPoint[]> {
    const allData: HealthDataPoint[] = [];
    
    for (const [name, provider] of this.providers) {
      try {
        const data = await provider.getHealthData(startDate, endDate);
        allData.push(...data);
      } catch (error) {
        console.error(`Failed to sync data from ${name}:`, error);
      }
    }

    // Resolve conflicts and deduplicate
    const resolvedData = this.resolveDataConflicts(allData);
    
    if (this.isOnline) {
      await this.uploadData(resolvedData);
    } else {
      this.queueForSync(resolvedData);
    }

    return resolvedData;
  }

  private resolveDataConflicts(data: HealthDataPoint[]): HealthDataPoint[] {
    // Group by metric type and timestamp (within 5-minute window)
    const grouped = new Map<string, HealthDataPoint[]>();
    
    data.forEach(point => {
      const key = `${point.metric}_${Math.floor(point.timestamp.getTime() / (5 * 60 * 1000))}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(point);
    });

    const resolved: HealthDataPoint[] = [];
    
    grouped.forEach(points => {
      if (points.length === 1) {
        resolved.push(points[0]);
      } else {
        // Conflict resolution: prefer higher confidence, then more recent
        const best = points.reduce((prev, current) => {
          if (current.confidence > prev.confidence) return current;
          if (current.confidence === prev.confidence && current.timestamp > prev.timestamp) return current;
          return prev;
        });
        resolved.push(best);
      }
    });

    return resolved;
  }

  private async uploadData(data: HealthDataPoint[]): Promise<void> {
    // Implementation will upload to backend service
    console.log(`Uploading ${data.length} health data points`);
  }

  private queueForSync(data: HealthDataPoint[]): void {
    const queueItem: SyncQueueItem = {
      id: Date.now().toString(),
      data,
      timestamp: new Date(),
      retryCount: 0,
      source: data[0]?.source || 'unknown'
    };
    
    this.syncQueue.push(queueItem);
  }

  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    
    const itemsToProcess = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToProcess) {
      try {
        await this.uploadData(item.data);
      } catch (error) {
        console.error('Failed to sync queued data:', error);
        
        if (item.retryCount < 3) {
          item.retryCount++;
          this.syncQueue.push(item);
        }
      }
    }

    this.syncInProgress = false;
  }

  subscribeToAllUpdates(callback: (data: HealthDataPoint[]) => void): () => void {
    const unsubscribeFunctions: (() => void)[] = [];

    this.providers.forEach(provider => {
      const unsubscribe = provider.subscribeToUpdates(callback);
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(fn => fn());
    };
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async getProviderStatus(): Promise<{ [key: string]: { available: boolean; hasPermissions: boolean } }> {
    const status: { [key: string]: { available: boolean; hasPermissions: boolean } } = {};
    
    for (const [name, provider] of this.providers) {
      status[name] = {
        available: await provider.isAvailable(),
        hasPermissions: false // Will be determined by actual permission check
      };
    }
    
    return status;
  }
}

export const healthDataIntegration = new HealthDataIntegrationService();