import { WorkoutPlan, WorkoutRecommendation } from '../types/workoutTypes';

export interface DemoWorkoutMapping {
  triggerPhrases: string[];
  workoutPlan: WorkoutPlan;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export class DemoWorkoutMappingService {
  private static instance: DemoWorkoutMappingService;
  private currentRecommendation: WorkoutRecommendation | null = null;

  private demoMappings: DemoWorkoutMapping[] = [
    {
      triggerPhrases: [
        'my back feels sore',
        'back pain',
        'sore back',
        'back hurts',
        'back is tight',
        'lower back pain'
      ],
      workoutPlan: {
        id: 'core-stability-light-cardio',
        name: 'Core Stability & Light Cardio',
        description: 'Gentle core strengthening and low-impact cardio to support your back recovery while maintaining fitness.',
        exercises: [{
          id: 'core-stability',
          name: 'Core Stability Routine',
          description: 'Gentle core exercises to support back health',
          category: 'strength',
          equipment: ['none'],
          difficulty: 'beginner',
          duration: 20,
          caloriesPerMinute: 4,
          instructions: [
            'Start with gentle pelvic tilts and bird dogs',
            'Progress to modified planks and dead bugs',
            'Focus on controlled movements and breathing',
            'Avoid any movements that cause pain'
          ],
          imageUrl: 'core-stability-icon'
        }],
        totalDuration: 25,
        estimatedCalories: 100,
        difficulty: 'beginner',
        equipment: ['none'],
        category: 'strength',
        tags: ['back-friendly', 'core', 'recovery', 'gentle']
      },
      reason: 'Perfect for your sore back! This gentle routine focuses on core stability and light cardio to support recovery.',
      priority: 'high'
    },
    {
      triggerPhrases: [
        'feeling tired',
        'low energy',
        'exhausted',
        'fatigue',
        'drained',
        'no energy'
      ],
      workoutPlan: {
        id: 'gentle-movement',
        name: 'Gentle Movement Flow',
        description: 'Light stretching and easy movement to boost energy without overwhelming your system.',
        exercises: [{
          id: 'gentle-flow',
          name: 'Gentle Movement',
          description: 'Light stretching and mobility work',
          category: 'flexibility',
          equipment: ['none'],
          difficulty: 'beginner',
          duration: 15,
          caloriesPerMinute: 3,
          instructions: [
            'Start with gentle neck and shoulder rolls',
            'Move through easy spinal twists',
            'Include light leg swings and arm circles',
            'Focus on breathing and gentle movement'
          ],
          imageUrl: 'gentle-flow-icon'
        }],
        totalDuration: 15,
        estimatedCalories: 45,
        difficulty: 'beginner',
        equipment: ['none'],
        category: 'flexibility',
        tags: ['energy-boost', 'gentle', 'recovery', 'mobility']
      },
      reason: 'When energy is low, gentle movement can help boost circulation and mood without draining you further.',
      priority: 'high'
    },
    {
      triggerPhrases: [
        'feeling great',
        'high energy',
        'energetic',
        'pumped up',
        'ready to go',
        'motivated'
      ],
      workoutPlan: {
        id: 'high-intensity-challenge',
        name: 'High-Intensity Challenge',
        description: 'Channel that energy into an intense workout that will push your limits and maximize results.',
        exercises: [{
          id: 'hiit-challenge',
          name: 'HIIT Challenge',
          description: 'High-intensity interval training for maximum impact',
          category: 'hiit',
          equipment: ['none'],
          difficulty: 'advanced',
          duration: 30,
          caloriesPerMinute: 15,
          instructions: [
            'Warm up with dynamic movements for 5 minutes',
            'Perform 8 rounds of 30 seconds work, 15 seconds rest',
            'Include burpees, mountain climbers, jump squats, and push-ups',
            'Cool down with stretching for 5 minutes'
          ],
          imageUrl: 'hiit-challenge-icon'
        }],
        totalDuration: 30,
        estimatedCalories: 450,
        difficulty: 'advanced',
        equipment: ['none'],
        category: 'hiit',
        tags: ['high-intensity', 'challenge', 'energy-burn', 'advanced']
      },
      reason: 'Your high energy levels are perfect for this challenging HIIT workout that will maximize your results!',
      priority: 'high'
    }
  ];

  private fallbackWorkouts: WorkoutPlan[] = [
    {
      id: 'morning-hiit',
      name: 'Morning HIIT Blast',
      description: 'Perfect for your energy level today! This workout will boost your metabolism and improve cardiovascular health.',
      exercises: [],
      totalDuration: 25,
      estimatedCalories: 300,
      difficulty: 'intermediate',
      equipment: ['none'],
      category: 'hiit',
      tags: ['morning', 'energy-boost', 'metabolism']
    },
    {
      id: 'cardio-endurance',
      name: 'Cardio Endurance',
      description: 'Build your cardiovascular endurance with this steady-state workout',
      exercises: [],
      totalDuration: 30,
      estimatedCalories: 300,
      difficulty: 'beginner',
      equipment: ['none'],
      category: 'cardio',
      tags: ['endurance', 'fat-burn', 'beginner-friendly']
    },
    {
      id: 'strength-builder',
      name: 'Strength Builder',
      description: 'Build lean muscle with this comprehensive strength workout',
      exercises: [],
      totalDuration: 35,
      estimatedCalories: 210,
      difficulty: 'intermediate',
      equipment: ['dumbbells'],
      category: 'strength',
      tags: ['muscle-building', 'strength', 'full-body']
    }
  ];

  public static getInstance(): DemoWorkoutMappingService {
    if (!DemoWorkoutMappingService.instance) {
      DemoWorkoutMappingService.instance = new DemoWorkoutMappingService();
    }
    return DemoWorkoutMappingService.instance;
  }

  public processMessage(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Check if message matches any demo trigger phrases
    for (const mapping of this.demoMappings) {
      const hasMatch = mapping.triggerPhrases.some(phrase => 
        lowerMessage.includes(phrase.toLowerCase())
      );
      
      if (hasMatch) {
        this.currentRecommendation = {
          id: `demo-rec-${Date.now()}`,
          workoutPlan: mapping.workoutPlan,
          reason: mapping.reason,
          priority: mapping.priority,
          basedOn: ['chat_input', 'demo_scenario'],
          scheduledFor: new Date()
        };
        return true;
      }
    }
    
    return false;
  }

  public getCurrentRecommendation(): WorkoutRecommendation | null {
    return this.currentRecommendation;
  }

  public clearCurrentRecommendation(): void {
    this.currentRecommendation = null;
  }

  public getFallbackRecommendations(): WorkoutRecommendation[] {
    return this.fallbackWorkouts.map((workout, index) => ({
      id: `fallback-rec-${index}`,
      workoutPlan: workout,
      reason: 'Based on your fitness goals and preferences',
      priority: index === 0 ? 'high' : 'medium',
      basedOn: ['fitness_goals', 'preferences'],
      scheduledFor: new Date()
    }));
  }

  public getRecommendationsWithDemo(): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];
    
    // Add current demo recommendation if available
    if (this.currentRecommendation) {
      recommendations.push(this.currentRecommendation);
    }
    
    // Add fallback recommendations (but limit to avoid too many)
    const fallbackRecs = this.getFallbackRecommendations();
    const remainingSlots = Math.max(0, 3 - recommendations.length);
    recommendations.push(...fallbackRecs.slice(0, remainingSlots));
    
    return recommendations;
  }

  public resetDemo(): void {
    this.currentRecommendation = null;
  }
}

export const demoWorkoutMappingService = DemoWorkoutMappingService.getInstance();