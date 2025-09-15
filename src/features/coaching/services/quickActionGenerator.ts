/**
 * Quick Action Generator for contextual coaching suggestions
 * Generates relevant quick actions based on user context, time, and conversation state
 */

import { 
  ActionSuggestion, 
  ConversationContext, 
  ActionType, 
  ActionCategory,
  MoodIndicator 
} from '../types/coachingTypes';
import { HealthMetrics } from '@/features/health/types/healthTypes';
import { UUID, Goal } from '@/shared/types/globalTypes';

export interface QuickActionConfig {
  maxActions: number;
  prioritizeByTime: boolean;
  includeMotivational: boolean;
  personalityStyle: 'encouraging' | 'direct' | 'analytical' | 'casual';
}

export interface ActionTemplate {
  type: ActionType;
  title: string;
  description: string;
  category: ActionCategory;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  conditions: ActionCondition[];
  timeRelevance?: TimeRelevance;
}

export interface ActionCondition {
  type: 'time_of_day' | 'energy_level' | 'stress_level' | 'recent_activity' | 'goal_type' | 'mood';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  weight: number; // 0-1 scale for importance
}

export interface TimeRelevance {
  preferredHours: number[]; // 0-23
  avoidHours?: number[];
  daysOfWeek?: string[];
}

export class QuickActionGenerator {
  private static instance: QuickActionGenerator;
  private config: QuickActionConfig;
  private actionTemplates: ActionTemplate[] = [];

  private constructor(config?: Partial<QuickActionConfig>) {
    this.config = {
      maxActions: 4,
      prioritizeByTime: true,
      includeMotivational: true,
      personalityStyle: 'encouraging',
      ...config
    };
    this.initializeActionTemplates();
  }

  public static getInstance(config?: Partial<QuickActionConfig>): QuickActionGenerator {
    if (!QuickActionGenerator.instance) {
      QuickActionGenerator.instance = new QuickActionGenerator(config);
    }
    return QuickActionGenerator.instance;
  }

