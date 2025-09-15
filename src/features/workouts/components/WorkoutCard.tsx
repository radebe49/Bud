import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { WorkoutPlan, WorkoutRecommendation } from '../types/workoutTypes';

interface WorkoutCardProps {
  workout: WorkoutPlan;
  recommendation?: WorkoutRecommendation;
  onPress?: () => void;
  showRecommendationReason?: boolean;
}

export function WorkoutCard({ 
  workout, 
  recommendation, 
  onPress, 
  showRecommendationReason = false 
}: WorkoutCardProps) {
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
        return '#EF4444';
      case 'hiit':
        return '#F97316';
      case 'strength':
        return '#3B82F6';
      case 'flexibility':
        return '#10B981';
      default:
        return '#8B5CF6';
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'cardio':
        return ['#FEF2F2', '#FFFFFF'];
      case 'hiit':
        return ['#FFF7ED', '#FFFFFF'];
      case 'strength':
        return ['#EFF6FF', '#FFFFFF'];
      case 'flexibility':
        return ['#F0FDF4', '#FFFFFF'];
      default:
        return ['#F5F3FF', '#FFFFFF'];
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardContainer}>
      <LinearGradient
        colors={getCategoryGradient(workout.category)}
        style={[
          styles.card,
          recommendation?.priority === 'high' && styles.highPriorityCard
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {recommendation?.priority === 'high' && (
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.priorityBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <IconSymbol name="star.fill" size={12} color="#FFFFFF" />
            <ThemedText style={styles.priorityText}>RECOMMENDED</ThemedText>
          </LinearGradient>
        )}
        
        <View style={styles.header}>
          <LinearGradient
            colors={[getCategoryColor(workout.category) + '20', getCategoryColor(workout.category) + '10']}
            style={styles.iconContainer}
          >
            <IconSymbol 
              name={getCategoryIcon(workout.category)} 
              size={24} 
              color={getCategoryColor(workout.category)} 
            />
          </LinearGradient>
          <View style={styles.workoutInfo}>
            <ThemedText style={styles.workoutTitle}>{workout.name}</ThemedText>
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <IconSymbol name="clock.fill" size={12} color="#6B7280" />
                <ThemedText style={styles.metaText}>{workout.totalDuration} min</ThemedText>
              </View>
              <View style={styles.metaItem}>
                <IconSymbol name="flame.fill" size={12} color="#F97316" />
                <ThemedText style={styles.metaText}>{workout.estimatedCalories} cal</ThemedText>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workout.difficulty) + '20' }]}>
                <ThemedText style={[styles.difficultyText, { color: getDifficultyColor(workout.difficulty) }]}>
                  {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <ThemedText style={styles.description}>
          {showRecommendationReason && recommendation?.reason 
            ? recommendation.reason 
            : workout.description}
        </ThemedText>

        {workout.equipment.length > 0 && !workout.equipment.includes('none') && (
          <View style={styles.equipmentContainer}>
            <View style={styles.equipmentIcon}>
              <IconSymbol name="wrench.fill" size={12} color="#6B7280" />
            </View>
            <ThemedText style={styles.equipmentText}>
              {workout.equipment.join(', ').replace(/_/g, ' ')}
            </ThemedText>
          </View>
        )}

        {workout.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {workout.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: getCategoryColor(workout.category) + '15' }]}>
                <ThemedText style={[styles.tagText, { color: getCategoryColor(workout.category) }]}>{tag}</ThemedText>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionIndicator}>
          <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  highPriorityCard: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  priorityBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 16,
    gap: 4,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    color: '#374151',
    fontWeight: '500',
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  equipmentIcon: {
    marginRight: 8,
  },
  equipmentText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'capitalize',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});