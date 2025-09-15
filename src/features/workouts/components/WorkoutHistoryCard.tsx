import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { WorkoutSession } from '../types/workoutTypes';

interface WorkoutHistoryCardProps {
  session: WorkoutSession;
  onPress?: () => void;
}

export function WorkoutHistoryCard({ session, onPress }: WorkoutHistoryCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 2) return '2 days ago';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    
    return Array.from({ length: 5 }, (_, index) => (
      <IconSymbol
        key={index}
        name={index < rating ? 'trophy.fill' : 'minus'}
        size={12}
        color={index < rating ? '#FFD700' : '#E5E5EA'}
      />
    ));
  };

  const getMainExercise = () => {
    if (session.exercises.length === 0) return null;
    const mainExercise = session.exercises[0];
    
    let details = '';
    if (mainExercise.distance) {
      details = `${mainExercise.distance} miles`;
    } else if (mainExercise.sets && mainExercise.reps) {
      details = `${mainExercise.sets} sets × ${mainExercise.reps} reps`;
    }
    
    return details;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardContainer}>
      <LinearGradient
        colors={session.completed ? ['#F0FDF4', '#FFFFFF'] : ['#FEF2F2', '#FFFFFF']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <LinearGradient
              colors={session.completed ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
              style={styles.statusIndicator}
            >
              <IconSymbol 
                name={session.completed ? "checkmark.circle.fill" : "clock.fill"} 
                size={16} 
                color="#FFFFFF" 
              />
            </LinearGradient>
            
            <View style={styles.workoutInfo}>
              <ThemedText style={styles.date}>{formatDate(session.startTime)}</ThemedText>
              <ThemedText style={styles.workoutName}>{session.workoutName}</ThemedText>
            </View>
          </View>
          
          <View style={styles.rightSection}>
            {session.rating && (
              <View style={styles.ratingContainer}>
                {getRatingStars(session.rating)}
              </View>
            )}
            <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <View style={styles.statIcon}>
                <IconSymbol name="clock.fill" size={12} color="#6B7280" />
              </View>
              <ThemedText style={styles.statText}>
                {formatDuration(session.duration)}
              </ThemedText>
            </View>
            
            <View style={styles.stat}>
              <View style={styles.statIcon}>
                <IconSymbol name="flame.fill" size={12} color="#F97316" />
              </View>
              <ThemedText style={styles.statText}>
                {session.caloriesBurned} cal
              </ThemedText>
            </View>
            
            {getMainExercise() && (
              <View style={styles.stat}>
                <View style={styles.statIcon}>
                  <IconSymbol name="chart.bar.fill" size={12} color="#10B981" />
                </View>
                <ThemedText style={styles.statText}>
                  {getMainExercise()}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
        
        {session.notes && (
          <View style={styles.notesContainer}>
            <View style={styles.notesIcon}>
              <IconSymbol name="quote.bubble.fill" size={12} color="#8B5CF6" />
            </View>
            <ThemedText style={styles.notes} numberOfLines={2}>
              {session.notes}
            </ThemedText>
          </View>
        )}
        
        {session.exercises.length > 1 && (
          <View style={styles.exerciseCount}>
            <View style={styles.exerciseCountIcon}>
              <IconSymbol name="list.bullet" size={12} color="#4F46E5" />
            </View>
            <ThemedText style={styles.exerciseCountText}>
              +{session.exercises.length - 1} more exercise{session.exercises.length > 2 ? 's' : ''}
            </ThemedText>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  workoutName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  rightSection: {
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  statsContainer: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    gap: 8,
  },
  notesIcon: {
    marginTop: 2,
  },
  notes: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  exerciseCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  exerciseCountIcon: {
    // No additional styling needed
  },
  exerciseCountText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
});