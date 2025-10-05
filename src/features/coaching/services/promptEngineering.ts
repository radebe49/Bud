/**
 * Prompt Engineering System
 * Handles prompt construction and optimization for health coaching conversations
 */

import type { 
  ConversationContext, 
  ChatMessage, 
  ContextualFactor,
  WorkoutContext,
  NutritionContext,
  SleepContext,
  EmotionalContext
} from '../types/conversationTypes';
import type { HealthMetrics } from '../../../shared/types/healthTypes';
import type { Goal } from '../../../shared/types/userTypes';
import type { GroqMessage } from './groqApiClient';

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  systemPrompt: string;
  userPromptTemplate: string;
  contextRequirements: string[];
  maxTokens: number;
  temperature: number;
}

export type PromptCategory = 
  | 'general_coaching'
  | 'workout_planning'
  | 'nutrition_advice'
  | 'sleep_coaching'
  | 'motivation'
  | 'goal_setting'
  | 'progress_review'
  | 'health_concerns'
  | 'habit_formation';

export interface PromptContext {
  userMessage: string;
  conversationContext: ConversationContext;
  healthMetrics?: HealthMetrics;
  recentMessages: ChatMessage[];
  contextualFactors: ContextualFactor[];
  currentGoals: Goal[];
}

export class PromptEngineering {
  private static instance: PromptEngineering;
  private templates: Map<string, PromptTemplate> = new Map();
  private contextAnalyzer: ContextAnalyzer;

  private constructor() {
    this.contextAnalyzer = new ContextAnalyzer();
    this.initializeTemplates();
  }

  public static getInstance(): PromptEngineering {
    if (!PromptEngineering.instance) {
      PromptEngineering.instance = new PromptEngineering();
    }
    return PromptEngineering.instance;
  }

