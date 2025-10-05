/**
 * Conversation Context Manager
 * Manages conversation history, context, and state for AI coaching sessions
 */

import type { 
  ConversationContext, 
  ChatMessage, 
  MoodIndicator, 
  ContextualFactor,
  Topic,
  CoachingSession,
  SessionOutcome
} from '../types/conversationTypes';
import type { HealthMetrics } from '../../../shared/types/healthTypes';
import type { Goal } from '../../../shared/types/userTypes';

export interface ContextManagerConfig {
  maxHistoryLength: number;
  contextExpiryMinutes: number;
  maxConcurrentSessions: number;
  persistContext: boolean;
}

export interface ContextSnapshot {
  context: ConversationContext;
  timestamp: Date;
  version: number;
}

export class ConversationContextManager {
  private static instance: ConversationContextManager;
  private activeContexts: Map<string, ConversationContext> = new Map();
  private contextHistory: Map<string, ContextSnapshot[]> = new Map();
  private activeSessions: Map<string, CoachingSession> = new Map();
  private config: ContextManagerConfig;

  private constructor() {
    this.config = {
      maxHistoryLength: 50, // Maximum messages to keep in history
      contextExpiryMinutes: 60, // Context expires after 1 hour of inactivity
      maxConcurrentSessions: 10, // Maximum concurrent sessions per user
      persistContext: true // Whether to persist context between app sessions
    };

    // Clean up expired contexts every 5 minutes
    setInterval(() => this.cleanupExpiredContexts(), 5 * 60 * 1000);
  }

  public static getInstance(): ConversationContextManager {
    if (!ConversationContextManager.instance) {
      ConversationContextManager.instance = new ConversationContextManager();
    }
    return ConversationContextManager.instance;
  }

  /**
   * Create a new conversation context
   */
  public createContext(
    userId: string,
    sessionId: string,
    initialTopic: Topic = { 
      id: 'general', 
      name: 'General Health', 
      category: 'general', 
      priority: 5 
    }
  ): ConversationContext {
    const context: ConversationContext = {
      sessionId,
      userId,
      currentTopic: initialTopic,
      recentMetrics: { timestamp: new Date() },
      activeGoals: [],
      conversationHistory: [],
      userMood: {
        energy: 5,
        motivation: 5,
        stress: 5,
        confidence: 5,
        overall: 5,
        timestamp: new Date(),
        source: 'inferred'
      },
      contextualFactors: [],
      lastInteraction: new Date(),
      sessionDuration: 0
    };

    this.activeContexts.set(sessionId, context);
    this.saveContextSnapshot(sessionId, context);

    // Create coaching session
    const session: CoachingSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      messages: [],
      context,
      outcomes: [],
      followUpNeeded: false
    };

    this.activeSessions.set(sessionId, session);

