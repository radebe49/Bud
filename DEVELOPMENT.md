# Development Guide

## Project Setup Complete ✅

The Bud Health Coach project foundation has been successfully set up with:

### ✅ Completed Setup Tasks

1. **Expo React Native Project with TypeScript** - Initialized and configured
2. **Feature-based Project Structure** - Organized by domain (auth, health, coaching, nutrition, workouts, sleep)
3. **Development Environment** - ESLint, Prettier, Jest testing framework configured
4. **Core Dependencies** - Health-related Expo modules added (camera, sensors, notifications, local auth)
5. **TypeScript Configuration** - Path aliases configured for clean imports
6. **Testing Framework** - Jest with comprehensive mocks for Expo modules
7. **Code Quality Tools** - ESLint and Prettier configured with health app specific rules

### 📁 Project Structure

```
bud-health-coach/
├── src/
│   ├── features/              # Feature-based organization
│   │   ├── auth/             # Authentication & user onboarding
│   │   ├── health/           # Health data integration & metrics
│   │   ├── coaching/         # AI conversation & coaching logic
│   │   ├── nutrition/        # Food tracking & nutrition insights
│   │   ├── workouts/         # Exercise planning & tracking
│   │   └── sleep/            # Sleep coaching & optimization
│   ├── shared/               # Shared utilities and components
│   │   ├── components/       # Reusable UI components
│   │   ├── services/         # API and storage services
│   │   ├── types/            # Global TypeScript interfaces
│   │   ├── utils/            # Helper functions and constants
│   │   └── hooks/            # Custom React hooks
│   └── navigation/           # App navigation configuration
├── app/                      # Expo Router file-based routing
├── components/               # Legacy components (to be migrated)
├── assets/                   # Images, fonts, static resources
└── ...config files
```

### 🛠 Available Scripts

```bash
# Development
npm start                    # Start Expo development server
npm run start:clear         # Start with cache cleared
npm run ios                 # Run on iOS simulator
npm run android             # Run on Android emulator
npm run web                 # Run web version

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix           # Fix ESLint issues automatically
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting
npm run type-check         # Run TypeScript checks

# Testing
npm test                   # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report

# Building
npm run prebuild           # Generate native code
npm run build:ios          # Build for iOS (requires EAS)
npm run build:android      # Build for Android (requires EAS)
npm run build:all          # Build for all platforms
```

### 🔧 Core Services Created

1. **API Service** (`src/shared/services/apiService.ts`)
   - HTTP client with error handling
   - Authentication token management
   - Request/response interceptors
   - File upload support

2. **Storage Service** (`src/shared/services/storageService.ts`)
   - Encrypted storage for sensitive data
   - Regular storage for app preferences
   - Batch operations support
   - Health data caching

3. **Validation Utils** (`src/shared/utils/validationUtils.ts`)
   - Health metric validation
   - Form validation helpers
   - Email, password, phone validation
   - Data sanitization functions

4. **Constants** (`src/shared/utils/constants.ts`)
   - App configuration
   - Health data ranges
   - UI constants
   - Error/success messages

### 📱 Health Integration Ready

The project is configured for health data integration with:

- **iOS**: HealthKit permissions configured
- **Android**: Health permissions configured
- **Camera**: For barcode scanning (nutrition)
- **Biometric Auth**: For secure access
- **Notifications**: For coaching reminders
- **Sensors**: For activity tracking

### 🧪 Testing Setup

- Jest configured with Expo preset
- Comprehensive mocks for all Expo modules
- Testing utilities for React Native components
- Coverage reporting configured
- Path aliases working in tests

### 🎯 Next Steps

The foundation is complete! You can now proceed with implementing the specific tasks:

1. **Task 2**: Implement core data models and TypeScript interfaces
2. **Task 3**: Build authentication and user profile system
3. **Task 4**: Create GROQ API integration service
4. **Task 5**: Develop health data integration layer
5. And so on...

### 🔍 Development Notes

- All TypeScript interfaces are properly typed
- Feature-based architecture allows for independent development
- Shared utilities are tested and ready for use
- Environment configuration is set up (.env.example provided)
- Code quality tools will help maintain consistency

### 🚀 Ready to Code!

The project foundation is solid and ready for feature development. All core infrastructure, tooling, and architectural patterns are in place to support the AI health coach application requirements.