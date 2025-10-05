/**
 * Example usage of the Health Data Integration Layer
 * This demonstrates how to use the health data services in the app
 */

import { healthDataService, HealthDataService } from './healthDataService';
import { HealthMetrics } from '../types/healthTypes';

export class HealthDataExample {
  private healthService: HealthDataService;

  constructor() {
    this.healthService = healthDataService;
  }

  /**
   * Initialize health data integration
   * Call this when the app starts or user logs in
   */
  async initializeHealthData(): Promise<void> {
    try {
      console.log('Initializing health data integration...');
      
      // Request permissions from all available providers
      const permissions = await this.healthService.requestPermissions();
      console.log('Health data permissions:', permissions);

      // Check provider status
      const providerStatus = await this.healthService.getProviderStatus();
      console.log('Provider status:', providerStatus);

      // Perform initial sync
      const syncResult = await this.healthService.syncHealthData();
      console.log('Initial sync result:', syncResult);

      console.log('Health data integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize health data:', error);
    }
  }

  /**
   * Get current health metrics
   * Use this to display user's current health status
   */
  async getCurrentHealthMetrics(): Promise<HealthMetrics | null> {
    try {
      const metrics = await this.healthService.getHealthMetrics();
      
      if (metrics) {
        console.log('Current health metrics:', {
          heartRate: metrics.heartRate,
          sleepScore: metrics.sleepScore,
          activityLevel: metrics.activityLevel,
          caloriesConsumed: metrics.caloriesConsumed,
          waterIntake: metrics.waterIntake
        });
      }

      return metrics;
    } catch (error) {
      console.error('Failed to get health metrics:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time health updates
   * Use this to update UI when new health data arrives
   */
  subscribeToHealthUpdates(onUpdate: (metrics: HealthMetrics) => void): () => void {
    console.log('Subscribing to health data updates...');
    
    return this.healthService.subscribeToHealthUpdates((metrics) => {
      console.log('Received health data update:', metrics);
      onUpdate(metrics);
    });
  }

  /**
   * Sync health data manually
   * Use this for pull-to-refresh functionality
   */
  async manualSync(): Promise<boolean> {
    try {
      console.log('Starting manual health data sync...');
      
      const result = await this.healthService.syncHealthData();
      
      if (result.success) {
        console.log(`Successfully synced ${result.syncedCount} data points`);
        return true;
      } else {
        console.error('Manual sync failed:', result.errors);
        return false;
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      return false;
    }
  }

  /**
   * Get sync status and storage information
   * Use this for debugging or showing sync status to user
   */
  async getSyncInfo(): Promise<{
    syncStatus: any;
    storageInfo: any;
    providerStatus: any;
  }> {
    try {
      const [syncStatus, storageInfo, providerStatus] = await Promise.all([
        this.healthService.getSyncStatus(),
        this.healthService.getStorageInfo(),
        this.healthService.getProviderStatus()
      ]);

      return {
        syncStatus,
        storageInfo,
        providerStatus
      };
    } catch (error) {
      console.error('Failed to get sync info:', error);
      return {
        syncStatus: null,
        storageInfo: null,
        providerStatus: null
      };
    }
  }

  /**
   * Clean up old data
   * Call this periodically to manage storage
   */
  async cleanupOldData(olderThanDays: number = 30): Promise<void> {
    try {
      console.log(`Cleaning up health data older than ${olderThanDays} days...`);
      await this.healthService.clearOldData(olderThanDays);
      console.log('Old data cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  /**
   * Dispose resources when app is closing
   */
  dispose(): void {
    console.log('Disposing health data service...');
    this.healthService.dispose();
  }
}

// Example usage in a React component:
/*
import React, { useEffect, useState } from 'react';
import { HealthDataExample } from '../services/healthDataExample';
import { HealthMetrics } from '../types/healthTypes';

export const HealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const healthExample = new HealthDataExample();

  useEffect(() => {
    const initializeHealth = async () => {
      await healthExample.initializeHealthData();
      const metrics = await healthExample.getCurrentHealthMetrics();
      setHealthData(metrics);
      setIsLoading(false);
    };

    initializeHealth();

    // Subscribe to updates
    const unsubscribe = healthExample.subscribeToHealthUpdates((metrics) => {
      setHealthData(metrics);
    });

    return () => {
      unsubscribe();
      healthExample.dispose();
    };
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await healthExample.manualSync();
    const metrics = await healthExample.getCurrentHealthMetrics();
    setHealthData(metrics);
    setIsLoading(false);
  };

  if (isLoading) {
    return <Text>Loading health data...</Text>;
  }

  return (
    <View>
      <Text>Heart Rate: {healthData?.heartRate} bpm</Text>
      <Text>Sleep Score: {healthData?.sleepScore}</Text>
      <Text>Activity Level: {healthData?.activityLevel}</Text>
      <Button title="Refresh" onPress={handleRefresh} />
    </View>
  );
};
*/

export const healthDataExample = new HealthDataExample();