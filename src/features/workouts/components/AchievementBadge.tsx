import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Achievement } from '../types/workoutTypes';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
}

export function AchievementBadge({ achievement, size = 'medium' }: AchievementBadgeProps) {
  const isUnlocked = achievement.unlockedAt !== undefined;
  const progressPercentage = Math.min(achievement.progress, 100);
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          icon: styles.smallIcon,
          title: styles.smallTitle,
          description: styles.smallDescription,
          progress: styles.smallProgress,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          icon: styles.largeIcon,
          title: styles.largeTitle,
          description: styles.largeDescription,
          progress: styles.largeProgress,
        };
      default:
        return {
          container: styles.mediumContainer,
          icon: styles.mediumIcon,
          title: styles.mediumTitle,
          description: styles.mediumDescription,
          progress: styles.mediumProgress,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <ThemedView style={[
      styles.container,
      sizeStyles.container,
      isUnlocked ? styles.unlockedContainer : styles.lockedContainer
    ]}>
      <View style={[
        styles.iconContainer,
        isUnlocked ? styles.unlockedIcon : styles.lockedIcon
      ]}>
        <ThemedText style={[styles.icon, sizeStyles.icon]}>
          {isUnlocked ? achievement.icon : '🔒'}
        </ThemedText>
      </View>
      
      <View style={styles.content}>
        <ThemedText style={[
          styles.title,
          sizeStyles.title,
          isUnlocked ? styles.unlockedText : styles.lockedText
        ]}>
          {achievement.title}
        </ThemedText>
        
        <ThemedText style={[
          styles.description,
          sizeStyles.description,
          isUnlocked ? styles.unlockedDescription : styles.lockedDescription
        ]}>
          {achievement.description}
        </ThemedText>
        
        {!isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, sizeStyles.progress]}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <ThemedText style={styles.progressText}>
              {achievement.progress}/{achievement.target}
            </ThemedText>
          </View>
        )}
        
        {isUnlocked && achievement.unlockedAt && (
          <ThemedText style={styles.unlockedDate}>
            Unlocked {achievement.unlockedAt.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  unlockedContainer: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  lockedContainer: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  iconContainer: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unlockedIcon: {
    backgroundColor: '#007AFF',
  },
  lockedIcon: {
    backgroundColor: '#E5E5EA',
  },
  icon: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  unlockedText: {
    color: '#000',
  },
  lockedText: {
    color: '#8E8E93',
  },
  description: {
    lineHeight: 16,
    marginBottom: 4,
  },
  unlockedDescription: {
    color: '#666',
  },
  lockedDescription: {
    color: '#8E8E93',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    minWidth: 30,
  },
  unlockedDate: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  
  // Small size styles
  smallContainer: {
    padding: 8,
  },
  smallIcon: {
    fontSize: 16,
    width: 24,
    height: 24,
    lineHeight: 24,
  },
  smallTitle: {
    fontSize: 12,
  },
  smallDescription: {
    fontSize: 10,
  },
  smallProgress: {
    height: 2,
  },
  
  // Medium size styles (default)
  mediumContainer: {
    padding: 12,
  },
  mediumIcon: {
    fontSize: 20,
    width: 32,
    height: 32,
    lineHeight: 32,
  },
  mediumTitle: {
    fontSize: 14,
  },
  mediumDescription: {
    fontSize: 12,
  },
  mediumProgress: {
    height: 3,
  },
  
  // Large size styles
  largeContainer: {
    padding: 16,
  },
  largeIcon: {
    fontSize: 24,
    width: 40,
    height: 40,
    lineHeight: 40,
  },
  largeTitle: {
    fontSize: 16,
  },
  largeDescription: {
    fontSize: 14,
  },
  largeProgress: {
    height: 4,
  },
});