/**
 * Enhanced conversation engine for Bud's AI coaching
 * Manages conversation context, response selection, and quick action generation
 */

import { 
  ChatMessage, 
  ConversationContext, 
  ActionSuggestion, 
  MessageType, 
  Topic,
  MoodIndicator,
  ContextualFactor
} from '../types/coachingTypes';
import { HealthDataPoint, HealthMetrics } from '@/features/health/types/healthTypes';
import { UUID, Goal } from '@/shared/types/globalTypes';
import { MockResponseDatabase, MockResponse } from './mockResponseDatabase';
import { workoutService } from '@/features/workouts/services/workoutService';

export interface ConversationEngineConfig {
  maxHistoryLength: number;
  contextRetentionMinutes: number;
  enableProactiveCoaching: boolean;
  personalityStyle: 'encouraging' | 'direct' | 'analytical' | 'casual';
}

export interface MessageAnalysis {
  intent: MessageIntent;
  entities: ExtractedEntity[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  dataLoggingOpportunity?: DataLoggingOpportunity;
}

export type MessageIntent = 
  | 'greeting'
  | 'log_data'
  | 'ask_advice'
  | 'report_progress'
  | 'express_concern'
  | 'request_motivation'
  | 'plan_activity'
  | 'general_chat';

export interface ExtractedEntity {
  type: 'metric' | 'value' | 'time' | 'activity' | 'emotion' | 'goal';
  value: string | number;
  confidence: number;
  position: { start: number; end: number };
}

export interface DataLoggingOpportunity {
  metric: string;
  value?: number;
  unit?: string;
  confidence: number;
  followUpQuestions: string[];
}

export class ConversationEngine {
  private static instance: ConversationEngine;
  private mockDb: MockResponseDatabase;
  private config: ConversationEngineConfig;
  private activeContexts: Map<string, ConversationContext> = new Map();

  private constructor(config?: Partial<ConversationEngineConfig>) {
    this.mockDb = MockResponseDatabase.getInstance();
    this.config = {
      maxHistoryLength: 50,
      contextRetentionMinutes: 60,
      enableProactiveCoaching: true,
      personalityStyle: 'encouraging',
      ...config
    };
  }

  public static getInstance(config?: Partial<ConversationEngineConfig>): ConversationEngine {
    if (!ConversationEngine.instance) {
      ConversationEngine.instance = new ConversationEngine(config);
    }
    return ConversationEngine.instance;
  }

  public async processMessage(
    message: string,
    userId: string,
    sessionId?: string
  ): Promise<{
    response: ChatMessage;
    context: ConversationContext;
    dataLogged?: HealthDataPoint[];
    workoutRecommendationUpdated?: boolean;
  }> {
    const contextKey = sessionId || userId;
    let context = this.getOrCreateContext(contextKey, userId);

    // Analyze the incoming message
    const analysis = this.analyzeMessage(message, context);
    
    // Update conversation context
    context = this.updateContext(context, message, analysis);

    // Check if message should trigger workout recommendation update
    const workoutRecommendationUpdated = workoutService.processChatMessage(message);

    // Generate appropriate response
    const response = await this.generateResponse(message, analysis, context);

    // Handle data logging if detected
    const dataLogged = this.handleDataLogging(analysis, context);

    // Update conversation history
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      messageType: 'text',
      context
    };

    context.conversationHistory.push(userMessage, response);
    
    // Trim history if too long
    if (context.conversationHistory.length > this.config.maxHistoryLength) {
      context.conversationHistory = context.conversationHistory.slice(-this.config.maxHistoryLength);
    }

    // Store updated context
    this.activeContexts.set(contextKey, context);

    return {
      response,
      context,
      dataLogged: dataLogged.length > 0 ? dataLogged : undefined,
      workoutRecommendationUpdated
    };
  }

  private analyzeMessage(message: string, context: ConversationContext): MessageAnalysis {
    const lowerMessage = message.toLowerCase();
    
    // Determine intent
    const intent = this.determineIntent(lowerMessage);
    
    // Extract entities
    const entities = this.extractEntities(message);
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(lowerMessage);
    
    // Check for data logging opportunities
    const dataLoggingOpportunity = this.detectDataLogging(message);

    return {
      intent,
      entities,
      sentiment,
      confidence: 0.8, // Simplified confidence score
      dataLoggingOpportunity
    };
  }

