/**
 * GROQ Service
 * Main service that orchestrates GROQ API integration with context management,
 * prompt engineering, and response caching
 */

import type { 
  ConversationContext, 
  ChatMessage, 
  AIResponse,
  MessageType,
  ActionSuggestion
} from '../types/conversationTypes';
import type { HealthMetrics } from '../../../shared/types/healthTypes';
import type { Goal } from '../../../shared/types/userTypes';

import { GroqApiClient, GroqApiError, type GroqMessage } from './groqApiClient';
import { ConversationContextManager } from './conversationContextManager';
import { PromptEngineering, type PromptContext } from './promptEngineering';
import { ResponseCache, type CacheMetadata } from './responseCache';

export interface GroqServiceConfig {
  enableCaching: boolean;
  enableStreaming: boolean;
  fallbackToCache: boolean;
  maxRetries: number;
  timeoutMs: number;
}

export interface ProcessMessageOptions {
  enableStreaming?: boolean;
  bypassCache?: boolean;
  customPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ProcessMessageResult {
  response: ChatMessage;
  cached: boolean;
  processingTime: number;
  tokensUsed?: number;
  confidence: number;
  streamingId?: string;
}

export class GroqService {
  private static instance: GroqService;
  private groqClient: GroqApiClient;
  private contextManager: ConversationContextManager;
  private promptEngine: PromptEngineering;
  private responseCache: ResponseCache;
  private config: GroqServiceConfig;

  private constructor() {
    this.groqClient = GroqApiClient.getInstance();
    this.contextManager = ConversationContextManager.getInstance();
    this.promptEngine = PromptEngineering.getInstance();
    this.responseCache = ResponseCache.getInstance();
    
    this.config = {
      enableCaching: true,
      enableStreaming: true,
      fallbackToCache: true,
      maxRetries: 3,
      timeoutMs: 30000
    };
  }

  public static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  /**
   * Process user message and generate AI response
   */
  public async processMessage(
    userMessage: string,
    userId: string,
    sessionId: string,
    options: ProcessMessageOptions = {}
  ): Promise<ProcessMessageResult> {
    const startTime = Date.now();

    try {
      // Get or create conversation context
      const context = this.contextManager.getOrCreateContext(userId, sessionId);
      
      // Create user message
      const userChatMessage: ChatMessage = {
        id: this.generateId(),
        content: userMessage,
        sender: 'user',
        timestamp: new Date(),
        messageType: 'text',
        context: {
          relatedMetrics: this.extractMetricReferences(userMessage),
          relatedGoals: this.extractGoalReferences(userMessage, context.activeGoals)
        }
      };

      // Update context with user message
      this.contextManager.updateContextWithMessage(sessionId, userChatMessage);

      // Generate prompt
      const promptContext: PromptContext = {
        userMessage,
        conversationContext: context,
        healthMetrics: context.recentMetrics,
        recentMessages: context.conversationHistory.slice(-10),
        contextualFactors: context.contextualFactors,
        currentGoals: context.activeGoals || []
      };

      const messages = this.promptEngine.generatePrompt(promptContext);
      
      // Check cache first (unless bypassed)
      if (this.config.enableCaching && !options.bypassCache) {
        const promptHash = this.responseCache.generatePromptHash(
          messages,
          userId,
          context.contextualFactors.map(f => f.type)
        );

        const cachedEntry = this.responseCache.get(promptHash);
        if (cachedEntry) {
          const cachedResponse = this.createChatMessageFromAIResponse(
            cachedEntry.response,
            context
          );

          // Update context with cached response
          this.contextManager.updateContextWithMessage(sessionId, cachedResponse);

          return {
            response: cachedResponse,
            cached: true,
            processingTime: Date.now() - startTime,
            tokensUsed: cachedEntry.metadata.tokensUsed,
            confidence: cachedEntry.response.confidence
          };
        }
      }

      // Generate AI response
      let aiResponse: AIResponse;
      let streamingId: string | undefined;

      if (this.config.enableStreaming && options.enableStreaming) {
        // Streaming response
        streamingId = this.generateId();
        aiResponse = await this.generateStreamingResponse(
          messages,
          streamingId,
          options
        );
      } else {
        // Standard response
        aiResponse = await this.generateResponse(messages, options);
      }

      // Create chat message from AI response
      const budResponse = this.createChatMessageFromAIResponse(aiResponse, context);

      // Update context with AI response
      this.contextManager.updateContextWithMessage(sessionId, budResponse);

      // Cache the response
      if (this.config.enableCaching && aiResponse.confidence >= 0.7) {
        const promptHash = this.responseCache.generatePromptHash(
          messages,
          userId,
          context.contextualFactors.map(f => f.type)
        );

        const metadata: CacheMetadata = {
          userId,
          sessionId,
          category: context.currentTopic.category,
          confidence: aiResponse.confidence,
          tokensUsed: aiResponse.tokensUsed || 0,
          processingTime: aiResponse.processingTime
        };

        this.responseCache.set(promptHash, aiResponse, metadata);
      }

      return {
        response: budResponse,
        cached: false,
        processingTime: Date.now() - startTime,
        tokensUsed: aiResponse.tokensUsed,
        confidence: aiResponse.confidence,
        streamingId
      };

    } catch (error) {
      console.error('Error processing message:', error);
      
      // Try fallback strategies
      return this.handleError(error, userMessage, userId, sessionId, startTime);
    }
  }

