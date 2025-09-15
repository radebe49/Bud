import { 
  Exercise, 
  WorkoutPlan, 
  WorkoutSession, 
  WorkoutRecommendation, 
  WorkoutStreak, 
  Achievement,
  WorkoutPreferences,
  Equipment 
} from '../types/workoutTypes';
import { demoWorkoutMappingService } from './demoWorkoutMappings';

class WorkoutService {
  private exercises: Exercise[] = [
    {
      id: 'running',
      name: 'Running',
      description: 'Outdoor or treadmill running for cardiovascular fitness',
      category: 'cardio',
      equipment: ['none'],
      difficulty: 'beginner',
      duration: 30,
      caloriesPerMinute: 10,
      instructions: [
        'Start with a 5-minute warm-up walk',
        'Gradually increase pace to comfortable running speed',
        'Maintain steady breathing throughout',
        'Cool down with 5-minute walk'
      ],
      imageUrl: 'running-icon'
    },
    {
      id: 'hiit-bodyweight',
      name: 'HIIT Bodyweight',
      description: 'High-intensity interval training using bodyweight exercises',
      category: 'hiit',
      equipment: ['none'],
      difficulty: 'intermediate',
      duration: 25,
      caloriesPerMinute: 12,
      instructions: [
        'Perform each exercise for 45 seconds',
        'Rest for 15 seconds between exercises',
        'Complete 4 rounds total',
        'Exercises: Burpees, Mountain Climbers, Jump Squats, Push-ups'
      ],
      imageUrl: 'hiit-icon'
    },
    {
      id: 'cycling',
      name: 'Cycling',
      description: 'Indoor or outdoor cycling workout',
      category: 'cardio',
      equipment: ['stationary_bike'],
      difficulty: 'beginner',
      duration: 40,
      caloriesPerMinute: 8,
      instructions: [
        'Start with 5-minute easy pace warm-up',
        'Alternate between moderate and high intensity',
        'Maintain proper posture throughout',
        'Cool down with easy pace for 5 minutes'
      ],
      imageUrl: 'cycling-icon'
    },
    {
      id: 'strength-dumbbells',
      name: 'Dumbbell Strength',
      description: 'Full-body strength training with dumbbells',
      category: 'strength',
      equipment: ['dumbbells'],
      difficulty: 'intermediate',
      duration: 35,
      caloriesPerMinute: 6,
      instructions: [
        'Perform 3 sets of 8-12 reps for each exercise',
        'Rest 60-90 seconds between sets',
        'Focus on proper form over heavy weight',
        'Include: Squats, Chest Press, Rows, Shoulder Press'
      ],
      imageUrl: 'strength-icon'
    }
  ];

  private workoutPlans: WorkoutPlan[] = [
    {
      id: 'morning-hiit',
      name: 'Morning HIIT Blast',
      description: 'Perfect for your energy level today! This workout will boost your metabolism and improve cardiovascular health.',
      exercises: [this.exercises[1]], // HIIT Bodyweight
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
      exercises: [this.exercises[0]], // Running
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
      exercises: [this.exercises[3]], // Dumbbell Strength
      totalDuration: 35,
      estimatedCalories: 210,
      difficulty: 'intermediate',
      equipment: ['dumbbells'],
      category: 'strength',
      tags: ['muscle-building', 'strength', 'full-body']
    }
  ];

  private workoutHistory: WorkoutSession[] = [
    {
      id: 'session-1',
      workoutPlanId: 'cardio-endurance',
      workoutName: '30-min Morning Run',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      duration: 30,
      caloriesBurned: 285,
      exercises: [{
        exerciseId: 'running',
        exerciseName: 'Running',
        duration: 30,
        distance: 3.2
      }],
      rating: 4,
      completed: true
    },
    {
      id: 'session-2',
      workoutPlanId: 'morning-hiit',
      workoutName: 'HIIT Bodyweight',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
      duration: 25,
      caloriesBurned: 320,
      exercises: [{
        exerciseId: 'hiit-bodyweight',
        exerciseName: 'HIIT Bodyweight',
        duration: 25
      }],
      rating: 5,
      completed: true
    }
  ];

