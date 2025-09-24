/**
 * Conversation and AI coaching types
 * Used for chat interface, context management, and AI interactions
 */

import type { HealthMetrics } from '../../../shared/types/healthTypes';
import type { Goal } from '../../../shared/types/userTypes';

export interface ConversationContext {
  sessionId: string;
  userId: string;
  currentTopic: Topic;
  recentMetrics: HealthMetrics;
  activeGoals: Goal[];
  conversationHistory: ChatMessage[];
  userMood: MoodIndicator;
  contextualFactors: ContextualFactor[];
  lastInteraction: Date;
  sessionDuration: number; // in minutes
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bud';
  timestamp: Date;
  context?: MessageContext;
  suggestions?: ActionSuggestion[];
  messageType: MessageType;
  metadata?: MessageMetadata;
}

export type MessageType = 
  | 'text'
  | 'quick_reply'
  | 'suggestion'
  | 'insight'
  | 'question'
  | 'celebration'
  | 'concern'
  | 'reminder'
  | 'system';

export interface MessageContext {
  relatedMetrics?: string[]; // IDs of health metrics referenced
  relatedGoals?: string[]; // IDs of goals referenced
  workoutContext?: WorkoutContext;
  nutritionContext?: NutritionContext;
  sleepContext?: SleepContext;
  emotionalContext?: EmotionalContext;
}

export interface MessageMetadata {
  confidence?: number; // AI confidence in response (0-1)
  processingTime?: number; // Response generation time in ms
  sources?: string[]; // Data sources used for response
  flags?: MessageFlag[]; // Special handling flags
}

export type MessageFlag = 
  | 'health_concern'
  | 'motivational'
  | 'educational'
  | 'actionable'
  | 'follow_up_needed'
  | 'escalation_required';

export interface ActionSuggestion {
  id: string;
  text: string;
  action: SuggestionAction;
  priority: 'low' | 'medium' | 'high';
  category: SuggestionCategory;
  estimatedTime?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
}

export type SuggestionAction = 
  | 'log_workout'
  | 'log_meal'
  | 'log_water'
  | 'start_workout'
  | 'view_progress'
  | 'adjust_goals'
  | 'schedule_rest'
  | 'check_sleep'
  | 'practice_mindfulness'
  | 'contact_professional';

export type SuggestionCategory = 
  | 'fitness'
  | 'nutrition'
  | 'sleep'
  | 'recovery'
  | 'motivation'
  | 'health'
  | 'lifestyle';

export interface Topic {
  id: string;
  name: string;
  category: TopicCategory;
  priority: number; // 1-10, higher = more important
  lastDiscussed?: Date;
  userInterest?: number; // 1-10, user's interest level
}

export type TopicCategory = 
  | 'fitness_planning'
  | 'workout_feedback'
  | 'nutrition_guidance'
  | 'sleep_optimization'
  | 'recovery_advice'
  | 'motivation_support'
  | 'goal_setting'
  | 'progress_review'
  | 'health_concerns'
  | 'lifestyle_changes';

export interface MoodIndicator {
  energy: number; // 1-10 scale
  motivation: number; // 1-10 scale
  stress: number; // 1-10 scale
  confidence: number; // 1-10 scale
  overall: number; // 1-10 scale
  timestamp: Date;
  source: 'self_reported' | 'inferred' | 'device_data';
}

export interface ContextualFactor {
  type: ContextualFactorType;
  value: string | number | boolean;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1 scale
  timestamp: Date;
}

export type ContextualFactorType = 
  | 'weather'
  | 'time_of_day'
  | 'day_of_week'
  | 'work_schedule'
  | 'travel_status'
  | 'social_situation'
  | 'recent_illness'
  | 'menstrual_cycle'
  | 'medication_change'
  | 'life_event';

export interface WorkoutContext {
  lastWorkout?: Date;
  nextPlannedWorkout?: Date;
  currentProgram?: string;
  recentPerformance?: 'improving' | 'declining' | 'stable';
  readinessScore?: number; // 0-100
  musclesSore?: string[];
  energyLevel?: number; // 1-10
}

export interface NutritionContext {
  lastMeal?: Date;
  caloriesConsumedToday?: number;
  macroBalance?: 'good' | 'needs_protein' | 'needs_carbs' | 'needs_fats';
  hydrationLevel?: 'low' | 'adequate' | 'good' | 'excellent';
  hungerLevel?: number; // 1-10
  cravings?: string[];
}

export interface SleepContext {
  lastNightSleep?: {
    duration: number; // in hours
    quality: number; // 1-10
    bedtime: Date;
    wakeTime: Date;
  };
  sleepDebt?: number; // in hours
  sleepTrend?: 'improving' | 'declining' | 'stable';
  bedtimeRoutine?: boolean;
  sleepEnvironment?: 'optimal' | 'suboptimal' | 'poor';
}

export interface EmotionalContext {
  currentMood?: string;
  stressLevel?: number; // 1-10
  motivationLevel?: number; // 1-10
  recentChallenges?: string[];
  recentWins?: string[];
  supportNeeded?: boolean;
}

export interface ConversationFlow {
  id: string;
  name: string;
  steps: ConversationStep[];
  triggers: FlowTrigger[];
  completionCriteria: CompletionCriteria;
}

export interface ConversationStep {
  id: string;
  type: StepType;
  content: string;
  expectedResponses?: string[];
  nextSteps: NextStepRule[];
  timeout?: number; // in minutes
}

export type StepType = 
  | 'question'
  | 'information'
  | 'instruction'
  | 'confirmation'
  | 'celebration'
  | 'concern_check';

export interface NextStepRule {
  condition: string; // Simple condition string
  nextStepId: string;
  confidence?: number;
}

export interface FlowTrigger {
  type: TriggerType;
  condition: string;
  priority: number;
}

export type TriggerType = 
  | 'metric_change'
  | 'goal_milestone'
  | 'time_based'
  | 'user_request'
  | 'health_concern'
  | 'inactivity';

export interface CompletionCriteria {
  requiredSteps: string[];
  optionalSteps: string[];
  timeLimit?: number; // in minutes
  userSatisfaction?: number; // minimum satisfaction score
}

export interface CoachingSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  messages: ChatMessage[];
  context: ConversationContext;
  outcomes: SessionOutcome[];
  satisfaction?: number; // 1-10 user rating
  followUpNeeded: boolean;
}

export interface SessionOutcome {
  type: OutcomeType;
  description: string;
  actionTaken?: string;
  nextSteps?: string[];
  impact?: 'positive' | 'negative' | 'neutral';
}

export type OutcomeType = 
  | 'goal_adjusted'
  | 'workout_planned'
  | 'nutrition_logged'
  | 'concern_addressed'
  | 'motivation_boosted'
  | 'education_provided'
  | 'referral_made';

export interface AIResponse {
  content: string;
  confidence: number; // 0-1
  suggestions: ActionSuggestion[];
  followUpQuestions?: string[];
  flags: MessageFlag[];
  processingTime: number; // in ms
  tokensUsed?: number;
}