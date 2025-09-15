/**
 * Auth Flow Screen - Manages login/signup flow
 */

import React, { useState } from 'react';
import { router } from 'expo-router';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';
import { AuthUser } from '../types/authTypes';

type AuthMode = 'login' | 'signup';

export const AuthFlowScreen: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const handleAuthSuccess = (user: AuthUser) => {
    // After successful auth, go to onboarding
    router.replace('/onboarding' as any);
  };

  const switchToLogin = () => setAuthMode('login');
  const switchToSignup = () => setAuthMode('signup');

  if (authMode === 'signup') {
    return (
      <SignupScreen
        onSignupSuccess={handleAuthSuccess}
        onSwitchToLogin={switchToLogin}
      />
    );
  }

  return (
    <LoginScreen
      onLoginSuccess={handleAuthSuccess}
      onSwitchToSignup={switchToSignup}
    />
  );
};