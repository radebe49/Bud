import { 
  SmartTimingPreferences, 
  TimeWindow, 
  ProactiveNotification,
  CoachingIntelligenceConfig
} from '../types/proactiveCoachingTypes';
import { HealthMetrics } from '../../../shared/types/healthTypes';

export class SmartTimingService {
  private userPreferences: Map<string, SmartTimingPreferences> = new Map();
  private userConfigs: Map<string, CoachingIntelligenceConfig> = new Map();
  private notificationHistory: Map<string, ProactiveNotification[]> = new Map();

  /**
   * Set user preferences for smart timing
   */
  setUserPreferences(userId: string, preferences: SmartTimingPreferences): void {
    this.userPreferences.set(userId, preferences);
  }

  /**
   * Set user coaching intelligence configuration
   */
  setUserConfig(userId: string, config: CoachingIntelligenceConfig): void {
    this.userConfigs.set(userId, config);
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): SmartTimingPreferences | null {
    return this.userPreferences.get(userId) || null;
  }

  /**
   * Determine optimal timing for coaching interventions
   */
  async calculateOptimalTiming(
    userId: string,
    notification: ProactiveNotification,
    currentMetrics?: HealthMetrics
  ): Promise<Date> {
    const preferences = this.userPreferences.get(userId);
    const config = this.userConfigs.get(userId);

    // If no preferences set or timing disabled, send immediately for urgent notifications
    if (!preferences || !config?.personalizedTimingEnabled) {
      return notification.priority === 'urgent' ? new Date() : this.getDefaultTiming(notification);
    }

    // Check if we should respect user preferences for this notification
    if (!this.shouldRespectUserPreferences(notification, preferences)) {
      return new Date(); // Send immediately for urgent health alerts
    }

    // Check notification frequency limits
    if (!this.canSendNotification(userId, notification, config)) {
      return this.getNextAvailableSlot(userId, notification, preferences);
    }

    const now = new Date();

    // Check if we're in a do-not-disturb period
    if (this.isInDoNotDisturbPeriod(now, preferences.doNotDisturbPeriods)) {
      return this.findNextAvailableTime(now, preferences);
    }

    // Check if we're in a preferred notification time
    if (this.isInPreferredTime(now, preferences.preferredNotificationTimes)) {
      return this.optimizeWithinPreferredTime(now, notification, preferences, currentMetrics);
    }

    // Find next preferred time
    return this.findNextPreferredTime(now, preferences, notification);
  }

  /**
   * Learn from user behavior to optimize timing
   */
  async learnFromUserBehavior(
    userId: string,
    notification: ProactiveNotification,
    userResponse: 'acknowledged' | 'dismissed' | 'acted_upon' | 'ignored',
    responseTime?: Date
  ): Promise<void> {
    const preferences = this.userPreferences.get(userId);
    if (!preferences) return;

    const deliveryTime = new Date(notification.scheduledFor);
    const hour = deliveryTime.getHours();
    const dayOfWeek = deliveryTime.getDay();

    // Update preferences based on user response
    if (userResponse === 'acknowledged' || userResponse === 'acted_upon') {
      // This was a good time - reinforce it
      this.reinforceTimeSlot(preferences, hour, dayOfWeek);
    } else if (userResponse === 'dismissed' || userResponse === 'ignored') {
      // This was a bad time - avoid it
      this.avoidTimeSlot(preferences, hour, dayOfWeek);
    }

    // Update user preferences
    this.userPreferences.set(userId, preferences);
  }

  /**
   * Analyze user activity patterns to suggest optimal notification times
   */
  async analyzeActivityPatterns(userId: string, healthData: HealthMetrics[]): Promise<TimeWindow[]> {
    if (healthData.length < 7) return []; // Need at least a week of data

    const activityPatterns = this.extractActivityPatterns(healthData);
    const optimalWindows: TimeWindow[] = [];

    // Find periods of low activity (good for notifications)
    const lowActivityPeriods = activityPatterns.filter(pattern => pattern.averageActivity < 0.3);
    
    for (const period of lowActivityPeriods) {
      // Convert to time windows
      const timeWindow: TimeWindow = {
        start: this.formatTime(period.hour),
        end: this.formatTime((period.hour + 1) % 24),
        daysOfWeek: period.daysOfWeek
      };
      optimalWindows.push(timeWindow);
    }

    // Suggest these as preferred notification times
    const preferences = this.userPreferences.get(userId);
    if (preferences && optimalWindows.length > 0) {
      preferences.preferredNotificationTimes = optimalWindows.slice(0, 3); // Top 3 windows
      this.userPreferences.set(userId, preferences);
    }

    return optimalWindows;
  }

