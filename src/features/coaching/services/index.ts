/**
 * Coaching services exports
 */

export { ConversationService } from './conversationService';
export { ConversationEngine } from './conversationEngine';
export { MockResponseDatabase } from './mockResponseDatabase';
export { QuickActionGenerator } from './quickActionGenerator';

export type { DataLoggingResult } from './conversationService';
export type { 
  ConversationEngineConfig,
  MessageAnalysis,
  MessageIntent,
  ExtractedEntity,
  DataLoggingOpportunity
} from './conversationEngine';
export type { 
  MockResponse,
  ResponseCategory
} from './mockResponseDatabase';
export type {
  QuickActionConfig,
  ActionTemplate,
  ActionCondition,
  TimeRelevance
} from './quickActionGenerator';