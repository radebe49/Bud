/**
 * Comprehensive mock response database for Bud's conversational AI
 * Provides contextual health coaching responses for demo reliability
 */

import { ConversationContext, ActionSuggestion, Topic } from '../types/coachingTypes';
import { UUID } from '@/shared/types/globalTypes';

export interface MockResponse {
  content: string;
  followUpQuestions?: string[];
  suggestions?: Partial<ActionSuggestion>[];
  priority?: 'low' | 'medium' | 'high';
}

export interface ResponseCategory {
  [key: string]: MockResponse[];
}

export class MockResponseDatabase {
  private static instance: MockResponseDatabase;
  private responses: Record<string, ResponseCategory> = {};

  private constructor() {
    this.initializeResponses();
  }

  public static getInstance(): MockResponseDatabase {
    if (!MockResponseDatabase.instance) {
      MockResponseDatabase.instance = new MockResponseDatabase();
    }
    return MockResponseDatabase.instance;
  }

  private initializeResponses() {
    this.responses = {
      // Greeting and initial interactions
      greetings: {
        morning: [
          {
            content: "Good morning! I'm Bud, your AI health coach. How are you feeling today? Ready to make it a great day for your health?",
            followUpQuestions: ["How did you sleep last night?", "What's your energy level like this morning?"],
            suggestions: [
              { type: 'log_workout', title: 'Plan morning workout', category: 'fitness' },
              { type: 'track_meal', title: 'Log breakfast', category: 'nutrition' }
            ]
          },
          {
            content: "Hey there! Hope you're having a wonderful morning. I'm here to help you stay on track with your health goals today.",
            followUpQuestions: ["What are your priorities for today?", "How's your morning routine going?"],
            suggestions: [
              { type: 'log_water', title: 'Track morning hydration', category: 'nutrition' },
              { type: 'view_progress', title: 'Check yesterday\'s progress', category: 'tracking' }
            ]
          }
        ],
        afternoon: [
          {
            content: "Good afternoon! How's your day going so far? I'm here to help you stay energized and focused on your health goals.",
            followUpQuestions: ["How are your energy levels?", "Have you been staying hydrated?"],
            suggestions: [
              { type: 'track_meal', title: 'Log lunch', category: 'nutrition' },
              { type: 'start_meditation', title: 'Quick stress break', category: 'stress' }
            ]
          }
        ],
        evening: [
          {
            content: "Good evening! How was your day? Let's review your progress and plan for a restful night.",
            followUpQuestions: ["How did your workouts go today?", "Are you winding down for the evening?"],
            suggestions: [
              { type: 'view_progress', title: 'Review today\'s progress', category: 'tracking' },
              { type: 'schedule_rest', title: 'Plan bedtime routine', category: 'sleep' }
            ]
          }
        ],
        general: [
          {
            content: "Hi! I'm Bud, your personal AI health coach. I'm here to help you with fitness, nutrition, sleep, and overall wellness. What would you like to focus on today?",
            followUpQuestions: ["What are your main health goals?", "How can I help you today?"],
            suggestions: [
              { type: 'plan_workout', title: 'Plan a workout', category: 'fitness' },
              { type: 'track_meal', title: 'Log a meal', category: 'nutrition' },
              { type: 'view_progress', title: 'Check your progress', category: 'tracking' }
            ]
          }
        ]
      },

      // Sleep-related responses
      sleep: {
        good_sleep: [
          {
            content: "That's fantastic! {hours} hours of quality sleep sets you up for a great day. Your body has had time to recover and recharge.",
            followUpQuestions: ["How's your energy level this morning?", "Ready for a productive workout today?"],
            suggestions: [
              { type: 'plan_workout', title: 'Plan energizing workout', category: 'fitness', priority: 'high' },
              { type: 'track_meal', title: 'Log nutritious breakfast', category: 'nutrition' }
            ]
          },
          {
            content: "Excellent sleep! {hours} hours is right in the sweet spot. Your recovery score should be looking good today.",
            followUpQuestions: ["Did you wake up feeling refreshed?", "Any dreams you remember?"],
            suggestions: [
              { type: 'log_workout', title: 'Take advantage of good energy', category: 'fitness' }
            ]
          }
        ],
        poor_sleep: [
          {
            content: "I see you only got {hours} hours of sleep. That's tough! Let's adjust today's plan to support your recovery and energy levels.",
            followUpQuestions: ["What kept you up last night?", "How are you feeling right now?"],
            suggestions: [
              { type: 'plan_workout', title: 'Light recovery workout', category: 'fitness', priority: 'medium' },
              { type: 'start_meditation', title: 'Energy-boosting meditation', category: 'stress' },
              { type: 'schedule_rest', title: 'Plan better sleep tonight', category: 'sleep' }
            ]
          },
          {
            content: "Only {hours} hours? Your body needs more rest to perform at its best. Let's focus on gentle activities today and improve tonight's sleep.",
            followUpQuestions: ["Are you feeling tired or surprisingly okay?", "What's your sleep environment like?"],
            suggestions: [
              { type: 'log_water', title: 'Stay extra hydrated', category: 'nutrition' },
              { type: 'schedule_rest', title: 'Plan early bedtime', category: 'sleep' }
            ]
          }
        ],
        sleep_tips: [
          {
            content: "Here are some proven strategies for better sleep: Keep your room cool (65-68°F), avoid screens 1 hour before bed, and try a consistent bedtime routine.",
            followUpQuestions: ["Which of these could you try tonight?", "What's your current bedtime routine like?"],
            suggestions: [
              { type: 'schedule_rest', title: 'Set bedtime reminder', category: 'sleep' },
              { type: 'start_meditation', title: 'Try bedtime meditation', category: 'stress' }
            ]
          }
        ]
      },

      // Workout and fitness responses
      fitness: {
        workout_completed: [
          {
            content: "Amazing work! 🎉 You crushed that {workoutType} workout. How are you feeling? Your body is getting stronger with every session.",
            followUpQuestions: ["How challenging was it on a scale of 1-10?", "How's your energy level now?"],
            suggestions: [
              { type: 'track_meal', title: 'Log post-workout nutrition', category: 'nutrition', priority: 'high' },
              { type: 'log_water', title: 'Rehydrate', category: 'nutrition' },
              { type: 'schedule_rest', title: 'Plan recovery time', category: 'sleep' }
            ]
          },
          {
            content: "Fantastic! That {workoutType} session is going to pay dividends for your health. I'm proud of your consistency!",
            followUpQuestions: ["Did you hit your target intensity?", "Any exercises that felt particularly good?"],
            suggestions: [
              { type: 'track_meal', title: 'Fuel your recovery', category: 'nutrition' },
              { type: 'view_progress', title: 'See your fitness progress', category: 'tracking' }
            ]
          }
        ],
        workout_planning: [
          {
            content: "Let's plan a great workout for you! Based on your goals and available equipment, I have some excellent options.",
            followUpQuestions: ["How much time do you have?", "What's your energy level like?", "Any specific muscle groups you want to focus on?"],
            suggestions: [
              { type: 'plan_workout', title: 'Quick 20-min HIIT', category: 'fitness' },
              { type: 'plan_workout', title: 'Strength training', category: 'fitness' },
              { type: 'plan_workout', title: 'Recovery yoga', category: 'fitness' }
            ]
          }
        ],
        low_energy_workout: [
          {
            content: "I hear you're feeling low on energy. That's totally normal! Let's do something gentle that will actually boost your energy levels.",
            followUpQuestions: ["Would you prefer stretching, light cardio, or yoga?", "How much time can you spare?"],
            suggestions: [
              { type: 'plan_workout', title: '10-min energizing walk', category: 'fitness' },
              { type: 'plan_workout', title: 'Gentle yoga flow', category: 'fitness' },
              { type: 'start_meditation', title: 'Energy meditation', category: 'stress' }
            ]
          }
        ],
        high_energy_workout: [
          {
            content: "I love that energy! 🔥 Let's channel it into an amazing workout that will challenge you and help you reach your goals.",
            followUpQuestions: ["Ready for a high-intensity session?", "Want to try something new today?"],
            suggestions: [
              { type: 'plan_workout', title: 'HIIT challenge', category: 'fitness', priority: 'high' },
              { type: 'plan_workout', title: 'Strength circuit', category: 'fitness' },
              { type: 'plan_workout', title: 'Cardio blast', category: 'fitness' }
            ]
          }
        ],
        back_pain_response: [
          {
            content: "I understand your back is feeling sore today. Let's focus on core stability and light cardio instead of heavy squats. I've updated your recommended workout to be back-friendly!",
            followUpQuestions: ["How long has your back been bothering you?", "Is it lower back or upper back?"],
            suggestions: [
              { type: 'plan_workout', title: 'Core stability routine', category: 'fitness', priority: 'high' },
              { type: 'start_meditation', title: 'Pain relief stretches', category: 'stress' },
              { type: 'track_meal', title: 'Anti-inflammatory foods', category: 'nutrition' }
            ]
          }
        ],
        fatigue_response: [
          {
            content: "When you're feeling tired, gentle movement can actually help boost your energy. I've adjusted your workout recommendations to focus on light, energizing activities.",
            followUpQuestions: ["How did you sleep last night?", "Have you been staying hydrated?"],
            suggestions: [
              { type: 'plan_workout', title: 'Gentle movement flow', category: 'fitness', priority: 'high' },
              { type: 'log_water', title: 'Check hydration', category: 'nutrition' },
              { type: 'start_meditation', title: 'Energy meditation', category: 'stress' }
            ]
          }
        ]
      },

      // Nutrition and meal responses
      nutrition: {
        meal_logged: [
          {
            content: "Great job logging your {mealType}! That sounds delicious and nutritious. How satisfied do you feel after eating?",
            followUpQuestions: ["Are you feeling satisfied and energized?", "How's your hydration today?"],
            suggestions: [
              { type: 'log_water', title: 'Track water intake', category: 'nutrition' },
              { type: 'view_progress', title: 'Check nutrition goals', category: 'tracking' }
            ]
          },
          {
            content: "Perfect! I've logged your {mealType}. Your nutrition tracking helps me give you better personalized advice.",
            followUpQuestions: ["How are your energy levels after eating?", "Any cravings or hunger?"],
            suggestions: [
              { type: 'get_recipe', title: 'Get healthy recipe ideas', category: 'nutrition' }
            ]
          }
        ],
        hydration: [
          {
            content: "Excellent hydration! {amount} of water is fantastic. Staying hydrated boosts your energy, improves focus, and supports recovery.",
            followUpQuestions: ["How are you feeling overall today?", "Have you noticed better energy with good hydration?"],
            suggestions: [
              { type: 'set_reminder', title: 'Set hydration reminders', category: 'tracking' }
            ]
          }
        ],
        nutrition_advice: [
          {
            content: "For optimal energy and recovery, focus on balanced meals with protein, healthy fats, and complex carbs. Think colorful plates!",
            followUpQuestions: ["What's your biggest nutrition challenge?", "Any foods you're trying to eat more or less of?"],
            suggestions: [
              { type: 'get_recipe', title: 'Get balanced meal ideas', category: 'nutrition' },
              { type: 'track_meal', title: 'Log your next meal', category: 'nutrition' }
            ]
          }
        ]
      },

      // Stress and mental health responses
      stress: {
        high_stress: [
          {
            content: "I can see you're dealing with high stress right now. That's completely understandable - life can be overwhelming sometimes. Let's work on some strategies to help you feel better.",
            followUpQuestions: ["What's contributing most to your stress today?", "Would you like to try a quick stress-relief technique?"],
            suggestions: [
              { type: 'start_meditation', title: '5-min breathing exercise', category: 'stress', priority: 'high' },
              { type: 'plan_workout', title: 'Stress-relief walk', category: 'fitness' },
              { type: 'schedule_rest', title: 'Plan relaxation time', category: 'sleep' }
            ]
          }
        ],
        low_stress: [
          {
            content: "That's wonderful! Low stress levels are fantastic for your overall health and recovery. You're in a great headspace to tackle your goals.",
            followUpQuestions: ["What's been helping keep your stress low?", "Ready to take on some challenges today?"],
            suggestions: [
              { type: 'plan_workout', title: 'Challenging workout', category: 'fitness' },
              { type: 'adjust_goal', title: 'Set new goals', category: 'planning' }
            ]
          }
        ],
        stress_management: [
          {
            content: "Stress management is crucial for your health journey. Regular exercise, good sleep, and mindfulness practices are your best tools.",
            followUpQuestions: ["Which stress management technique works best for you?", "How has stress been affecting your sleep or workouts?"],
            suggestions: [
              { type: 'start_meditation', title: 'Try guided meditation', category: 'stress' },
              { type: 'plan_workout', title: 'Stress-busting workout', category: 'fitness' }
            ]
          }
        ]
      },

      // Progress and motivation responses
      progress: {
        celebration: [
          {
            content: "🎉 Incredible progress! You've been so consistent with your health journey. Look how far you've come - you should be proud!",
            followUpQuestions: ["How does it feel to see this progress?", "What's been the biggest game-changer for you?"],
            suggestions: [
              { type: 'adjust_goal', title: 'Set new challenge', category: 'planning' },
              { type: 'view_progress', title: 'See detailed progress', category: 'tracking' }
            ]
          }
        ],
        encouragement: [
          {
            content: "Remember, every small step counts! Health is a journey, not a destination. You're building habits that will serve you for life.",
            followUpQuestions: ["What's one thing you're proud of this week?", "How can I better support you?"],
            suggestions: [
              { type: 'view_progress', title: 'See your wins', category: 'tracking' },
              { type: 'adjust_goal', title: 'Adjust goals if needed', category: 'planning' }
            ]
          }
        ],
        plateau: [
          {
            content: "Plateaus are totally normal and actually a sign that your body is adapting! Let's shake things up with some new strategies.",
            followUpQuestions: ["How long have you been feeling stuck?", "Ready to try something different?"],
            suggestions: [
              { type: 'plan_workout', title: 'Try new workout style', category: 'fitness' },
              { type: 'adjust_goal', title: 'Revise your approach', category: 'planning' }
            ]
          }
        ]
      },

      // General health and wellness
      general: {
        health_check: [
          {
            content: "I'm here to help with all aspects of your health - fitness, nutrition, sleep, stress management, and more. What would you like to focus on today?",
            followUpQuestions: ["What's your biggest health priority right now?", "How are you feeling overall?"],
            suggestions: [
              { type: 'view_progress', title: 'Check overall progress', category: 'tracking' },
              { type: 'plan_workout', title: 'Plan today\'s activity', category: 'fitness' },
              { type: 'track_meal', title: 'Log a meal', category: 'nutrition' }
            ]
          }
        ],
        goal_setting: [
          {
            content: "Setting clear, achievable goals is the foundation of success! Let's make sure your goals are specific, measurable, and realistic for your lifestyle.",
            followUpQuestions: ["What's your main health goal right now?", "What timeline feels realistic for you?"],
            suggestions: [
              { type: 'adjust_goal', title: 'Set SMART goals', category: 'planning' },
              { type: 'plan_workout', title: 'Plan goal-focused workout', category: 'fitness' }
            ]
          }
        ]
      },

      // Contextual responses based on time and patterns
      contextual: {
        morning_motivation: [
          {
            content: "Good morning, champion! Today is a fresh start and a new opportunity to invest in your health. What's one healthy choice you can make right now?",
            suggestions: [
              { type: 'log_water', title: 'Start with hydration', category: 'nutrition' },
              { type: 'plan_workout', title: 'Plan morning movement', category: 'fitness' }
            ]
          }
        ],
        evening_reflection: [
          {
            content: "As the day winds down, let's reflect on your health wins today. Every positive choice you made is building toward your bigger goals.",
            followUpQuestions: ["What went well with your health today?", "What would you do differently tomorrow?"],
            suggestions: [
              { type: 'view_progress', title: 'Review today\'s progress', category: 'tracking' },
              { type: 'schedule_rest', title: 'Plan recovery', category: 'sleep' }
            ]
          }
        ]
      }
    };
  }

