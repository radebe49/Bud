/**
 * GROQ Service Integration Tests
 */

import { GroqService, type ProcessMessageOptions, type ProcessMessageResult } from '../groqService';
import { GroqApiClient } from '../groqApiClient';
import { ConversationContextManager } from '../conversationContextManager';
import { PromptEngineering } from '../promptEngineering';
import { ResponseCache } from '../responseCache';
import type { HealthMetrics } from '../../../../shared/types/healthTypes';
import type { Goal } from '../../../../shared/types/userTypes';

// Mock all dependencies
jest.mock('../groqApiClient');
jest.mock('../conversationContextManager');
jest.mock('../promptEngineering');
jest.mock('../responseCache');

describe('GroqService', () => {
  let service: GroqService;
  let mockGroqClient: jest.Mocked<GroqApiClient>;
  let mockContextManager: jest.Mocked<ConversationContextManager>;
  let mockPromptEngine: jest.Mocked<PromptEngineering>;
  let mockResponseCache: jest.Mocked<ResponseCache>;

  const userId = 'test-user-123';
  const sessionId = 'test-session-456';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockGroqClient = {
      chatCompletion: jest.fn(),
      chatCompletionStream: jest.fn(),
      isConfigured: jest.fn().mockReturnValue(true),
      getConfig: jest.fn(),
      updateConfig: jest.fn(),
      clearRequestQueue: jest.fn()
    } as any;

    mockContextManager = {
      getOrCreateContext: jest.fn(),
      updateContextWithMessage: jest.fn(),
      updateContextWithMetrics: jest.fn(),
      updateContextWithGoals: jest.fn(),
      getContext: jest.fn(),
      clearContext: jest.fn(),
      getStats: jest.fn()
    } as any;

    mockPromptEngine = {
      generatePrompt: jest.fn()
    } as any;

    mockResponseCache = {
      get: jest.fn(),
      set: jest.fn(),
      generatePromptHash: jest.fn(),
      startStreaming: jest.fn(),
      addStreamChunk: jest.fn(),
      completeStreaming: jest.fn(),
      getStats: jest.fn()
    } as any;

    // Mock getInstance methods
    (GroqApiClient.getInstance as jest.Mock).mockReturnValue(mockGroqClient);
    (ConversationContextManager.getInstance as jest.Mock).mockReturnValue(mockContextManager);
    (PromptEngineering.getInstance as jest.Mock).mockReturnValue(mockPromptEngine);
    (ResponseCache.getInstance as jest.Mock).mockReturnValue(mockResponseCache);

    service = GroqService.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = GroqService.getInstance();
      const instance2 = GroqService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('processMessage', () => {
    const mockContext = {
      sessionId,
      userId,
      currentTopic: { id: 'general', name: 'General', category: 'general', priority: 5 },
      recentMetrics: { timestamp: new Date() },
      activeGoals: [],
      conversationHistory: [],
      contextualFactors: [],
      lastInteraction: new Date(),
      sessionDuration: 0,
      userMood: {
        energy: 5,
        motivation: 5,
        stress: 5,
        confidence: 5,
        overall: 5,
        timestamp: new Date(),
        source: 'inferred' as const
      }
    };

    const mockPromptMessages = [
      { role: 'system' as const, content: 'You are a health coach' },
      { role: 'user' as const, content: 'How can I improve my fitness?' }
    ];

    const mockGroqResponse = {
      id: 'test-response',
      object: 'chat.completion',
      created: Date.now(),
      model: 'llama-3.1-70b-versatile',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Here are some great fitness tips to get you started...'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 20,
        completion_tokens: 50,
        total_tokens: 70
      }
    };

    beforeEach(() => {
      mockContextManager.getOrCreateContext.mockReturnValue(mockContext);
      mockContextManager.updateContextWithMessage.mockReturnValue(mockContext);
      mockPromptEngine.generatePrompt.mockReturnValue(mockPromptMessages);
      mockGroqClient.chatCompletion.mockResolvedValue(mockGroqResponse);
      mockResponseCache.generatePromptHash.mockReturnValue('test-hash');
      mockResponseCache.get.mockReturnValue(null); // No cache hit by default
    });

    it('should process message successfully', async () => {
      const result = await service.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId
      );

      expect(result.response.content).toContain('fitness tips');
      expect(result.response.sender).toBe('bud');
      expect(result.cached).toBe(false);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);

      // Verify interactions
      expect(mockContextManager.getOrCreateContext).toHaveBeenCalledWith(userId, sessionId);
      expect(mockContextManager.updateContextWithMessage).toHaveBeenCalledTimes(2); // User message + AI response
      expect(mockPromptEngine.generatePrompt).toHaveBeenCalled();
      expect(mockGroqClient.chatCompletion).toHaveBeenCalledWith(mockPromptMessages, {});
    });

    it('should return cached response when available', async () => {
      const cachedResponse = {
        content: 'Cached fitness advice...',
        confidence: 0.9,
        suggestions: [],
        followUpQuestions: [],
        flags: [],
        processingTime: 100
      };

      const cachedEntry = {
        id: 'cached-1',
        promptHash: 'test-hash',
        response: cachedResponse,
        timestamp: new Date(),
        accessCount: 1,
        lastAccessed: new Date(),
        expiresAt: new Date(Date.now() + 60000),
        metadata: {
          category: 'general',
          confidence: 0.9,
          tokensUsed: 50,
          processingTime: 100
        }
      };

      mockResponseCache.get.mockReturnValue(cachedEntry);

      const result = await service.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId
      );

      expect(result.cached).toBe(true);
      expect(result.response.content).toBe('Cached fitness advice...');
      expect(result.confidence).toBe(0.9);
      expect(mockGroqClient.chatCompletion).not.toHaveBeenCalled();
    });

    it('should handle streaming responses', async () => {
      const streamingId = 'stream-123';
      const streamingResponse = {
        id: streamingId,
        content: 'Streaming fitness advice...',
        isComplete: true,
        chunks: [],
        startTime: new Date(),
        lastUpdate: new Date()
      };

      mockResponseCache.startStreaming.mockReturnValue(streamingResponse);
      mockResponseCache.completeStreaming.mockReturnValue(streamingResponse);

      const result = await service.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId,
        { enableStreaming: true }
      );

      expect(result.streamingId).toBe(streamingId);
      expect(mockGroqClient.chatCompletionStream).toHaveBeenCalled();
      expect(mockResponseCache.startStreaming).toHaveBeenCalled();
      expect(mockResponseCache.completeStreaming).toHaveBeenCalled();
    });

    it('should handle API errors with fallback', async () => {
      mockGroqClient.chatCompletion.mockRejectedValue(new Error('API Error'));

      const result = await service.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId
      );

      expect(result.response.content).toContain('trouble connecting');
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.cached).toBe(false);
    });

    it('should cache high-confidence responses', async () => {
      const result = await service.processMessage(
        'How can I improve my fitness?',
        userId,
        sessionId
      );

      expect(mockResponseCache.set).toHaveBeenCalledWith(
        'test-hash',
        expect.objectContaining({
          content: expect.stringContaining('fitness tips'),
          confidence: expect.any(Number)
        }),
        expect.objectContaining({
          userId,
          sessionId,
          category: 'general'
        })
      );
    });

    it('should not cache low-confidence responses', async () => {
      // Mock low-confidence response
      const lowConfidenceResponse = {
        ...mockGroqResponse,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Short' },
            finish_reason: 'length'
          }
        ]
      };

      mockGroqClient.chatCompletion.mockResolvedValue(lowConfidenceResponse);

      await service.processMessage('Test', userId, sessionId);

      expect(mockResponseCache.set).not.toHaveBeenCalled();
    });

    it('should extract action suggestions from response', async () => {
      const workoutResponse = {
        ...mockGroqResponse,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'You should start with a workout routine. Consider planning your exercises.'
            },
            finish_reason: 'stop'
          }
        ]
      };

      mockGroqClient.chatCompletion.mockResolvedValue(workoutResponse);

      const result = await service.processMessage(
        'I want to start exercising',
        userId,
        sessionId
      );

      expect(result.response.suggestions).toBeDefined();
      expect(result.response.suggestions?.length).toBeGreaterThan(0);
      expect(result.response.suggestions?.[0].action).toBe('plan_workout');
    });

    it('should handle custom options', async () => {
      const options: ProcessMessageOptions = {
        maxTokens: 500,
        temperature: 0.8,
        bypassCache: true
      };

      await service.processMessage(
        'Test message',
        userId,
        sessionId,
        options
      );

      expect(mockGroqClient.chatCompletion).toHaveBeenCalledWith(
        mockPromptMessages,
        { maxTokens: 500, temperature: 0.8 }
      );
      expect(mockResponseCache.get).not.toHaveBeenCalled(); // Cache bypassed
    });
  });

  describe('updateHealthMetrics', () => {
    it('should update health metrics in context', async () => {
      const metrics: HealthMetrics = {
        heartRate: 75,
        sleepScore: 8,
        stressLevel: 3,
        timestamp: new Date()
      };

      await service.updateHealthMetrics(sessionId, metrics);

      expect(mockContextManager.updateContextWithMetrics).toHaveBeenCalledWith(
        sessionId,
        metrics
      );
    });
  });

  describe('updateGoals', () => {
    it('should update goals in context', async () => {
      const goals: Goal[] = [
        {
          id: 'goal-1',
          title: 'Lose Weight',
          description: 'Lose 10 pounds',
          category: 'fitness',
          targetValue: 10,
          currentValue: 0,
          unit: 'lbs',
          deadline: new Date(),
          isActive: true,
          createdAt: new Date()
        }
      ];

      await service.updateGoals(sessionId, goals);

      expect(mockContextManager.updateContextWithGoals).toHaveBeenCalledWith(
        sessionId,
        goals
      );
    });
  });

  describe('getConversationContext', () => {
    it('should return conversation context', () => {
      const mockContext = { sessionId, userId } as any;
      mockContextManager.getContext.mockReturnValue(mockContext);

      const result = service.getConversationContext(sessionId);

      expect(result).toBe(mockContext);
      expect(mockContextManager.getContext).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('clearConversationContext', () => {
    it('should clear conversation context', () => {
      service.clearConversationContext(sessionId);

      expect(mockContextManager.clearContext).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('getServiceStats', () => {
    it('should return service statistics', () => {
      const mockGroqStats = { configured: true };
      const mockCacheStats = { totalEntries: 10 };
      const mockContextStats = { activeContexts: 5 };

      mockGroqClient.isConfigured.mockReturnValue(true);
      mockGroqClient.getConfig.mockReturnValue({} as any);
      mockResponseCache.getStats.mockReturnValue(mockCacheStats as any);
      mockContextManager.getStats.mockReturnValue(mockContextStats as any);

      const stats = service.getServiceStats();

      expect(stats.groq.configured).toBe(true);
      expect(stats.cache).toBe(mockCacheStats);
      expect(stats.context).toBe(mockContextStats);
    });
  });

  describe('configuration', () => {
    it('should update service configuration', () => {
      const newConfig = {
        enableCaching: false,
        enableStreaming: false
      };

      service.updateConfig(newConfig);
      const config = service.getConfig();

      expect(config.enableCaching).toBe(false);
      expect(config.enableStreaming).toBe(false);
    });
  });

  describe('error handling and fallbacks', () => {
    beforeEach(() => {
      mockContextManager.getOrCreateContext.mockReturnValue({
        sessionId,
        userId,
        currentTopic: { id: 'general', name: 'General', category: 'general', priority: 5 },
        recentMetrics: { timestamp: new Date() },
        activeGoals: [],
        conversationHistory: [],
        contextualFactors: [],
        lastInteraction: new Date(),
        sessionDuration: 0,
        userMood: {
          energy: 5,
          motivation: 5,
          stress: 5,
          confidence: 5,
          overall: 5,
          timestamp: new Date(),
          source: 'inferred' as const
        }
      });
      mockPromptEngine.generatePrompt.mockReturnValue([]);
    });

    it('should handle GROQ API timeout', async () => {
      mockGroqClient.chatCompletion.mockRejectedValue(new Error('Request timeout'));

      const result = await service.processMessage('Test', userId, sessionId);

      expect(result.response.content).toContain('trouble connecting');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should handle GROQ API rate limiting', async () => {
      mockGroqClient.chatCompletion.mockRejectedValue(new Error('Rate limit exceeded'));

      const result = await service.processMessage('Test', userId, sessionId);

      expect(result.response.content).toContain('trouble connecting');
      expect(result.response.suggestions).toBeDefined();
      expect(result.response.suggestions?.length).toBeGreaterThan(0);
    });

    it('should handle streaming errors gracefully', async () => {
      mockGroqClient.chatCompletionStream.mockRejectedValue(new Error('Streaming failed'));
      mockResponseCache.startStreaming.mockReturnValue({
        id: 'stream-1',
        content: '',
        isComplete: false,
        chunks: [],
        startTime: new Date(),
        lastUpdate: new Date()
      });

      const result = await service.processMessage(
        'Test',
        userId,
        sessionId,
        { enableStreaming: true }
      );

      expect(result.response.content).toContain('trouble connecting');
    });

    it('should provide basic suggestions in fallback responses', async () => {
      mockGroqClient.chatCompletion.mockRejectedValue(new Error('API Error'));

      const result = await service.processMessage('Test', userId, sessionId);

      expect(result.response.suggestions).toBeDefined();
      expect(result.response.suggestions?.length).toBeGreaterThan(0);
      
      const suggestionTypes = result.response.suggestions?.map(s => s.action);
      expect(suggestionTypes).toContain('view_progress');
    });
  });

  describe('content analysis', () => {
    beforeEach(() => {
      mockContextManager.getOrCreateContext.mockReturnValue({
        sessionId,
        userId,
        currentTopic: { id: 'general', name: 'General', category: 'general', priority: 5 },
        recentMetrics: { timestamp: new Date() },
        activeGoals: [
          {
            id: 'goal-1',
            title: 'Weight Loss',
            description: 'Lose weight',
            category: 'fitness',
            targetValue: 10,
            currentValue: 0,
            unit: 'lbs',
            deadline: new Date(),
            isActive: true,
            createdAt: new Date()
          }
        ],
        conversationHistory: [],
        contextualFactors: [],
        lastInteraction: new Date(),
        sessionDuration: 0,
        userMood: {
          energy: 5,
          motivation: 5,
          stress: 5,
          confidence: 5,
          overall: 5,
          timestamp: new Date(),
          source: 'inferred' as const
        }
      });
      mockPromptEngine.generatePrompt.mockReturnValue([]);
    });

    it('should extract metric references from content', async () => {
      const heartRateResponse = {
        id: 'test',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Your heart rate looks good at 75 bpm. Keep monitoring your sleep patterns.'
            },
            finish_reason: 'stop'
          }
        ],
        usage: { total_tokens: 20 }
      };

      mockGroqClient.chatCompletion.mockResolvedValue(heartRateResponse);

      const result = await service.processMessage('How is my health?', userId, sessionId);

      expect(result.response.context?.relatedMetrics).toContain('heartRate');
      expect(result.response.context?.relatedMetrics).toContain('sleepScore');
    });

    it('should extract goal references from content', async () => {
      const weightLossResponse = {
        id: 'test',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Great progress on your weight loss journey! Keep up the good work.'
            },
            finish_reason: 'stop'
          }
        ],
        usage: { total_tokens: 20 }
      };

      mockGroqClient.chatCompletion.mockResolvedValue(weightLossResponse);

      const result = await service.processMessage('How am I doing?', userId, sessionId);

      expect(result.response.context?.relatedGoals).toContain('goal-1');
    });

    it('should identify health concerns in content', async () => {
      const concernResponse = {
        id: 'test',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'You should consult with a doctor about this pain. I recommend seeing a medical professional.'
            },
            finish_reason: 'stop'
          }
        ],
        usage: { total_tokens: 20 }
      };

      mockGroqClient.chatCompletion.mockResolvedValue(concernResponse);

      const result = await service.processMessage('I have chest pain', userId, sessionId);

      expect(result.response.metadata?.flags).toContain('health_concern');
    });
  });
});