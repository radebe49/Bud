import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProgressRing } from '@/shared/components/ProgressRing';
import { workoutService } from '../services/workoutService';
import type { 
  WorkoutSession, 
  Exercise, 
  CompletedExercise,
  ProgressMetric 
} from '../types/workoutTypes';

const { width } = Dimensions.get('window');

interface WorkoutTrackingScreenProps {
  workoutId: string;
  onComplete: (session: WorkoutSession) => void;
  onCancel: () => void;
}

export function WorkoutTrackingScreen({ 
  workoutId, 
  onComplete, 
  onCancel 
}: WorkoutTrackingScreenProps) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    initializeWorkout();
  }, [workoutId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const initializeWorkout = async () => {
    try {
      const workoutSession = await workoutService.startWorkout(workoutId);
      const exerciseLibrary = await workoutService.getExerciseLibrary();
      
      setSession(workoutSession);
      setExercises(exerciseLibrary.slice(0, 3)); // Mock workout with 3 exercises
      setIsActive(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout');
      onCancel();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) return;

    const maxSets = currentExercise.sets || 3;
    
    if (currentSet < maxSets) {
      setCurrentSet(currentSet + 1);
    } else {
      // Complete exercise
      const completedExercise: CompletedExercise = {
        exerciseId: currentExercise.id,
        exerciseName: currentExercise.name,
        duration: Math.floor(elapsedTime / 60), // Convert to minutes
        sets: maxSets,
        reps: currentExercise.reps || 12,
        notes: `Completed ${maxSets} sets`
      };

      setCompletedExercises([...completedExercises, completedExercise]);
      
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
      } else {
        completeWorkout();
      }
    }
  };

  const handleSkipExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
    } else {
      completeWorkout();
    }
  };

  const completeWorkout = async () => {
    if (!session) return;

    try {
      const completedSession: WorkoutSession = {
        ...session,
        endTime: new Date(),
        duration: Math.floor(elapsedTime / 60),
        caloriesBurned: Math.floor(elapsedTime * 8), // Rough estimate
        exercises: completedExercises,
        completed: true
      };

      await workoutService.completeWorkout(session.id, completedSession);
      setIsActive(false);
      onComplete(completedSession);
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const handlePauseResume = () => {
    setIsActive(!isActive);
  };

  const handleEndWorkout = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Workout', style: 'destructive', onPress: completeWorkout }
      ]
    );
  };

  const currentExercise = exercises[currentExerciseIndex];
  const progress = exercises.length > 0 ? (currentExerciseIndex + 1) / exercises.length : 0;

  if (!session || !currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ProgressRing
            size={60}
            strokeWidth={6}
            progress={0.7}
            color="#4F46E5"
            animated={true}
          />
          <ThemedText style={styles.loadingText}>Starting workout...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <IconSymbol name="xmark" size={24} color="#6B7280" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.workoutTitle}>{session.workoutName}</ThemedText>
          <ThemedText style={styles.exerciseCounter}>
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={handleEndWorkout} style={styles.headerButton}>
          <IconSymbol name="stop.fill" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <ThemedText style={styles.progressText}>
          {Math.round(progress * 100)}% Complete
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Timer */}
        <View style={styles.timerContainer}>
          <LinearGradient
            colors={['#F8FAFC', '#FFFFFF']}
            style={styles.timerCard}
          >
            <ThemedText style={styles.timerLabel}>Workout Time</ThemedText>
            <ThemedText style={styles.timerValue}>{formatTime(elapsedTime)}</ThemedText>
            <TouchableOpacity 
              onPress={handlePauseResume}
              style={[styles.pauseButton, { backgroundColor: isActive ? '#EF4444' : '#10B981' }]}
            >
              <IconSymbol 
                name={isActive ? 'pause.fill' : 'play.fill'} 
                size={20} 
                color="#FFFFFF" 
              />
              <ThemedText style={styles.pauseButtonText}>
                {isActive ? 'Pause' : 'Resume'}
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Current Exercise */}
        <View style={styles.exerciseContainer}>
          <LinearGradient
            colors={['#EEF2FF', '#FFFFFF']}
            style={styles.exerciseCard}
          >
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseIcon}>
                <IconSymbol name="figure.run" size={32} color="#4F46E5" />
              </View>
              <View style={styles.exerciseInfo}>
                <ThemedText style={styles.exerciseName}>{currentExercise.name}</ThemedText>
                <ThemedText style={styles.exerciseDescription}>
                  {currentExercise.description}
                </ThemedText>
              </View>
              <TouchableOpacity 
                onPress={() => setShowExerciseDetails(true)}
                style={styles.infoButton}
              >
                <IconSymbol name="info.circle" size={24} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            {/* Set Information */}
            {currentExercise.sets && (
              <View style={styles.setInfo}>
                <View style={styles.setCounter}>
                  <ThemedText style={styles.setLabel}>Set</ThemedText>
                  <ThemedText style={styles.setNumber}>
                    {currentSet} / {currentExercise.sets}
                  </ThemedText>
                </View>
                <View style={styles.repsInfo}>
                  <ThemedText style={styles.repsLabel}>Target Reps</ThemedText>
                  <ThemedText style={styles.repsNumber}>
                    {currentExercise.reps || 12}
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={handleSkipExercise}
                style={styles.skipButton}
              >
                <IconSymbol name="forward.fill" size={20} color="#6B7280" />
                <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleCompleteSet}
                style={styles.completeButton}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  style={styles.completeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.completeButtonText}>
                    {currentSet < (currentExercise.sets || 3) ? 'Complete Set' : 'Complete Exercise'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Completed Exercises */}
        {completedExercises.length > 0 && (
          <View style={styles.completedSection}>
            <ThemedText style={styles.completedTitle}>Completed Exercises</ThemedText>
            {completedExercises.map((exercise, index) => (
              <View key={index} style={styles.completedExercise}>
                <View style={styles.completedIcon}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
                </View>
                <View style={styles.completedInfo}>
                  <ThemedText style={styles.completedName}>{exercise.exerciseName}</ThemedText>
                  <ThemedText style={styles.completedDetails}>
                    {exercise.sets} sets × {exercise.reps} reps
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Exercise Details Modal */}
      <Modal
        visible={showExerciseDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>{currentExercise.name}</ThemedText>
            <TouchableOpacity 
              onPress={() => setShowExerciseDetails(false)}
              style={styles.modalCloseButton}
            >
              <IconSymbol name="xmark" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <ThemedText style={styles.modalDescription}>
              {currentExercise.description}
            </ThemedText>
            
            <View style={styles.instructionsSection}>
              <ThemedText style={styles.instructionsTitle}>Instructions</ThemedText>
              {currentExercise.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <ThemedText style={styles.instructionNumber}>{index + 1}.</ThemedText>
                  <ThemedText style={styles.instructionText}>{instruction}</ThemedText>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  exerciseCounter: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timerContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  timerCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  timerLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseContainer: {
    marginBottom: 24,
  },
  exerciseCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  exerciseIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  setCounter: {
    alignItems: 'center',
  },
  setLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  setNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
  },
  repsInfo: {
    alignItems: 'center',
  },
  repsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  repsNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    gap: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  completeButton: {
    flex: 2,
    borderRadius: 16,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  completedSection: {
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  completedExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  completedIcon: {
    marginRight: 12,
  },
  completedInfo: {
    flex: 1,
  },
  completedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  completedDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
    marginRight: 12,
    minWidth: 24,
  },
  instructionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    flex: 1,
  },
});