    return context;
  }

  /**
   * Get existing context or create new one
   */
  public getOrCreateContext(
    userId: string,
    sessionId: string,
    initialTopic?: Topic
  ): ConversationContext {
    const existingContext = this.activeContexts.get(sessionId);
    
    if (existingContext && !this.isContextExpired(existingContext)) {
      // Update last interaction time
      existingContext.lastInteraction = new Date();
      existingContext.sessionDuration = this.calculateSessionDuration(existingContext);
      return existingContext;
    }

    return this.createContext(userId, sessionId, initialTopic);
  }

  /**
   * Update context with new message
   */
  public updateContextWithMessage(
    sessionId: string,
    message: ChatMessage
  ): ConversationContext {
    const context = this.activeContexts.get(sessionId);
    if (!context) {
      throw new Error(`Context not found for session: ${sessionId}`);
    }

    // Add message to history
    context.conversationHistory.push(message);

    // Trim history if it exceeds max length
    if (context.conversationHistory.length > this.config.maxHistoryLength) {
      context.conversationHistory = context.conversationHistory.slice(-this.config.maxHistoryLength);
    }

    // Update last interaction
    context.lastInteraction = new Date();
    context.sessionDuration = this.calculateSessionDuration(context);

    // Update topic if message suggests a topic change
    this.updateTopicFromMessage(context, message);

    // Update session
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.messages.push(message);
      session.context = context;
    }

    // Save snapshot
    this.saveContextSnapshot(sessionId, context);

    return context;
  }

  /**
   * Update context with health metrics
   */
  public updateContextWithMetrics(
    sessionId: string,
    metrics: HealthMetrics
  ): ConversationContext {
    const context = this.activeContexts.get(sessionId);
    if (!context) {
      throw new Error(`Context not found for session: ${sessionId}`);
    }

    context.recentMetrics = metrics;
    context.lastInteraction = new Date();

    // Update contextual factors based on metrics
    this.updateContextualFactorsFromMetrics(context, metrics);

    this.saveContextSnapshot(sessionId, context);
    return context;
  }

  /**
   * Update context with user goals
   */
  public updateContextWithGoals(
    sessionId: string,
    goals: Goal[]
  ): ConversationContext {
    const context = this.activeContexts.get(sessionId);
    if (!context) {
      throw new Error(`Context not found for session: ${sessionId}`);
    }

    context.activeGoals = goals;
    context.lastInteraction = new Date();

    this.saveContextSnapshot(sessionId, context);
    return context;
  }

  /**
   * Update user mood in context
   */
  public updateMood(
    sessionId: string,
    mood: Partial<MoodIndicator>
  ): ConversationContext {
    const context = this.activeContexts.get(sessionId);
    if (!context) {
      throw new Error(`Context not found for session: ${sessionId}`);
    }

    context.userMood = {
      ...context.userMood,
      ...mood,
      timestamp: new Date()
    };

    context.lastInteraction = new Date();
    this.saveContextSnapshot(sessionId, context);
    return context;
  }

  /**
   * Add contextual factor
   */
  public addContextualFactor(
    sessionId: string,
    factor: ContextualFactor
  ): ConversationContext {
    const context = this.activeContexts.get(sessionId);
    if (!context) {
      throw new Error(`Context not found for session: ${sessionId}`);
    }

    // Remove existing factor of same type
    context.contextualFactors = context.contextualFactors.filter(
      f => f.type !== factor.type
    );

    // Add new factor
    context.contextualFactors.push(factor);

    // Keep only recent factors (last 10)
    if (context.contextualFactors.length > 10) {
      context.contextualFactors = context.contextualFactors
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
    }

    context.lastInteraction = new Date();
    this.saveContextSnapshot(sessionId, context);
    return context;
  }

  /**
   * Get context by session ID
   */
  public getContext(sessionId: string): ConversationContext | undefined {
    const context = this.activeContexts.get(sessionId);
    
    if (context && this.isContextExpired(context)) {
      this.clearContext(sessionId);
      return undefined;
    }

    return context;
  }

  /**
   * Get all active contexts for a user
   */
  public getUserContexts(userId: string): ConversationContext[] {
    const userContexts: ConversationContext[] = [];
    
    for (const context of this.activeContexts.values()) {
      if (context.userId === userId && !this.isContextExpired(context)) {
        userContexts.push(context);
      }
    }

    return userContexts;
  }

  /**
   * Clear context for a session
   */
  public clearContext(sessionId: string): void {
    // End coaching session
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.endTime = new Date();
      // Could save session to persistent storage here
    }

    this.activeContexts.delete(sessionId);
    this.activeSessions.delete(sessionId);
    this.contextHistory.delete(sessionId);
  }

  /**
   * Get conversation summary for context
   */
  public getConversationSummary(sessionId: string): string {
    const context = this.activeContexts.get(sessionId);
    if (!context || context.conversationHistory.length === 0) {
      return 'No conversation history available.';
    }

    const recentMessages = context.conversationHistory.slice(-10);
    const topics = new Set<string>();
    let userQuestions = 0;
    let budResponses = 0;

    for (const message of recentMessages) {
      if (message.sender === 'user') {
        userQuestions++;
      } else {
        budResponses++;
      }

      // Extract topics from message context
      if (message.context?.relatedGoals) {
        message.context.relatedGoals.forEach(goal => topics.add(goal));
      }
    }

    const topicsList = Array.from(topics).slice(0, 3).join(', ');
    const duration = Math.round(context.sessionDuration);

    return `Session duration: ${duration} minutes. ` +
           `${userQuestions} user messages, ${budResponses} responses. ` +
           `Topics discussed: ${topicsList || 'general health'}.`;
  }

  /**
   * Get context history for a session
   */
  public getContextHistory(sessionId: string): ContextSnapshot[] {
    return this.contextHistory.get(sessionId) || [];
  }

  /**
   * Get coaching session
   */
  public getSession(sessionId: string): CoachingSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Add session outcome
   */
  public addSessionOutcome(
    sessionId: string,
    outcome: SessionOutcome
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.outcomes.push(outcome);
    }
  }

  /**
   * Private helper methods
   */

  private calculateSessionDuration(context: ConversationContext): number {
    if (context.conversationHistory.length === 0) {
      return 0;
    }

    const firstMessage = context.conversationHistory[0];
    const lastMessage = context.conversationHistory[context.conversationHistory.length - 1];
    
    return (lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime()) / (1000 * 60);
  }

  private isContextExpired(context: ConversationContext): boolean {
    const expiryTime = new Date(
      context.lastInteraction.getTime() + (this.config.contextExpiryMinutes * 60 * 1000)
    );
    return new Date() > expiryTime;
  }

  private updateTopicFromMessage(context: ConversationContext, message: ChatMessage): void {
    if (!message.context) return;

    // Simple topic detection based on message context
    if (message.context.workoutContext) {
      context.currentTopic = {
        id: 'fitness',
        name: 'Fitness & Workouts',
        category: 'fitness_planning',
        priority: 8
      };
    } else if (message.context.nutritionContext) {
      context.currentTopic = {
        id: 'nutrition',
        name: 'Nutrition & Diet',
        category: 'nutrition_guidance',
        priority: 7
      };
    } else if (message.context.sleepContext) {
      context.currentTopic = {
        id: 'sleep',
        name: 'Sleep & Recovery',
        category: 'sleep_optimization',
        priority: 8
      };
    }
  }

  private updateContextualFactorsFromMetrics(
    context: ConversationContext,
    metrics: HealthMetrics
  ): void {
    const now = new Date();

    // Add factors based on metrics
    if (metrics.sleepScore !== undefined) {
      this.addContextualFactor(context.sessionId, {
        type: 'sleep_quality',
        value: metrics.sleepScore,
        impact: metrics.sleepScore > 7 ? 'positive' : metrics.sleepScore < 5 ? 'negative' : 'neutral',
        confidence: 0.8,
        timestamp: now
      });
    }

    if (metrics.stressLevel !== undefined) {
      this.addContextualFactor(context.sessionId, {
        type: 'stress_level',
        value: metrics.stressLevel,
        impact: metrics.stressLevel < 4 ? 'positive' : metrics.stressLevel > 7 ? 'negative' : 'neutral',
        confidence: 0.7,
        timestamp: now
      });
    }

    if (metrics.activityLevel !== undefined) {
      this.addContextualFactor(context.sessionId, {
        type: 'energy_level',
        value: metrics.activityLevel,
        impact: metrics.activityLevel > 6 ? 'positive' : metrics.activityLevel < 3 ? 'negative' : 'neutral',
        confidence: 0.6,
        timestamp: now
      });
    }
  }

  private saveContextSnapshot(sessionId: string, context: ConversationContext): void {
    if (!this.config.persistContext) return;

    const snapshots = this.contextHistory.get(sessionId) || [];
    const snapshot: ContextSnapshot = {
      context: JSON.parse(JSON.stringify(context)), // Deep copy
      timestamp: new Date(),
      version: snapshots.length + 1
    };

    snapshots.push(snapshot);

    // Keep only last 20 snapshots
    if (snapshots.length > 20) {
      snapshots.splice(0, snapshots.length - 20);
    }

    this.contextHistory.set(sessionId, snapshots);
  }

  private cleanupExpiredContexts(): void {
    const expiredSessions: string[] = [];

    for (const [sessionId, context] of this.activeContexts.entries()) {
      if (this.isContextExpired(context)) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.clearContext(sessionId);
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired conversation contexts`);
    }
  }

  /**
   * Configuration methods
   */

  public updateConfig(newConfig: Partial<ContextManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ContextManagerConfig {
    return { ...this.config };
  }

  /**
   * Statistics and monitoring
   */

  public getStats(): {
    activeContexts: number;
    activeSessions: number;
    totalHistorySnapshots: number;
    averageSessionDuration: number;
  } {
    const durations = Array.from(this.activeContexts.values())
      .map(ctx => ctx.sessionDuration)
      .filter(d => d > 0);

    const averageDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const totalSnapshots = Array.from(this.contextHistory.values())
      .reduce((sum, snapshots) => sum + snapshots.length, 0);

    return {
      activeContexts: this.activeContexts.size,
      activeSessions: this.activeSessions.size,
      totalHistorySnapshots: totalSnapshots,
      averageSessionDuration: Math.round(averageDuration * 100) / 100
    };
  }
}