/**
 * Authentication wrapper screen that manages login/signup flow
 */

import React, { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';
import { AuthUser } from '../types/authTypes';

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const handleAuthSuccess = (user: AuthUser) => {
    onAuthSuccess(user);
  };

  const switchToLogin = () => {
    setMode('login');
  };

  const switchToSignup = () => {
    setMode('signup');
  };

  if (mode === 'signup') {
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