  /**
   * Get notification delivery statistics for a user
   */
  getDeliveryStats(userId: string): {
    totalSent: number;
    acknowledged: number;
    dismissed: number;
    averageResponseTime: number;
    optimalTimes: string[];
  } {
    const history = this.notificationHistory.get(userId) || [];
    
    const acknowledged = history.filter(n => n.acknowledged).length;
    const dismissed = history.length - acknowledged;
    
    // Calculate average response time (simplified)
    const responseTimes = history
      .filter(n => n.acknowledged)
      .map(n => new Date(n.scheduledFor).getTime());
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Find most successful delivery times
    const timeSlotSuccess = new Map<string, { sent: number; acknowledged: number }>();
    
    for (const notification of history) {
      const hour = new Date(notification.scheduledFor).getHours();
      const timeSlot = this.getTimeSlotName(hour);
      
      const current = timeSlotSuccess.get(timeSlot) || { sent: 0, acknowledged: 0 };
      current.sent++;
      if (notification.acknowledged) current.acknowledged++;
      timeSlotSuccess.set(timeSlot, current);
    }

    const optimalTimes = Array.from(timeSlotSuccess.entries())
      .filter(([_, stats]) => stats.sent >= 3) // Need at least 3 notifications
      .sort(([_, a], [__, b]) => (b.acknowledged / b.sent) - (a.acknowledged / a.sent))
      .slice(0, 3)
      .map(([timeSlot]) => timeSlot);

    return {
      totalSent: history.length,
      acknowledged,
      dismissed,
      averageResponseTime,
      optimalTimes
    };
  }

  /**
   * Record notification delivery for learning
   */
  recordNotificationDelivery(userId: string, notification: ProactiveNotification): void {
    const history = this.notificationHistory.get(userId) || [];
    history.push({ ...notification });
    
    // Keep only last 100 notifications
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.notificationHistory.set(userId, history);
  }

  // Private helper methods

  private shouldRespectUserPreferences(
    notification: ProactiveNotification, 
    preferences: SmartTimingPreferences
  ): boolean {
    // Always respect preferences unless it's urgent and user allows urgent notifications
    if (notification.priority === 'urgent') {
      return !preferences.urgentNotificationsAllowed;
    }
    return true;
  }

  private canSendNotification(
    userId: string, 
    notification: ProactiveNotification, 
    config: CoachingIntelligenceConfig
  ): boolean {
    const today = new Date().toDateString();
    const history = this.notificationHistory.get(userId) || [];
    
    const todayNotifications = history.filter(n => 
      new Date(n.scheduledFor).toDateString() === today && n.delivered
    );

    // Check daily limit
    if (todayNotifications.length >= config.notificationFrequencyLimit) {
      return false;
    }

    // Check cooldown period
    const lastNotification = todayNotifications[todayNotifications.length - 1];
    if (lastNotification) {
      const timeSinceLastNotification = Date.now() - new Date(lastNotification.scheduledFor).getTime();
      const cooldownMs = config.interventionCooldownPeriod * 60 * 1000;
      
      if (timeSinceLastNotification < cooldownMs) {
        return false;
      }
    }

    return true;
  }

  private getNextAvailableSlot(
    userId: string, 
    notification: ProactiveNotification, 
    preferences: SmartTimingPreferences
  ): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find first preferred time window tomorrow
    if (preferences.preferredNotificationTimes.length > 0) {
      const firstWindow = preferences.preferredNotificationTimes[0];
      const [hours, minutes] = firstWindow.start.split(':').map(Number);
      
      tomorrow.setHours(hours, minutes, 0, 0);
      return tomorrow;
    }

    // Default to 9 AM tomorrow
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  private isInDoNotDisturbPeriod(time: Date, dndPeriods: TimeWindow[]): boolean {
    const timeStr = this.formatTime(time.getHours(), time.getMinutes());
    const dayOfWeek = time.getDay();

    return dndPeriods.some(period => {
      if (period.daysOfWeek && !period.daysOfWeek.includes(dayOfWeek)) {
        return false;
      }
      return timeStr >= period.start && timeStr <= period.end;
    });
  }

  private isInPreferredTime(time: Date, preferredTimes: TimeWindow[]): boolean {
    const timeStr = this.formatTime(time.getHours(), time.getMinutes());
    const dayOfWeek = time.getDay();

    return preferredTimes.some(period => {
      if (period.daysOfWeek && !period.daysOfWeek.includes(dayOfWeek)) {
        return false;
      }
      return timeStr >= period.start && timeStr <= period.end;
    });
  }

  private optimizeWithinPreferredTime(
    time: Date, 
    notification: ProactiveNotification, 
    preferences: SmartTimingPreferences,
    currentMetrics?: HealthMetrics
  ): Date {
    // For now, return current time if we're in preferred window
    // Could be enhanced to find optimal moment within the window
    return time;
  }

  private findNextAvailableTime(from: Date, preferences: SmartTimingPreferences): Date {
    let nextTime = new Date(from.getTime() + 30 * 60 * 1000); // 30 minutes later
    
    // Keep checking until we find a non-DND time
    while (this.isInDoNotDisturbPeriod(nextTime, preferences.doNotDisturbPeriods)) {
      nextTime = new Date(nextTime.getTime() + 30 * 60 * 1000);
      
      // Don't search more than 24 hours ahead
      if (nextTime.getTime() - from.getTime() > 24 * 60 * 60 * 1000) {
        break;
      }
    }
    
    return nextTime;
  }

