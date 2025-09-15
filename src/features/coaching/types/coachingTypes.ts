/**
 * AI Coaching-related TypeScript interfaces and types
 */

import { UUID, Timestamp, Goal } from '@/shared/types/globalTypes';
import { HealthMetrics } from '@/features/health/types/healthTypes';

// Chat and conversation types
export interface ChatMessage {
  id: UUID;
  content: string;
  sender: 'user' | 'bud';
  timestamp: Timestamp;
  context?: ConversationContext;
  suggestions?: ActionSuggestion[];
  messageType: MessageType;
  metadata?: MessageMetadata;
}

export type MessageType = 
  | 'text'
  | 'metric_card'
  | 'action_card'
  | 'insight_banner'
  | 'progress_update'
  | 'recommendation'
  | 'celebration'
  | 'question'
  | 'system';

export interface MessageMetadata {
  relatedMetrics?: string[];
  actionRequired?: boolean;
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: Timestamp;
}

// Conversation context and state
export interface ConversationContext {
  sessionId: UUID;
  userId: UUID;
  currentTopic: Topic;
  recentMetrics: HealthMetrics;
  activeGoals: Goal[];
  conversationHistory: ChatMessage[];
  userMood?: MoodIndicator;
  contextualFactors: ContextualFactor[];
  lastInteraction: Timestamp;
}

export type Topic = 
  | 'general'
  | 'workout_planning'
  | 'nutrition_advice'
  | 'sleep_coaching'
  | 'stress_management'
  | 'goal_setting'
  | 'progress_review'
  | 'motivation'
  | 'health_concerns';

export interface MoodIndicator {
  energy: number; // 1-10 scale
  motivation: number; // 1-10 scale
  stress: number; // 1-10 scale
  confidence: number; // 1-10 scale
  timestamp: Timestamp;
}

export interface ContextualFactor {
  type: FactorType;
  value: string | number;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // 0-1 scale for importance
}

export type FactorType = 
  | 'sleep_quality'
  | 'stress_level'
  | 'weather'
  | 'schedule_busy'
  | 'recent_workout'
  | 'meal_timing'
  | 'hydration_level'
  | 'energy_level';

// Action suggestions and recommendations
export interface ActionSuggestion {
  id: UUID;
  type: ActionType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
  category: ActionCategory;
  parameters?: Record<string, any>;
}

export type ActionType = 
  | 'log_workout'
  | 'track_meal'
  | 'log_water'
  | 'start_meditation'
  | 'schedule_rest'
  | 'adjust_goal'
  | 'view_progress'
  | 'get_recipe'
  | 'plan_workout'
  | 'set_reminder';

export type ActionCategory = 
  | 'fitness'
  | 'nutrition'
  | 'sleep'
  | 'stress'
  | 'tracking'
  | 'planning'
  | 'motivation';

// Coaching intelligence and patterns
export interface CoachingPattern {
  id: UUID;
  userId: UUID;
  patternType: PatternType;
  description: string;
  frequency: number;
  confidence: number; // 0-1 scale
  triggers: PatternTrigger[];
  recommendations: string[];
  lastDetected: Timestamp;
}

export type PatternType = 
  | 'workout_consistency'
  | 'sleep_schedule'
  | 'nutrition_timing'
  | 'stress_response'
  | 'recovery_pattern'
  | 'motivation_cycle'
  | 'goal_adherence';

export interface PatternTrigger {
  condition: string;
  threshold: number;
  timeframe: string;
}

// Proactive coaching
export interface ProactiveIntervention {
  id: UUID;
  userId: UUID;
  triggerCondition: string;
  message: string;
  actionSuggestions: ActionSuggestion[];
  timing: InterventionTiming;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'acknowledged' | 'dismissed';
  createdAt: Timestamp;
  scheduledFor?: Timestamp;
}

export interface InterventionTiming {
  type: 'immediate' | 'scheduled' | 'optimal_window';
  preferredTime?: string; // HH:MM format
  timeWindow?: { start: string; end: string };
  daysOfWeek?: string[];
}

// Coaching effectiveness and feedback
export interface CoachingFeedback {
  id: UUID;
  messageId: UUID;
  userId: UUID;
  rating: number; // 1-5 scale
  helpful: boolean;
  followedAdvice: boolean;
  comments?: string;
  timestamp: Timestamp;
}

export interface CoachingEffectiveness {
  userId: UUID;
  period: { start: Timestamp; end: Timestamp };
  averageRating: number;
  adviceFollowRate: number;
  goalProgressRate: number;
  userEngagement: number;
  improvementAreas: string[];
}

// AI service integration
export interface AIServiceRequest {
  id: UUID;
  userId: UUID;
  prompt: string;
  context: ConversationContext;
  requestType: 'chat' | 'recommendation' | 'analysis';
  timestamp: Timestamp;
}

export interface AIServiceResponse {
  id: UUID;
  requestId: UUID;
  content: string;
  confidence: number; // 0-1 scale
  suggestions?: ActionSuggestion[];
  followUpQuestions?: string[];
  processingTime: number; // in milliseconds
  timestamp: Timestamp;
}

// Habit tracking and reinforcement
export interface Habit {
  id: UUID;
  userId: UUID;
  name: string;
  description: string;
  category: ActionCategory;
  targetFrequency: HabitFrequency;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0-1 scale
  isActive: boolean;
  createdAt: Timestamp;
}

export interface HabitFrequency {
  type: 'daily' | 'weekly' | 'custom';
  timesPerPeriod: number;
  specificDays?: string[]; // for weekly habits
}

export interface HabitCompletion {
  id: UUID;
  habitId: UUID;
  completedAt: Timestamp;
  notes?: string;
  mood?: MoodIndicator;
}

// Milestone and achievement tracking
export interface Milestone {
  id: UUID;
  userId: UUID;
  type: 'habit_streak' | 'goal_achievement' | 'consistency' | 'improvement';
  title: string;
  description: string;
  threshold: number;
  currentProgress: number;
  isCompleted: boolean;
  completedAt?: Timestamp;
  reward?: string;
}