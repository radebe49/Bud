import { ChatMessage, ActionSuggestion, ConversationContext, MessageType } from '../types/coachingTypes';
import { HealthDataPoint, HealthMetrics } from '@/features/health/types/healthTypes';
import { UUID } from '@/shared/types/globalTypes';
import { ConversationEngine } from './conversationEngine';
import { QuickActionGenerator } from './quickActionGenerator';
import { MockResponseDatabase } from './mockResponseDatabase';
import { workoutUpdateNotifier } from '@/shared/services/workoutUpdateNotifier';

export interface DataLoggingResult {
  success: boolean;
  dataLogged?: HealthDataPoint[];
  followUpQuestions?: string[];
  suggestions?: ActionSuggestion[];
}

export class ConversationService {
  private static instance: ConversationService;
  private conversationEngine: ConversationEngine;
  private quickActionGenerator: QuickActionGenerator;
  private mockDb: MockResponseDatabase;

  private constructor() {
    this.conversationEngine = ConversationEngine.getInstance();
    this.quickActionGenerator = QuickActionGenerator.getInstance();
    this.mockDb = MockResponseDatabase.getInstance();
  }

  public static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }



  public async processMessage(
    message: string,
    context: ConversationContext
  ): Promise<{ response: ChatMessage; dataLogged?: DataLoggingResult }> {
    try {
      // Use the enhanced conversation engine
      const result = await this.conversationEngine.processMessage(
        message,
        context.userId,
        context.sessionId
      );

      // Generate additional quick actions based on context
      const quickActions = this.quickActionGenerator.generateQuickActions(result.context);
      const contextualActions = this.quickActionGenerator.generateContextualActions(message, result.context);

      // Merge suggestions
      const allSuggestions = [
        ...(result.response.suggestions || []),
        ...quickActions.slice(0, 2), // Limit quick actions
        ...contextualActions
      ];

      // Remove duplicates and limit total suggestions
      const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions).slice(0, 4);

      // Update response with enhanced suggestions
      const enhancedResponse: ChatMessage = {
        ...result.response,
        suggestions: uniqueSuggestions
      };

      // Check if workout recommendations were updated
      if (result.workoutRecommendationUpdated) {
        // Notify subscribers that workout recommendations have been updated
        workoutUpdateNotifier.notifyWorkoutUpdate();
      }

      // Convert health data points to DataLoggingResult format
      const dataLogged: DataLoggingResult = {
        success: (result.dataLogged?.length || 0) > 0,
        dataLogged: result.dataLogged,
        followUpQuestions: this.extractFollowUpQuestions(enhancedResponse),
        suggestions: uniqueSuggestions
      };

      return {
        response: enhancedResponse,
        dataLogged: dataLogged.success ? dataLogged : undefined
      };
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Fallback to basic response
      return this.generateFallbackResponse(message, context);
    }
  }

  private deduplicateSuggestions(suggestions: ActionSuggestion[]): ActionSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.type}-${suggestion.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private extractFollowUpQuestions(response: ChatMessage): string[] {
    // Extract follow-up questions from response content
    // This is a simple implementation - could be enhanced
    const content = response.content;
    const questionMarkers = ['?'];
    const sentences = content.split(/[.!?]+/);
    
    return sentences
      .filter(sentence => sentence.includes('?'))
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .slice(0, 2); // Limit to 2 follow-up questions
  }

  private generateFallbackResponse(
    message: string,
    context: ConversationContext
  ): { response: ChatMessage; dataLogged?: DataLoggingResult } {
    const fallbackResponse = this.mockDb.getRandomResponse('general');
    
    const response: ChatMessage = {
      id: this.generateId(),
      content: fallbackResponse?.content || "I'm here to help with your health journey! What would you like to focus on today?",
      sender: 'bud',
      timestamp: new Date(),
      messageType: 'text',
      context,
      suggestions: fallbackResponse?.suggestions?.map(s => ({
        id: this.generateId(),
        type: s.type || 'view_progress',
        title: s.title || 'View Progress',
        description: s.description || '',
        priority: s.priority || 'medium',
        category: s.category || 'tracking',
        estimatedDuration: s.estimatedDuration || 5
      })) || []
    };

    return { response };
  }

  // Legacy method for backward compatibility
  public async analyzeForDataLogging(message: string): Promise<DataLoggingResult> {
    // Use the conversation engine for data logging analysis
    const tempContext: ConversationContext = {
      sessionId: 'temp',
      userId: 'temp-user',
      currentTopic: 'general',
      recentMetrics: { timestamp: new Date() },
      activeGoals: [],
      conversationHistory: [],
      contextualFactors: [],
      lastInteraction: new Date()
    };

    try {
      const result = await this.conversationEngine.processMessage(message, 'temp-user', 'temp');
      
      return {
        success: (result.dataLogged?.length || 0) > 0,
        dataLogged: result.dataLogged,
        followUpQuestions: this.extractFollowUpQuestions(result.response),
        suggestions: result.response.suggestions || []
      };
    } catch (error) {
      console.error('Error analyzing message for data logging:', error);
      return {
        success: false,
        dataLogged: [],
        followUpQuestions: [],
        suggestions: []
      };
    }
  }

  // Utility methods
  public getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.conversationEngine.getActiveContext(sessionId);
  }

  public clearConversationContext(sessionId: string): void {
    this.conversationEngine.clearContext(sessionId);
  }

  public getAllActiveContexts(): ConversationContext[] {
    return this.conversationEngine.getAllActiveContexts();
  }

  public generateQuickActions(context: ConversationContext): ActionSuggestion[] {
    return this.quickActionGenerator.generateQuickActions(context);
  }

  private generateId(): UUID {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}