  /**
   * Generate optimized prompt for GROQ API
   */
  public generatePrompt(context: PromptContext): GroqMessage[] {
    const category = this.determinePromptCategory(context);
    const template = this.getTemplate(category);
    
    const systemPrompt = this.buildSystemPrompt(template, context);
    const userPrompt = this.buildUserPrompt(template, context);

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add conversation history (last 10 messages)
    const recentHistory = context.recentMessages.slice(-10);
    for (const message of recentHistory) {
      messages.push({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.content
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userPrompt
    });

    return messages;
  }

  /**
   * Build comprehensive system prompt
   */
  private buildSystemPrompt(template: PromptTemplate, context: PromptContext): string {
    const basePrompt = template.systemPrompt;
    const contextInfo = this.buildContextInformation(context);
    const guidelines = this.getCoachingGuidelines(template.category);
    const constraints = this.getResponseConstraints();

    return `${basePrompt}

${contextInfo}

${guidelines}

${constraints}`;
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(template: PromptTemplate, context: PromptContext): string {
    let prompt = template.userPromptTemplate;
    
    // Replace placeholders with actual context
    prompt = prompt.replace('{userMessage}', context.userMessage);
    prompt = prompt.replace('{currentTime}', new Date().toLocaleString());
    
    // Add health metrics if available
    if (context.healthMetrics) {
      const metricsText = this.formatHealthMetrics(context.healthMetrics);
      prompt = prompt.replace('{healthMetrics}', metricsText);
    }

    // Add contextual factors
    const factorsText = this.formatContextualFactors(context.contextualFactors);
    prompt = prompt.replace('{contextualFactors}', factorsText);

    // Add goals
    const goalsText = this.formatGoals(context.currentGoals);
    prompt = prompt.replace('{currentGoals}', goalsText);

    return prompt;
  }

  /**
   * Build context information section
   */
  private buildContextInformation(context: PromptContext): string {
    const sections: string[] = [];

    // User profile and goals
    if (context.currentGoals.length > 0) {
      sections.push(`USER GOALS:
${context.currentGoals.map(goal => `- ${goal.title}: ${goal.description}`).join('\n')}`);
    }

    // Health metrics
    if (context.healthMetrics) {
      sections.push(`CURRENT HEALTH METRICS:
${this.formatHealthMetrics(context.healthMetrics)}`);
    }

    // Contextual factors
    if (context.contextualFactors.length > 0) {
      sections.push(`CONTEXTUAL FACTORS:
${this.formatContextualFactors(context.contextualFactors)}`);
    }

    // Session context
    const sessionInfo = this.buildSessionContext(context.conversationContext);
    if (sessionInfo) {
      sections.push(`SESSION CONTEXT:
${sessionInfo}`);
    }

    return sections.join('\n\n');
  }

  /**
   * Determine appropriate prompt category
   */
  private determinePromptCategory(context: PromptContext): PromptCategory {
    const message = context.userMessage.toLowerCase();
    const recentContext = context.conversationContext.currentTopic.category;

    // Keyword-based category detection
    if (this.containsKeywords(message, ['workout', 'exercise', 'training', 'fitness', 'gym'])) {
      return 'workout_planning';
    }
    
    if (this.containsKeywords(message, ['food', 'eat', 'nutrition', 'diet', 'meal', 'calories'])) {
      return 'nutrition_advice';
    }
    
    if (this.containsKeywords(message, ['sleep', 'tired', 'rest', 'bedtime', 'insomnia'])) {
      return 'sleep_coaching';
    }
    
    if (this.containsKeywords(message, ['goal', 'target', 'achieve', 'plan', 'objective'])) {
      return 'goal_setting';
    }
    
    if (this.containsKeywords(message, ['progress', 'improvement', 'results', 'tracking'])) {
      return 'progress_review';
    }
    
    if (this.containsKeywords(message, ['motivated', 'motivation', 'encourage', 'support'])) {
      return 'motivation';
    }
    
    if (this.containsKeywords(message, ['habit', 'routine', 'consistency', 'daily'])) {
      return 'habit_formation';
    }
    
    if (this.containsKeywords(message, ['pain', 'hurt', 'injury', 'sick', 'concern', 'worried'])) {
      return 'health_concerns';
    }

    // Fall back to recent conversation context
    switch (recentContext) {
      case 'fitness_planning':
      case 'workout_feedback':
        return 'workout_planning';
      case 'nutrition_guidance':
        return 'nutrition_advice';
      case 'sleep_optimization':
        return 'sleep_coaching';
      case 'goal_setting':
        return 'goal_setting';
      case 'progress_review':
        return 'progress_review';
      case 'motivation_support':
        return 'motivation';
      case 'health_concerns':
        return 'health_concerns';
      default:
        return 'general_coaching';
    }
  }

  /**
   * Get coaching guidelines for category
   */
  private getCoachingGuidelines(category: PromptCategory): string {
    const guidelines = {
      general_coaching: `COACHING GUIDELINES:
- Be supportive, encouraging, and personalized
- Ask follow-up questions to understand user needs
- Provide actionable, specific advice
- Consider user's current health metrics and context
- Maintain a warm, professional tone`,

      workout_planning: `WORKOUT COACHING GUIDELINES:
- Consider user's fitness level, equipment, and time availability
- Adapt recommendations based on readiness scores and recovery metrics
- Provide clear exercise instructions and modifications
- Focus on progressive overload and injury prevention
- Ask about any pain or discomfort before recommending exercises`,

      nutrition_advice: `NUTRITION COACHING GUIDELINES:
- Focus on sustainable, healthy eating habits
- Consider user's goals, preferences, and dietary restrictions
- Provide practical meal timing and preparation advice
- Connect nutrition choices to energy levels and performance
- Avoid extreme diets or unsustainable restrictions`,

      sleep_coaching: `SLEEP COACHING GUIDELINES:
- Assess current sleep patterns and quality
- Provide evidence-based sleep hygiene recommendations
- Consider lifestyle factors affecting sleep
- Suggest gradual changes to sleep routine
- Address environmental factors and stress management`,

      motivation: `MOTIVATIONAL COACHING GUIDELINES:
- Acknowledge user's efforts and progress
- Help identify and overcome barriers
- Use positive reinforcement and encouragement
- Set realistic, achievable short-term goals
- Celebrate small wins and milestones`,

      goal_setting: `GOAL SETTING GUIDELINES:
- Help create SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Break down large goals into smaller, manageable steps
- Consider user's current situation and constraints
- Align goals with user's values and motivations
- Plan for obstacles and setbacks`,

      progress_review: `PROGRESS REVIEW GUIDELINES:
- Analyze trends in health metrics and behaviors
- Highlight positive changes and improvements
- Identify areas for adjustment or focus
- Provide data-driven insights and recommendations
- Maintain motivation while addressing challenges`,

      health_concerns: `HEALTH CONCERNS GUIDELINES:
- Take all health concerns seriously
- Recommend consulting healthcare professionals when appropriate
- Provide general wellness advice within scope
- Avoid diagnosing or providing medical treatment advice
- Focus on supportive lifestyle modifications`,

      habit_formation: `HABIT FORMATION GUIDELINES:
- Start with small, manageable habit changes
- Focus on consistency over perfection
- Help identify habit triggers and rewards
- Suggest habit stacking and environmental design
- Track progress and adjust strategies as needed`
    };

    return guidelines[category] || guidelines.general_coaching;
  }

  /**
   * Get response constraints
   */
  private getResponseConstraints(): string {
    return `RESPONSE CONSTRAINTS:
- Keep responses concise but comprehensive (200-400 words)
- Use bullet points or numbered lists for clarity
- Include 1-3 specific, actionable recommendations
- Ask one follow-up question to continue the conversation
- Maintain a supportive, non-judgmental tone
- If health concerns are mentioned, recommend consulting a healthcare professional
- Personalize advice based on provided context and metrics`;
  }

  /**
   * Format health metrics for prompt
   */
  private formatHealthMetrics(metrics: HealthMetrics): string {
    const parts: string[] = [];
    
    if (metrics.heartRate) parts.push(`Heart Rate: ${metrics.heartRate} bpm`);
    if (metrics.sleepScore) parts.push(`Sleep Score: ${metrics.sleepScore}/10`);
    if (metrics.recoveryScore) parts.push(`Recovery Score: ${metrics.recoveryScore}/10`);
    if (metrics.stressLevel) parts.push(`Stress Level: ${metrics.stressLevel}/10`);
    if (metrics.activityLevel) parts.push(`Activity Level: ${metrics.activityLevel}/10`);
    if (metrics.caloriesConsumed) parts.push(`Calories Consumed: ${metrics.caloriesConsumed}`);
    if (metrics.waterIntake) parts.push(`Water Intake: ${metrics.waterIntake}ml`);
    
    return parts.join(', ') || 'No recent metrics available';
  }

  /**
   * Format contextual factors for prompt
   */
  private formatContextualFactors(factors: ContextualFactor[]): string {
    if (factors.length === 0) return 'No specific contextual factors';
    
    return factors
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Top 5 most confident factors
      .map(factor => `${factor.type}: ${factor.value} (${factor.impact} impact)`)
      .join(', ');
  }

  /**
   * Format goals for prompt
   */
  private formatGoals(goals: Goal[]): string {
    if (goals.length === 0) return 'No active goals set';
    
    return goals
      .slice(0, 3) // Top 3 goals
      .map(goal => `${goal.title}: ${goal.description}`)
      .join('; ');
  }

  /**
   * Build session context information
   */
  private buildSessionContext(context: ConversationContext): string {
    const parts: string[] = [];
    
    parts.push(`Current Topic: ${context.currentTopic.name}`);
    parts.push(`Session Duration: ${Math.round(context.sessionDuration)} minutes`);
    parts.push(`Messages Exchanged: ${context.conversationHistory.length}`);
    
    if (context.userMood) {
      parts.push(`User Mood - Energy: ${context.userMood.energy}/10, Motivation: ${context.userMood.motivation}/10, Stress: ${context.userMood.stress}/10`);
    }
    
    return parts.join('\n');
  }

  /**
   * Check if message contains keywords
   */
  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get template by category
   */
  private getTemplate(category: PromptCategory): PromptTemplate {
    return this.templates.get(category) || this.templates.get('general_coaching')!;
  }

  /**
   * Initialize prompt templates
   */
  private initializeTemplates(): void {
    // General coaching template
    this.templates.set('general_coaching', {
      id: 'general_coaching',
      name: 'General Health Coaching',
      category: 'general_coaching',
      systemPrompt: `You are Bud, an AI-powered personal health coach. You provide personalized, supportive guidance for fitness, nutrition, sleep, and overall wellness. You adapt your advice based on the user's current health metrics, goals, and circumstances.`,
      userPromptTemplate: `User message: "{userMessage}"

Current time: {currentTime}
Health metrics: {healthMetrics}
Contextual factors: {contextualFactors}
Current goals: {currentGoals}

Please provide a helpful, personalized response that addresses the user's message while considering their current context and health data.`,
      contextRequirements: ['userMessage'],
      maxTokens: 500,
      temperature: 0.7
    });

    // Workout planning template
    this.templates.set('workout_planning', {
      id: 'workout_planning',
      name: 'Workout Planning & Fitness Coaching',
      category: 'workout_planning',
      systemPrompt: `You are Bud, a fitness coach specializing in personalized workout planning. You create adaptive exercise programs based on user goals, fitness level, available equipment, and current readiness scores. You prioritize safety, progressive overload, and sustainable fitness habits.`,
      userPromptTemplate: `User message: "{userMessage}"

Current health metrics: {healthMetrics}
Contextual factors: {contextualFactors}
Fitness goals: {currentGoals}

Please provide specific workout recommendations, exercise modifications, or fitness guidance that addresses the user's needs while considering their current readiness and recovery status.`,
      contextRequirements: ['userMessage', 'healthMetrics'],
      maxTokens: 600,
      temperature: 0.6
    });

    // Nutrition advice template
    this.templates.set('nutrition_advice', {
      id: 'nutrition_advice',
      name: 'Nutrition & Diet Coaching',
      category: 'nutrition_advice',
      systemPrompt: `You are Bud, a nutrition coach focused on sustainable, healthy eating habits. You provide personalized dietary advice that supports the user's fitness goals, energy levels, and overall health. You emphasize balance, practicality, and long-term adherence.`,
      userPromptTemplate: `User message: "{userMessage}"

Current health metrics: {healthMetrics}
Contextual factors: {contextualFactors}
Nutrition goals: {currentGoals}

Please provide practical nutrition advice, meal suggestions, or dietary guidance that supports the user's goals and current situation.`,
      contextRequirements: ['userMessage'],
      maxTokens: 500,
      temperature: 0.7
    });

    // Sleep coaching template
    this.templates.set('sleep_coaching', {
      id: 'sleep_coaching',
      name: 'Sleep Optimization Coaching',
      category: 'sleep_coaching',
      systemPrompt: `You are Bud, a sleep coach specializing in sleep optimization and recovery. You help users improve sleep quality, establish healthy sleep routines, and understand the connection between sleep and overall health performance.`,
      userPromptTemplate: `User message: "{userMessage}"

Current health metrics: {healthMetrics}
Contextual factors: {contextualFactors}
Sleep-related goals: {currentGoals}

Please provide evidence-based sleep advice, routine suggestions, or recovery guidance that addresses the user's sleep concerns and supports their overall health goals.`,
      contextRequirements: ['userMessage'],
      maxTokens: 500,
      temperature: 0.6
    });

    // Add more templates for other categories...
    this.addRemainingTemplates();
  }

  /**
   * Add remaining prompt templates
   */
  private addRemainingTemplates(): void {
    // Motivation template
    this.templates.set('motivation', {
      id: 'motivation',
      name: 'Motivational Coaching',
      category: 'motivation',
      systemPrompt: `You are Bud, a motivational health coach. You provide encouragement, help users overcome obstacles, and maintain motivation for their health journey. You celebrate progress, address setbacks positively, and help users stay committed to their goals.`,
      userPromptTemplate: `User message: "{userMessage}"

Current progress: {healthMetrics}
Contextual factors: {contextualFactors}
Goals: {currentGoals}

Please provide motivational support, encouragement, and practical strategies to help the user stay committed to their health journey.`,
      contextRequirements: ['userMessage'],
      maxTokens: 400,
      temperature: 0.8
    });

    // Goal setting template
    this.templates.set('goal_setting', {
      id: 'goal_setting',
      name: 'Goal Setting & Planning',
      category: 'goal_setting',
      systemPrompt: `You are Bud, a goal-setting coach who helps users create realistic, achievable health and fitness goals. You guide users through the SMART goal framework and help break down large objectives into manageable steps.`,
      userPromptTemplate: `User message: "{userMessage}"

Current status: {healthMetrics}
Contextual factors: {contextualFactors}
Existing goals: {currentGoals}

Please help the user set or refine their health goals, making them specific, measurable, achievable, relevant, and time-bound.`,
      contextRequirements: ['userMessage'],
      maxTokens: 500,
      temperature: 0.6
    });

    // Progress review template
    this.templates.set('progress_review', {
      id: 'progress_review',
      name: 'Progress Review & Analysis',
      category: 'progress_review',
      systemPrompt: `You are Bud, a progress analysis coach. You help users understand their health data trends, celebrate achievements, identify areas for improvement, and adjust their strategies based on results.`,
      userPromptTemplate: `User message: "{userMessage}"

Current metrics: {healthMetrics}
Contextual factors: {contextualFactors}
Goals being tracked: {currentGoals}

Please analyze the user's progress, highlight positive trends, and provide recommendations for continued improvement.`,
      contextRequirements: ['userMessage', 'healthMetrics'],
      maxTokens: 600,
      temperature: 0.5
    });

    // Health concerns template
    this.templates.set('health_concerns', {
      id: 'health_concerns',
      name: 'Health Concerns & Wellness',
      category: 'health_concerns',
      systemPrompt: `You are Bud, a wellness coach who addresses health concerns with care and appropriate boundaries. You provide general wellness advice while always recommending professional medical consultation for health issues. You focus on supportive lifestyle modifications within your scope.`,
      userPromptTemplate: `User message: "{userMessage}"

Current health status: {healthMetrics}
Contextual factors: {contextualFactors}
Health goals: {currentGoals}

Please address the user's health concerns with appropriate care, provide general wellness advice, and recommend professional consultation when necessary.`,
      contextRequirements: ['userMessage'],
      maxTokens: 400,
      temperature: 0.5
    });

    // Habit formation template
    this.templates.set('habit_formation', {
      id: 'habit_formation',
      name: 'Habit Formation & Consistency',
      category: 'habit_formation',
      systemPrompt: `You are Bud, a habit formation coach who helps users build sustainable healthy habits. You focus on small, consistent changes, habit stacking, environmental design, and overcoming common obstacles to habit formation.`,
      userPromptTemplate: `User message: "{userMessage}"

Current patterns: {healthMetrics}
Contextual factors: {contextualFactors}
Habit goals: {currentGoals}

Please provide specific strategies for building or maintaining healthy habits, focusing on consistency and sustainable change.`,
      contextRequirements: ['userMessage'],
      maxTokens: 500,
      temperature: 0.7
    });
  }
}

/**
 * Context Analyzer helper class
 */
class ContextAnalyzer {
  /**
   * Analyze conversation context for prompt optimization
   */
  public analyzeContext(context: ConversationContext): {
    urgency: 'low' | 'medium' | 'high';
    complexity: 'simple' | 'moderate' | 'complex';
    emotionalState: 'positive' | 'neutral' | 'negative';
    topicFocus: string[];
  } {
    const urgency = this.assessUrgency(context);
    const complexity = this.assessComplexity(context);
    const emotionalState = this.assessEmotionalState(context);
    const topicFocus = this.extractTopicFocus(context);

    return {
      urgency,
      complexity,
      emotionalState,
      topicFocus
    };
  }

  private assessUrgency(context: ConversationContext): 'low' | 'medium' | 'high' {
    // Check for urgent keywords in recent messages
    const recentContent = context.conversationHistory
      .slice(-3)
      .map(msg => msg.content.toLowerCase())
      .join(' ');

    if (this.containsUrgentKeywords(recentContent)) {
      return 'high';
    }

    // Check health metrics for concerning values
    if (context.recentMetrics.stressLevel && context.recentMetrics.stressLevel > 8) {
      return 'high';
    }

    if (context.recentMetrics.sleepScore && context.recentMetrics.sleepScore < 4) {
      return 'medium';
    }

    return 'low';
  }

  private assessComplexity(context: ConversationContext): 'simple' | 'moderate' | 'complex' {
    const factorCount = context.contextualFactors.length;
    const goalCount = context.activeGoals.length;
    const historyLength = context.conversationHistory.length;

    if (factorCount > 5 || goalCount > 3 || historyLength > 20) {
      return 'complex';
    }

    if (factorCount > 2 || goalCount > 1 || historyLength > 5) {
      return 'moderate';
    }

    return 'simple';
  }

  private assessEmotionalState(context: ConversationContext): 'positive' | 'neutral' | 'negative' {
    if (!context.userMood) return 'neutral';

    const averageMood = (
      context.userMood.energy +
      context.userMood.motivation +
      context.userMood.confidence -
      context.userMood.stress
    ) / 4;

    if (averageMood > 6) return 'positive';
    if (averageMood < 4) return 'negative';
    return 'neutral';
  }

  private extractTopicFocus(context: ConversationContext): string[] {
    const topics = new Set<string>();
    
    // Add current topic
    topics.add(context.currentTopic.category);

    // Extract topics from recent messages
    const recentMessages = context.conversationHistory.slice(-5);
    for (const message of recentMessages) {
      if (message.context?.workoutContext) topics.add('fitness');
      if (message.context?.nutritionContext) topics.add('nutrition');
      if (message.context?.sleepContext) topics.add('sleep');
      if (message.context?.emotionalContext) topics.add('emotional');
    }

    return Array.from(topics);
  }

  private containsUrgentKeywords(content: string): boolean {
    const urgentKeywords = [
      'emergency', 'urgent', 'pain', 'injury', 'hurt', 'sick',
      'chest pain', 'difficulty breathing', 'severe', 'crisis'
    ];

    return urgentKeywords.some(keyword => content.includes(keyword));
  }
}