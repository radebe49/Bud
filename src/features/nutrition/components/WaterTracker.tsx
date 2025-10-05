import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '../../../../components/ui/IconSymbol';
import { ProgressRing } from '../../../shared/components/ProgressRing';

interface WaterTrackerProps {
  current: number; // in ml
  goal: number; // in ml
  onAddWater: (amount: number) => void;
}

export function WaterTracker({ current, goal, onAddWater }: WaterTrackerProps) {
  const progress = current / goal;
  const remainingMl = Math.max(0, goal - current);
  
  // Convert ml to more readable format
  const formatWaterAmount = (ml: number): string => {
    if (ml >= 1000) {
      return `${(ml / 1000).toFixed(1)}L`;
    }
    return `${ml}ml`;
  };

  const quickAddAmounts = [250, 500, 750]; // Common water amounts in ml

  return (
    <View style={styles.container}>
      <View style={styles.progressSection}>
        <View style={styles.progressRingContainer}>
          <ProgressRing
            progress={progress}
            size={80}
            strokeWidth={8}
            color="#4ECDC4"
            backgroundColor="#E5E7EB"
          />
          <View style={styles.progressTextContainer}>
            <Text style={styles.currentAmount}>
              {formatWaterAmount(current)}
            </Text>
          </View>
        </View>
        
        <View style={styles.waterStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatWaterAmount(goal)}</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatWaterAmount(remainingMl)}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(progress * 100)}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickAddSection}>
        <Text style={styles.quickAddTitle}>Quick Add</Text>
        <View style={styles.quickAddButtons}>
          {quickAddAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.quickAddButton}
              onPress={() => onAddWater(amount)}
            >
              <IconSymbol name="drop.fill" size={16} color="#4ECDC4" />
              <Text style={styles.quickAddButtonText}>
                {formatWaterAmount(amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hydration Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Hydration Tips</Text>
        <Text style={styles.tipText}>
          {progress < 0.3 
            ? "Start your day with a glass of water to kickstart hydration"
            : progress < 0.6
            ? "Keep a water bottle nearby as a visual reminder to drink"
            : progress < 0.9
            ? "You're doing great! Keep up the good hydration habits"
            : "Excellent hydration today! Your body thanks you 🎉"
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressRingContainer: {
    position: 'relative',
    marginRight: 20,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  waterStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  quickAddSection: {
    marginBottom: 16,
  },
  quickAddTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  quickAddButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAddButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickAddButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
    marginLeft: 6,
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
});