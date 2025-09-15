/**
 * Login screen for email-based authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService';
import { AuthUser } from '../types/authTypes';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  onSwitchToSignup: () => void;
}

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 428;

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onSwitchToSignup
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.login({ email: email.trim(), password });
      onLoginSuccess(user);
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first');
      return;
    }

    try {
      await authService.resetPassword(email.trim());
      Alert.alert(
        'Reset Email Sent',
        'If an account with this email exists, you will receive a password reset email shortly.'
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send reset email');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.budAvatar}>
                <Text style={styles.budEmoji}>🤖</Text>
              </View>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Sign in to continue your health journey with Bud</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#999999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#999999"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.signupPrompt}>
                <Text style={styles.signupPromptText}>Don't have an account? </Text>
                <TouchableOpacity onPress={onSwitchToSignup} disabled={isLoading}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>


            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isLargeScreen ? 32 : 24,
    paddingVertical: isLargeScreen ? 40 : 32,
  },
  header: {
    alignItems: 'center',
    marginTop: isLargeScreen ? 40 : 20,
    marginBottom: isLargeScreen ? 40 : 32,
  },
  budAvatar: {
    width: isLargeScreen ? 80 : 70,
    height: isLargeScreen ? 80 : 70,
    borderRadius: isLargeScreen ? 40 : 35,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 20 : 16,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  budEmoji: {
    fontSize: isLargeScreen ? 40 : 35,
    color: 'white',
  },
  title: {
    fontSize: isLargeScreen ? 28 : 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: isLargeScreen ? 16 : 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: isLargeScreen ? 24 : 22,
    fontWeight: '400',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: isLargeScreen ? 24 : 20,
  },
  inputLabel: {
    fontSize: isLargeScreen ? 16 : 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isLargeScreen ? 16 : 14,
    fontSize: isLargeScreen ? 16 : 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: isLargeScreen ? 32 : 24,
  },
  forgotPasswordText: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: isLargeScreen ? 18 : 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: '700',
    color: 'white',
  },
  footer: {
    marginTop: isLargeScreen ? 40 : 32,
    alignItems: 'center',
  },
  signupPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 20 : 16,
  },
  signupPromptText: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#666666',
  },
  signupLink: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#4ECDC4',
    fontWeight: '700',
  },

});