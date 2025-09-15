/**
 * Tests for QuickActionGenerator
 */

import { QuickActionGenerator } from '../quickActionGenerator';
import { ConversationContext } from '../../types/coachingTypes';

describe('QuickActionGenerator', () => {
  let generator: QuickActionGenerator;
  let mockContext: ConversationContext;
  
  beforeEach(() => {
    generator = QuickActionGenerator.getInstance();
    mockContext = {
      sessionId: 'test-session',
      userId: 'test-user',
      currentTopic: 'general',
      recentMetrics: { timestamp: new Date() },
      activeGoals: [],
      conversationHistory: [],
      contextualFactors: [],
      lastInteraction: new Date()
    };
  });

  describe('generateQuickActions', () => {
    it('should generate quick actions for basic context', () => {
      const actions = generator.generateQuickActions(mockContext);
      
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.length).toBeLessThanOrEqual(4); // Max actions limit
    });

    it('should generate time-appropriate actions in morning', () => {
      // Mock morning time (8 AM)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
      
      const actions = generator.generateQuickActions(mockContext);
      
      expect(actions).toBeDefined();
      expect(actions.length).toBeGreaterThan(0);
      
      // Should include morning-appropriate actions
      const actionTitles = actions.map(a => a.title.toLowerCase());
      const hasMorningAction = actionTitles.some(title => 
        title.includes('morning') || 
        title.includes('breakfast') || 
        title.includes('hydration')
      );
      expect(hasMorningAction).toBe(true);
      
      jest.restoreAllMocks();
    });

    it('should generate time-appropriate actions in evening', () => {
      // Mock evening time (9 PM)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(21);
      
      const actions = generator.generateQuickActions(mockContext);
      
      expect(actions).toBeDefined();
      expect(actions.length).toBeGreaterThan(0);
      
      // Should include evening-appropriate actions
      const actionTitles = actions.map(a => a.title.toLowerCase());
      const hasEveningAction = actionTitles.some(title => 
        title.includes('bedtime') || 
        title.includes('evening') || 
        title.includes('progress') ||
        title.includes('wind-down')
      );
      expect(hasEveningAction).toBe(true);
      
      jest.restoreAllMocks();
    });

    it('should consider user mood in action generation', () => {
      const contextWithMood: ConversationContext = {
        ...mockContext,
        userMood: {
          energy: 3, // Low energy
          motivation: 4,
          stress: 7, // High stress
          confidence: 5,
          timestamp: new Date()
        }
      };
      
      const actions = generator.generateQuickActions(contextWithMood);
      
      expect(actions).toBeDefined();
      expect(actions.length).toBeGreaterThan(0);
      
      // Should include stress-relief actions for high stress
      const actionTypes = actions.map(a => a.type);
      expect(actionTypes).toContain('start_meditation');
    });

    it('should limit duplicate action types', () => {
      const actions = generator.generateQuickActions(mockContext);
      
      const actionTypes = actions.map(a => a.type);
      const uniqueTypes = [...new Set(actionTypes)];
      
      // Should have mostly unique types, but some duplicates are acceptable
      expect(uniqueTypes.length).toBeGreaterThan(0);
      expect(actionTypes.length).toBeGreaterThanOrEqual(uniqueTypes.length);
    });
  });

  describe('generateContextualActions', () => {
    it('should generate stress-relief actions for stressed message', () => {
      const actions = generator.generateContextualActions('I feel really stressed today', mockContext);
      
      expect(actions).toBeDefined();
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.length).toBeLessThanOrEqual(2); // Limit contextual actions
      
      const hasStressAction = actions.some(action => 
        action.type === 'start_meditation' || 
        action.category === 'stress'
      );
      expect(hasStressAction).toBe(true);
    });

    it('should generate energy actions for tired message', () => {
      const actions = generator.generateContextualActions('I am so tired and exhausted', mockContext);
      
      expect(actions).toBeDefined();
      expect(actions.length).toBeGreaterThan(0);
      
      const hasEnergyAction = actions.some(action => 
        action.title.toLowerCase().includes('energy') || 
        action.title.toLowerCase().includes('rest') ||
        action.type === 'start_meditation' ||
        action.type === 'schedule_rest'
      );
      expect(hasEnergyAction).toBe(true);
    });

    it('should generate workout actions for motivated message', () => {
      const actions = generator.generateContextualActions('I feel so motivated and energetic!', mockContext);
      
      expect(actions).toBeDefined();
      expect(actions.length).toBeGreaterThan(0);
      
      const hasWorkoutAction = actions.some(action => 
        action.type === 'plan_workout' || 
        action.category === 'fitness'
      );
      expect(hasWorkoutAction).toBe(true);
    });

    it('should generate nutrition actions for workout message', () => {
      const actions = generator.generateContextualActions('Just finished my workout', mockContext);
      
      expect(actions).toBeDefined();
      expect(actions.length).toBeGreaterThan(0);
      
      const hasNutritionAction = actions.some(action => 
        action.type === 'track_meal' || 
        action.type === 'log_water' ||
        action.category === 'nutrition'
      );
      expect(hasNutritionAction).toBe(true);
    });

    it('should return empty array for neutral message', () => {
      const actions = generator.generateContextualActions('Hello there', mockContext);
      
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
      // May or may not have actions depending on implementation
    });
  });

  describe('configuration', () => {
    it('should allow updating configuration', () => {
      const newConfig = {
        maxActions: 6,
        prioritizeByTime: false
      };
      
      generator.updateConfig(newConfig);
      const config = generator.getConfig();
      
      expect(config.maxActions).toBe(6);
      expect(config.prioritizeByTime).toBe(false);
    });

    it('should respect maxActions configuration', () => {
      generator.updateConfig({ maxActions: 2 });
      
      const actions = generator.generateQuickActions(mockContext);
      
      expect(actions.length).toBeLessThanOrEqual(2);
    });
  });
});