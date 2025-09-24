import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Tag } from '@/shared/components/Tag';
import { workoutService } from '../services/workoutService';
import type { 
  WorkoutGoal, 
  Equipment, 
  WorkoutPlan,
  Exercise 
} from '../types/workoutTypes';

const { width } = Dimensions.get('window');

interface WorkoutPlanningScreenProps {
  onPlanCreated: (plan: WorkoutPlan) => void;
  onCancel: () => void;
}

export function WorkoutPlanningScreen({ onPlanCreated, onCancel }: WorkoutPlanningScreenProps) {
  const [selectedGoals, setSelectedGoals] = useState<WorkoutGoal[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>(['none']);
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [sessionDuration, setSessionDuration] = useState(30);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  const workoutGoals: { id: WorkoutGoal; label: string; icon: string; color: string }[] = [
    { id: 'weight_loss', label: 'Weight Loss', icon: 'flame.fill', color: '#EF4444' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: 'bolt.fill', color: '#3B82F6' },
    { id: 'endurance', label: 'Endurance', icon: 'heart.fill', color: '#10B981' },
    { id: 'strength', label: 'Strength', icon: 'dumbbell.fill', color: '#8B5CF6' },
    { id: 'flexibility', label: 'Flexibility', icon: 'figure.walk', color: '#F59E0B' },
    { id: 'general_fitness', label: 'General Fitness', icon: 'figure.run', color: '#6366F1' }
  ];

  const equipmentOptions: { id: Equipment; label: string; icon: string }[] = [
    { id: 'none', label: 'No Equipment', icon: 'hand.raised.fill' },
    { id: 'dumbbells', label: 'Dumbbells', icon: 'dumbbell.fill' },
    { id: 'resistance_bands', label: 'Resistance Bands', icon: 'oval.fill' },
    { id: 'kettlebell', label: 'Kettlebell', icon: 'circle.fill' },
    { id: 'yoga_mat', label: 'Yoga Mat', icon: 'rectangle.fill' },
    { id: 'pull_up_bar', label: 'Pull-up Bar', icon: 'minus' },
    { id: 'gym_access', label: 'Full Gym', icon: 'building.fill' }
  ];

  const fitnessLevels = [
    { id: 'beginner', label: 'Beginner', description: 'New to exercise or returning after a break' },
    { id: 'intermediate', label: 'Intermediate', description: 'Regular exercise for 6+ months' },
    { id: 'advanced', label: 'Advanced', description: 'Consistent training for 2+ years' }
  ];

  const durationOptions = [15, 20, 30, 45, 60, 90];
  const frequencyOptions = [2, 3, 4, 5, 6, 7];

  useEffect(() => {
    loadAvailableExercises();
  }, [selectedEquipment]);

  const loadAvailableExercises = async () => {
    try {
      const exercises = await workoutService.getExercisesByCategory(
        undefined,
        undefined,
        selectedEquipment
      );
      setAvailableExercises(exercises);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const toggleGoal = (goal: WorkoutGoal) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const toggleEquipment = (equipment: Equipment) => {
    setSelectedEquipment(prev => {
      if (equipment === 'none') {
        return prev.includes('none') ? [] : ['none'];
      } else {
        const withoutNone = prev.filter(e => e !== 'none');
        return withoutNone.includes(equipment)
          ? withoutNone.filter(e => e !== equipment)
          : [...withoutNone, equipment];
      }
    });
  };

  const generateWorkoutPlan = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Select Goals', 'Please select at least one fitness goal.');
      return;
    }

    if (selectedEquipment.length === 0) {
      Alert.alert('Select Equipment', 'Please select your available equipment.');
      return;
    }

    setIsGenerating(true);

    try {
      const plan = await workoutService.generateWorkoutPlan(
        selectedGoals,
        selectedEquipment,
        fitnessLevel,
        sessionDuration,
        sessionsPerWeek
      );

      onPlanCreated(plan);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate workout plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderGoalSelection = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Fitness Goals</ThemedText>
      <ThemedText style={styles.sectionDescription}>
        What do you want to achieve? (Select multiple)
      </ThemedText>
      
      <View style={styles.optionsGrid}>
        {workoutGoals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            onPress={() => toggleGoal(goal.id)}
            style={[
              styles.optionCard,
              selectedGoals.includes(goal.id) && styles.selectedOptionCard
            ]}
          >
            <LinearGradient
              colors={selectedGoals.includes(goal.id) 
                ? [goal.color + '20', goal.color + '10']
                : ['#F8FAFC', '#FFFFFF']
              }
              style={styles.optionContent}
            >
              <View style={[
                styles.optionIcon,
                { backgroundColor: goal.color + '15' }
              ]}>
                <IconSymbol name={goal.icon} size={24} color={goal.color} />
              </View>
              <ThemedText style={[
                styles.optionLabel,
                selectedGoals.includes(goal.id) && { color: goal.color }
              ]}>
                {goal.label}
              </ThemedText>
              {selectedGoals.includes(goal.id) && (
                <View style={styles.selectedIndicator}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color={goal.color} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEquipmentSelection = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Available Equipment</ThemedText>
      <ThemedText style={styles.sectionDescription}>
        What equipment do you have access to?
      </ThemedText>
      
      <View style={styles.equipmentGrid}>
        {equipmentOptions.map((equipment) => (
          <TouchableOpacity
            key={equipment.id}
            onPress={() => toggleEquipment(equipment.id)}
            style={[
              styles.equipmentCard,
              selectedEquipment.includes(equipment.id) && styles.selectedEquipmentCard
            ]}
          >
            <View style={[
              styles.equipmentIcon,
              selectedEquipment.includes(equipment.id) && styles.selectedEquipmentIcon
            ]}>
              <IconSymbol 
                name={equipment.icon} 
                size={20} 
                color={selectedEquipment.includes(equipment.id) ? '#FFFFFF' : '#6B7280'} 
              />
            </View>
            <ThemedText style={[
              styles.equipmentLabel,
              selectedEquipment.includes(equipment.id) && styles.selectedEquipmentLabel
            ]}>
              {equipment.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFitnessLevel = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Fitness Level</ThemedText>
      <ThemedText style={styles.sectionDescription}>
        How would you describe your current fitness level?
      </ThemedText>
      
      <View style={styles.levelOptions}>
        {fitnessLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            onPress={() => setFitnessLevel(level.id as any)}
            style={[
              styles.levelCard,
              fitnessLevel === level.id && styles.selectedLevelCard
            ]}
          >
            <View style={styles.levelContent}>
              <View style={styles.levelHeader}>
                <ThemedText style={[
                  styles.levelTitle,
                  fitnessLevel === level.id && styles.selectedLevelTitle
                ]}>
                  {level.label}
                </ThemedText>
                {fitnessLevel === level.id && (
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#4F46E5" />
                )}
              </View>
              <ThemedText style={styles.levelDescription}>
                {level.description}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderWorkoutSettings = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Workout Settings</ThemedText>
      
      {/* Session Duration */}
      <View style={styles.settingGroup}>
        <ThemedText style={styles.settingLabel}>Session Duration</ThemedText>
        <View style={styles.durationOptions}>
          {durationOptions.map((duration) => (
            <TouchableOpacity
              key={duration}
              onPress={() => setSessionDuration(duration)}
              style={[
                styles.durationOption,
                sessionDuration === duration && styles.selectedDurationOption
              ]}
            >
              <ThemedText style={[
                styles.durationText,
                sessionDuration === duration && styles.selectedDurationText
              ]}>
                {duration}m
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sessions Per Week */}
      <View style={styles.settingGroup}>
        <ThemedText style={styles.settingLabel}>Sessions Per Week</ThemedText>
        <View style={styles.frequencyOptions}>
          {frequencyOptions.map((frequency) => (
            <TouchableOpacity
              key={frequency}
              onPress={() => setSessionsPerWeek(frequency)}
              style={[
                styles.frequencyOption,
                sessionsPerWeek === frequency && styles.selectedFrequencyOption
              ]}
            >
              <ThemedText style={[
                styles.frequencyText,
                sessionsPerWeek === frequency && styles.selectedFrequencyText
              ]}>
                {frequency}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Plan Preview</ThemedText>
      <View style={styles.previewCard}>
        <LinearGradient
          colors={['#EEF2FF', '#FFFFFF']}
          style={styles.previewContent}
        >
          <View style={styles.previewHeader}>
            <IconSymbol name="calendar" size={24} color="#4F46E5" />
            <ThemedText style={styles.previewTitle}>Your Custom Plan</ThemedText>
          </View>
          
          <View style={styles.previewStats}>
            <View style={styles.previewStat}>
              <ThemedText style={styles.previewStatValue}>{sessionsPerWeek}</ThemedText>
              <ThemedText style={styles.previewStatLabel}>Sessions/Week</ThemedText>
            </View>
            <View style={styles.previewStat}>
              <ThemedText style={styles.previewStatValue}>{sessionDuration}m</ThemedText>
              <ThemedText style={styles.previewStatLabel}>Per Session</ThemedText>
            </View>
            <View style={styles.previewStat}>
              <ThemedText style={styles.previewStatValue}>{availableExercises.length}</ThemedText>
              <ThemedText style={styles.previewStatLabel}>Exercises</ThemedText>
            </View>
          </View>

          {selectedGoals.length > 0 && (
            <View style={styles.previewGoals}>
              <ThemedText style={styles.previewGoalsTitle}>Goals:</ThemedText>
              <View style={styles.previewGoalsTags}>
                {selectedGoals.map((goal) => {
                  const goalData = workoutGoals.find(g => g.id === goal);
                  return goalData ? (
                    <Tag
                      key={goal}
                      text={goalData.label}
                      color={goalData.color}
                      size="small"
                    />
                  ) : null;
                })}
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <IconSymbol name="xmark" size={24} color="#6B7280" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Create Workout Plan</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderGoalSelection()}
        {renderEquipmentSelection()}
        {renderFitnessLevel()}
        {renderWorkoutSettings()}
        {renderPreview()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Generate Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={generateWorkoutPlan}
          disabled={isGenerating || selectedGoals.length === 0}
          style={[
            styles.generateButton,
            (isGenerating || selectedGoals.length === 0) && styles.disabledButton
          ]}
        >
          <LinearGradient
            colors={
              isGenerating || selectedGoals.length === 0
                ? ['#9CA3AF', '#6B7280']
                : ['#4F46E5', '#7C3AED']
            }
            style={styles.generateButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isGenerating ? (
              <>
                <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
                <ThemedText style={styles.generateButtonText}>Generating...</ThemedText>
              </>
            ) : (
              <>
                <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.generateButtonText}>Generate Plan</ThemedText>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOptionCard: {
    shadowOpacity: 0.12,
  },
  optionContent: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
    minHeight: 120,
    justifyContent: 'center',
    position: 'relative',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedEquipmentCard: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  equipmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedEquipmentIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  equipmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  selectedEquipmentLabel: {
    color: '#FFFFFF',
  },
  levelOptions: {
    gap: 12,
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedLevelCard: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  levelContent: {
    gap: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  selectedLevelTitle: {
    color: '#4F46E5',
  },
  levelDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  settingGroup: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedDurationOption: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectedDurationText: {
    color: '#FFFFFF',
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFrequencyOption: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  selectedFrequencyText: {
    color: '#FFFFFF',
  },
  previewCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  previewContent: {
    padding: 20,
    borderRadius: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  previewStat: {
    alignItems: 'center',
  },
  previewStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
  },
  previewStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  previewGoals: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  previewGoalsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  previewGoalsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  generateButton: {
    borderRadius: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 40,
  },
});