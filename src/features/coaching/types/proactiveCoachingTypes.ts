export interface UserBehaviorPattern {
  id: string;
  userId: string;
  patternType: 'workout_timing' | 'sleep_schedule' | 'nutrition_habits' | 'stress_response' | 'recovery_patterns';
  frequency: number; // How often this pattern occurs (0-1)
  confidence: number; // Confidence in pattern detection (0-1)
  triggers: PatternTrigger[];
  outcomes: PatternOutcome[];
  lastDetected: Date;
  createdAt: Date;
}

export interface PatternTrigger {
  type: 'time_of_day' | 'day_of_week' | 'health_metric' | 'external_factor';
  value: string | number;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface PatternOutcome {
  metric: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: number; // 0-1 scale
}

export interface ProactiveNotification {
  id: string;
  userId: string;
  type: 'health_alert' | 'coaching_suggestion' | 'habit_reinforcement' | 'milestone_celebration';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionable: boolean;
  suggestedActions: CoachingAction[];
  triggerData: HealthMetricChange;
  scheduledFor: Date;
  expiresAt: Date;
  delivered: boolean;
  acknowledged: boolean;
}

export interface HealthMetricChange {
  metric: string;
  previousValue: number;
  currentValue: number;
  changePercentage: number;
  trend: 'improving' | 'declining' | 'stable';
  timeframe: string; // e.g., "24h", "7d", "30d"
}

export interface CoachingAction {
  type: 'workout_adjustment' | 'nutrition_suggestion' | 'sleep_optimization' | 'stress_management';
  title: string;
  description: string;
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'moderate' | 'challenging';
  expectedOutcome: string;
}

export interface HabitMilestone {
  id: string;
  userId: string;
  habitType: 'workout_consistency' | 'sleep_schedule' | 'nutrition_tracking' | 'hydration' | 'stress_management';
  milestoneType: 'streak' | 'frequency' | 'improvement' | 'goal_achievement';
  targetValue: number;
  currentValue: number;
  progress: number; // 0-1
  achieved: boolean;
  achievedAt?: Date;
  nextMilestone?: HabitMilestone;
  celebrationMessage: string;
  reward?: string;
}

export interface ContextualTrigger {
  id: string;
  name: string;
  condition: TriggerCondition;
  action: CoachingIntervention;
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface TriggerCondition {
  type: 'metric_threshold' | 'pattern_detected' | 'time_based' | 'correlation_found';
  parameters: Record<string, any>;
  evaluationFunction: string; // Serialized function for evaluation
}

export interface CoachingIntervention {
  type: 'immediate_notification' | 'scheduled_reminder' | 'plan_adjustment' | 'conversation_starter';
  content: string;
  actions: CoachingAction[];
  timing: InterventionTiming;
}

export interface InterventionTiming {
  immediate: boolean;
  delay?: number; // minutes
  optimalTimeWindow?: {
    start: string; // HH:mm format
    end: string;
  };
  respectUserPreferences: boolean;
}

export interface SmartTimingPreferences {
  userId: string;
  preferredNotificationTimes: TimeWindow[];
  doNotDisturbPeriods: TimeWindow[];
  maxNotificationsPerDay: number;
  urgentNotificationsAllowed: boolean;
  contextualFactors: {
    workSchedule?: TimeWindow[];
    sleepSchedule?: TimeWindow;
    workoutTimes?: TimeWindow[];
  };
}

export interface TimeWindow {
  start: string; // HH:mm format
  end: string;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
}

export interface CoachingIntelligenceConfig {
  patternDetectionSensitivity: number; // 0-1
  notificationFrequencyLimit: number; // per day
  interventionCooldownPeriod: number; // minutes
  enableProactiveNotifications: boolean;
  enableHabitTracking: boolean;
  enableContextualTriggers: boolean;
  personalizedTimingEnabled: boolean;
}