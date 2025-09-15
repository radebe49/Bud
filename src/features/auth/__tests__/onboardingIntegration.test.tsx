/**
 * Integration test for the complete onboarding flow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OnboardingFlow } from '../components/OnboardingFlow';

// Mock navigation
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock EncryptedStorage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock LinearGradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

describe('OnboardingFlow Integration', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete the full onboarding flow', async () => {
    const { getByText, getByTestId } = render(
      <OnboardingFlow onComplete={mockOnComplete} />
    );

    // Step 1: Welcome Screen
    expect(getByText('Meet Bud')).toBeTruthy();
    expect(getByText('Your AI Health Coach')).toBeTruthy();
    
    // Continue to goals
    fireEvent.press(getByText("Let's Get Started"));

    // Step 2: Goal Selection Screen
    await waitFor(() => {
      expect(getByText('What are your goals?')).toBeTruthy();
    });

    // Select a goal
    fireEvent.press(getByText('Lose Weight'));
    
    // Continue to setup
    fireEvent.press(getByText('Continue'));

    // Step 3: Setup Screen
    await waitFor(() => {
      expect(getByText("Let's personalize your experience")).toBeTruthy();
    });

    // Select equipment
    fireEvent.press(getByText('Dumbbells'));
    
    // Select fitness level
    fireEvent.press(getByText('Intermediate'));
    
    // Complete setup
    fireEvent.press(getByText('Complete Setup'));

    // Verify onboarding completion
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('should allow navigation back through steps', async () => {
    const { getByText } = render(
      <OnboardingFlow onComplete={mockOnComplete} />
    );

    // Go to goals screen
    fireEvent.press(getByText("Let's Get Started"));

    await waitFor(() => {
      expect(getByText('What are your goals?')).toBeTruthy();
    });

    // Go back to welcome
    fireEvent.press(getByText('←'));

    await waitFor(() => {
      expect(getByText('Meet Bud')).toBeTruthy();
    });
  });

  it('should require selections before allowing continuation', async () => {
    const { getByText, queryByText } = render(
      <OnboardingFlow onComplete={mockOnComplete} />
    );

    // Go to goals screen
    fireEvent.press(getByText("Let's Get Started"));

    await waitFor(() => {
      expect(getByText('What are your goals?')).toBeTruthy();
    });

    // Try to continue without selecting goals - button should be disabled
    const continueButton = getByText('Continue');
    expect(continueButton.props.accessibilityState?.disabled).toBe(true);

    // Select a goal
    fireEvent.press(getByText('Lose Weight'));
    
    // Now continue should be enabled
    expect(continueButton.props.accessibilityState?.disabled).toBe(false);
  });
});