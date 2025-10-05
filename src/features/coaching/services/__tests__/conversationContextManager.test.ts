/**
 * Conversation Context Manager Tests
 */

import { ConversationContextManager } from '../conversationContextManager';
import type { 
  ConversationContext, 
  ChatMessage, 
  MoodIndicator, 
  ContextualFactor 
} from '../../types/conversationTypes';
import type { HealthMetrics } from '../../../../shared/types/healthTypes';
import type { Goal } from '../../../../shared/types/userTypes';

describe('ConversationContextManager', () => {
  let manager: ConversationContextManager;
  const userId = 'test-user-123';
  const sessionId = 'test-session-456';

  beforeEach(() => {
    manager = ConversationContextManager.getInstance();
    // Clear any existing contexts
    manager.clearContext(sessionId);
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ConversationContextManager.getInstance();
      const instance2 = ConversationContextManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createContext', () => {
    it('should create new conversation context', () => {
      const context = manager.createContext(userId, sessionId);

      expect(context.userId).toBe(userId);
      expect(context.sessionId).toBe(sessionId);
      expect(context.conversationHistory).toEqual([]);
      expect(context.activeGoals).toEqual([]);
      expect(context.contextualFactors).toEqual([]);
      expect(context.currentTopic.id).toBe('general');
      expect(context.userMood).toBeDefined();
      expect(context.lastInteraction).toBeInstanceOf(Date);
    });

    it('should create context with custom topic', () => {
      const customTopic = {
        id: 'fitness',
        name: 'Fitness Planning',
        category: 'fitness_planning' as const,
        priority: 8
      };

      const context = manager.createContext(userId, sessionId, customTopic);
      expect(context.currentTopic).toEqual(customTopic);
    });
  });

  describe('getOrCreateContext', () => {
    it('should return existing context if not expired', () => {
      const originalContext = manager.createContext(userId, sessionId);
      const retrievedContext = manager.getOrCreateContext(userId, sessionId);

      expect(retrievedContext).toBe(originalContext);
      expect(retrievedContext.sessionId).toBe(sessionId);
    });

    it('should create new context if none exists', () => {
      const context = manager.getOrCreateContext(userId, 'new-session');
      expect(context.sessionId).toBe('new-session');
      expect(context.userId).toBe(userId);
    });

    it('should update last interaction time when retrieving context', () => {
      const context = manager.createContext(userId, sessionId);
      const originalTime = context.lastInteraction;

      // Wait a bit and retrieve again
      setTimeout(() => {
        const updatedContext = manager.getOrCreateContext(userId, sessionId);
        expect(updatedContext.lastInteraction.getTime()).toBeGreaterThan(originalTime.getTime());
      }, 10);
    });
  });

  describe('updateContextWithMessage', () => {
    it('should add message to conversation history', () => {
      const context = manager.createContext(userId, sessionId);
      
      const message: ChatMessage = {
        id: 'msg-1',
        content: 'Hello, I want to improve my fitness',
        sender: 'user',
        timestamp: new Date(),
        messageType: 'text'
      };

      const updatedContext = manager.updateContextWithMessage(sessionId, message);

      expect(updatedContext.conversationHistory).toHaveLength(1);
      expect(updatedContext.conversationHistory[0]).toBe(message);
      expect(updatedContext.lastInteraction).toBeInstanceOf(Date);
    });

    it('should trim history when exceeding max length', () => {
      const context = manager.createContext(userId, sessionId);
      
      // Update config to have small max history
      manager.updateConfig({ maxHistoryLength: 3 });

      // Add 5 messages
      for (let i = 0; i < 5; i++) {
        const message: ChatMessage = {
          id: `msg-${i}`,
          content: `Message ${i}`,
          sender: 'user',
          timestamp: new Date(),
          messageType: 'text'
        };
        manager.updateContextWithMessage(sessionId, message);
      }

      const updatedContext = manager.getContext(sessionId)!;
      expect(updatedContext.conversationHistory).toHaveLength(3);
      expect(updatedContext.conversationHistory[0].id).toBe('msg-2'); // Oldest kept
      expect(updatedContext.conversationHistory[2].id).toBe('msg-4'); // Newest
    });

    it('should update topic based on message context', () => {
      const context = manager.createContext(userId, sessionId);
      
      const workoutMessage: ChatMessage = {
        id: 'msg-1',
        content: 'I want to plan a workout',
        sender: 'user',
        timestamp: new Date(),
        messageType: 'text',
        context: {
          workoutContext: {
            readinessScore: 8,
            energyLevel: 7
          }
        }
      };

      const updatedContext = manager.updateContextWithMessage(sessionId, workoutMessage);
      expect(updatedContext.currentTopic.category).toBe('fitness_planning');
    });
  });

  describe('updateContextWithMetrics', () => {
    it('should update health metrics and contextual factors', () => {
      const context = manager.createContext(userId, sessionId);
      
      const metrics: HealthMetrics = {
        heartRate: 75,
        sleepScore: 8,
        stressLevel: 3,
        activityLevel: 7,
        timestamp: new Date()
      };

      const updatedContext = manager.updateContextWithMetrics(sessionId, metrics);

      expect(updatedContext.recentMetrics).toBe(metrics);
      expect(updatedContext.contextualFactors.length).toBeGreaterThan(0);
      
      // Check that contextual factors were created from metrics
      const sleepFactor = updatedContext.contextualFactors.find(f => f.type === 'sleep_quality');
      expect(sleepFactor).toBeDefined();
      expect(sleepFactor?.value).toBe(8);
      expect(sleepFactor?.impact).toBe('positive');
    });
  });

  describe('updateContextWithGoals', () => {
    it('should update active goals', () => {
      const context = manager.createContext(userId, sessionId);
      
      const goals: Goal[] = [
        {
          id: 'goal-1',
          title: 'Lose Weight',
          description: 'Lose 10 pounds in 3 months',
          category: 'fitness',
          targetValue: 10,
          currentValue: 0,
          unit: 'lbs',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          isActive: true,
          createdAt: new Date()
        }
      ];

      const updatedContext = manager.updateContextWithGoals(sessionId, goals);
      expect(updatedContext.activeGoals).toBe(goals);
      expect(updatedContext.activeGoals).toHaveLength(1);
    });
  });

  describe('updateMood', () => {
    it('should update user mood', () => {
      const context = manager.createContext(userId, sessionId);
      
      const moodUpdate: Partial<MoodIndicator> = {
        energy: 8,
        motivation: 9,
        stress: 2
      };

      const updatedContext = manager.updateMood(sessionId, moodUpdate);

      expect(updatedContext.userMood.energy).toBe(8);
      expect(updatedContext.userMood.motivation).toBe(9);
      expect(updatedContext.userMood.stress).toBe(2);
      expect(updatedContext.userMood.confidence).toBe(5); // Should keep original value
      expect(updatedContext.userMood.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('addContextualFactor', () => {
    it('should add contextual factor', () => {
      const context = manager.createContext(userId, sessionId);
      
      const factor: ContextualFactor = {
        type: 'weather',
        value: 'sunny',
        impact: 'positive',
        confidence: 0.8,
        timestamp: new Date()
      };

      const updatedContext = manager.addContextualFactor(sessionId, factor);

      expect(updatedContext.contextualFactors).toContain(factor);
    });

    it('should replace existing factor of same type', () => {
      const context = manager.createContext(userId, sessionId);
      
      const factor1: ContextualFactor = {
        type: 'weather',
        value: 'rainy',
        impact: 'negative',
        confidence: 0.7,
        timestamp: new Date()
      };

      const factor2: ContextualFactor = {
        type: 'weather',
        value: 'sunny',
        impact: 'positive',
        confidence: 0.8,
        timestamp: new Date()
      };

      manager.addContextualFactor(sessionId, factor1);
      const updatedContext = manager.addContextualFactor(sessionId, factor2);

      const weatherFactors = updatedContext.contextualFactors.filter(f => f.type === 'weather');
      expect(weatherFactors).toHaveLength(1);
      expect(weatherFactors[0].value).toBe('sunny');
    });

    it('should limit contextual factors to 10', () => {
      const context = manager.createContext(userId, sessionId);
      
      // Add 15 different factors
      for (let i = 0; i < 15; i++) {
        const factor: ContextualFactor = {
          type: `factor_${i}` as any,
          value: i,
          impact: 'neutral',
          confidence: 0.5,
          timestamp: new Date(Date.now() + i * 1000) // Different timestamps
        };
        manager.addContextualFactor(sessionId, factor);
      }

      const updatedContext = manager.getContext(sessionId)!;
      expect(updatedContext.contextualFactors).toHaveLength(10);
      
      // Should keep the most recent ones
      const lastFactor = updatedContext.contextualFactors.find(f => f.type === 'factor_14');
      expect(lastFactor).toBeDefined();
    });
  });

  describe('getContext', () => {
    it('should return context if exists and not expired', () => {
      const originalContext = manager.createContext(userId, sessionId);
      const retrievedContext = manager.getContext(sessionId);

      expect(retrievedContext).toBe(originalContext);
    });

    it('should return undefined if context does not exist', () => {
      const context = manager.getContext('non-existent-session');
      expect(context).toBeUndefined();
    });

    it('should clear and return undefined if context is expired', () => {
      // Create context with very short expiry
      manager.updateConfig({ contextExpiryMinutes: 0.001 }); // ~0.06 seconds
      
      const context = manager.createContext(userId, sessionId);
      expect(context).toBeDefined();

      // Wait for expiry
      return new Promise(resolve => {
        setTimeout(() => {
          const expiredContext = manager.getContext(sessionId);
          expect(expiredContext).toBeUndefined();
          resolve(undefined);
        }, 100);
      });
    });
  });

  describe('getUserContexts', () => {
    it('should return all active contexts for user', () => {
      const session1 = 'session-1';
      const session2 = 'session-2';
      const session3 = 'session-3';
      const otherUser = 'other-user';

      manager.createContext(userId, session1);
      manager.createContext(userId, session2);
      manager.createContext(otherUser, session3);

      const userContexts = manager.getUserContexts(userId);

      expect(userContexts).toHaveLength(2);
      expect(userContexts.map(c => c.sessionId)).toContain(session1);
      expect(userContexts.map(c => c.sessionId)).toContain(session2);
      expect(userContexts.map(c => c.sessionId)).not.toContain(session3);
    });
  });

  describe('clearContext', () => {
    it('should remove context and session', () => {
      const context = manager.createContext(userId, sessionId);
      expect(manager.getContext(sessionId)).toBe(context);

      manager.clearContext(sessionId);
      expect(manager.getContext(sessionId)).toBeUndefined();
    });
  });

  describe('getConversationSummary', () => {
    it('should generate conversation summary', () => {
      const context = manager.createContext(userId, sessionId);
      
      // Add some messages
      const messages: ChatMessage[] = [
        {
          id: 'msg-1',
          content: 'I want to lose weight',
          sender: 'user',
          timestamp: new Date(),
          messageType: 'text'
        },
        {
          id: 'msg-2',
          content: 'Great! Let me help you create a plan.',
          sender: 'bud',
          timestamp: new Date(),
          messageType: 'text'
        }
      ];

      messages.forEach(msg => manager.updateContextWithMessage(sessionId, msg));

      const summary = manager.getConversationSummary(sessionId);

      expect(summary).toContain('1 user messages');
      expect(summary).toContain('1 responses');
      expect(summary).toContain('Session duration:');
    });

    it('should return default message for empty conversation', () => {
      manager.createContext(userId, sessionId);
      const summary = manager.getConversationSummary(sessionId);
      expect(summary).toBe('No conversation history available.');
    });
  });

  describe('getStats', () => {
    it('should return context manager statistics', () => {
      manager.createContext(userId, sessionId);
      manager.createContext('user2', 'session2');

      const stats = manager.getStats();

      expect(stats.activeContexts).toBe(2);
      expect(stats.activeSessions).toBe(2);
      expect(stats.totalHistorySnapshots).toBeGreaterThanOrEqual(0);
      expect(stats.averageSessionDuration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxHistoryLength: 100,
        contextExpiryMinutes: 120
      };

      manager.updateConfig(newConfig);
      const config = manager.getConfig();

      expect(config.maxHistoryLength).toBe(100);
      expect(config.contextExpiryMinutes).toBe(120);
    });
  });
});