/**
 * Prompt Engineering Tests
 */

import { PromptEngineering, type PromptContext, type PromptCategory } from '../promptEngineering';
import type { 
  ConversationContext, 
  ChatMessage, 
  ContextualFactor 
} from '../../types/conversationTypes';
import type { HealthMetrics } from '../../../../shared/types/healthTypes';
import type { Goal } from '../../../../shared/types/userTypes';

describe('PromptEngineering', () => {
  let promptEngine: PromptEngineering;

  beforeEach(() => {
    promptEngine = PromptEngineering.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = PromptEngineering.getInstance();
      const instance2 = PromptEngineering.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('generatePrompt', () => {
    const mockHealthMetrics: HealthMetrics = {
      heartRate: 75,
      sleepScore: 8,
      recoveryScore: 7,
      stressLevel: 3,
      activityLevel: 6,
      caloriesConsumed: 1800,
      waterIntake: 2000,
      timestamp: new Date()
    };

    const mockGoals: Goal[] = [
      {
        id: 'goal-1',
        title: 'Weight Loss',
        description: 'Lose 10 pounds in 3 months',
        category: 'fitness',
        targetValue: 10,
        currentValue: 2,
        unit: 'lbs',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'goal-2',
        title: 'Better Sleep',
        description: 'Get 8 hours of sleep nightly',
        category: 'sleep',
        targetValue: 8,
        currentValue: 7,
        unit: 'hours',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date()
      }
    ];

    const mockContextualFactors: ContextualFactor[] = [
      {
        type: 'weather',
        value: 'sunny',
        impact: 'positive',
        confidence: 0.8,
        timestamp: new Date()
      },
      {
        type: 'stress_level',
        value: 3,
        impact: 'neutral',
        confidence: 0.9,
        timestamp: new Date()
      }
    ];

    const mockConversationContext: ConversationContext = {
      sessionId: 'test-session',
      userId: 'test-user',
      currentTopic: {
        id: 'fitness',
        name: 'Fitness Planning',
        category: 'fitness_planning',
        priority: 8
      },
      recentMetrics: mockHealthMetrics,
      activeGoals: mockGoals,
      conversationHistory: [],
      contextualFactors: mockContextualFactors,
      lastInteraction: new Date(),
      sessionDuration: 15,
      userMood: {
        energy: 7,
        motivation: 8,
        stress: 3,
        confidence: 6,
        overall: 7,
        timestamp: new Date(),
        source: 'self_reported'
      }
    };

    const mockRecentMessages: ChatMessage[] = [
      {
        id: 'msg-1',
        content: 'I want to start working out',
        sender: 'user',
        timestamp: new Date(),
        messageType: 'text'
      },
      {
        id: 'msg-2',
        content: 'That\'s great! Let me help you create a workout plan.',
        sender: 'bud',
        timestamp: new Date(),
        messageType: 'text'
      }
    ];

    it('should generate workout planning prompt', () => {
      const context: PromptContext = {
        userMessage: 'I want to plan a workout for tomorrow',
        conversationContext: mockConversationContext,
        healthMetrics: mockHealthMetrics,
        recentMessages: mockRecentMessages,
        contextualFactors: mockContextualFactors,
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(context);

      expect(messages).toHaveLength(4); // System + 2 history + current user message
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain('fitness coach');
      expect(messages[0].content).toContain('workout planning');
      
      // Check that health metrics are included
      expect(messages[0].content).toContain('Heart Rate: 75');
      expect(messages[0].content).toContain('Sleep Score: 8');
      
      // Check that goals are included
      expect(messages[0].content).toContain('Weight Loss');
      expect(messages[0].content).toContain('Better Sleep');
      
      // Check conversation history
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toBe('I want to start working out');
      expect(messages[2].role).toBe('assistant');
      expect(messages[2].content).toContain('workout plan');
      
      // Check current message
      expect(messages[3].role).toBe('user');
      expect(messages[3].content).toContain('plan a workout for tomorrow');
    });

    it('should generate nutrition advice prompt', () => {
      const nutritionContext: PromptContext = {
        userMessage: 'What should I eat for breakfast?',
        conversationContext: {
          ...mockConversationContext,
          currentTopic: {
            id: 'nutrition',
            name: 'Nutrition Guidance',
            category: 'nutrition_guidance',
            priority: 7
          }
        },
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: mockContextualFactors,
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(nutritionContext);

      expect(messages[0].content).toContain('nutrition coach');
      expect(messages[0].content).toContain('dietary advice');
      expect(messages[0].content).toContain('Calories Consumed: 1800');
      expect(messages[0].content).toContain('Water Intake: 2000ml');
    });

    it('should generate sleep coaching prompt', () => {
      const sleepContext: PromptContext = {
        userMessage: 'I\'m having trouble sleeping',
        conversationContext: {
          ...mockConversationContext,
          currentTopic: {
            id: 'sleep',
            name: 'Sleep Optimization',
            category: 'sleep_optimization',
            priority: 8
          }
        },
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: mockContextualFactors,
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(sleepContext);

      expect(messages[0].content).toContain('sleep coach');
      expect(messages[0].content).toContain('sleep optimization');
      expect(messages[0].content).toContain('evidence-based sleep advice');
    });

    it('should generate motivational prompt', () => {
      const motivationContext: PromptContext = {
        userMessage: 'I\'m feeling unmotivated to exercise',
        conversationContext: mockConversationContext,
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: mockContextualFactors,
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(motivationContext);

      expect(messages[0].content).toContain('motivational');
      expect(messages[0].content).toContain('encouragement');
      expect(messages[0].content).toContain('overcome obstacles');
    });

    it('should generate health concerns prompt', () => {
      const healthConcernContext: PromptContext = {
        userMessage: 'I\'m worried about this pain in my chest',
        conversationContext: mockConversationContext,
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: mockContextualFactors,
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(healthConcernContext);

      expect(messages[0].content).toContain('health concerns');
      expect(messages[0].content).toContain('professional medical consultation');
      expect(messages[0].content).toContain('wellness advice');
    });

    it('should include contextual factors in prompt', () => {
      const context: PromptContext = {
        userMessage: 'How should I adjust my workout?',
        conversationContext: mockConversationContext,
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: mockContextualFactors,
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(context);

      expect(messages[0].content).toContain('weather: sunny (positive impact)');
      expect(messages[0].content).toContain('stress_level: 3 (neutral impact)');
    });

    it('should include session context information', () => {
      const context: PromptContext = {
        userMessage: 'What\'s my progress?',
        conversationContext: mockConversationContext,
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: mockContextualFactors,
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(context);

      expect(messages[0].content).toContain('Session Duration: 15 minutes');
      expect(messages[0].content).toContain('Current Topic: Fitness Planning');
      expect(messages[0].content).toContain('Energy: 7/10');
      expect(messages[0].content).toContain('Motivation: 8/10');
    });

    it('should limit conversation history to last 10 messages', () => {
      const manyMessages: ChatMessage[] = [];
      for (let i = 0; i < 15; i++) {
        manyMessages.push({
          id: `msg-${i}`,
          content: `Message ${i}`,
          sender: i % 2 === 0 ? 'user' : 'bud',
          timestamp: new Date(),
          messageType: 'text'
        });
      }

      const context: PromptContext = {
        userMessage: 'Current message',
        conversationContext: mockConversationContext,
        healthMetrics: mockHealthMetrics,
        recentMessages: manyMessages,
        contextualFactors: mockContextualFactors,
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(context);

      // System prompt + 10 history messages + current message = 12 total
      expect(messages).toHaveLength(12);
      
      // Should include the last 10 messages (indices 5-14)
      expect(messages[1].content).toBe('Message 5');
      expect(messages[10].content).toBe('Message 14');
    });

    it('should handle empty health metrics gracefully', () => {
      const context: PromptContext = {
        userMessage: 'How am I doing?',
        conversationContext: {
          ...mockConversationContext,
          recentMetrics: { timestamp: new Date() }
        },
        recentMessages: [],
        contextualFactors: [],
        currentGoals: []
      };

      const messages = promptEngine.generatePrompt(context);

      expect(messages[0].content).toContain('No recent metrics available');
      expect(messages[0].content).toContain('No active goals set');
      expect(messages[0].content).toContain('No specific contextual factors');
    });

    it('should determine correct prompt category based on keywords', () => {
      const testCases = [
        { message: 'I want to start working out', expectedCategory: 'workout_planning' },
        { message: 'What should I eat for dinner?', expectedCategory: 'nutrition_advice' },
        { message: 'I can\'t sleep well', expectedCategory: 'sleep_coaching' },
        { message: 'I need motivation to continue', expectedCategory: 'motivation' },
        { message: 'How do I set better goals?', expectedCategory: 'goal_setting' },
        { message: 'Show me my progress', expectedCategory: 'progress_review' },
        { message: 'I want to build a daily habit', expectedCategory: 'habit_formation' },
        { message: 'I\'m worried about this pain', expectedCategory: 'health_concerns' }
      ];

      testCases.forEach(({ message, expectedCategory }) => {
        const context: PromptContext = {
          userMessage: message,
          conversationContext: {
            ...mockConversationContext,
            currentTopic: {
              id: 'general',
              name: 'General',
              category: 'general',
              priority: 5
            }
          },
          healthMetrics: mockHealthMetrics,
          recentMessages: [],
          contextualFactors: [],
          currentGoals: []
        };

        const messages = promptEngine.generatePrompt(context);
        
        // The system prompt should contain category-specific content
        const systemPrompt = messages[0].content.toLowerCase();
        expect(systemPrompt).toContain(expectedCategory.replace('_', ' '));
      });
    });

    it('should include appropriate coaching guidelines for each category', () => {
      const workoutContext: PromptContext = {
        userMessage: 'Plan my workout',
        conversationContext: mockConversationContext,
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: mockContextualFactors,
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(workoutContext);
      const systemPrompt = messages[0].content;

      expect(systemPrompt).toContain('WORKOUT COACHING GUIDELINES');
      expect(systemPrompt).toContain('progressive overload');
      expect(systemPrompt).toContain('injury prevention');
      expect(systemPrompt).toContain('readiness scores');
    });

    it('should include response constraints in all prompts', () => {
      const context: PromptContext = {
        userMessage: 'General question',
        conversationContext: mockConversationContext,
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: [],
        currentGoals: []
      };

      const messages = promptEngine.generatePrompt(context);
      const systemPrompt = messages[0].content;

      expect(systemPrompt).toContain('RESPONSE CONSTRAINTS');
      expect(systemPrompt).toContain('200-400 words');
      expect(systemPrompt).toContain('actionable recommendations');
      expect(systemPrompt).toContain('follow-up question');
      expect(systemPrompt).toContain('healthcare professional');
    });

    it('should format goals properly in prompt', () => {
      const context: PromptContext = {
        userMessage: 'How are my goals?',
        conversationContext: mockConversationContext,
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: [],
        currentGoals: mockGoals
      };

      const messages = promptEngine.generatePrompt(context);
      const systemPrompt = messages[0].content;

      expect(systemPrompt).toContain('Weight Loss: Lose 10 pounds in 3 months');
      expect(systemPrompt).toContain('Better Sleep: Get 8 hours of sleep nightly');
    });

    it('should limit goals to top 3 in prompt', () => {
      const manyGoals: Goal[] = [];
      for (let i = 0; i < 5; i++) {
        manyGoals.push({
          id: `goal-${i}`,
          title: `Goal ${i}`,
          description: `Description ${i}`,
          category: 'fitness',
          targetValue: 10,
          currentValue: 0,
          unit: 'units',
          deadline: new Date(),
          isActive: true,
          createdAt: new Date()
        });
      }

      const context: PromptContext = {
        userMessage: 'How are my goals?',
        conversationContext: {
          ...mockConversationContext,
          activeGoals: manyGoals
        },
        healthMetrics: mockHealthMetrics,
        recentMessages: [],
        contextualFactors: [],
        currentGoals: manyGoals
      };

      const messages = promptEngine.generatePrompt(context);
      const systemPrompt = messages[0].content;

      // Should only include first 3 goals
      expect(systemPrompt).toContain('Goal 0');
      expect(systemPrompt).toContain('Goal 1');
      expect(systemPrompt).toContain('Goal 2');
      expect(systemPrompt).not.toContain('Goal 3');
      expect(systemPrompt).not.toContain('Goal 4');
    });
  });
});