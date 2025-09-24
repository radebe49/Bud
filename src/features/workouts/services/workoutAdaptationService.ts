import { HealthMetrics } from '../../../shared/types/healthTypes';
import { 
  WorkoutPlan, 
  Adaptation, 
  AdaptationReason, 
  AdaptationChange,
  Exercise 
} from '../types/workoutTypes';

/**
 * Service for adapting workouts based on health metrics and user feedback
 */
class WorkoutAdaptationService {
  /**
   * Analyze health metrics and determine if workout adaptations are needed
   */
  analyzeHealthMetrics(metrics: HealthMetrics): {
    needsAdaptation: boolean;
    reasons: AdaptationReason[];
    severity: 'low' | 'moderate' | 'high';
  } {
    const reasons: AdaptationReason[] = [];
    let severity: 'low' | 'moderate' | 'high' = 'low';

    // Check recovery score (0-100)
    if (metrics.recoveryScore < 40) {
      reasons.push('low_readiness');
      severity = 'high';
    } else if (metrics.recoveryScore < 60) {
      reasons.push('low_readiness');
      severity = 'moderate';
    }

    // Check sleep score (0-100)
    if (metrics.sleepScore < 50) {
      reasons.push('poor_sleep');
      if (severity === 'low') severity = 'high';
    } else if (metrics.sleepScore < 70) {
      reasons.push('poor_sleep');
      if (severity === 'low') severity = 'moderate';
    }

    // Check stress level (1-10 scale)
    if (metrics.stressLevel >= 8) {
      reasons.push('high_stress');
      severity = 'high';
    } else if (metrics.stressLevel >= 6) {
      reasons.push('high_stress');
      if (severity === 'low') severity = 'moderate';
    }

    // Check heart rate variability (lower values indicate stress/fatigue)
    if (metrics.heartRateVariability < 20) {
      reasons.push('overtraining');
      severity = 'high';
    } else if (metrics.heartRateVariability < 30) {
      reasons.push('overtraining');
      if (severity === 'low') severity = 'moderate';
    }

    return {
      needsAdaptation: reasons.length > 0,
      reasons,
      severity
    };
  }

  /**
   * Generate workout adaptations based on health analysis
   */
  generateAdaptations(
    originalWorkout: WorkoutPlan,
    healthMetrics: HealthMetrics,
    userFeedback?: string
  ): Adaptation[] {
    const analysis = this.analyzeHealthMetrics(healthMetrics);
    const adaptations: Adaptation[] = [];

    if (!analysis.needsAdaptation && !userFeedback) {
      return adaptations;
    }

    // Handle each adaptation reason
    for (const reason of analysis.reasons) {
      const adaptation = this.createAdaptationForReason(reason, analysis.severity);
      if (adaptation) {
        adaptations.push(adaptation);
      }
    }

    // Handle user feedback
    if (userFeedback) {
      const feedbackAdaptation = this.createAdaptationFromFeedback(userFeedback);
      if (feedbackAdaptation) {
        adaptations.push(feedbackAdaptation);
      }
    }

    return adaptations;
  }

  /**
   * Apply adaptations to a workout plan
   */
  applyAdaptations(
    originalWorkout: WorkoutPlan,
    adaptations: Adaptation[]
  ): WorkoutPlan {
    let adaptedWorkout = { ...originalWorkout };

    for (const adaptation of adaptations) {
      adaptedWorkout = this.applyAdaptation(adaptedWorkout, adaptation);
    }

    adaptedWorkout.adaptations = [...adaptedWorkout.adaptations, ...adaptations];
    adaptedWorkout.updatedAt = new Date();

    return adaptedWorkout;
  }

