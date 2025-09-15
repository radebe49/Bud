/**
 * Signup screen for email-based registration
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

interface SignupScreenProps {
  onSignupSuccess: (user: AuthUser) => void;
  onSwitchToLogin: () => void;
}

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 428;

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onSignupSuccess,
  onSwitchToLogin
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.signup({
        email: email.trim(),
        password,
        name: name.trim() || undefined
      });
      onSignupSuccess(user);
    } catch (error) {
      Alert.alert('Signup Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
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
              <Text style={styles.title}>Join Bud!</Text>
              <Text style={styles.subtitle}>Create your account to start your personalized health journey</Text>
            </View>

            {/* Signup Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999999"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

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
                    placeholder="Create a password (min 6 characters)"
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

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999999"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.signupButton, isLoading && styles.disabledButton]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <Text style={styles.signupButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptText}>Already have an account? </Text>
                <TouchableOpacity onPress={onSwitchToLogin} disabled={isLoading}>
                  <Text style={styles.loginLink}>Sign In</Text>
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
    marginTop: isLargeScreen ? 20 : 10,
    marginBottom: isLargeScreen ? 32 : 24,
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
    paddingHorizontal: 16,
    fontWeight: '400',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: isLargeScreen ? 20 : 16,
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
  signupButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: isLargeScreen ? 18 : 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: isLargeScreen ? 24 : 20,
    marginBottom: isLargeScreen ? 16 : 12,
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
  signupButtonText: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: '700',
    color: 'white',
  },
  termsText: {
    fontSize: isLargeScreen ? 13 : 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: isLargeScreen ? 18 : 16,
    paddingHorizontal: 16,
  },
  footer: {
    marginTop: isLargeScreen ? 24 : 20,
    alignItems: 'center',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 16 : 12,
  },
  loginPromptText: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#4ECDC4',
    fontWeight: '700',
  },

});