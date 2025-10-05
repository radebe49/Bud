import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '../../../../components/ui/IconSymbol';
import { FoodCard } from './FoodCard';
import type { MealEntry, MealType } from '../types/nutritionTypes';

interface MealSectionProps {
  mealType: MealType;
  meals: MealEntry[];
  onAddFood: () => void;
}

export function MealSection({ mealType, meals, onAddFood }: MealSectionProps) {
  const getMealDisplayName = (type: MealType): string => {
    const names: Record<MealType, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snacks',
      pre_workout: 'Pre-Workout',
      post_workout: 'Post-Workout',
      late_night: 'Late Night',
    };
    return names[type];
  };

  const getMealIcon = (type: MealType): string => {
    const icons: Record<MealType, string> = {
      breakfast: 'sunrise.fill',
      lunch: 'sun.max.fill',
      dinner: 'moon.fill',
      snack: 'leaf.fill',
      pre_workout: 'figure.run',
      post_workout: 'figure.cooldown',
      late_night: 'moon.stars.fill',
    };
    return icons[type];
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalFoods = meals.reduce((sum, meal) => sum + meal.foods.length, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.mealInfo}>
          <IconSymbol 
            name={getMealIcon(mealType)} 
            size={20} 
            color="#666666" 
          />
          <Text style={styles.mealName}>{getMealDisplayName(mealType)}</Text>
          {totalCalories > 0 && (
            <Text style={styles.calorieCount}>{totalCalories} cal</Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={onAddFood}>
          <IconSymbol name="plus.circle.fill" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {meals.length === 0 ? (
        <TouchableOpacity style={styles.emptyState} onPress={onAddFood}>
          <Text style={styles.emptyStateText}>
            Tap to add {getMealDisplayName(mealType).toLowerCase()}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.foodList}>
          {meals.map((meal) =>
            meal.foods.map((food) => (
              <FoodCard
                key={`${meal.id}-${food.id}`}
                food={food}
                showMacros={false}
              />
            ))
          )}
          
          {totalFoods > 1 && (
            <View style={styles.mealSummary}>
              <Text style={styles.summaryText}>
                {totalFoods} items • {totalCalories} calories
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  calorieCount: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  addButton: {
    padding: 4,
  },
  emptyState: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
  },
  foodList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  mealSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
});