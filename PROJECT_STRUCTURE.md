# Bud Health Coach - Project Structure

## Overview
This is the foundation setup for the AI-powered personal health coach "Bud" mobile application built with React Native and Expo.

## Project Structure

```
src/
├── features/                 # Feature-based organization
│   ├── auth/                # Authentication & user onboarding
│   │   ├── components/      # Auth-specific UI components
│   │   ├── services/        # Auth API calls and logic
│   │   ├── types/          # Auth-related TypeScript interfaces
│   │   └── screens/        # Login, signup, onboarding screens
│   ├── health/             # Health data integration & metrics
│   │   ├── components/     # MetricCard, ProgressRing, etc.
│   │   ├── services/       # HealthKit, Google Fit integrations
│   │   ├── types/          # HealthMetrics, DataPoint interfaces
│   │   └── screens/        # Dashboard, metrics screens
│   ├── coaching/           # AI conversation & coaching logic
│   │   ├── components/     # ChatBubble, ConversationView
│   │   ├── services/       # GROQ API integration
│   │   ├── types/          # ChatMessage, CoachingContext
│   │   └── screens/        # ChatScreen, coaching flows
│   ├── nutrition/          # Food tracking & nutrition insights
│   │   ├── components/     # FoodCard, MacroBar, WaterTracker
│   │   ├── services/       # Food database, barcode scanning
│   │   ├── types/          # MealEntry, FoodItem, MacroNutrients
│   │   └── screens/        # NutritionScreen, food logging
│   ├── workouts/           # Exercise planning & tracking
│   │   ├── components/     # WorkoutCard, ExerciseList
│   │   ├── services/       # Workout generation algorithms
│   │   ├── types/          # WorkoutPlan, Exercise interfaces
│   │   └── screens/        # WorkoutScreen, exercise tracking
│   └── sleep/              # Sleep coaching & optimization
│       ├── components/     # Sleep analysis charts
│       ├── services/       # Sleep pattern analysis
│       ├── types/          # SleepData, SleepAnalysis
│       └── screens/        # SleepScreen, bedtime routines
├── shared/
│   ├── components/         # Reusable UI components
│   ├── services/           # Common API utilities, storage
│   ├── types/              # Global TypeScript interfaces
│   ├── utils/              # Helper functions, constants
│   └── hooks/              # Custom React hooks
└── navigation/             # App navigation configuration
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation
```bash
npm install
```

### Available Scripts
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run web version
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript checks

### Technology Stack
- **Frontend**: React Native with Expo, TypeScript
- **Navigation**: React Navigation
- **Animations**: React Native Reanimated
- **State Management**: TBD (Context API or Zustand)
- **Testing**: Jest, React Native Testing Library
- **Code Quality**: ESLint, Prettier
- **Health Data**: HealthKit (iOS), Google Fit (Android)
- **AI Service**: GROQ API for GPT models
- **Storage**: React Native Encrypted Storage, AsyncStorage

## Next Steps
This foundation provides the basic project structure and development environment. The next tasks will involve:
1. Implementing core data models and TypeScript interfaces
2. Building authentication and user profile system
3. Creating GROQ API integration service
4. Developing health data integration layer
5. Building core UI component library

## File Naming Conventions
- **Components**: PascalCase (e.g., `MetricCard.tsx`)
- **Screens**: PascalCase with "Screen" suffix (e.g., `HomeScreen.tsx`)
- **Services**: camelCase (e.g., `healthDataService.ts`)
- **Types**: camelCase with "Types" suffix (e.g., `healthTypes.ts`)
- **Utils**: camelCase (e.g., `dateUtils.ts`)