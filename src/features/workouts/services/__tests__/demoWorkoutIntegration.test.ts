import { workoutService } from '../workoutService';
import { demoWorkoutMappingService } from '../demoWorkoutMappings';

describe('Demo Workout Integration', () => {
  beforeEach(() => {
    // Reset demo state before each test
    demoWorkoutMappingService.resetDemo();
  });

  it('should integrate chat message processing with workout recommendations', async () => {
    // Initially should return default recommendations
    const initialRecs = await workoutService.getRecommendedWorkouts();
    expect(initialRecs[0].workoutPlan.name).toBe('Morning HIIT Blast');
    
    // Process a back pain message
    const messageProcessed = workoutService.processChatMessage('My back feels sore today');
    expect(messageProcessed).toBe(true);
    
    // Now recommendations should be updated
    const updatedRecs = await workoutService.getRecommendedWorkouts();
    expect(updatedRecs[0].workoutPlan.name).toBe('Core Stability & Light Cardio');
    expect(updatedRecs[0].reason).toContain('sore back');
    expect(updatedRecs[0].priority).toBe('high');
  });

  it('should handle multiple demo scenarios', async () => {
    // Test fatigue scenario
    workoutService.processChatMessage('I am feeling exhausted');
    let recs = await workoutService.getRecommendedWorkouts();
    expect(recs[0].workoutPlan.name).toBe('Gentle Movement Flow');
    
    // Reset and test high energy scenario
    workoutService.resetDemoState();
    workoutService.processChatMessage('I feel amazing and energetic!');
    recs = await workoutService.getRecommendedWorkouts();
    expect(recs[0].workoutPlan.name).toBe('High-Intensity Challenge');
  });

  it('should return to default recommendations after reset', async () => {
    // Set a demo scenario
    workoutService.processChatMessage('My back feels sore');
    let recs = await workoutService.getRecommendedWorkouts();
    expect(recs[0].workoutPlan.name).toBe('Core Stability & Light Cardio');
    
    // Reset demo state
    workoutService.resetDemoState();
    recs = await workoutService.getRecommendedWorkouts();
    expect(recs[0].workoutPlan.name).toBe('Morning HIIT Blast');
  });

  it('should maintain fallback recommendations when no demo is active', async () => {
    // Process a non-demo message
    const messageProcessed = workoutService.processChatMessage('Hello, how are you?');
    expect(messageProcessed).toBe(false);
    
    // Should still return default recommendations
    const recs = await workoutService.getRecommendedWorkouts();
    expect(recs[0].workoutPlan.name).toBe('Morning HIIT Blast');
    expect(recs.length).toBeGreaterThan(1);
  });
});