  private achievements: Achievement[] = [
    {
      id: 'first-workout',
      title: 'First Steps',
      description: 'Complete your first workout',
      icon: '🎯',
      unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      progress: 100,
      target: 1,
      category: 'milestone'
    },
    {
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Work out 5 times in a week',
      icon: '🔥',
      progress: 40,
      target: 5,
      category: 'streak'
    },
    {
      id: 'calorie-burner',
      title: 'Calorie Crusher',
      description: 'Burn 1000 calories in workouts',
      icon: '⚡',
      progress: 60,
      target: 1000,
      category: 'calories'
    }
  ];

  async getRecommendedWorkouts(preferences?: WorkoutPreferences): Promise<WorkoutRecommendation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if we have demo-based recommendations
    const demoRecommendations = demoWorkoutMappingService.getRecommendationsWithDemo();
    if (demoRecommendations.length > 0) {
      return demoRecommendations;
    }
    
    // Fallback to default recommendations
    return [
      {
        id: 'rec-1',
        workoutPlan: this.workoutPlans[0], // Morning HIIT
        reason: 'Based on your high energy level and morning preference',
        priority: 'high',
        basedOn: ['energy_level', 'time_preference', 'equipment_available'],
        scheduledFor: new Date()
      },
      {
        id: 'rec-2',
        workoutPlan: this.workoutPlans[1], // Cardio Endurance
        reason: 'Great for building cardiovascular fitness',
        priority: 'medium',
        basedOn: ['fitness_goals', 'beginner_friendly'],
      }
    ];
  }

  async getExerciseLibrary(): Promise<Exercise[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.exercises;
  }

  async getWorkoutHistory(limit: number = 10): Promise<WorkoutSession[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.workoutHistory.slice(0, limit);
  }

  async getWorkoutStreak(): Promise<WorkoutStreak> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const now = new Date();
    const lastWorkout = this.workoutHistory[0]?.startTime;
    const daysSinceLastWorkout = lastWorkout ? 
      Math.floor((now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    return {
      currentStreak: daysSinceLastWorkout <= 1 ? 2 : 0,
      longestStreak: 5,
      lastWorkoutDate: lastWorkout,
      weeklyGoal: 4,
      weeklyCompleted: 2
    };
  }

  async getAchievements(): Promise<Achievement[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.achievements;
  }

  async startWorkout(workoutPlanId: string): Promise<WorkoutSession> {
    const workoutPlan = this.workoutPlans.find(plan => plan.id === workoutPlanId);
    if (!workoutPlan) {
      throw new Error('Workout plan not found');
    }

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      workoutPlanId,
      workoutName: workoutPlan.name,
      startTime: new Date(),
      duration: 0,
      caloriesBurned: 0,
      exercises: [],
      completed: false
    };

    return session;
  }

  async completeWorkout(sessionId: string, session: Partial<WorkoutSession>): Promise<WorkoutSession> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const completedSession: WorkoutSession = {
      id: sessionId,
      workoutPlanId: session.workoutPlanId || '',
      workoutName: session.workoutName || '',
      startTime: session.startTime || new Date(),
      endTime: new Date(),
      duration: session.duration || 0,
      caloriesBurned: session.caloriesBurned || 0,
      exercises: session.exercises || [],
      rating: session.rating,
      notes: session.notes,
      completed: true
    };

    // Add to history
    this.workoutHistory.unshift(completedSession);
    
    return completedSession;
  }

  async getWorkoutsByEquipment(equipment: Equipment[]): Promise<WorkoutPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.workoutPlans.filter(plan => 
      plan.equipment.some(eq => equipment.includes(eq) || eq === 'none')
    );
  }

  /**
   * Process a chat message to potentially update workout recommendations
   * @param message The user's chat message
   * @returns true if the message triggered a workout recommendation update
   */
  processChatMessage(message: string): boolean {
    return demoWorkoutMappingService.processMessage(message);
  }

  /**
   * Reset demo state to default recommendations
   */
  resetDemoState(): void {
    demoWorkoutMappingService.resetDemo();
  }

  /**
   * Get the current demo recommendation if any
   */
  getCurrentDemoRecommendation(): WorkoutRecommendation | null {
    return demoWorkoutMappingService.getCurrentRecommendation();
  }
}

export const workoutService = new WorkoutService();