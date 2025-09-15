# Bud Health Coach

AI-powered personal health coach mobile application built with React Native and Expo.

## Features

- Personalized AI coaching powered by GPT models via GROQ
- Real-time health data integration (HealthKit, Google Fit)
- Custom workout planning and tracking
- Sleep coaching and optimization
- Nutrition tracking with barcode scanning
- Proactive health insights and recommendations

## Tech Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context + Hooks
- **Storage**: React Native Encrypted Storage
- **AI Integration**: GROQ API
- **Health Data**: HealthKit (iOS), Google Fit (Android)

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run web version
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript checks


## Health Data Integration

The app integrates with various health platforms:

- **iOS**: HealthKit for comprehensive health metrics
- **Android**: Google Fit for activity and health data
- **Optional**: Fitbit, Oura Ring, Garmin, MyFitnessPal APIs

## AI Coaching

Powered by GPT models via GROQ API:
- Natural language conversations
- Contextual health insights
- Personalized recommendations
- Proactive coaching interventions

## Privacy & Security

- End-to-end encryption for health data
- Secure local storage with React Native Encrypted Storage
- HIPAA compliance considerations
- Granular privacy controls


## License

This project is licensed under the MIT Open Source License.
