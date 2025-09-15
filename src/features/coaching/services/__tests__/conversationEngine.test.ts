/**
 * Tests for ConversationEngine
 */

import { ConversationEngine } from '../conversationEngine';
import { ConversationContext } from '../../types/coachingTypes';

describe('ConversationEngine', () => {
  let engine: ConversationEngine;
  
  beforeEach(() => {
    engine = ConversationEngine.getInstance();
  });

  afterEach(() => {
    // Clear any active contexts
    engine.getAllActiveContexts().forEach(context => {
      engine.clearContext(context.sessionId);
    });
  });

  describe('processMessage', () => {
    it('should process a greeting message', async () => {
      const result = await engine.processMessage('Hello!', 'test-user', 'test-session');
      
      expect(result.response).toBeDefined();
      expect(result.response.sender).toBe('bud');
      expect(result.response.content).toBeTruthy();
      expect(result.context).toBeDefined();
      expect(result.context.userId).toBe('test-user');
    });

    it('should detect sleep data logging', async () => {
      const result = await engine.processMessage('I slept 8 hours last night', 'test-user', 'test-session');
      
      expect(result.response).toBeDefined();
      expect(result.dataLogged).toBeDefined();
      expect(result.dataLogged?.length).toBeGreaterThan(0);
      expect(result.dataLogged?.[0].metric).toBe('sleep_score');
      expect(result.dataLogged?.[0].value).toBe(8);
    });

    it('should detect workout logging', async () => {
      const result = await engine.processMessage('I worked out this morning', 'test-user', 'test-session');
      
      expect(result.response).toBeDefined();
      expect(result.dataLogged).toBeDefined();
      expect(result.dataLogged?.length).toBeGreaterThan(0);
      expect(result.dataLogged?.[0].metric).toBe('active_minutes');
    });

    it('should detect energy level logging', async () => {
      const result = await engine.processMessage('My energy is 7 out of 10', 'test-user', 'test-session');
      
      expect(result.response).toBeDefined();
      expect(result.dataLogged).toBeDefined();
      expect(result.dataLogged?.length).toBeGreaterThan(0);
      expect(result.dataLogged?.[0].metric).toBe('activity_level');
      expect(result.dataLogged?.[0].value).toBe(7);
    });

    it('should maintain conversation context', async () => {
      const firstResult = await engine.processMessage('Hello!', 'test-user', 'test-session');
      const secondResult = await engine.processMessage('How are you?', 'test-user', 'test-session');
      
      expect(secondResult.context.conversationHistory.length).toBeGreaterThan(0);
      expect(secondResult.context.sessionId).toBe('test-session');
    });

    it('should generate appropriate suggestions', async () => {
      const result = await engine.processMessage('I feel tired today', 'test-user', 'test-session');
      
      expect(result.response.suggestions).toBeDefined();
      expect(result.response.suggestions?.length).toBeGreaterThan(0);
    });
  });

  describe('context management', () => {
    it('should create new context for new users', async () => {
      const result = await engine.processMessage('Hello', 'new-user', 'new-session');
      
      const context = engine.getActiveContext('new-session');
      expect(context).toBeDefined();
      expect(context?.userId).toBe('new-user');
    });

    it('should clear context when requested', async () => {
      await engine.processMessage('Hello', 'test-user', 'test-session');
      
      let context = engine.getActiveContext('test-session');
      expect(context).toBeDefined();
      
      engine.clearContext('test-session');
      context = engine.getActiveContext('test-session');
      expect(context).toBeUndefined();
    });
  });
});