  /**
   * Generate standard AI response
   */
  private async generateResponse(
    messages: GroqMessage[],
    options: ProcessMessageOptions
  ): Promise<AIResponse> {
    const startTime = Date.now();

    const response = await this.groqClient.chatCompletion(messages, {
      maxTokens: options.maxTokens,
      temperature: options.temperature
    });

    const processingTime = Date.now() - startTime;
    const content = response.choices?.[0]?.message?.content || '';

    return {
      content,
      confidence: this.calculateConfidence(response),
      suggestions: this.extractActionSuggestions(content),
      followUpQuestions: this.extractFollowUpQuestions(content),
      flags: this.extractMessageFlags(content),
      processingTime,
      tokensUsed: response.usage?.total_tokens
    };
  }

  /**
   * Generate streaming AI response
   */
  private async generateStreamingResponse(
    messages: GroqMessage[],
    streamingId: string,
    options: ProcessMessageOptions
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const streamingResponse = this.responseCache.startStreaming(streamingId);

    let totalTokens = 0;

    await this.groqClient.chatCompletionStream(
      messages,
      (chunk) => {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          this.responseCache.addStreamChunk(streamingId, content);
          totalTokens += Math.ceil(content.length / 4); // Rough token estimate
        }
      },
      {
        maxTokens: options.maxTokens,
        temperature: options.temperature
      }
    );

    const completedResponse = this.responseCache.completeStreaming(streamingId);
    if (!completedResponse) {
      throw new Error('Failed to complete streaming response');
    }

    const processingTime = Date.now() - startTime;

    return {
      content: completedResponse.content,
      confidence: 0.8, // Default confidence for streaming
      suggestions: this.extractActionSuggestions(completedResponse.content),
      followUpQuestions: this.extractFollowUpQuestions(completedResponse.content),
      flags: this.extractMessageFlags(completedResponse.content),
      processingTime,
      tokensUsed: totalTokens
    };
  }

  /**
   * Create ChatMessage from AIResponse
   */
  private createChatMessageFromAIResponse(
    aiResponse: AIResponse,
    context: ConversationContext
  ): ChatMessage {
    return {
      id: this.generateId(),
      content: aiResponse.content,
      sender: 'bud',
      timestamp: new Date(),
      messageType: this.determineMessageType(aiResponse),
      context: {
        relatedMetrics: this.extractMetricReferences(aiResponse.content),
        relatedGoals: this.extractGoalReferences(aiResponse.content, context.activeGoals)
      },
      suggestions: aiResponse.suggestions,
      metadata: {
        confidence: aiResponse.confidence,
        processingTime: aiResponse.processingTime,
        flags: aiResponse.flags
      }
    };
  }

  /**
   * Handle errors with fallback strategies
   */
  private async handleError(
    error: any,
    userMessage: string,
    userId: string,
    sessionId: string,
    startTime: number
  ): Promise<ProcessMessageResult> {
    console.error('GROQ Service error:', error);

    // Try to get a cached similar response
    if (this.config.fallbackToCache) {
      const fallbackResponse = await this.getFallbackResponse(userMessage, userId);
      if (fallbackResponse) {
        return {
          response: fallbackResponse,
          cached: true,
          processingTime: Date.now() - startTime,
          confidence: 0.5 // Lower confidence for fallback
        };
      }
    }

    // Generate basic fallback response
    const fallbackMessage: ChatMessage = {
      id: this.generateId(),
      content: this.generateBasicFallbackResponse(userMessage),
      sender: 'bud',
      timestamp: new Date(),
      messageType: 'text',
      suggestions: this.generateBasicSuggestions(),
      metadata: {
        confidence: 0.3,
        processingTime: Date.now() - startTime,
        flags: ['fallback_response']
      }
    };

    // Update context with fallback response
    const context = this.contextManager.getOrCreateContext(userId, sessionId);
    this.contextManager.updateContextWithMessage(sessionId, fallbackMessage);

    return {
      response: fallbackMessage,
      cached: false,
      processingTime: Date.now() - startTime,
      confidence: 0.3
    };
  }

  /**
   * Get fallback response from cache
   */
  private async getFallbackResponse(
    userMessage: string,
    userId: string
  ): Promise<ChatMessage | null> {
    // This is a simplified fallback - in a real implementation,
    // you might use semantic similarity to find related cached responses
    return null;
  }

