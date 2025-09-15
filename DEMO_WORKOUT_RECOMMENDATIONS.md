# Dynamic Workout Recommendations Demo

This document describes the implementation of Task 25: Update Recommended Workouts for Demo Flow.

## Overview

The feature allows chat messages in the AskBud screen to dynamically update the recommended workouts displayed in the Cardio screen. This creates a seamless demo experience where user input immediately affects workout suggestions.

## Implementation Details

### 1. Demo Workout Mapping Service (`demoWorkoutMappings.ts`)

- **Purpose**: Maps specific chat phrases to workout recommendations
- **Key Features**:
  - Case-insensitive phrase matching
  - Priority-based recommendations
  - Fallback to default workouts

### 2. Workout Service Integration

- **Enhanced `workoutService.ts`** with demo capabilities:
  - `processChatMessage(message: string): boolean` - Processes chat input
  - `resetDemoState(): void` - Resets to default recommendations
  - `getCurrentDemoRecommendation()` - Gets active demo recommendation

### 3. Real-time Updates

- **Workout Update Notifier** (`workoutUpdateNotifier.ts`):
  - Simple event emitter for cross-screen communication
  - Notifies Cardio screen when recommendations change
  - Automatic subscription cleanup

### 4. Conversation Engine Integration

- **Enhanced conversation processing**:
  - Detects demo trigger phrases
  - Updates workout recommendations
  - Provides contextual responses

## Demo Scenarios

### Scenario 1: Back Pain
**User Input**: "My back feels sore today"
**Response**: "I understand your back is feeling sore today. Let's focus on core stability and light cardio instead of heavy squats. I've updated your recommended workout to be back-friendly!"
**Workout Update**: Changes to "Core Stability & Light Cardio" (High Priority)

### Scenario 2: Low Energy
**User Input**: "I am feeling tired today"
**Response**: "When you're feeling tired, gentle movement can actually help boost your energy. I've adjusted your workout recommendations to focus on light, energizing activities."
**Workout Update**: Changes to "Gentle Movement Flow" (High Priority)

### Scenario 3: High Energy
**User Input**: "I feel amazing and energetic!"
**Response**: "I love that energy! Let's channel it into an amazing workout that will challenge you and help you reach your goals."
**Workout Update**: Changes to "High-Intensity Challenge" (High Priority)

## Technical Flow

1. **User sends message** in AskBud chat
2. **Conversation Engine** processes message and detects demo triggers
3. **Workout Service** updates recommendations based on trigger phrases
4. **Update Notifier** broadcasts change to subscribers
5. **Cardio Screen** receives notification and refreshes recommendations
6. **UI Updates** instantly show new highlighted workout

## Key Features

### ✅ Instant Updates
- Recommendations update immediately when navigating back to Cardio screen
- No manual refresh required

### ✅ Demo-Friendly
- Predictable responses for presentation scenarios
- Easy reset functionality for multiple demos

### ✅ Fallback System
- Always shows default recommendations when no demo is active
- Graceful handling of non-demo messages

### ✅ Visual Feedback
- High-priority recommendations get highlighted border
- Clear "RECOMMENDED" badge for demo-triggered workouts

## Testing

The implementation includes comprehensive tests:

- **Unit Tests**: `demoWorkoutMappings.test.ts` (9 tests passing)
- **Integration Tests**: `demoWorkoutIntegration.test.ts` (4 tests passing)
- **Coverage**: All demo scenarios and edge cases

## Usage for Demos

### Setup
1. Open the app and navigate to AskBud
2. Ensure Cardio screen shows default recommendations

### Demo Flow
1. **Show initial state**: Navigate to Cardio, show "Morning HIIT Blast" as highlighted
2. **Trigger demo**: Go to AskBud, type "My back feels sore today"
3. **Show update**: Navigate back to Cardio, see "Core Stability & Light Cardio" highlighted
4. **Reset for next demo**: Call `workoutService.resetDemoState()` or restart app

### Reset Between Demos
```typescript
import { workoutService } from '@/features/workouts';
workoutService.resetDemoState();
```

## Files Modified/Created

### New Files
- `src/features/workouts/services/demoWorkoutMappings.ts`
- `src/shared/services/workoutUpdateNotifier.ts`
- `src/features/workouts/services/__tests__/demoWorkoutMappings.test.ts`
- `src/features/workouts/services/__tests__/demoWorkoutIntegration.test.ts`
- `src/features/workouts/demo/workoutDemoScript.ts`

### Modified Files
- `src/features/workouts/services/workoutService.ts` - Added demo integration
- `src/features/coaching/services/conversationEngine.ts` - Added workout update notifications
- `src/features/coaching/services/conversationService.ts` - Added update notifications
- `src/features/coaching/services/mockResponseDatabase.ts` - Added demo responses
- `app/(tabs)/cardio.tsx` - Added update listener
- `src/features/workouts/index.ts` - Added exports
- `src/shared/services/index.ts` - Added notifier export

## Success Criteria ✅

- [x] Replace static "Recommended Workouts" list with demo-scripted data
- [x] Map AskBud demo input to updated recommended workout
- [x] Store demo mappings in local JSON/object (no Supabase needed)
- [x] Ensure Recommended Workouts updates instantly on navigation
- [x] Add fallback Recommended Workouts list for non-demo scenarios
- [x] Comprehensive testing coverage
- [x] Real-time cross-screen communication

The implementation successfully creates the illusion of dynamic AI-powered workout adjustments based on user conversation, perfect for demo presentations.