  private initializeActionTemplates() {
    this.actionTemplates = [
      // Morning actions
      {
        type: 'log_water',
        title: 'Start with hydration',
        description: 'Log your morning water intake',
        category: 'nutrition',
        priority: 'high',
        estimatedDuration: 1,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 6, weight: 0.8 },
          { type: 'time_of_day', operator: 'less_than', value: 10, weight: 0.8 }
        ],
        timeRelevance: { preferredHours: [6, 7, 8, 9] }
      },
      {
        type: 'plan_workout',
        title: 'Plan morning workout',
        description: 'Set up your exercise for today',
        category: 'fitness',
        priority: 'high',
        estimatedDuration: 5,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 6, weight: 0.9 },
          { type: 'time_of_day', operator: 'less_than', value: 11, weight: 0.9 },
          { type: 'energy_level', operator: 'greater_than', value: 5, weight: 0.7 }
        ],
        timeRelevance: { preferredHours: [6, 7, 8, 9, 10] }
      },
      {
        type: 'track_meal',
        title: 'Log breakfast',
        description: 'Track your morning nutrition',
        category: 'nutrition',
        priority: 'medium',
        estimatedDuration: 3,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 6, weight: 0.8 },
          { type: 'time_of_day', operator: 'less_than', value: 11, weight: 0.8 }
        ],
        timeRelevance: { preferredHours: [7, 8, 9, 10] }
      },

      // Midday actions
      {
        type: 'start_meditation',
        title: 'Midday reset',
        description: '5-minute stress relief break',
        category: 'stress',
        priority: 'medium',
        estimatedDuration: 5,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 11, weight: 0.7 },
          { type: 'time_of_day', operator: 'less_than', value: 15, weight: 0.7 },
          { type: 'stress_level', operator: 'greater_than', value: 6, weight: 0.9 }
        ],
        timeRelevance: { preferredHours: [12, 13, 14] }
      },
      {
        type: 'track_meal',
        title: 'Log lunch',
        description: 'Track your midday nutrition',
        category: 'nutrition',
        priority: 'medium',
        estimatedDuration: 3,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 11, weight: 0.8 },
          { type: 'time_of_day', operator: 'less_than', value: 15, weight: 0.8 }
        ],
        timeRelevance: { preferredHours: [11, 12, 13, 14] }
      },
      {
        type: 'log_water',
        title: 'Hydration check',
        description: 'Log your water intake',
        category: 'nutrition',
        priority: 'medium',
        estimatedDuration: 1,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 10, weight: 0.6 },
          { type: 'time_of_day', operator: 'less_than', value: 18, weight: 0.6 }
        ],
        timeRelevance: { preferredHours: [11, 12, 13, 14, 15, 16, 17] }
      },

      // Afternoon/Evening actions
      {
        type: 'plan_workout',
        title: 'Afternoon energy boost',
        description: 'Plan an energizing workout',
        category: 'fitness',
        priority: 'medium',
        estimatedDuration: 5,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 15, weight: 0.7 },
          { type: 'time_of_day', operator: 'less_than', value: 19, weight: 0.7 },
          { type: 'energy_level', operator: 'greater_than', value: 4, weight: 0.6 }
        ],
        timeRelevance: { preferredHours: [15, 16, 17, 18] }
      },
      {
        type: 'track_meal',
        title: 'Log dinner',
        description: 'Track your evening nutrition',
        category: 'nutrition',
        priority: 'medium',
        estimatedDuration: 3,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 17, weight: 0.8 },
          { type: 'time_of_day', operator: 'less_than', value: 21, weight: 0.8 }
        ],
        timeRelevance: { preferredHours: [17, 18, 19, 20] }
      },

      // Evening/Night actions
      {
        type: 'schedule_rest',
        title: 'Plan bedtime routine',
        description: 'Set up for quality sleep',
        category: 'sleep',
        priority: 'high',
        estimatedDuration: 3,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 20, weight: 0.9 },
          { type: 'time_of_day', operator: 'less_than', value: 24, weight: 0.9 }
        ],
        timeRelevance: { preferredHours: [20, 21, 22, 23] }
      },
      {
        type: 'view_progress',
        title: 'Review today\'s wins',
        description: 'Check your daily progress',
        category: 'tracking',
        priority: 'medium',
        estimatedDuration: 3,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 18, weight: 0.7 }
        ],
        timeRelevance: { preferredHours: [18, 19, 20, 21, 22] }
      },
      {
        type: 'start_meditation',
        title: 'Evening wind-down',
        description: 'Relaxing meditation before bed',
        category: 'stress',
        priority: 'medium',
        estimatedDuration: 10,
        conditions: [
          { type: 'time_of_day', operator: 'greater_than', value: 19, weight: 0.8 },
          { type: 'stress_level', operator: 'greater_than', value: 5, weight: 0.7 }
        ],
        timeRelevance: { preferredHours: [19, 20, 21, 22] }
      },

      // Energy-based actions
      {
        type: 'plan_workout',
        title: 'High-energy workout',
        description: 'Channel that energy into exercise',
        category: 'fitness',
        priority: 'high',
        estimatedDuration: 5,
        conditions: [
          { type: 'energy_level', operator: 'greater_than', value: 7, weight: 1.0 },
          { type: 'time_of_day', operator: 'less_than', value: 20, weight: 0.6 }
        ]
      },
      {
        type: 'start_meditation',
        title: 'Energy boost meditation',
        description: 'Quick energizing break',
        category: 'stress',
        priority: 'medium',
        estimatedDuration: 5,
        conditions: [
          { type: 'energy_level', operator: 'less_than', value: 4, weight: 0.9 }
        ]
      },

      // Stress-based actions
      {
        type: 'start_meditation',
        title: 'Stress relief',
        description: 'Calm your mind with breathing',
        category: 'stress',
        priority: 'high',
        estimatedDuration: 5,
        conditions: [
          { type: 'stress_level', operator: 'greater_than', value: 7, weight: 1.0 }
        ]
      },
      {
        type: 'plan_workout',
        title: 'Stress-busting walk',
        description: 'Light movement to clear your head',
        category: 'fitness',
        priority: 'medium',
        estimatedDuration: 3,
        conditions: [
          { type: 'stress_level', operator: 'greater_than', value: 6, weight: 0.8 }
        ]
      },

      // Goal-based actions
      {
        type: 'adjust_goal',
        title: 'Review your goals',
        description: 'Check and adjust your targets',
        category: 'planning',
        priority: 'medium',
        estimatedDuration: 5,
        conditions: [
          { type: 'goal_type', operator: 'contains', value: 'weight_loss', weight: 0.7 }
        ]
      },
      {
        type: 'get_recipe',
        title: 'Healthy meal ideas',
        description: 'Find nutrition-focused recipes',
        category: 'nutrition',
        priority: 'medium',
        estimatedDuration: 3,
        conditions: [
          { type: 'goal_type', operator: 'contains', value: 'weight_loss', weight: 0.8 }
        ]
      },

      // General motivational actions
      {
        type: 'view_progress',
        title: 'See your progress',
        description: 'Check how far you\'ve come',
        category: 'tracking',
        priority: 'low',
        estimatedDuration: 2,
        conditions: []
      },
      {
        type: 'set_reminder',
        title: 'Set health reminder',
        description: 'Never miss your health goals',
        category: 'tracking',
        priority: 'low',
        estimatedDuration: 2,
        conditions: []
      }
    ];
  }

  public generateQuickActions(context: ConversationContext): ActionSuggestion[] {
    const currentHour = new Date().getHours();
    const scoredActions: Array<{ action: ActionTemplate; score: number }> = [];

    // Score each action template based on context
    for (const template of this.actionTemplates) {
      const score = this.scoreAction(template, context, currentHour);
      if (score > 0) {
        scoredActions.push({ action: template, score });
      }
    }

    // Sort by score (highest first)
    scoredActions.sort((a, b) => b.score - a.score);

    // Take top actions and convert to ActionSuggestion
    const topActions = scoredActions
      .slice(0, this.config.maxActions)
      .map(({ action }) => this.convertToActionSuggestion(action));

    return topActions;
  }

  private scoreAction(
    template: ActionTemplate,
    context: ConversationContext,
    currentHour: number
  ): number {
    let score = 0;

    // Base score from priority
    const priorityScores = { low: 1, medium: 2, high: 3 };
    score += priorityScores[template.priority];

    // Time relevance scoring
    if (this.config.prioritizeByTime && template.timeRelevance) {
      if (template.timeRelevance.preferredHours.includes(currentHour)) {
        score += 2;
      }
      if (template.timeRelevance.avoidHours?.includes(currentHour)) {
        score -= 3;
      }
    }

    // Condition-based scoring
    for (const condition of template.conditions) {
      const conditionScore = this.evaluateCondition(condition, context, currentHour);
      score += conditionScore * condition.weight;
    }

    // Avoid duplicate action types in recent history
    const recentActions = context.conversationHistory
      .slice(-10)
      .filter(msg => msg.sender === 'bud' && msg.suggestions)
      .flatMap(msg => msg.suggestions || []);
    
    const hasRecentSimilar = recentActions.some(action => action.type === template.type);
    if (hasRecentSimilar) {
      score *= 0.5; // Reduce score for recently suggested actions
    }

    return Math.max(0, score);
  }

  private evaluateCondition(
    condition: ActionCondition,
    context: ConversationContext,
    currentHour: number
  ): number {
    switch (condition.type) {
      case 'time_of_day':
        return this.evaluateTimeCondition(condition, currentHour);
      
      case 'energy_level':
        return this.evaluateEnergyCondition(condition, context);
      
      case 'stress_level':
        return this.evaluateStressCondition(condition, context);
      
      case 'recent_activity':
        return this.evaluateRecentActivityCondition(condition, context);
      
      case 'goal_type':
        return this.evaluateGoalCondition(condition, context);
      
      case 'mood':
        return this.evaluateMoodCondition(condition, context);
      
      default:
        return 0;
    }
  }

  private evaluateTimeCondition(condition: ActionCondition, currentHour: number): number {
    switch (condition.operator) {
      case 'equals':
        return currentHour === condition.value ? 2 : 0;
      case 'greater_than':
        return currentHour > condition.value ? 2 : -1;
      case 'less_than':
        return currentHour < condition.value ? 2 : -1;
      default:
        return 0;
    }
  }

  private evaluateEnergyCondition(condition: ActionCondition, context: ConversationContext): number {
    const energyLevel = context.userMood?.energy || 5; // Default to neutral
    
    switch (condition.operator) {
      case 'greater_than':
        return energyLevel > condition.value ? 2 : -1;
      case 'less_than':
        return energyLevel < condition.value ? 2 : -1;
      case 'equals':
        return energyLevel === condition.value ? 2 : 0;
      default:
        return 0;
    }
  }

  private evaluateStressCondition(condition: ActionCondition, context: ConversationContext): number {
    const stressLevel = context.userMood?.stress || 5; // Default to neutral
    
    switch (condition.operator) {
      case 'greater_than':
        return stressLevel > condition.value ? 2 : -1;
      case 'less_than':
        return stressLevel < condition.value ? 2 : -1;
      case 'equals':
        return stressLevel === condition.value ? 2 : 0;
      default:
        return 0;
    }
  }

  private evaluateRecentActivityCondition(condition: ActionCondition, context: ConversationContext): number {
    // Check recent conversation history for activity mentions
    const recentMessages = context.conversationHistory.slice(-5);
    const hasRecentActivity = recentMessages.some(msg => 
      msg.content.toLowerCase().includes(condition.value.toLowerCase())
    );
    
    switch (condition.operator) {
      case 'contains':
        return hasRecentActivity ? 2 : 0;
      case 'not_contains':
        return !hasRecentActivity ? 2 : -1;
      default:
        return 0;
    }
  }

  private evaluateGoalCondition(condition: ActionCondition, context: ConversationContext): number {
    const hasGoalType = context.activeGoals.some(goal => 
      goal.type === condition.value
    );
    
    switch (condition.operator) {
      case 'contains':
        return hasGoalType ? 2 : 0;
      case 'not_contains':
        return !hasGoalType ? 1 : 0;
      default:
        return 0;
    }
  }

  private evaluateMoodCondition(condition: ActionCondition, context: ConversationContext): number {
    if (!context.userMood) return 0;
    
    // Simple mood evaluation - could be enhanced
    const overallMood = (
      context.userMood.energy + 
      context.userMood.motivation + 
      (10 - context.userMood.stress) + 
      context.userMood.confidence
    ) / 4;
    
    switch (condition.operator) {
      case 'greater_than':
        return overallMood > condition.value ? 2 : 0;
      case 'less_than':
        return overallMood < condition.value ? 2 : 0;
      default:
        return 0;
    }
  }

  private convertToActionSuggestion(template: ActionTemplate): ActionSuggestion {
    return {
      id: this.generateId(),
      type: template.type,
      title: template.title,
      description: template.description,
      priority: template.priority,
      category: template.category,
      estimatedDuration: template.estimatedDuration
    };
  }

  public generateContextualActions(
    recentMessage: string,
    context: ConversationContext
  ): ActionSuggestion[] {
    const contextualActions: ActionSuggestion[] = [];
    const lowerMessage = recentMessage.toLowerCase();

    // Generate actions based on message content
    if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
      contextualActions.push({
        id: this.generateId(),
        type: 'start_meditation',
        title: 'Quick energy boost',
        description: '5-minute energizing meditation',
        priority: 'high',
        category: 'stress',
        estimatedDuration: 5
      });
      
      contextualActions.push({
        id: this.generateId(),
        type: 'schedule_rest',
        title: 'Plan rest time',
        description: 'Schedule recovery and better sleep',
        priority: 'medium',
        category: 'sleep',
        estimatedDuration: 3
      });
    }

    if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
      contextualActions.push({
        id: this.generateId(),
        type: 'start_meditation',
        title: 'Stress relief',
        description: 'Calm your mind with breathing exercises',
        priority: 'high',
        category: 'stress',
        estimatedDuration: 5
      });
      
      contextualActions.push({
        id: this.generateId(),
        type: 'plan_workout',
        title: 'Stress-busting walk',
        description: 'Light movement to clear your head',
        priority: 'medium',
        category: 'fitness',
        estimatedDuration: 15
      });
    }

    if (lowerMessage.includes('motivated') || lowerMessage.includes('energetic')) {
      contextualActions.push({
        id: this.generateId(),
        type: 'plan_workout',
        title: 'High-energy workout',
        description: 'Channel that energy into exercise',
        priority: 'high',
        category: 'fitness',
        estimatedDuration: 5
      });
      
      contextualActions.push({
        id: this.generateId(),
        type: 'adjust_goal',
        title: 'Set new challenge',
        description: 'Raise the bar on your goals',
        priority: 'medium',
        category: 'planning',
        estimatedDuration: 5
      });
    }

    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      contextualActions.push({
        id: this.generateId(),
        type: 'track_meal',
        title: 'Log post-workout nutrition',
        description: 'Track your recovery meal',
        priority: 'high',
        category: 'nutrition',
        estimatedDuration: 3
      });
      
      contextualActions.push({
        id: this.generateId(),
        type: 'log_water',
        title: 'Rehydrate',
        description: 'Log your water intake',
        priority: 'medium',
        category: 'nutrition',
        estimatedDuration: 1
      });
    }

    return contextualActions.slice(0, 2); // Limit to 2 contextual actions
  }

  private generateId(): UUID {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  public updateConfig(newConfig: Partial<QuickActionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): QuickActionConfig {
    return { ...this.config };
  }
}