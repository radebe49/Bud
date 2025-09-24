export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  equipment: Equipment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  caloriesPerMinute: number;
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  muscleGroups: MuscleGroup[];
  modifications: ExerciseModification[];
  restTime?: number; // recommended rest between sets in seconds
  sets?: number; // default number of sets
  reps?: number; // default number of reps
}

export type ExerciseCategory = 
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'hiit'
  | 'yoga'
  | 'pilates'
  | 'martial_arts'
  | 'sports'
  | 'recovery';

export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'full_body';

export interface ExerciseModification {
  type: 'easier' | 'harder' | 'injury_adaptation';
  description: string;
  targetCondition?: string; // e.g., "knee injury", "beginner"
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  weeklyGoals: Goal[];
  dailyWorkouts: DailyWorkout[];
  adaptations: Adaptation[];
  progressMetrics: ProgressMetric[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface DailyWorkout {
  id: string;
  date: Date;
  exercises: Exercise[];
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  adaptedFor?: AdaptationReason;
  warmUp?: Exercise[];
  coolDown?: Exercise[];
  notes?: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  type: GoalType;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
}

export type GoalType = 
  | 'weekly_workouts'
  | 'total_duration'
  | 'calories_burned'
  | 'strength_increase'
  | 'endurance_improvement'
  | 'weight_target'
  | 'body_composition';

export interface Adaptation {
  id: string;
  reason: AdaptationReason;
  changes: AdaptationChange[];
  appliedDate: Date;
  duration?: number; // in days
}

export type AdaptationReason = 
  | 'low_readiness'
  | 'injury'
  | 'illness'
  | 'high_stress'
  | 'poor_sleep'
  | 'overtraining'
  | 'equipment_unavailable'
  | 'time_constraint';

export interface AdaptationChange {
  type: 'intensity_reduction' | 'duration_reduction' | 'exercise_substitution' | 'rest_day';
  description: string;
  originalValue?: string;
  newValue?: string;
}

export interface ProgressMetric {
  id: string;
  metric: ProgressMetricType;
  value: number;
  unit: string;
  date: Date;
  exerciseId?: string;
  notes?: string;
}

export type ProgressMetricType = 
  | 'weight_lifted'
  | 'reps_completed'
  | 'duration_improved'
  | 'distance_covered'
  | 'calories_burned'
  | 'heart_rate_avg'
  | 'perceived_exertion';

export interface WorkoutSession {
  id: string;
  workoutPlanId: string;
  workoutName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // actual duration in minutes
  caloriesBurned: number;
  exercises: CompletedExercise[];
  notes?: string;
  rating?: number; // 1-5 stars
  completed: boolean;
}

export interface CompletedExercise {
  exerciseId: string;
  exerciseName: string;
  duration: number; // in minutes
  sets?: number;
  reps?: number;
  weight?: number;
  distance?: number; // for cardio exercises
  notes?: string;
}

export interface WorkoutRecommendation {
  id: string;
  workoutPlan: WorkoutPlan;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  basedOn: string[]; // factors like energy level, goals, equipment
  scheduledFor?: Date;
}

export interface WorkoutStreak {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: Date;
  weeklyGoal: number;
  weeklyCompleted: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number; // 0-100
  target: number;
  category: 'streak' | 'duration' | 'calories' | 'frequency' | 'milestone';
}

export type Equipment = 
  | 'none'
  | 'dumbbells'
  | 'resistance_bands'
  | 'kettlebell'
  | 'barbell'
  | 'gym_access'
  | 'yoga_mat'
  | 'pull_up_bar'
  | 'treadmill'
  | 'stationary_bike';

export interface WorkoutPreferences {
  preferredDuration: number; // in minutes
  preferredTime: 'morning' | 'afternoon' | 'evening';
  availableEquipment: Equipment[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: WorkoutGoal[];
  dislikedExercises: string[];
}

export type WorkoutGoal = 
  | 'weight_loss'
  | 'muscle_gain'
  | 'endurance'
  | 'strength'
  | 'flexibility'
  | 'general_fitness';