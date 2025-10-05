/**
 * GROQ Integration Tests
 * Tests the complete GROQ API integration system working together
 */

import { GroqService } from '../groqService';
import { GroqApiClient } from '../groqApiClient';
import { ConversationContextManager } from '../conversationContextManager';
import { PromptEngineering } from '../promptEngineering';
import { ResponseCache } from '../responseCache';
import type { HealthMetrics } from '../../../../shared/types/healthTypes';
import type { Goal } from '../../../../shared/types/userTypes';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('GROQ Integration Tests', () => {
  let groqService: GroqService;
  let contextManager: ConversationContextManager;
  let responseCache: ResponseCache;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  const userId = 'integration-test-user';
  const sessionId = 'integration-test-session';

  beforeEach(() => {
    // Set up environment
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-integration-key';
    
    // Clear all instances and get fresh ones
    jest.clearAllMocks();
    mockFetch.mockClear();
    
    groqService = GroqService.getInstance();
    contextManager = ConversationContextManager.getInstance();
    responseCache = ResponseCache.getInstance();
    
    // Clear any existing state
    contextManager.clearContext(sessionId);
    responseCache.clear();
  });

  afterEach(() => {
    contextManager.clearContext(sessionId);
    responseCache.clear();
  });

  describe('End-to-End Message Processing', () => {
    const mockGroqResponse = {
      id: 'integration-test-response',
      object: 'chat.completion',
      created: Date.now(),
      model: 'llama-3.1-70b-versatile',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Great question about fitness! Based on your current metrics, I recommend starting with 3 workouts per week. Your sleep score of 8 shows good recovery capacity. Would you like me to create a specific workout plan for you?'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 150,
        completion_tokens: 75,
        total_tokens: 225
      }
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockGroqResponse
      } as Response);
    });

    it('should process a complete conversation flow', async () => {
      // Step 1: Set up user health metrics and goals
      const healthMetrics: HealthMetrics = {
        heartRate: 72,
        sleepScore: 8,
        recoveryScore: 7,
        stressLevel: 4,
        activityLevel: 5,
        timestamp: new Date()
      };

      const goals: Goal[] = [
        {
          id: 'fitness-goal-1',
          title: 'Get Stronger',
          description: 'Build muscle and increase strength',
          category: 'fitness',
          targetValue: 100,
          currentValue: 60,
          unit: 'strength_score',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          isActive: true,
          createdAt: new Date()
        }
      ];

      await groqService.updateHealthMetrics(sessionId, healthMetrics);
      await groqService.updateGoals(sessionId, goals);

      // Step 2: Process first message
      const result1 = await groqService.processMessage(
        'I want to start a fitness routine. What do you recommend?',
        userId,
        sessionId
      );

      // Verify first response
      expect(result1.response.sender).toBe('bud');
      expect(result1.response.content).toContain('fitness');
      expect(result1.response.content).toContain('sleep score of 8');
      expect(result1.cached).toBe(false);
      expect(result1.confidence).toBeGreaterThan(0.7);
      expect(result1.tokensUsed).toBe(225);

      // Verify context was updated
      const context = groqService.getConversationContext(sessionId);
      expect(context).toBeDefined();
      expect(context!.conversationHistory).toHaveLength(2); // User message + AI response
      expect(context!.recentMetrics.sleepScore).toBe(8);
      expect(context!.activeGoals).toHaveLength(1);

      // Step 3: Process follow-up message
      const result2 = await groqService.processMessage(
        'Yes, please create a workout plan for me',
        userId,
        sessionId
      );

      // Verify follow-up response
      expect(result2.response.sender).toBe('bud');
      expect(result2.cached).toBe(false);

      // Verify conversation history grew
      const updatedContext = groqService.getConversationContext(sessionId);
      expect(updatedContext!.conversationHistory).toHaveLength(4); // 2 previous + 2 new
    });

    it('should handle caching across multiple requests', async () => {
      // First request
      const result1 = await groqService.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId
      );

      expect(result1.cached).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second identical request (should be cached)
      const result2 = await groqService.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId + '-2' // Different session to avoid conversation history affecting cache
      );

      expect(result2.cached).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call
      expect(result2.response.content).toBe(result1.response.content);
    });

    it('should handle different conversation topics', async () => {
      const topicTests = [
        {
          message: 'I want to plan a workout',
          expectedPromptContent: 'fitness coach'
        },
        {
          message: 'What should I eat for breakfast?',
          expectedPromptContent: 'nutrition coach'
        },
        {
          message: 'I\'m having trouble sleeping',
          expectedPromptContent: 'sleep coach'
        },
        {
          message: 'I need motivation to continue',
          expectedPromptContent: 'motivational'
        }
      ];

      for (const test of topicTests) {
        // Clear context for each test
        contextManager.clearContext(sessionId + test.message);
        
        const result = await groqService.processMessage(
          test.message,
          userId,
          sessionId + test.message
        );

        expect(result.response.sender).toBe('bud');
        expect(result.cached).toBe(false);
        
        // Verify the correct prompt was used by checking the API call
        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
        const requestBody = JSON.parse(lastCall[1]?.body as string);
        const systemMessage = requestBody.messages[0].content.toLowerCase();
        expect(systemMessage).toContain(test.expectedPromptContent);
      }
    });

    it('should extract and provide relevant action suggestions', async () => {
      const workoutResponse = {
        ...mockGroqResponse,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Let\'s start with a workout plan! You should log your current fitness level and track your water intake. Consider planning your meals too.'
            },
            finish_reason: 'stop'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => workoutResponse
      } as Response);

      const result = await groqService.processMessage(
        'I want to get fit',
        userId,
        sessionId
      );

      expect(result.response.suggestions).toBeDefined();
      expect(result.response.suggestions!.length).toBeGreaterThan(0);
      
      const suggestionActions = result.response.suggestions!.map(s => s.action);
      expect(suggestionActions).toContain('plan_workout');
    });

    it('should handle contextual factors in responses', async () => {
      // Set up context with specific factors
      const context = contextManager.createContext(userId, sessionId);
      contextManager.addContextualFactor(sessionId, {
        type: 'weather',
        value: 'rainy',
        impact: 'negative',
        confidence: 0.8,
        timestamp: new Date()
      });

      contextManager.addContextualFactor(sessionId, {
        type: 'stress_level',
        value: 8,
        impact: 'negative',
        confidence: 0.9,
        timestamp: new Date()
      });

      const result = await groqService.processMessage(
        'Should I work out today?',
        userId,
        sessionId
      );

      // Verify that contextual factors were included in the prompt
      const apiCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(apiCall[1]?.body as string);
      const systemMessage = requestBody.messages[0].content;
      
      expect(systemMessage).toContain('weather: rainy (negative impact)');
      expect(systemMessage).toContain('stress_level: 8 (negative impact)');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle API failures gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await groqService.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId
      );

      expect(result.response.sender).toBe('bud');
      expect(result.response.content).toContain('trouble connecting');
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.response.suggestions).toBeDefined();
      expect(result.response.suggestions!.length).toBeGreaterThan(0);
    });

    it('should handle API timeout', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ choices: [] })
          } as Response), 15000);
        })
      );

      const result = await groqService.processMessage(
        'Test message',
        userId,
        sessionId
      );

      expect(result.response.content).toContain('trouble connecting');
    });

    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      } as Response);

      const result = await groqService.processMessage(
        'Test message',
        userId,
        sessionId
      );

      expect(result.response.content).toContain('trouble connecting');
    });

    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: 'Rate limit exceeded' })
      } as Response);

      const result = await groqService.processMessage(
        'Test message',
        userId,
        sessionId
      );

      expect(result.response.content).toContain('trouble connecting');
    });
  });

  describe('Performance and Optimization', () => {
    it('should cache responses for improved performance', async () => {
      const startTime = Date.now();

      // First request (uncached)
      const result1 = await groqService.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId
      );
      const firstRequestTime = Date.now() - startTime;

      expect(result1.cached).toBe(false);

      // Second identical request (cached)
      const cachedStartTime = Date.now();
      const result2 = await groqService.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId + '-cached'
      );
      const cachedRequestTime = Date.now() - cachedStartTime;

      expect(result2.cached).toBe(true);
      expect(cachedRequestTime).toBeLessThan(firstRequestTime);
    });

    it('should provide cache statistics', async () => {
      // Make some requests to populate cache
      await groqService.processMessage('Test message 1', userId, sessionId + '1');
      await groqService.processMessage('Test message 2', userId, sessionId + '2');

      const stats = groqService.getServiceStats();

      expect(stats.cache.totalEntries).toBeGreaterThan(0);
      expect(stats.context.activeContexts).toBeGreaterThan(0);
      expect(stats.groq.configured).toBe(true);
    });

    it('should handle concurrent requests efficiently', async () => {
      const promises = [];
      
      // Make 5 concurrent requests
      for (let i = 0; i < 5; i++) {
        promises.push(
          groqService.processMessage(
            `Concurrent message ${i}`,
            userId,
            sessionId + i
          )
        );
      }

      const results = await Promise.all(promises);

      // All requests should complete successfully
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.response.sender).toBe('bud');
        expect(result.response.content).toBeDefined();
      });
    });
  });

  describe('Context Management Integration', () => {
    it('should maintain conversation context across multiple messages', async () => {
      // First message
      await groqService.processMessage(
        'I want to lose weight',
        userId,
        sessionId
      );

      // Second message
      await groqService.processMessage(
        'What exercises should I do?',
        userId,
        sessionId
      );

      // Third message
      await groqService.processMessage(
        'How often should I work out?',
        userId,
        sessionId
      );

      const context = groqService.getConversationContext(sessionId);
      expect(context).toBeDefined();
      expect(context!.conversationHistory).toHaveLength(6); // 3 user + 3 AI messages
      expect(context!.sessionDuration).toBeGreaterThan(0);
    });

    it('should update context with health metrics and goals', async () => {
      const healthMetrics: HealthMetrics = {
        heartRate: 80,
        sleepScore: 6,
        stressLevel: 7,
        timestamp: new Date()
      };

      const goals: Goal[] = [
        {
          id: 'test-goal',
          title: 'Test Goal',
          description: 'Test description',
          category: 'fitness',
          targetValue: 100,
          currentValue: 50,
          unit: 'points',
          deadline: new Date(),
          isActive: true,
          createdAt: new Date()
        }
      ];

      await groqService.updateHealthMetrics(sessionId, healthMetrics);
      await groqService.updateGoals(sessionId, goals);

      const result = await groqService.processMessage(
        'How am I doing with my goals?',
        userId,
        sessionId
      );

      const context = groqService.getConversationContext(sessionId);
      expect(context!.recentMetrics.heartRate).toBe(80);
      expect(context!.activeGoals).toHaveLength(1);
      expect(context!.activeGoals[0].title).toBe('Test Goal');
    });

    it('should clear context when requested', () => {
      // Create context
      contextManager.createContext(userId, sessionId);
      expect(groqService.getConversationContext(sessionId)).toBeDefined();

      // Clear context
      groqService.clearConversationContext(sessionId);
      expect(groqService.getConversationContext(sessionId)).toBeUndefined();
    });
  });

  describe('Service Configuration', () => {
    it('should allow configuration updates', () => {
      const newConfig = {
        enableCaching: false,
        enableStreaming: false,
        maxRetries: 5
      };

      groqService.updateConfig(newConfig);
      const config = groqService.getConfig();

      expect(config.enableCaching).toBe(false);
      expect(config.enableStreaming).toBe(false);
      expect(config.maxRetries).toBe(5);
    });

    it('should respect caching configuration', async () => {
      // Disable caching
      groqService.updateConfig({ enableCaching: false });

      // Make two identical requests
      const result1 = await groqService.processMessage(
        'Test caching disabled',
        userId,
        sessionId
      );

      const result2 = await groqService.processMessage(
        'Test caching disabled',
        userId,
        sessionId + '-2'
      );

      // Both should be uncached
      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});