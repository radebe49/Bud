/**
 * Coaching types index
 * Exports all coaching and conversation-related TypeScript interfaces and types
 */

export type {
  ConversationContext,
  ChatMessage,
  MessageType,
  MessageContext,
  MessageMetadata,
  MessageFlag,
  ActionSuggestion,
  SuggestionAction,
  SuggestionCategory,
  Topic,
  TopicCategory,
  MoodIndicator,
  ContextualFactor,
  ContextualFactorType,
  WorkoutContext,
  NutritionContext,
  SleepContext,
  EmotionalContext,
  ConversationFlow,
  ConversationStep,
  StepType,
  NextStepRule,
  FlowTrigger,
  TriggerType,
  CompletionCriteria,
  CoachingSession,
  SessionOutcome,
  OutcomeType,
  AIResponse
} from './conversationTypes';

// Proactive Coaching Intelligence Types
export type {
  UserBehaviorPattern,
  PatternTrigger,
  PatternOutcome,
  ProactiveNotification,
  HealthMetricChange,
  CoachingAction,
  HabitMilestone,
  ContextualTrigger,
  TriggerCondition,
  CoachingIntervention,
  InterventionTiming,
  SmartTimingPreferences,
  TimeWindow,
  CoachingIntelligenceConfig
} from './proactiveCoachingTypes';