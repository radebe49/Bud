/**
 * Simple event emitter for notifying when workout recommendations are updated
 */

type WorkoutUpdateListener = () => void;

export class WorkoutUpdateNotifier {
  private static instance: WorkoutUpdateNotifier;
  private listeners: WorkoutUpdateListener[] = [];

  public static getInstance(): WorkoutUpdateNotifier {
    if (!WorkoutUpdateNotifier.instance) {
      WorkoutUpdateNotifier.instance = new WorkoutUpdateNotifier();
    }
    return WorkoutUpdateNotifier.instance;
  }

  public subscribe(listener: WorkoutUpdateListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public notifyWorkoutUpdate(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in workout update listener:', error);
      }
    });
  }
}

export const workoutUpdateNotifier = WorkoutUpdateNotifier.getInstance();