  public getResponse(
    category: string,
    subcategory: string,
    context?: ConversationContext
  ): MockResponse | null {
    const categoryResponses = this.responses[category];
    if (!categoryResponses) return null;

    const subcategoryResponses = categoryResponses[subcategory];
    if (!subcategoryResponses || subcategoryResponses.length === 0) return null;

    // Select response based on context or randomly
    const selectedResponse = this.selectContextualResponse(subcategoryResponses, context);
    
    return selectedResponse;
  }

  public getResponsesByPattern(pattern: string): MockResponse[] {
    const allResponses: MockResponse[] = [];
    
    Object.values(this.responses).forEach(category => {
      Object.values(category).forEach(subcategory => {
        subcategory.forEach(response => {
          if (response.content.toLowerCase().includes(pattern.toLowerCase())) {
            allResponses.push(response);
          }
        });
      });
    });

    return allResponses;
  }

  public getRandomResponse(category: string): MockResponse | null {
    const categoryResponses = this.responses[category];
    if (!categoryResponses) return null;

    const allSubcategoryResponses = Object.values(categoryResponses).flat();
    if (allSubcategoryResponses.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * allSubcategoryResponses.length);
    return allSubcategoryResponses[randomIndex];
  }

  private selectContextualResponse(
    responses: MockResponse[],
    context?: ConversationContext
  ): MockResponse {
    if (!context || responses.length === 1) {
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Simple contextual selection based on time of day
    const hour = new Date().getHours();
    
    // Prefer different responses based on time
    if (hour >= 6 && hour < 12) {
      // Morning - prefer energizing responses
      const morningResponses = responses.filter(r => 
        r.content.includes('morning') || 
        r.content.includes('energy') || 
        r.content.includes('start')
      );
      if (morningResponses.length > 0) {
        return morningResponses[Math.floor(Math.random() * morningResponses.length)];
      }
    } else if (hour >= 18 && hour < 23) {
      // Evening - prefer reflective responses
      const eveningResponses = responses.filter(r => 
        r.content.includes('evening') || 
        r.content.includes('day') || 
        r.content.includes('progress')
      );
      if (eveningResponses.length > 0) {
        return eveningResponses[Math.floor(Math.random() * eveningResponses.length)];
      }
    }

    // Default to random selection
    return responses[Math.floor(Math.random() * responses.length)];
  }

  public getAllCategories(): string[] {
    return Object.keys(this.responses);
  }

  public getSubcategories(category: string): string[] {
    const categoryResponses = this.responses[category];
    return categoryResponses ? Object.keys(categoryResponses) : [];
  }
}