  private determineIntent(message: string): MessageIntent {
    // Greeting patterns
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/i.test(message)) {
      return 'greeting';
    }

    // Data logging patterns
    if (/\b(slept|ate|drank|worked out|weigh|feeling|energy|stress)\b/i.test(message)) {
      return 'log_data';
    }

    // Advice seeking patterns
    if (/\b(should|recommend|suggest|advice|help|how to|what)\b/i.test(message)) {
      return 'ask_advice';
    }

    // Progress reporting patterns
    if (/\b(completed|finished|achieved|progress|goal|milestone)\b/i.test(message)) {
      return 'report_progress';
    }

    // Concern expressing patterns
    if (/\b(worried|concerned|struggling|difficult|hard|problem)\b/i.test(message)) {
      return 'express_concern';
    }

    // Motivation seeking patterns
    if (/\b(motivated|motivation|encourage|support|boost|inspire)\b/i.test(message)) {
      return 'request_motivation';
    }

    // Activity planning patterns
    if (/\b(plan|schedule|workout|exercise|meal|activity)\b/i.test(message)) {
      return 'plan_activity';
    }

    return 'general_chat';
  }

  private extractEntities(message: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    // Extract numeric values with units
    const numericMatches = message.matchAll(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|lbs?|kg|calories|steps|minutes?|mins?|glasses?|cups?)/gi);
    for (const match of numericMatches) {
      entities.push({
        type: 'value',
        value: parseFloat(match[1]),
        confidence: 0.9,
        position: { start: match.index || 0, end: (match.index || 0) + match[0].length }
      });
    }

    // Extract activities
    const activityMatches = message.matchAll(/\b(running|cycling|swimming|yoga|lifting|cardio|strength|hiit|walking)\b/gi);
    for (const match of activityMatches) {
      entities.push({
        type: 'activity',
        value: match[1].toLowerCase(),
        confidence: 0.8,
        position: { start: match.index || 0, end: (match.index || 0) + match[0].length }
      });
    }

    // Extract emotions
    const emotionMatches = message.matchAll(/\b(tired|energetic|motivated|stressed|happy|sad|excited|calm|frustrated|great|good|bad|terrible)\b/gi);
    for (const match of emotionMatches) {
      entities.push({
        type: 'emotion',
        value: match[1].toLowerCase(),
        confidence: 0.7,
        position: { start: match.index || 0, end: (match.index || 0) + match[0].length }
      });
    }

    return entities;
  }

  private analyzeSentiment(message: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['great', 'good', 'awesome', 'fantastic', 'amazing', 'love', 'happy', 'excited', 'motivated', 'energetic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'tired', 'stressed', 'frustrated', 'difficult', 'struggling'];

    const positiveCount = positiveWords.filter(word => message.includes(word)).length;
    const negativeCount = negativeWords.filter(word => message.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private detectDataLogging(message: string): DataLoggingOpportunity | undefined {
    // Sleep detection
    const sleepMatch = message.match(/(?:slept|sleep|sleeping).{0,50}?(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/i);
    if (sleepMatch) {
      return {
        metric: 'sleep_score',
        value: parseFloat(sleepMatch[1]),
        unit: 'hours',
        confidence: 0.9,
        followUpQuestions: [
          'How did you feel when you woke up?',
          'Was it restful sleep?'
        ]
      };
    }

    // Weight detection
    const weightMatch = message.match(/(?:weigh|weight).{0,30}?(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?|kg)/i);
    if (weightMatch) {
      return {
        metric: 'weight',
        value: parseFloat(weightMatch[1]),
        unit: message.includes('kg') ? 'kg' : 'lbs',
        confidence: 0.95,
        followUpQuestions: [
          'How are you feeling about your progress?',
          'Have you been consistent with your nutrition?'
        ]
      };
    }

    // Energy level detection
    const energyMatch = message.match(/(?:energy|feeling).{0,20}?(\d+)(?:\/10|\s*out of 10)/i);
    if (energyMatch) {
      return {
        metric: 'activity_level',
        value: parseInt(energyMatch[1]),
        unit: 'scale_1_10',
        confidence: 1.0,
        followUpQuestions: [
          'What\'s contributing to this energy level?',
          'How has your day been so far?'
        ]
      };
    }

    // Workout detection
    if (/\b(worked out|exercised|trained|gym|ran|cycling|lifted|workout)\b/i.test(message)) {
      return {
        metric: 'active_minutes',
        value: 30, // Default workout duration
        unit: 'minutes',
        confidence: 0.8,
        followUpQuestions: [
          'How long was your workout?',
          'How challenging was it on a scale of 1-10?',
          'How are you feeling now?'
        ]
      };
    }

    return undefined;
  }

  private async generateResponse(
    message: string,
    analysis: MessageAnalysis,
    context: ConversationContext
  ): Promise<ChatMessage> {
    let mockResponse: MockResponse | null = null;

    // Check for demo-specific responses first
    mockResponse = this.getDemoSpecificResponse(message, analysis, context);

    // If no demo response, use regular logic
    if (!mockResponse) {
      // Select response based on intent and context
      switch (analysis.intent) {
        case 'greeting':
          mockResponse = this.getGreetingResponse(context);
          break;
        case 'log_data':
          mockResponse = this.getDataLoggingResponse(analysis, context);
          break;
        case 'ask_advice':
          mockResponse = this.getAdviceResponse(message, context);
          break;
        case 'report_progress':
          mockResponse = this.getProgressResponse(context);
          break;
        case 'express_concern':
          mockResponse = this.getConcernResponse(analysis, context);
          break;
        case 'request_motivation':
          mockResponse = this.getMotivationResponse(context);
          break;
        case 'plan_activity':
          mockResponse = this.getPlanningResponse(message, context);
          break;
        default:
          mockResponse = this.mockDb.getRandomResponse('general');
      }
    }

    if (!mockResponse) {
      mockResponse = {
        content: "I'm here to help with your health journey! What would you like to focus on today?",
        suggestions: [
          { type: 'plan_workout', title: 'Plan a workout', category: 'fitness' },
          { type: 'track_meal', title: 'Log a meal', category: 'nutrition' }
        ]
      };
    }

    // Process template variables in response
    const processedContent = this.processResponseTemplate(mockResponse.content, analysis, context);

    // Generate suggestions
    const suggestions = this.generateActionSuggestions(mockResponse, analysis, context);

    return {
      id: this.generateId(),
      content: processedContent,
      sender: 'bud',
      timestamp: new Date(),
      messageType: this.determineResponseMessageType(analysis),
      context,
      suggestions,
      metadata: {
        relatedMetrics: analysis.dataLoggingOpportunity ? [analysis.dataLoggingOpportunity.metric] : [],
        actionRequired: (mockResponse.followUpQuestions?.length || 0) > 0,
        priority: mockResponse.priority || 'medium'
      }
    };
  }

  private getGreetingResponse(context: ConversationContext): MockResponse | null {
    const hour = new Date().getHours();
    let timeOfDay = 'general';
    
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 23) timeOfDay = 'evening';

    return this.mockDb.getResponse('greetings', timeOfDay, context);
  }

  private getDataLoggingResponse(analysis: MessageAnalysis, context: ConversationContext): MockResponse | null {
    if (!analysis.dataLoggingOpportunity) {
      return this.mockDb.getRandomResponse('general');
    }

    const metric = analysis.dataLoggingOpportunity.metric;
    
    switch (metric) {
      case 'sleep_score':
        const hours = analysis.dataLoggingOpportunity.value || 0;
        const sleepCategory = hours >= 7 ? 'good_sleep' : 'poor_sleep';
        return this.mockDb.getResponse('sleep', sleepCategory, context);
      
      case 'active_minutes':
        return this.mockDb.getResponse('fitness', 'workout_completed', context);
      
      case 'weight':
        return this.mockDb.getResponse('nutrition', 'meal_logged', context);
      
      case 'activity_level':
        const energyLevel = analysis.dataLoggingOpportunity.value || 5;
        const energyCategory = energyLevel >= 7 ? 'high_energy_workout' : 'low_energy_workout';
        return this.mockDb.getResponse('fitness', energyCategory, context);
      
      default:
        return this.mockDb.getRandomResponse('general');
    }
  }

  private getAdviceResponse(message: string, context: ConversationContext): MockResponse | null {
    if (message.toLowerCase().includes('workout') || message.toLowerCase().includes('exercise')) {
      return this.mockDb.getResponse('fitness', 'workout_planning', context);
    }
    
    if (message.toLowerCase().includes('nutrition') || message.toLowerCase().includes('eat')) {
      return this.mockDb.getResponse('nutrition', 'nutrition_advice', context);
    }
    
    if (message.toLowerCase().includes('sleep')) {
      return this.mockDb.getResponse('sleep', 'sleep_tips', context);
    }
    
    if (message.toLowerCase().includes('stress')) {
      return this.mockDb.getResponse('stress', 'stress_management', context);
    }

    return this.mockDb.getResponse('general', 'health_check', context);
  }

  private getProgressResponse(context: ConversationContext): MockResponse | null {
    // Simple logic - could be enhanced with actual progress analysis
    return this.mockDb.getResponse('progress', 'celebration', context);
  }

  private getConcernResponse(analysis: MessageAnalysis, context: ConversationContext): MockResponse | null {
    if (analysis.sentiment === 'negative') {
      return this.mockDb.getResponse('stress', 'high_stress', context);
    }
    return this.mockDb.getResponse('progress', 'encouragement', context);
  }

  private getMotivationResponse(context: ConversationContext): MockResponse | null {
    return this.mockDb.getResponse('progress', 'encouragement', context);
  }

  private getPlanningResponse(message: string, context: ConversationContext): MockResponse | null {
    if (message.toLowerCase().includes('workout') || message.toLowerCase().includes('exercise')) {
      return this.mockDb.getResponse('fitness', 'workout_planning', context);
    }
    return this.mockDb.getResponse('general', 'goal_setting', context);
  }

  private getDemoSpecificResponse(message: string, analysis: MessageAnalysis, context: ConversationContext): MockResponse | null {
    const lowerMessage = message.toLowerCase();
    
    // Check for back pain demo scenario
    if (lowerMessage.includes('back feels sore') || 
        lowerMessage.includes('back pain') || 
        lowerMessage.includes('sore back') ||
        lowerMessage.includes('back hurts') ||
        lowerMessage.includes('back is tight') ||
        lowerMessage.includes('lower back pain')) {
      return this.mockDb.getResponse('fitness', 'back_pain_response', context);
    }
    
    // Check for fatigue demo scenario
    if (lowerMessage.includes('feeling tired') ||
        lowerMessage.includes('low energy') ||
        lowerMessage.includes('exhausted') ||
        lowerMessage.includes('fatigue') ||
        lowerMessage.includes('drained') ||
        lowerMessage.includes('no energy')) {
      return this.mockDb.getResponse('fitness', 'fatigue_response', context);
    }
    
    return null;
  }

  private processResponseTemplate(
    content: string, 
    analysis: MessageAnalysis, 
    context: ConversationContext
  ): string {
    let processed = content;

    // Replace template variables
    if (analysis.dataLoggingOpportunity) {
      const { value, unit, metric } = analysis.dataLoggingOpportunity;
      
      if (value !== undefined) {
        processed = processed.replace('{hours}', value.toString());
        processed = processed.replace('{amount}', `${value} ${unit || ''}`);
      }

      // Extract workout type from entities
      const workoutEntity = analysis.entities.find(e => e.type === 'activity');
      if (workoutEntity) {
        processed = processed.replace('{workoutType}', workoutEntity.value.toString());
      }

      // Extract meal type based on time
      const hour = new Date().getHours();
      let mealType = 'meal';
      if (hour >= 6 && hour < 11) mealType = 'breakfast';
      else if (hour >= 11 && hour < 16) mealType = 'lunch';
      else if (hour >= 16 && hour < 22) mealType = 'dinner';
      processed = processed.replace('{mealType}', mealType);
    }

    return processed;
  }

  private generateActionSuggestions(
    mockResponse: MockResponse,
    analysis: MessageAnalysis,
    context: ConversationContext
  ): ActionSuggestion[] {
    const suggestions: ActionSuggestion[] = [];

    // Add suggestions from mock response
    if (mockResponse.suggestions) {
      mockResponse.suggestions.forEach(suggestion => {
        suggestions.push({
          id: this.generateId(),
          type: suggestion.type || 'view_progress',
          title: suggestion.title || 'View Progress',
          description: suggestion.description || '',
          priority: suggestion.priority || 'medium',
          category: suggestion.category || 'tracking',
          estimatedDuration: suggestion.estimatedDuration || 5
        });
      });
    }

    // Add contextual suggestions based on analysis
    if (analysis.dataLoggingOpportunity) {
      const metric = analysis.dataLoggingOpportunity.metric;
      
      switch (metric) {
        case 'sleep_score':
          suggestions.push({
            id: this.generateId(),
            type: 'plan_workout',
            title: 'Plan today\'s workout',
            description: 'Based on your sleep quality',
            priority: 'medium',
            category: 'fitness',
            estimatedDuration: 5
          });
          break;
        
        case 'active_minutes':
          suggestions.push({
            id: this.generateId(),
            type: 'track_meal',
            title: 'Log post-workout meal',
            description: 'Track your recovery nutrition',
            priority: 'high',
            category: 'nutrition',
            estimatedDuration: 3
          });
          break;
      }
    }

    return suggestions;
  }

  private determineResponseMessageType(analysis: MessageAnalysis): MessageType {
    switch (analysis.intent) {
      case 'log_data':
        return 'progress_update';
      case 'ask_advice':
        return 'recommendation';
      case 'report_progress':
        return 'celebration';
      case 'express_concern':
        return 'question';
      default:
        return 'text';
    }
  }

  private handleDataLogging(analysis: MessageAnalysis, context: ConversationContext): HealthDataPoint[] {
    const dataPoints: HealthDataPoint[] = [];

    if (analysis.dataLoggingOpportunity) {
      const { metric, value, unit } = analysis.dataLoggingOpportunity;
      
      if (value !== undefined) {
        dataPoints.push({
          id: this.generateId(),
          userId: context.userId,
          metric: metric as any,
          value,
          unit: unit || '',
          timestamp: new Date(),
          source: 'manual',
          confidence: analysis.dataLoggingOpportunity.confidence
        });
      }
    }

    return dataPoints;
  }

  private getOrCreateContext(contextKey: string, userId: string): ConversationContext {
    let context = this.activeContexts.get(contextKey);
    
    if (!context) {
      context = {
        sessionId: contextKey,
        userId,
        currentTopic: 'general',
        recentMetrics: { timestamp: new Date() },
        activeGoals: [],
        conversationHistory: [],
        contextualFactors: [],
        lastInteraction: new Date()
      };
    }

    return context;
  }

  private updateContext(
    context: ConversationContext,
    message: string,
    analysis: MessageAnalysis
  ): ConversationContext {
    // Update topic based on message intent
    const topicMap: Record<MessageIntent, Topic> = {
      'greeting': 'general',
      'log_data': 'progress_review',
      'ask_advice': 'general',
      'report_progress': 'progress_review',
      'express_concern': 'health_concerns',
      'request_motivation': 'motivation',
      'plan_activity': 'workout_planning',
      'general_chat': 'general'
    };

    context.currentTopic = topicMap[analysis.intent] || 'general';
    context.lastInteraction = new Date();

    // Update mood indicator if emotion detected
    const emotionEntity = analysis.entities.find(e => e.type === 'emotion');
    if (emotionEntity) {
      context.userMood = {
        energy: this.convertEmotionToScale(emotionEntity.value.toString(), 'energy'),
        motivation: this.convertEmotionToScale(emotionEntity.value.toString(), 'motivation'),
        stress: this.convertEmotionToScale(emotionEntity.value.toString(), 'stress'),
        confidence: this.convertEmotionToScale(emotionEntity.value.toString(), 'confidence'),
        timestamp: new Date()
      };
    }

    return context;
  }

  private convertEmotionToScale(emotion: string, aspect: string): number {
    const emotionMaps = {
      energy: {
        'tired': 2, 'exhausted': 1, 'low': 3, 'okay': 5, 'good': 7, 'great': 8, 'energetic': 9, 'amazing': 10
      },
      motivation: {
        'unmotivated': 2, 'low': 3, 'okay': 5, 'good': 7, 'motivated': 8, 'excited': 9, 'inspired': 10
      },
      stress: {
        'calm': 2, 'relaxed': 3, 'okay': 5, 'stressed': 7, 'overwhelmed': 8, 'anxious': 9, 'panicked': 10
      },
      confidence: {
        'insecure': 2, 'uncertain': 4, 'okay': 5, 'confident': 7, 'strong': 8, 'unstoppable': 10
      }
    };

    const map = emotionMaps[aspect as keyof typeof emotionMaps];
    return map[emotion as keyof typeof map] || 5;
  }

  private generateId(): UUID {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  public getActiveContext(contextKey: string): ConversationContext | undefined {
    return this.activeContexts.get(contextKey);
  }

  public clearContext(contextKey: string): void {
    this.activeContexts.delete(contextKey);
  }

  public getAllActiveContexts(): ConversationContext[] {
    return Array.from(this.activeContexts.values());
  }
}