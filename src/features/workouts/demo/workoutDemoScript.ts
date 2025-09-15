/**
 * Demo script showcasing the dynamic workout recommendation feature
 */

import { workoutService } from '../services/workoutService';
import { demoWorkoutMappingService } from '../services/demoWorkoutMappings';

export class WorkoutDemoScript {
  public async runDemo(): Promise<void> {
    console.log('🏋️ Workout Recommendation Demo\n');

    // Show initial recommendations
    console.log('📋 Initial Recommended Workouts:');
    let recommendations = await workoutService.getRecommendedWorkouts();
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.workoutPlan.name} (${rec.priority} priority)`);
      console.log(`   Reason: ${rec.reason}`);
      if (index === 0) console.log('   ⭐ HIGHLIGHTED RECOMMENDATION');
    });

    console.log('\n---\n');

    // Demo scenario 1: Back pain
    console.log('💬 User says: "My back feels sore today"');
    const backPainProcessed = workoutService.processChatMessage('My back feels sore today');
    console.log(`🤖 Message processed: ${backPainProcessed ? 'YES' : 'NO'}`);

    if (backPainProcessed) {
      console.log('\n📋 Updated Recommended Workouts:');
      recommendations = await workoutService.getRecommendedWorkouts();
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.workoutPlan.name} (${rec.priority} priority)`);
        console.log(`   Reason: ${rec.reason}`);
        if (index === 0) console.log('   ⭐ NEW HIGHLIGHTED RECOMMENDATION');
      });
    }

    console.log('\n---\n');

    // Reset and demo scenario 2: Fatigue
    workoutService.resetDemoState();
    console.log('💬 User says: "I am feeling really tired today"');
    const fatigueProcessed = workoutService.processChatMessage('I am feeling really tired today');
    console.log(`🤖 Message processed: ${fatigueProcessed ? 'YES' : 'NO'}`);

    if (fatigueProcessed) {
      console.log('\n📋 Updated Recommended Workouts:');
      recommendations = await workoutService.getRecommendedWorkouts();
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.workoutPlan.name} (${rec.priority} priority)`);
        console.log(`   Reason: ${rec.reason}`);
        if (index === 0) console.log('   ⭐ NEW HIGHLIGHTED RECOMMENDATION');
      });
    }

    console.log('\n---\n');

    // Reset and demo scenario 3: High energy
    workoutService.resetDemoState();
    console.log('💬 User says: "I feel amazing and energetic today!"');
    const energyProcessed = workoutService.processChatMessage('I feel amazing and energetic today!');
    console.log(`🤖 Message processed: ${energyProcessed ? 'YES' : 'NO'}`);

    if (energyProcessed) {
      console.log('\n📋 Updated Recommended Workouts:');
      recommendations = await workoutService.getRecommendedWorkouts();
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.workoutPlan.name} (${rec.priority} priority)`);
        console.log(`   Reason: ${rec.reason}`);
        if (index === 0) console.log('   ⭐ NEW HIGHLIGHTED RECOMMENDATION');
      });
    }

    console.log('\n---\n');

    // Demo non-triggering message
    console.log('💬 User says: "Hello, how are you?"');
    const normalProcessed = workoutService.processChatMessage('Hello, how are you?');
    console.log(`🤖 Message processed: ${normalProcessed ? 'YES' : 'NO'}`);
    console.log('📋 Recommendations remain unchanged (fallback to default)');

    console.log('\n---\n');

    // Reset to show return to default
    workoutService.resetDemoState();
    console.log('🔄 Demo reset - back to default recommendations');
    recommendations = await workoutService.getRecommendedWorkouts();
    console.log('\n📋 Default Recommended Workouts:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.workoutPlan.name} (${rec.priority} priority)`);
      console.log(`   Reason: ${rec.reason}`);
      if (index === 0) console.log('   ⭐ HIGHLIGHTED RECOMMENDATION');
    });

    console.log('\n✅ Demo completed!');
    console.log('\n🎯 Key Features Demonstrated:');
    console.log('• Dynamic workout recommendations based on chat input');
    console.log('• Instant updates to the Cardio screen (via notification system)');
    console.log('• Fallback to default recommendations for non-demo scenarios');
    console.log('• Demo reset functionality for presentations');
  }
}

// Export function to run the demo
export async function runWorkoutDemo(): Promise<void> {
  const demo = new WorkoutDemoScript();
  await demo.runDemo();
}

// Allow running the demo directly
if (require.main === module) {
  runWorkoutDemo().catch(console.error);
}