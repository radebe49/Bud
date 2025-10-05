/**
 * Coaching Services Index
 * Exports all coaching-related services including GROQ API integration
 */

// GROQ API Integration
export { GroqApiClient, GroqApiError } from './groqApiClient';
export { ConversationContextManager } from './conversationContextManager';
export { PromptEngineering } from './promptEngineering';
export { ResponseCache, StreamingUtils } from './responseCache';
export { GroqService } from './groqService';

// Existing Services
export { ConversationService } from './conversationService';
export { ConversationEngine } from './conversationEngine';
export { QuickActionGenerator } from './quickActionGenerator';
export { MockResponseDatabase } from './mockResponseDatabase';

// Proactive Coaching Intelligence Services
export { proactiveCoachingService } from './proactiveCoachingService';
export { patternRecognitionService } from './patternRecognitionService';
export { proactiveNotificationService } from './proactiveNotificationService';
export { habitReinforcementService } from './habitReinforcementService';
export { contextualTriggerService } from './contextualTriggerService';
export { smartTimingService } from './smartTimingService';

// Types
export type {
  GroqApiConfig,
  GroqChatRequest,
  GroqChatResponse,
  GroqMessage,
  GroqChoice,
  GroqStreamChunk
} from './groqApiClient';

export type {
  ContextManagerConfig,
  ContextSnapshot
} from './conversationContextManager';

export type {
  PromptTemplate,
  PromptCategory,
  PromptContext
} from './promptEngineering';

export type {
  CacheEntry,
  CacheMetadata,
  CacheConfig,
  StreamingResponse,
  StreamChunk
} from './responseCache';

export type {
  GroqServiceConfig,
  ProcessMessageOptions,
  ProcessMessageResult
} from './groqService';

export type {
  DataLoggingResult
} from './conversationService';

// Proactive Coaching Types
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
} from '../types/proactiveCoachingTypes';