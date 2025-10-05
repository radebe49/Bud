import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '../../../../components/ui/IconSymbol';
import { ProgressRing } from '../../../shared/components/ProgressRing';
import { MetricCard } from '../../../shared/components/MetricCard';
import { MacroBar } from '../components/MacroBar';
import { WaterTracker } from '../components/WaterTracker';
import { FoodCard } from '../components/FoodCard';
import { MealSection } from '../components/MealSection';
import { NutritionInsightCard } from '../components/NutritionInsightCard';
import { FoodSearchModal } from '../components/FoodSearchModal';
import { nutritionService } from '../services/nutritionService';
import type { NutritionTracking, MealEntry, FoodItem, MealType } from '../types/nutritionTypes';

export function NutritionScreen() {
  const [nutritionData, setNutritionData] = useState<NutritionTracking | null>(null);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    try {
      setLoading(true);
      const data = await nutritionService.getTodaysNutrition();
      setNutritionData(data);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
      Alert.alert('Error', 'Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowFoodSearch(true);
  };

  const handleFoodSelected = async (food: FoodItem) => {
    try {
      await nutritionService.addFoodToMeal(selectedMealType, food);
      setShowFoodSearch(false);
      await loadNutritionData(); // Refresh data
    } catch (error) {
      console.error('Failed to add food:', error);
      Alert.alert('Error', 'Failed to add food to meal');
    }
  };

  const handleWaterIntake = async (amount: number) => {
    try {
      await nutritionService.addWaterIntake(amount);
      await loadNutritionData(); // Refresh data
    } catch (error) {
      console.error('Failed to add water intake:', error);
      Alert.alert('Error', 'Failed to log water intake');
    }
  };

  const handleBarcodeScan = () => {
    // TODO: Implement barcode scanning
    Alert.alert('Barcode Scanner', 'Barcode scanning will be implemented in a future update');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading nutrition data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!nutritionData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load nutrition data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNutritionData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const calorieProgress = nutritionData.caloriesConsumed / nutritionData.dailyCalorieGoal;
  const waterProgress = nutritionData.currentWaterIntake / nutritionData.waterIntakeGoal;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <TouchableOpacity style={styles.scanButton} onPress={handleBarcodeScan}>
            <IconSymbol name="barcode.viewfinder" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Calorie Overview */}
        <View style={styles.calorieSection}>
          <View style={styles.calorieRingContainer}>
            <ProgressRing
              progress={calorieProgress}
              size={120}
              strokeWidth={12}
              color="#FF6B6B"
              backgroundColor="#F0F0F0"
            />
            <View style={styles.calorieTextContainer}>
              <Text style={styles.caloriesConsumed}>
                {Math.round(nutritionData.caloriesConsumed)}
              </Text>
              <Text style={styles.calorieGoal}>
                / {nutritionData.dailyCalorieGoal}
              </Text>
              <Text style={styles.calorieLabel}>calories</Text>
            </View>
          </View>
          
          <View style={styles.calorieStats}>
            <View style={styles.calorieStat}>
              <Text style={styles.calorieStatValue}>
                {nutritionData.caloriesRemaining > 0 
                  ? nutritionData.caloriesRemaining 
                  : 0}
              </Text>
              <Text style={styles.calorieStatLabel}>Remaining</Text>
            </View>
            <View style={styles.calorieStat}>
              <Text style={[
                styles.calorieStatValue,
                nutritionData.caloriesRemaining < 0 && styles.overCalories
              ]}>
                {nutritionData.caloriesRemaining < 0 
                  ? Math.abs(nutritionData.caloriesRemaining)
                  : 0}
              </Text>
              <Text style={styles.calorieStatLabel}>Over</Text>
            </View>
          </View>
        </View>

        {/* Macros */}
        <View style={styles.macroSection}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <MacroBar macroTargets={nutritionData.macroTargets} />
        </View>

        {/* Water Intake */}
        <View style={styles.waterSection}>
          <Text style={styles.sectionTitle}>Hydration</Text>
          <WaterTracker
            current={nutritionData.currentWaterIntake}
            goal={nutritionData.waterIntakeGoal}
            onAddWater={handleWaterIntake}
          />
        </View>

        {/* Meals */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          
          <MealSection
            mealType="breakfast"
            meals={nutritionData.mealLog.filter(meal => meal.mealType === 'breakfast')}
            onAddFood={() => handleAddFood('breakfast')}
          />
          
          <MealSection
            mealType="lunch"
            meals={nutritionData.mealLog.filter(meal => meal.mealType === 'lunch')}
            onAddFood={() => handleAddFood('lunch')}
          />
          
          <MealSection
            mealType="dinner"
            meals={nutritionData.mealLog.filter(meal => meal.mealType === 'dinner')}
            onAddFood={() => handleAddFood('dinner')}
          />
          
          <MealSection
            mealType="snack"
            meals={nutritionData.mealLog.filter(meal => meal.mealType === 'snack')}
            onAddFood={() => handleAddFood('snack')}
          />
        </View>

        {/* Nutrition Insights */}
        {nutritionData.nutritionInsights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Insights</Text>
            {nutritionData.nutritionInsights.map((insight) => (
              <NutritionInsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        )}

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Food Search Modal */}
      <FoodSearchModal
        visible={showFoodSearch}
        onClose={() => setShowFoodSearch(false)}
        onFoodSelected={handleFoodSelected}
        mealType={selectedMealType}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  scanButton: {
    padding: 8,
  },
  calorieSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  calorieRingContainer: {
    position: 'relative',
    marginRight: 20,
  },
  calorieTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesConsumed: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  calorieGoal: {
    fontSize: 16,
    color: '#666666',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  calorieStats: {
    flex: 1,
  },
  calorieStat: {
    marginBottom: 16,
  },
  calorieStatValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  overCalories: {
    color: '#FF3B30',
  },
  calorieStatLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  macroSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  waterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mealsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  bottomPadding: {
    height: Platform.select({
      ios: 100,
      android: 80,
    }),
  },
});