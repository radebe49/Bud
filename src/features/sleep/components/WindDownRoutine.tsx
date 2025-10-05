/**
 * Wind-Down Routine Component
 * Interactive component for tracking bedtime routine completion
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RoutineStep } from '../types/sleepTypes';

interface WindDownRoutineProps {
  routineSteps: RoutineStep[];
  onStepComplete?: (stepId: string, completed: boolean) => void;
  onRoutineComplete?: (completionRate: number) => void;
  bedtime: Date;
}

export const WindDownRoutine: React.FC<WindDownRoutineProps> = ({
  routineSteps,
  onStepComplete,
  onRoutineComplete,
  bedtime
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const completionRate = (completedSteps.size / routineSteps.length) * 100;
    onRoutineComplete?.(completionRate);
  }, [completedSteps, routineSteps.length, onRoutineComplete]);

  const toggleStepCompletion = (stepId: string) => {
    const newCompletedSteps = new Set(completedSteps);
    const wasCompleted = completedSteps.has(stepId);
    
    if (wasCompleted) {
      newCompletedSteps.delete(stepId);
    } else {
      newCompletedSteps.add(stepId);
    }
    
    setCompletedSteps(newCompletedSteps);
    onStepComplete?.(stepId, !wasCompleted);
  };

  const getStepStatus = (step: RoutineStep): 'upcoming' | 'current' | 'overdue' | 'completed' => {
    if (completedSteps.has(step.id)) return 'completed';
    
    const stepTime = new Date(bedtime);
    stepTime.setMinutes(stepTime.getMinutes() - step.timeBeforeBed);
    
    const now = currentTime.getTime();
    const stepStart = stepTime.getTime();
    const stepEnd = stepStart + (step.duration * 60 * 1000);
    
    if (now < stepStart) return 'upcoming';
    if (now >= stepStart && now <= stepEnd) return 'current';
    return 'overdue';
  };

  const formatTimeUntilStep = (step: RoutineStep): string => {
    const stepTime = new Date(bedtime);
    stepTime.setMinutes(stepTime.getMinutes() - step.timeBeforeBed);
    
    const timeDiff = stepTime.getTime() - currentTime.getTime();
    const minutesUntil = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesUntil > 60) {
      const hours = Math.floor(minutesUntil / 60);
      const mins = minutesUntil % 60;
      return `in ${hours}h ${mins}m`;
    } else if (minutesUntil > 0) {
      return `in ${minutesUntil}m`;
    } else if (minutesUntil > -step.duration) {
      return 'now';
    } else {
      return 'overdue';
    }
  };

  const sortedSteps = [...routineSteps].sort((a, b) => b.timeBeforeBed - a.timeBeforeBed);
  const completionRate = (completedSteps.size / routineSteps.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wind-Down Routine</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${completionRate}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(completionRate)}% complete
          </Text>
        </View>
      </View>

      <ScrollView style={styles.stepsList} showsVerticalScrollIndicator={false}>
        {sortedSteps.map((step) => {
          const status = getStepStatus(step);
          const isCompleted = completedSteps.has(step.id);
          
          return (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.stepItem,
                styles[`step${status.charAt(0).toUpperCase() + status.slice(1)}`]
              ]}
              onPress={() => toggleStepCompletion(step.id)}
              activeOpacity={0.7}
            >
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <View style={[
                    styles.checkbox,
                    isCompleted && styles.checkboxCompleted
                  ]}>
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={[
                      styles.stepName,
                      isCompleted && styles.stepNameCompleted
                    ]}>
                      {step.name}
                    </Text>
                    <Text style={styles.stepTiming}>
                      {formatTimeUntilStep(step)} • {step.duration} min
                    </Text>
                  </View>
                  <View style={[
                    styles.statusIndicator,
                    styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`]
                  ]} />
                </View>
                
                <Text style={styles.stepDescription}>
                  {step.description}
                </Text>
                
                <View style={styles.stepMeta}>
                  <Text style={styles.categoryTag}>
                    {step.category.replace('_', ' ')}
                  </Text>
                  <Text style={styles.difficulty}>
                    {step.difficulty}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {completionRate === 100 && (
        <View style={styles.completionMessage}>
          <Text style={styles.completionText}>
            🌙 Great job! Your wind-down routine is complete
          </Text>
          <Text style={styles.completionSubtext}>
            You're ready for a good night's sleep
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    minWidth: 80,
    textAlign: 'right',
  },
  stepsList: {
    flex: 1,
    padding: 20,
  },
  stepItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  stepUpcoming: {
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },
  stepCurrent: {
    borderColor: '#007AFF',
    backgroundColor: '#F8FBFF',
  },
  stepOverdue: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF8F8',
  },
  stepCompleted: {
    borderColor: '#6BCF7F',
    backgroundColor: '#F8FFF9',
  },
  stepContent: {
    gap: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#6BCF7F',
    borderColor: '#6BCF7F',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  stepNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  stepTiming: {
    fontSize: 12,
    color: '#666666',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusUpcoming: {
    backgroundColor: '#E0E0E0',
  },
  statusCurrent: {
    backgroundColor: '#007AFF',
  },
  statusOverdue: {
    backgroundColor: '#FF6B6B',
  },
  statusCompleted: {
    backgroundColor: '#6BCF7F',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  stepMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'capitalize',
  },
  difficulty: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'capitalize',
  },
  completionMessage: {
    padding: 20,
    backgroundColor: '#F8FFF9',
    borderTopWidth: 1,
    borderTopColor: '#E8F5E8',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A3D',
    marginBottom: 4,
  },
  completionSubtext: {
    fontSize: 14,
    color: '#5A7A5A',
  },
});