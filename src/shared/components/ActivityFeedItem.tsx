import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

type IconName = 
  | 'trophy.fill'
  | 'heart.fill'
  | 'brain.head.profile'
  | 'moon.fill'
  | 'flame.fill'
  | 'figure.walk'
  | 'drop.fill'
  | 'fork.knife';

interface ActivityFeedItemProps {
  icon: IconName;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  type: 'achievement' | 'activity' | 'insight';
}

export function ActivityFeedItem({
  icon,
  iconColor,
  title,
  description,
  time,
  type,
}: ActivityFeedItemProps) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'achievement':
        return '#FFF3CD';
      case 'activity':
        return '#D1ECF1';
      case 'insight':
        return '#E2E3E5';
      default:
        return '#F8F9FA';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor() }]}>
        <IconSymbol name={icon} size={20} color={iconColor} />
      </View>
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
        <ThemedText style={styles.time}>{time}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    opacity: 0.6,
  },
});