  /**
   * Get alternative exercises for injury adaptations
   */
  getAlternativeExercises(
    originalExercise: Exercise,
    injuryType: string
  ): Exercise[] {
    const alternatives: Exercise[] = [];

    // Define injury-specific exercise alternatives
    const injuryAlternatives: Record<string, Partial<Exercise>[]> = {
      'knee_injury': [
        {
          id: 'seated-exercises',
          name: 'Seated Upper Body',
          description: 'Upper body exercises that can be done seated',
          category: 'strength',
          equipment: ['dumbbells'],
          difficulty: 'beginner',
          duration: originalExercise.duration,
          caloriesPerMinute: originalExercise.caloriesPerMinute * 0.7,
          instructions: [
            'Perform all exercises while seated',
            'Focus on upper body movements',
            'Maintain good posture throughout'
          ],
          muscleGroups: ['chest', 'shoulders', 'biceps', 'triceps'],
          modifications: []
        }
      ],
      'back_injury': [
        {
          id: 'low-impact-cardio',
          name: 'Low Impact Cardio',
          description: 'Gentle cardio exercises that minimize back strain',
          category: 'cardio',
          equipment: ['none'],
          difficulty: 'beginner',
          duration: originalExercise.duration,
          caloriesPerMinute: originalExercise.caloriesPerMinute * 0.6,
          instructions: [
            'Keep movements controlled and gentle',
            'Avoid twisting or bending motions',
            'Stop if you feel any discomfort'
          ],
          muscleGroups: ['full_body'],
          modifications: []
        }
      ],
      'shoulder_injury': [
        {
          id: 'lower-body-focus',
          name: 'Lower Body Focus',
          description: 'Exercises targeting legs and core without shoulder involvement',
          category: 'strength',
          equipment: ['none'],
          difficulty: originalExercise.difficulty,
          duration: originalExercise.duration,
          caloriesPerMinute: originalExercise.caloriesPerMinute * 0.8,
          instructions: [
            'Focus on squats, lunges, and leg exercises',
            'Avoid overhead or pushing movements',
            'Keep arms relaxed at sides'
          ],
          muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'core'],
          modifications: []
        }
      ]
    };

    const alternativeTemplates = injuryAlternatives[injuryType] || [];
    
