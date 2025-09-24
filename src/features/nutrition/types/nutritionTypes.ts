/**
 * Nutrition tracking and meal planning types
 * Used for food logging, macro tracking, and nutrition coaching
 */

import type { MacroNutrients, MicroNutrients } from '../../../shared/types/healthTypes';

export interface NutritionTracking {
  dailyCalorieGoal: number;
  caloriesConsumed: number;
  caloriesRemaining: number;
  macroTargets: MacroTargets;
  waterIntakeGoal: number; // in ml
  currentWaterIntake: number;
  mealLog: MealEntry[];
  nutritionInsights: NutritionInsight[];
}

export interface MealEntry {
  id: string;
  userId: string;
  timestamp: Date;
  mealType: MealType;
  foods: FoodItem[];
  totalCalories: number;
  macros: MacroNutrients;
  micros?: MicroNutrients;
  notes?: string;
  location?: string;
  mood?: MealMood;
}

export type MealType = 
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'pre_workout'
  | 'post_workout'
  | 'late_night';

export type MealMood = 
  | 'satisfied'
  | 'still_hungry'
  | 'overfull'
  | 'energized'
  | 'sluggish'
  | 'craving_more';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  quantity: number;
  unit: FoodUnit;
  calories: number;
  macros: MacroNutrients;
  micros?: MicroNutrients;
  servingSize: ServingSize;
  foodCategory: FoodCategory;
  verified: boolean; // Whether nutritional data is verified
}

export type FoodUnit = 
  | 'g'      // grams
  | 'ml'     // milliliters
  | 'cup'    // cups
  | 'tbsp'   // tablespoons
  | 'tsp'    // teaspoons
  | 'oz'     // ounces
  | 'piece'  // individual pieces
  | 'slice'  // slices
  | 'serving'; // standard serving

export interface ServingSize {
  amount: number;
  unit: FoodUnit;
  description?: string; // e.g., "1 medium apple", "1 cup chopped"
}

export type FoodCategory = 
  | 'fruits'
  | 'vegetables'
  | 'grains'
  | 'protein'
  | 'dairy'
  | 'fats_oils'
  | 'beverages'
  | 'snacks'
  | 'sweets'
  | 'condiments'
  | 'supplements'
  | 'alcohol';

export interface MacroTargets {
  protein: MacroTarget;
  carbs: MacroTarget;
  fats: MacroTarget;
  fiber: MacroTarget;
}

export interface MacroTarget {
  target: number; // in grams
  current: number; // in grams
  percentage: number; // 0-100, percentage of target achieved
  min?: number; // minimum recommended
  max?: number; // maximum recommended
}

export interface NutritionInsight {
  id: string;
  type: NutritionInsightType;
  message: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  relatedMetrics?: string[]; // IDs of related health metrics
  actionable: boolean;
}

export type NutritionInsightType = 
  | 'calorie_deficit'
  | 'calorie_surplus'
  | 'macro_balance'
  | 'hydration'
  | 'meal_timing'
  | 'nutrient_deficiency'
  | 'food_quality'
  | 'eating_pattern'
  | 'performance_correlation';

export interface WaterIntake {
  id: string;
  userId: string;
  timestamp: Date;
  amount: number; // in ml
  source: WaterSource;
  temperature?: WaterTemperature;
}

export type WaterSource = 
  | 'plain_water'
  | 'flavored_water'
  | 'tea'
  | 'coffee'
  | 'juice'
  | 'sports_drink'
  | 'other_beverage';

export type WaterTemperature = 
  | 'cold'
  | 'room_temperature'
  | 'warm'
  | 'hot';

export interface NutritionGoals {
  dailyCalories: number;
  macroDistribution: {
    proteinPercentage: number; // % of total calories
    carbPercentage: number;    // % of total calories
    fatPercentage: number;     // % of total calories
  };
  waterIntakeGoal: number; // in ml
  mealFrequency: number; // meals per day
  specialDietary: DietaryRestriction[];
}

export type DietaryRestriction = 
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'low_carb'
  | 'low_fat'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'halal'
  | 'kosher';

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  dailyMeals: DailyMealPlan[];
  nutritionTargets: NutritionGoals;
  createdBy: 'ai' | 'nutritionist' | 'user';
  adherenceScore?: number; // 0-100
}

export interface DailyMealPlan {
  date: Date;
  meals: PlannedMeal[];
  totalCalories: number;
  totalMacros: MacroNutrients;
  shoppingList?: ShoppingListItem[];
}

export interface PlannedMeal {
  mealType: MealType;
  name: string;
  description?: string;
  ingredients: FoodItem[];
  instructions?: string[];
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ShoppingListItem {
  foodId: string;
  name: string;
  quantity: number;
  unit: FoodUnit;
  category: FoodCategory;
  purchased: boolean;
  notes?: string;
}

export interface FoodDatabase {
  searchFood: (query: string) => Promise<FoodItem[]>;
  getFoodByBarcode: (barcode: string) => Promise<FoodItem | null>;
  addCustomFood: (food: Omit<FoodItem, 'id'>) => Promise<FoodItem>;
  updateFood: (id: string, updates: Partial<FoodItem>) => Promise<FoodItem>;
}

export interface NutritionAnalysis {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  averageCalories: number;
  averageMacros: MacroNutrients;
  adherenceToGoals: number; // 0-100 percentage
  trends: NutritionTrend[];
  recommendations: string[];
}

export interface NutritionTrend {
  metric: 'calories' | 'protein' | 'carbs' | 'fats' | 'fiber' | 'water';
  direction: 'increasing' | 'decreasing' | 'stable';
  changeAmount: number;
  changePercentage: number;
  significance: 'low' | 'medium' | 'high';
}