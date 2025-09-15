import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface FixedHeaderProps {
  onProfilePress?: () => void;
}

export function FixedHeader({ onProfilePress }: FixedHeaderProps) {
  return (
    <View style={styles.header}>
      <ThemedText style={styles.appName}>bud</ThemedText>
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <View style={styles.profileIcon}>
          <ThemedText style={styles.profileInitial}>A</ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});