  /**
   * Generate basic fallback response
   */
  private generateBasicFallbackResponse(userMessage: string): string {
    const responses = [
      "I'm having trouble connecting right now, but I'm here to help! Can you tell me more about what you'd like to focus on?",
      "I'm experiencing some technical difficulties, but let's keep working on your health goals. What's on your mind today?",
      "Sorry, I'm having connection issues. While I get that sorted, is there something specific about your fitness or wellness you'd like to discuss?",
      "I'm temporarily offline, but I don't want that to stop your progress! What health topic would you like to explore?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate basic action suggestions
   */
  private generateBasicSuggestions(): ActionSuggestion[] {
    return [
      {
        id: this.generateId(),
        text: 'View Progress',
        action: 'view_progress',
        priority: 'medium',
        category: 'tracking'
      },
      {
        id: this.generateId(),
        text: 'Log Workout',
        action: 'log_workout',
        priority: 'medium',
        category: 'fitness'
      },
      {
        id: this.generateId(),
        text: 'Track Water',
        action: 'log_water',
        priority: 'low',
        category: 'nutrition'
      }
    ];
  }

  /**
   * Utility methods for content analysis
   */

  private calculateConfidence(response: any): number {
    // Simple confidence calculation based on response completeness
    const content = response.choices?.[0]?.message?.content || '';
    const finishReason = response.choices?.[0]?.finish_reason;
    
    if (finishReason === 'stop' && content.length > 50) {
      return 0.9;
    } else if (finishReason === 'length' && content.length > 100) {
      return 0.7;
    } else if (content.length > 20) {
      return 0.6;
    }
    
    return 0.4;
  }

  private determineMessageType(aiResponse: AIResponse): MessageType {
    const content = aiResponse.content.toLowerCase();
    
    if (aiResponse.flags.includes('health_concern')) return 'concern';
    if (aiResponse.flags.includes('motivational')) return 'celebration';
    if (content.includes('?')) return 'question';
    if (aiResponse.suggestions.length > 0) return 'suggestion';
    
    return 'text';
  }

  private extractActionSuggestions(content: string): ActionSuggestion[] {
    const suggestions: ActionSuggestion[] = [];
    
    // Simple keyword-based extraction
    if (content.toLowerCase().includes('workout') || content.toLowerCase().includes('exercise')) {
      suggestions.push({
        id: this.generateId(),
        text: 'Plan Workout',
        action: 'plan_workout',
        priority: 'high',
        category: 'fitness'
      });
    }
    
    if (content.toLowerCase().includes('food') || content.toLowerCase().includes('nutrition')) {
      suggestions.push({
        id: this.generateId(),
        text: 'Log Meal',
        action: 'track_meal',
        priority: 'medium',
        category: 'nutrition'
      });
    }
    
    if (content.toLowerCase().includes('sleep') || content.toLowerCase().includes('rest')) {
      suggestions.push({
        id: this.generateId(),
        text: 'Check Sleep',
        action: 'check_sleep',
        priority: 'medium',
        category: 'sleep'
      });
    }
    
    return suggestions;
  }

  private extractFollowUpQuestions(content: string): string[] {
    const sentences = content.split(/[.!?]+/);
    return sentences
      .filter(sentence => sentence.includes('?'))
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .slice(0, 2);
  }

  private extractMessageFlags(content: string): string[] {
    const flags: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('doctor') || lowerContent.includes('medical')) {
      flags.push('health_concern');
    }
    
    if (lowerContent.includes('great') || lowerContent.includes('excellent') || lowerContent.includes('congratulations')) {
      flags.push('motivational');
    }
    
    if (lowerContent.includes('should') || lowerContent.includes('recommend') || lowerContent.includes('suggest')) {
      flags.push('actionable');
    }
    
    return flags;
  }

  private extractMetricReferences(content: string): string[] {
    const metrics: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('heart rate')) metrics.push('heartRate');
    if (lowerContent.includes('sleep')) metrics.push('sleepScore');
    if (lowerContent.includes('stress')) metrics.push('stressLevel');
    if (lowerContent.includes('calories')) metrics.push('caloriesConsumed');
    if (lowerContent.includes('water')) metrics.push('waterIntake');
    
    return metrics;
  }

  private extractGoalReferences(content: string, goals: Goal[]): string[] {
    const references: string[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const goal of goals) {
      if (lowerContent.includes(goal.title.toLowerCase()) || 
          lowerContent.includes(goal.description.toLowerCase())) {
        references.push(goal.id);
      }
    }
    
    return references;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Public utility methods
   */

  public async updateHealthMetrics(
    sessionId: string,
    metrics: HealthMetrics
  ): Promise<void> {
    this.contextManager.updateContextWithMetrics(sessionId, metrics);
  }

  public async updateGoals(
    sessionId: string,
    goals: Goal[]
  ): Promise<void> {
    this.contextManager.updateContextWithGoals(sessionId, goals);
  }

  public getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.contextManager.getContext(sessionId);
  }

  public clearConversationContext(sessionId: string): void {
    this.contextManager.clearContext(sessionId);
  }

  public getServiceStats(): {
    groq: any;
    cache: any;
    context: any;
  } {
    return {
      groq: {
        configured: this.groqClient.isConfigured(),
        config: this.groqClient.getConfig()
      },
      cache: this.responseCache.getStats(),
      context: this.contextManager.getStats()
    };
  }

  public updateConfig(newConfig: Partial<GroqServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): GroqServiceConfig {
    return { ...this.config };
  }
}