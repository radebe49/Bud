import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MacroTargets } from '../types/nutritionTypes';

interface MacroBarProps {
  macroTargets: MacroTargets;
}

export function MacroBar({ macroTargets }: MacroBarProps) {
  const renderMacroBar = (
    name: string,
    target: { target: number; current: number; percentage: number },
    color: string,
    unit: string = 'g'
  ) => {
    const progress = Math.min(target.percentage / 100, 1);
    
    return (
      <View key={name} style={styles.macroItem}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroName}>{name}</Text>
          <Text style={styles.macroValues}>
            {Math.round(target.current)}{unit} / {target.target}{unit}
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${progress * 100}%`, backgroundColor: color }
              ]} 
            />
          </View>
          <Text style={styles.percentageText}>{target.percentage}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderMacroBar('Protein', macroTargets.protein, '#FF6B6B')}
      {renderMacroBar('Carbs', macroTargets.carbs, '#4ECDC4')}
      {renderMacroBar('Fats', macroTargets.fats, '#45B7D1')}
      {renderMacroBar('Fiber', macroTargets.fiber, '#96CEB4')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  macroItem: {
    marginBottom: 16,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  macroValues: {
    fontSize: 14,
    color: '#666666',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    minWidth: 40,
    textAlign: 'right',
  },
});