import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '../../../../components/ui/IconSymbol';
import { FoodCard } from './FoodCard';
import { nutritionService } from '../services/nutritionService';
import type { FoodItem, MealType } from '../types/nutritionTypes';

interface FoodSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onFoodSelected: (food: FoodItem) => void;
  mealType: MealType;
}

export function FoodSearchModal({ 
  visible, 
  onClose, 
  onFoodSelected, 
  mealType 
}: FoodSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentFoods] = useState<FoodItem[]>([
    // Mock recent foods - in real app, this would come from user history
    {
      id: 'recent1',
      name: 'Banana',
      quantity: 118,
      unit: 'g',
      calories: 105,
      macros: { protein: 1.3, carbohydrates: 27, fats: 0.4, fiber: 3.1, sugar: 14 },
      servingSize: { amount: 118, unit: 'g', description: '1 medium banana' },
      foodCategory: 'fruits',
      verified: true,
    },
    {
      id: 'recent2',
      name: 'Greek Yogurt',
      brand: 'Chobani',
      quantity: 170,
      unit: 'g',
      calories: 130,
      macros: { protein: 20, carbohydrates: 9, fats: 0, fiber: 0, sugar: 6 },
      servingSize: { amount: 170, unit: 'g', description: '1 container' },
      foodCategory: 'dairy',
      verified: true,
    },
  ]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchFood();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchFood = async () => {
    try {
      setLoading(true);
      const results = await nutritionService.searchFood(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Food search failed:', error);
      Alert.alert('Error', 'Failed to search for food');
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    onFoodSelected(food);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleBarcodeScan = () => {
    // TODO: Implement barcode scanning
    Alert.alert('Barcode Scanner', 'Barcode scanning will be implemented in a future update');
  };

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark" size={20} color="#666666" />
          </TouchableOpacity>
          
          <Text style={styles.title}>
            Add to {getMealDisplayName(mealType)}
          </Text>
          
          <TouchableOpacity style={styles.scanButton} onPress={handleBarcodeScan}>
            <IconSymbol name="barcode.viewfinder" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <IconSymbol name="magnifyingglass" size={16} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <IconSymbol name="xmark.circle.fill" size={16} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {searchQuery.length >= 2 && searchResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {searchResults.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onPress={() => handleFoodSelect(food)}
                />
              ))}
            </View>
          )}

          {searchQuery.length >= 2 && !loading && searchResults.length === 0 && (
            <View style={styles.noResultsContainer}>
              <IconSymbol name="magnifyingglass" size={48} color="#CCCCCC" />
              <Text style={styles.noResultsTitle}>No results found</Text>
              <Text style={styles.noResultsText}>
                Try a different search term or scan a barcode
              </Text>
            </View>
          )}

          {searchQuery.length < 2 && (
            <>
              {/* Quick Add Suggestions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Add</Text>
                <View style={styles.quickAddGrid}>
                  {['Apple', 'Banana', 'Water', 'Coffee'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.quickAddItem}
                      onPress={() => setSearchQuery(item)}
                    >
                      <Text style={styles.quickAddText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Recent Foods */}
              {recentFoods.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Foods</Text>
                  {recentFoods.map((food) => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onPress={() => handleFoodSelect(food)}
                    />
                  ))}
                </View>
              )}

              {/* Popular Foods by Meal */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Popular for {getMealDisplayName(mealType)}
                </Text>
                <Text style={styles.comingSoonText}>
                  Popular food suggestions coming soon...
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scanButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickAddItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickAddText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});