  private findNextPreferredTime(
    from: Date, 
    preferences: SmartTimingPreferences, 
    notification: ProactiveNotification
  ): Date {
    const preferredTimes = preferences.preferredNotificationTimes;
    
    if (preferredTimes.length === 0) {
      return new Date(from.getTime() + 60 * 60 * 1000); // 1 hour later
    }

    const now = from;
    const currentTimeStr = this.formatTime(now.getHours(), now.getMinutes());
    const currentDay = now.getDay();

    // Find next preferred window today
    for (const window of preferredTimes) {
      if (window.daysOfWeek && !window.daysOfWeek.includes(currentDay)) {
        continue;
      }
      
      if (window.start > currentTimeStr) {
        const [hours, minutes] = window.start.split(':').map(Number);
        const nextTime = new Date(now);
        nextTime.setHours(hours, minutes, 0, 0);
        return nextTime;
      }
    }

    // No more windows today, find first window tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowDay = tomorrow.getDay();
    const availableWindows = preferredTimes.filter(window => 
      !window.daysOfWeek || window.daysOfWeek.includes(tomorrowDay)
    );

    if (availableWindows.length > 0) {
      const firstWindow = availableWindows[0];
      const [hours, minutes] = firstWindow.start.split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
      return tomorrow;
    }

    // Fallback to 9 AM tomorrow
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  private getDefaultTiming(notification: ProactiveNotification): Date {
    const now = new Date();
    
    // Immediate for urgent
    if (notification.priority === 'urgent') {
      return now;
    }
    
    // High priority: within 30 minutes
    if (notification.priority === 'high') {
      return new Date(now.getTime() + 30 * 60 * 1000);
    }
    
    // Medium priority: within 2 hours
    if (notification.priority === 'medium') {
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    }
    
    // Low priority: within 4 hours
    return new Date(now.getTime() + 4 * 60 * 60 * 1000);
  }

  private reinforceTimeSlot(preferences: SmartTimingPreferences, hour: number, dayOfWeek: number): void {
    // Find or create a preferred time window for this slot
    const timeSlot = this.formatTime(hour);
    const endTime = this.formatTime((hour + 1) % 24);
    
    const existingWindow = preferences.preferredNotificationTimes.find(window => 
      window.start === timeSlot
    );

    if (existingWindow) {
      // Add this day of week if not already included
      if (!existingWindow.daysOfWeek) {
        existingWindow.daysOfWeek = [dayOfWeek];
      } else if (!existingWindow.daysOfWeek.includes(dayOfWeek)) {
        existingWindow.daysOfWeek.push(dayOfWeek);
      }
    } else {
      // Create new preferred window
      preferences.preferredNotificationTimes.push({
        start: timeSlot,
        end: endTime,
        daysOfWeek: [dayOfWeek]
      });
    }
  }

  private avoidTimeSlot(preferences: SmartTimingPreferences, hour: number, dayOfWeek: number): void {
    // Add to do-not-disturb periods
    const timeSlot = this.formatTime(hour);
    const endTime = this.formatTime((hour + 1) % 24);
    
    const existingDND = preferences.doNotDisturbPeriods.find(period => 
      period.start === timeSlot
    );

    if (existingDND) {
      if (!existingDND.daysOfWeek) {
        existingDND.daysOfWeek = [dayOfWeek];
      } else if (!existingDND.daysOfWeek.includes(dayOfWeek)) {
        existingDND.daysOfWeek.push(dayOfWeek);
      }
    } else {
      preferences.doNotDisturbPeriods.push({
        start: timeSlot,
        end: endTime,
        daysOfWeek: [dayOfWeek]
      });
    }
  }

  private extractActivityPatterns(healthData: HealthMetrics[]): Array<{
    hour: number;
    averageActivity: number;
    daysOfWeek: number[];
  }> {
    const hourlyPatterns = new Map<number, { activities: number[]; days: Set<number> }>();

    for (const data of healthData) {
      const date = new Date(data.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();

      if (!hourlyPatterns.has(hour)) {
        hourlyPatterns.set(hour, { activities: [], days: new Set() });
      }

      const pattern = hourlyPatterns.get(hour)!;
      pattern.activities.push(data.activityLevel);
      pattern.days.add(dayOfWeek);
    }

    return Array.from(hourlyPatterns.entries()).map(([hour, data]) => ({
      hour,
      averageActivity: data.activities.reduce((sum, activity) => sum + activity, 0) / data.activities.length,
      daysOfWeek: Array.from(data.days)
    }));
  }

  private formatTime(hours: number, minutes: number = 0): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private getTimeSlotName(hour: number): string {
    if (hour >= 6 && hour < 9) return 'Early Morning';
    if (hour >= 9 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  }
}

export const smartTimingService = new SmartTimingService();