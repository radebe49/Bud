export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'hiit';
  equipment: Equipment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  caloriesPerMinute: number;
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  totalDuration: number;
  estimatedCalories: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: Equipment[];
  category: 'cardio' | 'strength' | 'hiit' | 'flexibility';
  tags: string[];
}

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