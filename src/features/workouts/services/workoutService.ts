import { 
  Exercise, 
  WorkoutPlan, 
  WorkoutSession, 
  WorkoutRecommendation, 
  WorkoutStreak, 
  Achievement,
  WorkoutPreferences,
  Equipment,
  ProgressMetric,
  WorkoutGoal,
  AdaptationReason,
  ExerciseCategory,
  MuscleGroup
} from '../types/workoutTypes';
import { HealthMetrics } from '../../../shared/types/healthTypes';
import { demoWorkoutMappingService } from './demoWorkoutMappings';
import { workoutAdaptationService } from './workoutAdaptationService';

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
      muscleGroups: ['full_body'],
      modifications: [
        { type: 'easier', description: 'Walk-run intervals for beginners' },
        { type: 'harder', description: 'Add hill intervals or increase pace' }
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
      muscleGroups: ['full_body'],
      modifications: [
        { type: 'easier', description: 'Reduce work time to 30 seconds, increase rest to 30 seconds' },
        { type: 'harder', description: 'Add weights or increase work time to 60 seconds' }
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
      muscleGroups: ['quadriceps', 'hamstrings', 'calves'],
      modifications: [
        { type: 'easier', description: 'Maintain steady moderate pace throughout' },
        { type: 'harder', description: 'Add sprint intervals every 5 minutes' }
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
      muscleGroups: ['full_body'],
      modifications: [
        { type: 'easier', description: 'Use lighter weights, reduce to 2 sets' },
        { type: 'harder', description: 'Increase weight, add drop sets' }
      ],
      sets: 3,
      reps: 12,
      restTime: 75,
      imageUrl: 'strength-icon'
    },
    {
      id: 'yoga-flow',
      name: 'Yoga Flow',
      description: 'Dynamic yoga sequence for flexibility and strength',
      category: 'yoga',
      equipment: ['yoga_mat'],
      difficulty: 'beginner',
      duration: 30,
      caloriesPerMinute: 3,
      instructions: [
        'Begin in mountain pose with deep breathing',
        'Flow through sun salutations',
        'Hold warrior poses for 30 seconds each',
        'End with relaxation pose'
      ],
      muscleGroups: ['full_body'],
      modifications: [
        { type: 'easier', description: 'Use blocks and straps for support' },
        { type: 'injury_adaptation', description: 'Seated variations for knee injuries', targetCondition: 'knee injury' }
      ],
      imageUrl: 'yoga-icon'
    },
    {
      id: 'push-ups',
      name: 'Push-ups',
      description: 'Classic upper body strength exercise',
      category: 'strength',
      equipment: ['none'],
      difficulty: 'beginner',
      duration: 10,
      caloriesPerMinute: 8,
      instructions: [
        'Start in plank position with hands shoulder-width apart',
        'Lower body until chest nearly touches ground',
        'Push back up to starting position',
        'Keep core engaged throughout'
      ],
      muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
      modifications: [
        { type: 'easier', description: 'Knee push-ups or wall push-ups' },
        { type: 'harder', description: 'Diamond push-ups or weighted push-ups' }
      ],
      sets: 3,
      reps: 15,
      restTime: 60,
      imageUrl: 'pushup-icon'
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

  /**
   * Generate personalized workout plan based on user goals and equipment
   */
  async generateWorkoutPlan(
    goals: WorkoutGoal[], 
    equipment: Equipment[], 
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced',
    availableTime: number, // minutes per session
    sessionsPerWeek: number
  ): Promise<WorkoutPlan> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter exercises based on equipment and fitness level
    const availableExercises = this.exercises.filter(exercise => 
      exercise.equipment.some(eq => equipment.includes(eq) || eq === 'none') &&
      (fitnessLevel === 'advanced' || exercise.difficulty !== 'advanced') &&
      exercise.duration <= availableTime
    );

    // Create workout plan based on goals
    const planExercises = this.selectExercisesForGoals(availableExercises, goals, availableTime);

    const workoutPlan: WorkoutPlan = {
      id: `plan-${Date.now()}`,
      userId: 'current-user',
      name: `${goals.join(' & ').replace(/_/g, ' ')} Plan`,
      description: `Personalized ${sessionsPerWeek}x/week plan for ${goals.join(' and ').replace(/_/g, ' ')}`,
      weeklyGoals: goals.map(goal => ({
        id: `goal-${goal}`,
        type: goal === 'weight_loss' ? 'calories_burned' : 'weekly_workouts',
        target: goal === 'weight_loss' ? 2000 : sessionsPerWeek,
        current: 0,
        unit: goal === 'weight_loss' ? 'calories' : 'sessions',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'high'
      })),
      dailyWorkouts: [],
      adaptations: [],
      progressMetrics: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    return workoutPlan;
  }

  /**
   * Adapt workout based on readiness scores and user feedback
   */
  async adaptWorkout(
    originalWorkout: WorkoutPlan,
    healthMetrics: HealthMetrics,
    userFeedback?: string
  ): Promise<WorkoutPlan> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Use the adaptation service for more sophisticated adaptation logic
    const adaptations = workoutAdaptationService.generateAdaptations(
      originalWorkout,
      healthMetrics,
      userFeedback
    );

    const adaptedWorkout = workoutAdaptationService.applyAdaptations(
      originalWorkout,
      adaptations
    );

    return adaptedWorkout;
  }

  /**
   * Calculate readiness score for workout recommendations
   */
  async calculateReadinessScore(healthMetrics: HealthMetrics): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return workoutAdaptationService.calculateReadinessScore(healthMetrics);
  }

  /**
   * Get alternative exercises for injuries or limitations
   */
  async getAlternativeExercises(
    exerciseId: string,
    injuryType?: string
  ): Promise<Exercise[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const originalExercise = this.exercises.find(ex => ex.id === exerciseId);
    if (!originalExercise) return [];

    if (injuryType) {
      return workoutAdaptationService.getAlternativeExercises(originalExercise, injuryType);
    }

    // Return general modifications if no specific injury type
    return this.getExerciseModifications(exerciseId);
  }

  /**
   * Track workout progress and performance
   */
  async trackProgress(
    sessionId: string,
    exerciseId: string,
    metric: ProgressMetric
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In a real app, this would save to database
    console.log(`Progress tracked for session ${sessionId}, exercise ${exerciseId}:`, metric);
  }

  /**
   * Get performance trends and analysis
   */
  async getPerformanceTrends(
    userId: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<{
    trends: ProgressMetric[];
    insights: string[];
    recommendations: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock performance data
    const trends: ProgressMetric[] = [
      {
        id: 'trend-1',
        metric: 'calories_burned',
        value: 1850,
        unit: 'calories',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        notes: 'Weekly total'
      },
      {
        id: 'trend-2',
        metric: 'duration_improved',
        value: 15,
        unit: 'minutes',
        date: new Date(),
        notes: 'Average session increase'
      }
    ];

    const insights = [
      'Your workout consistency has improved 23% this month',
      'Strength exercises show 12% improvement in weight lifted',
      'Cardio endurance increased by 8 minutes on average'
    ];

    const recommendations = [
      'Consider adding one more strength session per week',
      'Your recovery metrics suggest you can handle higher intensity',
      'Try incorporating yoga for better flexibility scores'
    ];

    return { trends, insights, recommendations };
  }

  /**
   * Get exercises filtered by category and muscle groups
   */
  async getExercisesByCategory(
    category?: ExerciseCategory,
    muscleGroups?: MuscleGroup[],
    equipment?: Equipment[]
  ): Promise<Exercise[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    let filtered = this.exercises;

    if (category) {
      filtered = filtered.filter(ex => ex.category === category);
    }

    if (muscleGroups && muscleGroups.length > 0) {
      filtered = filtered.filter(ex => 
        ex.muscleGroups.some(mg => muscleGroups.includes(mg))
      );
    }

    if (equipment && equipment.length > 0) {
      filtered = filtered.filter(ex =>
        ex.equipment.some(eq => equipment.includes(eq) || eq === 'none')
      );
    }

    return filtered;
  }

  /**
   * Get exercise modifications for injuries or limitations
   */
  async getExerciseModifications(
    exerciseId: string,
    condition?: string
  ): Promise<Exercise[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const exercise = this.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return [];

    // Return modified versions of the exercise
    const modifications = exercise.modifications
      .filter(mod => !condition || mod.targetCondition === condition)
      .map(mod => ({
        ...exercise,
        id: `${exercise.id}-${mod.type}`,
        name: `${exercise.name} (${mod.type})`,
        description: mod.description,
        difficulty: mod.type === 'easier' ? 'beginner' : 
                   mod.type === 'harder' ? 'advanced' : exercise.difficulty
      }));

    return modifications;
  }

  /**
   * Private helper method to select exercises based on goals
   */
  private selectExercisesForGoals(
    availableExercises: Exercise[],
    goals: WorkoutGoal[],
    timeLimit: number
  ): Exercise[] {
    const selected: Exercise[] = [];
    let totalTime = 0;

    // Prioritize exercises based on goals
    const priorityMap: Record<WorkoutGoal, ExerciseCategory[]> = {
      weight_loss: ['cardio', 'hiit'],
      muscle_gain: ['strength'],
      endurance: ['cardio'],
      strength: ['strength'],
      flexibility: ['yoga', 'flexibility'],
      general_fitness: ['cardio', 'strength', 'hiit']
    };

    for (const goal of goals) {
      const preferredCategories = priorityMap[goal] || ['cardio'];
      
      for (const category of preferredCategories) {
        const categoryExercises = availableExercises.filter(ex => 
          ex.category === category && !selected.includes(ex)
        );
        
        for (const exercise of categoryExercises) {
          if (totalTime + exercise.duration <= timeLimit) {
            selected.push(exercise);
            totalTime += exercise.duration;
            break; // One exercise per category per goal
          }
        }
      }
    }

    return selected;
  }
}

export const workoutService = new WorkoutService();