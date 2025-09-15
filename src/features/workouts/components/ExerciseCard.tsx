import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Exercise } from '../types/workoutTypes';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  showDetails?: boolean;
}

export function ExerciseCard({ exercise, onPress, showDetails = false }: ExerciseCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardio':
        return 'heart.fill';
      case 'hiit':
        return 'flame.fill';
      case 'strength':
        return 'bolt.fill';
      case 'flexibility':
        return 'figure.walk';
      default:
        return 'figure.run';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cardio':
        return '#FF3B30';
      case 'hiit':
        return '#FF9500';
      case 'strength':
        return '#007AFF';
      case 'flexibility':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#34C759';
      case 'intermediate':
        return '#FF9500';
      case 'advanced':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        <View style={styles.header}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: `${getCategoryColor(exercise.category)}15` }
          ]}>
            <IconSymbol 
              name={getCategoryIcon(exercise.category)} 
              size={20} 
              color={getCategoryColor(exercise.category)} 
            />
          </View>
          <View style={styles.exerciseInfo}>
            <ThemedText style={styles.exerciseTitle}>{exercise.name}</ThemedText>
            <View style={styles.metaInfo}>
              <ThemedText style={styles.duration}>{exercise.duration} min</ThemedText>
              <ThemedText style={styles.separator}>•</ThemedText>
              <ThemedText style={[
                styles.difficulty,
                { color: getDifficultyColor(exercise.difficulty) }
              ]}>
                {exercise.difficulty}
              </ThemedText>
              <ThemedText style={styles.separator}>•</ThemedText>
              <ThemedText style={styles.calories}>
                ~{Math.round(exercise.caloriesPerMinute * exercise.duration)} cal
              </ThemedText>
            </View>
          </View>
          {onPress && (
            <IconSymbol name="chevron.right" size={16} color="#8E8E93" />
          )}
        </View>

        <ThemedText style={styles.description}>{exercise.description}</ThemedText>

        {exercise.equipment.length > 0 && !exercise.equipment.includes('none') && (
          <View style={styles.equipmentContainer}>
            <IconSymbol name="bolt.fill" size={12} color="#8E8E93" />
            <ThemedText style={styles.equipmentText}>
              {exercise.equipment.join(', ').replace(/_/g, ' ')}
            </ThemedText>
          </View>
        )}

        {showDetails && exercise.instructions.length > 0 && (
          <View style={styles.instructionsContainer}>
            <ThemedText style={styles.instructionsTitle}>Instructions:</ThemedText>
            {exercise.instructions.slice(0, 2).map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <ThemedText style={styles.instructionNumber}>{index + 1}.</ThemedText>
                <ThemedText style={styles.instructionText}>{instruction}</ThemedText>
              </View>
            ))}
            {exercise.instructions.length > 2 && (
              <ThemedText style={styles.moreInstructions}>
                +{exercise.instructions.length - 2} more steps
              </ThemedText>
            )}
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#8E8E93',
    marginHorizontal: 4,
  },
  difficulty: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  calories: {
    fontSize: 12,
    color: '#8E8E93',
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
    marginBottom: 8,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  instructionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  instructionNumber: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 6,
    minWidth: 16,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    lineHeight: 16,
  },
  moreInstructions: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 4,
  },
});