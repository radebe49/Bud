import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '../../../../components/ui/IconSymbol';
import type { FoodItem } from '../types/nutritionTypes';

interface FoodCardProps {
  food: FoodItem;
  showMacros?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
}

export function FoodCard({ 
  food, 
  showMacros = true, 
  onPress, 
  onRemove 
}: FoodCardProps) {
  const formatQuantity = (quantity: number, unit: string): string => {
    if (unit === 'g' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)}kg`;
    }
    if (unit === 'ml' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)}L`;
    }
    return `${quantity}${unit}`;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      fruits: 'leaf.fill',
      vegetables: 'carrot.fill',
      grains: 'grain.fill',
      protein: 'fish.fill',
      dairy: 'drop.fill',
      fats_oils: 'drop.circle.fill',
      beverages: 'cup.and.saucer.fill',
      snacks: 'bag.fill',
      sweets: 'heart.fill',
      condiments: 'bottle.fill',
      supplements: 'pills.fill',
      alcohol: 'wineglass.fill',
    };
    return icons[category] || 'circle.fill';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      fruits: '#FF6B6B',
      vegetables: '#4ECDC4',
      grains: '#45B7D1',
      protein: '#96CEB4',
      dairy: '#FFEAA7',
      fats_oils: '#DDA0DD',
      beverages: '#87CEEB',
      snacks: '#F4A460',
      sweets: '#FFB6C1',
      condiments: '#D2B48C',
      supplements: '#98FB98',
      alcohol: '#DDA0DD',
    };
    return colors[category] || '#666666';
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.foodInfo}>
          <View style={[
            styles.categoryIcon,
            { backgroundColor: getCategoryColor(food.foodCategory) }
          ]}>
            <IconSymbol 
              name={getCategoryIcon(food.foodCategory)} 
              size={16} 
              color="#FFFFFF" 
            />
          </View>
          
          <View style={styles.nameContainer}>
            <Text style={styles.foodName} numberOfLines={1}>
              {food.name}
            </Text>
            {food.brand && (
              <Text style={styles.brandName} numberOfLines={1}>
                {food.brand}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantity}>
            {formatQuantity(food.quantity, food.unit)}
          </Text>
          <Text style={styles.calories}>
            {food.calories} cal
          </Text>
        </View>

        {onRemove && (
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <IconSymbol name="minus.circle.fill" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {showMacros && (
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>P</Text>
            <Text style={styles.macroValue}>{Math.round(food.macros.protein)}g</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>C</Text>
            <Text style={styles.macroValue}>{Math.round(food.macros.carbohydrates)}g</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>F</Text>
            <Text style={styles.macroValue}>{Math.round(food.macros.fats)}g</Text>
          </View>
          {food.macros.fiber > 0 && (
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fiber</Text>
              <Text style={styles.macroValue}>{Math.round(food.macros.fiber)}g</Text>
            </View>
          )}
        </View>
      )}

      {food.verified && (
        <View style={styles.verifiedBadge}>
          <IconSymbol name="checkmark.seal.fill" size={12} color="#34C759" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  brandName: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  quantityContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  calories: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginRight: 4,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 11,
    color: '#34C759',
    marginLeft: 4,
    fontWeight: '500',
  },
});