    return alternativeTemplates.map((template, index) => ({
      ...originalExercise,
      ...template,
      id: `${originalExercise.id}-alt-${index}`,
      difficulty: originalExercise.difficulty, // Preserve original difficulty
    } as Exercise));
  }

  /**
   * Calculate readiness score based on multiple health metrics
   */
  calculateReadinessScore(metrics: HealthMetrics): number {
    // Weighted calculation of readiness based on key metrics
    const weights = {
      recovery: 0.3,
      sleep: 0.25,
      stress: 0.2,
      hrv: 0.15,
      activity: 0.1
    };

    const normalizedStress = Math.max(0, 100 - (metrics.stressLevel * 10)); // Invert stress (higher stress = lower readiness)
    const normalizedHrv = Math.min(100, metrics.heartRateVariability * 2); // Scale HRV to 0-100
    const normalizedActivity = Math.min(100, metrics.activityLevel); // Assume activity level is 0-100

    const readinessScore = 
      (metrics.recoveryScore * weights.recovery) +
      (metrics.sleepScore * weights.sleep) +
      (normalizedStress * weights.stress) +
      (normalizedHrv * weights.hrv) +
      (normalizedActivity * weights.activity);

    return Math.round(Math.max(0, Math.min(100, readinessScore)));
  }

  /**
   * Private method to create adaptation for specific reason
   */
  private createAdaptationForReason(
    reason: AdaptationReason,
    severity: 'low' | 'moderate' | 'high'
  ): Adaptation | null {
    const adaptationMap: Record<AdaptationReason, AdaptationChange[]> = {
      low_readiness: [
        {
          type: 'intensity_reduction',
          description: `Reduced intensity due to ${severity} readiness scores`,
          originalValue: 'high',
          newValue: severity === 'high' ? 'low' : 'moderate'
        }
      ],
      poor_sleep: [
        {
          type: 'duration_reduction',
          description: `Shortened workout due to ${severity} sleep quality`,
          originalValue: '45 min',
          newValue: severity === 'high' ? '20 min' : '30 min'
        }
      ],
      high_stress: [
        {
          type: 'exercise_substitution',
          description: 'Replaced high-intensity with stress-reducing exercises',
          originalValue: 'HIIT/Strength',
          newValue: 'Yoga/Walking'
        }
      ],
      overtraining: [
        {
          type: 'rest_day',
          description: 'Recommended rest day due to overtraining indicators',
          originalValue: 'Planned workout',
          newValue: 'Active recovery'
        }
      ],
      injury: [
        {
          type: 'exercise_substitution',
          description: 'Modified exercises to accommodate injury',
          originalValue: 'Original exercises',
          newValue: 'Injury-safe alternatives'
        }
      ],
      illness: [
        {
          type: 'rest_day',
          description: 'Rest recommended during illness recovery',
          originalValue: 'Planned workout',
          newValue: 'Complete rest'
        }
      ],
      equipment_unavailable: [
        {
          type: 'exercise_substitution',
          description: 'Substituted exercises based on available equipment',
          originalValue: 'Equipment-based exercises',
          newValue: 'Bodyweight alternatives'
        }
      ],
      time_constraint: [
        {
          type: 'duration_reduction',
          description: 'Shortened workout to fit available time',
          originalValue: 'Full workout',
          newValue: 'Express version'
        }
      ]
    };

    const changes = adaptationMap[reason];
    if (!changes) return null;

    return {
      id: `adaptation-${reason}-${Date.now()}`,
      reason,
      changes,
      appliedDate: new Date(),
      duration: reason === 'illness' ? 7 : undefined // Illness adaptations last longer
    };
  }

  /**
   * Private method to create adaptation from user feedback
   */
  private createAdaptationFromFeedback(feedback: string): Adaptation | null {
    const lowerFeedback = feedback.toLowerCase();
    
    if (lowerFeedback.includes('too hard') || lowerFeedback.includes('difficult')) {
      return {
        id: `adaptation-feedback-${Date.now()}`,
        reason: 'low_readiness',
        changes: [{
          type: 'intensity_reduction',
          description: 'Reduced intensity based on user feedback',
          originalValue: 'Current intensity',
          newValue: 'Easier level'
        }],
        appliedDate: new Date()
      };
    }

    if (lowerFeedback.includes('too long') || lowerFeedback.includes('no time') || lowerFeedback.includes('enough time')) {
      return {
        id: `adaptation-feedback-${Date.now()}`,
        reason: 'time_constraint',
        changes: [{
          type: 'duration_reduction',
          description: 'Shortened workout based on time constraints',
          originalValue: 'Full duration',
          newValue: 'Shortened version'
        }],
        appliedDate: new Date()
      };
    }

    if (lowerFeedback.includes('injury') || lowerFeedback.includes('pain')) {
      return {
        id: `adaptation-feedback-${Date.now()}`,
        reason: 'injury',
        changes: [{
          type: 'exercise_substitution',
          description: 'Modified exercises due to reported discomfort',
          originalValue: 'Original exercises',
          newValue: 'Low-impact alternatives'
        }],
        appliedDate: new Date()
      };
    }

    return null;
  }

  /**
   * Private method to apply a single adaptation to a workout
   */
  private applyAdaptation(workout: WorkoutPlan, adaptation: Adaptation): WorkoutPlan {
    const adaptedWorkout = { ...workout };

    for (const change of adaptation.changes) {
      switch (change.type) {
        case 'intensity_reduction':
          // Reduce intensity of exercises
          adaptedWorkout.dailyWorkouts = adaptedWorkout.dailyWorkouts.map(daily => ({
            ...daily,
            intensity: change.newValue as 'low' | 'moderate' | 'high'
          }));
          break;

        case 'duration_reduction':
          // Reduce workout duration
          const reductionFactor = change.newValue?.includes('20') ? 0.5 : 0.75;
          adaptedWorkout.dailyWorkouts = adaptedWorkout.dailyWorkouts.map(daily => ({
            ...daily,
            duration: Math.round(daily.duration * reductionFactor)
          }));
          break;

        case 'exercise_substitution':
          // This would require more complex logic to substitute exercises
          // For now, we'll mark it as adapted
          adaptedWorkout.dailyWorkouts = adaptedWorkout.dailyWorkouts.map(daily => ({
            ...daily,
            adaptedFor: adaptation.reason
          }));
          break;

        case 'rest_day':
          // Convert workout to rest day
          adaptedWorkout.dailyWorkouts = adaptedWorkout.dailyWorkouts.map(daily => ({
            ...daily,
            exercises: [], // Remove exercises
            duration: 0,
            intensity: 'low',
            adaptedFor: adaptation.reason,
            notes: 'Rest day recommended based on health metrics'
          }));
          break;
      }
    }

    return adaptedWorkout;
  }
}

export const workoutAdaptationService = new WorkoutAdaptationService();