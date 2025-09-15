/**
 * Goal Selection Screen - Second screen of onboarding flow
 * Allows users to select their health and fitness goals
 * Clean white background design inspired by modern health apps
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { onboardingService } from '../services/onboardingService';
import { HealthGoal, GoalOption } from '../types/authTypes';

interface GoalSelectionScreenProps {
  onContinue: (selectedGoals: HealthGoal[]) => void;
  onBack: () => void;
}

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 428; // 6.7 inch detection

export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({
  onContinue,
  onBack,
}) => {
  const [selectedGoals, setSelectedGoals] = useState<HealthGoal[]>([]);
  const goalOptions = onboardingService.getGoalOptions();

  const toggleGoal = (goalId: HealthGoal) => {
    // Add haptic feedback for better user experience
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        // Limit to 3 goals for better focus
        if (prev.length >= 3) {
          // Provide feedback when limit is reached
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return [...prev.slice(1), goalId];
        }
        return [...prev, goalId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      onContinue(selectedGoals);
    }
  };

  const renderGoalCard = (goal: GoalOption) => {
    const isSelected = selectedGoals.includes(goal.id);
    
    return (
      <TouchableOpacity
        key={goal.id}
        style={[
          styles.goalCard,
          isSelected && styles.selectedGoalCard,
        ]}
        onPress={() => toggleGoal(goal.id)}
      >
        <View style={styles.goalCardContent}>
          <View style={[styles.goalIcon, { backgroundColor: goal.color }]}>
            <Text style={styles.goalEmoji}>{goal.icon}</Text>
          </View>
          <View style={styles.goalTextContainer}>
            <Text style={[styles.goalTitle, isSelected && styles.selectedGoalTitle]}>
              {goal.title}
            </Text>
            <Text style={[styles.goalDescription, isSelected && styles.selectedGoalDescription]}>
              {goal.description}
            </Text>
          </View>
          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>What are your goals?</Text>
          <Text style={styles.subtitle}>
            Select up to 3 goals that matter most to you right now
          </Text>
        </View>

        {/* Goals Grid */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.goalsGrid}>
            {goalOptions.map(renderGoalCard)}
          </View>
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {selectedGoals.length > 0 && (
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedGoals.length === 0 && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
          >
            <Text style={[
              styles.continueButtonText,
              selectedGoals.length === 0 && styles.disabledButtonText,
            ]}>
              Continue
            </Text>
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressDots}>
              <View style={styles.progressDot} />
              <View style={[styles.progressDot, styles.activeDot]} />
              <View style={styles.progressDot} />
            </View>
            <Text style={styles.progressText}>2 of 3</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: isLargeScreen ? 32 : 24,
  },
  header: {
    paddingTop: isLargeScreen ? 20 : 16,
    paddingBottom: isLargeScreen ? 32 : 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 24 : 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  backButtonText: {
    fontSize: isLargeScreen ? 20 : 18,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  title: {
    fontSize: isLargeScreen ? 28 : 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: isLargeScreen ? 12 : 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: isLargeScreen ? 16 : 15,
    color: '#666666',
    lineHeight: isLargeScreen ? 24 : 22,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  goalsGrid: {
    gap: isLargeScreen ? 16 : 12,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: isLargeScreen ? 16 : 14,
    padding: isLargeScreen ? 20 : 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    marginBottom: isLargeScreen ? 16 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedGoalCard: {
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  goalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: isLargeScreen ? 56 : 48,
    height: isLargeScreen ? 56 : 48,
    borderRadius: isLargeScreen ? 16 : 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isLargeScreen ? 16 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalEmoji: {
    fontSize: isLargeScreen ? 24 : 20,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: isLargeScreen ? 16 : 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  selectedGoalTitle: {
    color: '#1a1a1a',
  },
  goalDescription: {
    fontSize: isLargeScreen ? 14 : 13,
    color: '#666666',
    lineHeight: isLargeScreen ? 18 : 16,
    fontWeight: '400',
  },
  selectedGoalDescription: {
    color: '#666666',
  },
  checkmark: {
    width: isLargeScreen ? 28 : 24,
    height: isLargeScreen ? 28 : 24,
    borderRadius: isLargeScreen ? 14 : 12,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: isLargeScreen ? 16 : 14,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomSection: {
    paddingVertical: isLargeScreen ? 24 : 20,
  },
  selectedCount: {
    alignItems: 'center',
    marginBottom: isLargeScreen ? 16 : 12,
  },
  selectedCountText: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#666666',
    fontWeight: '500',
  },
  continueButton: {
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
    backgroundColor: '#e9ecef',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: '700',
    color: 'white',
  },
  disabledButtonText: {
    color: '#999999',
  },
  progressSection: {
    alignItems: 'center',
    marginTop: isLargeScreen ? 24 : 20,
  },
  progressDots: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4ECDC4',
    width: 24,
    borderRadius: 4,
  },
  progressText: {
    fontSize: isLargeScreen ? 14 : 13,
    color: '#666666',
    fontWeight: '500',
  },
});