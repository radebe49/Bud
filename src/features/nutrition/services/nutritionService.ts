import type {
  NutritionTracking,
  MealEntry,
  FoodItem,
  MealType,
  WaterIntake,
  NutritionInsight,
  MacroTargets,
  MacroTarget,
} from '../types/nutritionTypes';
import type { MacroNutrients } from '../../../shared/types/healthTypes';

class NutritionService {
  private mockData: NutritionTracking = {
    dailyCalorieGoal: 2200,
    caloriesConsumed: 1650,
    caloriesRemaining: 550,
    macroTargets: {
      protein: { target: 165, current: 120, percentage: 73 },
      carbs: { target: 275, current: 180, percentage: 65 },
      fats: { target: 73, current: 55, percentage: 75 },
      fiber: { target: 25, current: 18, percentage: 72 },
    },
    waterIntakeGoal: 2500, // 2.5L in ml
    currentWaterIntake: 1800, // 1.8L in ml
    mealLog: [
      {
        id: '1',
        userId: 'user1',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        mealType: 'breakfast',
        foods: [
          {
            id: 'food1',
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
          {
            id: 'food2',
            name: 'Blueberries',
            quantity: 80,
            unit: 'g',
            calories: 45,
            macros: { protein: 0.6, carbohydrates: 11, fats: 0.2, fiber: 2.4, sugar: 10 },
            servingSize: { amount: 80, unit: 'g', description: '1/2 cup' },
            foodCategory: 'fruits',
            verified: true,
          },
        ],
        totalCalories: 175,
        macros: { protein: 20.6, carbohydrates: 20, fats: 0.2, fiber: 2.4, sugar: 16 },
      },
      {
        id: '2',
        userId: 'user1',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        mealType: 'lunch',
        foods: [
          {
            id: 'food3',
            name: 'Grilled Chicken Breast',
            quantity: 150,
            unit: 'g',
            calories: 231,
            macros: { protein: 43.5, carbohydrates: 0, fats: 5, fiber: 0, sugar: 0 },
            servingSize: { amount: 150, unit: 'g', description: '1 medium breast' },
            foodCategory: 'protein',
            verified: true,
          },
          {
            id: 'food4',
            name: 'Brown Rice',
            quantity: 100,
            unit: 'g',
            calories: 112,
            macros: { protein: 2.6, carbohydrates: 23, fats: 0.9, fiber: 1.8, sugar: 0.7 },
            servingSize: { amount: 100, unit: 'g', description: '1/2 cup cooked' },
            foodCategory: 'grains',
            verified: true,
          },
        ],
        totalCalories: 343,
        macros: { protein: 46.1, carbohydrates: 23, fats: 5.9, fiber: 1.8, sugar: 0.7 },
      },
    ],
    nutritionInsights: [
      {
        id: 'insight1',
        type: 'hydration',
        message: 'You\'re 72% towards your daily water goal',
        recommendation: 'Try to drink another 700ml before dinner to stay well hydrated',
        priority: 'medium',
        timestamp: new Date(),
        actionable: true,
      },
      {
        id: 'insight2',
        type: 'macro_balance',
        message: 'Great protein intake today!',
        recommendation: 'Your protein is on track. Consider adding some healthy fats for dinner',
        priority: 'low',
        timestamp: new Date(),
        actionable: true,
      },
    ],
  };

  private waterIntakeLog: WaterIntake[] = [
    {
      id: 'water1',
      userId: 'user1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      amount: 500,
      source: 'plain_water',
    },
    {
      id: 'water2',
      userId: 'user1',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      amount: 300,
      source: 'coffee',
    },
    {
      id: 'water3',
      userId: 'user1',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      amount: 1000,
      source: 'plain_water',
    },
  ];

  async getTodaysNutrition(): Promise<NutritionTracking> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Recalculate totals based on current meal log
    const totalCalories = this.mockData.mealLog.reduce((sum, meal) => sum + meal.totalCalories, 0);
    const totalMacros = this.mockData.mealLog.reduce(
      (totals, meal) => ({
        protein: totals.protein + meal.macros.protein,
        carbohydrates: totals.carbohydrates + meal.macros.carbohydrates,
        fats: totals.fats + meal.macros.fats,
        fiber: totals.fiber + meal.macros.fiber,
        sugar: totals.sugar + meal.macros.sugar,
      }),
      { protein: 0, carbohydrates: 0, fats: 0, fiber: 0, sugar: 0 }
    );

    // Update macro targets with current values
    const updatedMacroTargets: MacroTargets = {
      protein: {
        ...this.mockData.macroTargets.protein,
        current: totalMacros.protein,
        percentage: Math.round((totalMacros.protein / this.mockData.macroTargets.protein.target) * 100),
      },
      carbs: {
        ...this.mockData.macroTargets.carbs,
        current: totalMacros.carbohydrates,
        percentage: Math.round((totalMacros.carbohydrates / this.mockData.macroTargets.carbs.target) * 100),
      },
      fats: {
        ...this.mockData.macroTargets.fats,
        current: totalMacros.fats,
        percentage: Math.round((totalMacros.fats / this.mockData.macroTargets.fats.target) * 100),
      },
      fiber: {
        ...this.mockData.macroTargets.fiber,
        current: totalMacros.fiber,
        percentage: Math.round((totalMacros.fiber / this.mockData.macroTargets.fiber.target) * 100),
      },
    };

    return {
      ...this.mockData,
      caloriesConsumed: totalCalories,
      caloriesRemaining: this.mockData.dailyCalorieGoal - totalCalories,
      macroTargets: updatedMacroTargets,
    };
  }

  async addFoodToMeal(mealType: MealType, food: FoodItem): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find existing meal or create new one
    let existingMeal = this.mockData.mealLog.find(meal => 
      meal.mealType === mealType && 
      this.isSameDay(meal.timestamp, new Date())
    );

    if (existingMeal) {
      // Add food to existing meal
      existingMeal.foods.push(food);
      existingMeal.totalCalories += food.calories;
      existingMeal.macros.protein += food.macros.protein;
      existingMeal.macros.carbohydrates += food.macros.carbohydrates;
      existingMeal.macros.fats += food.macros.fats;
      existingMeal.macros.fiber += food.macros.fiber;
      existingMeal.macros.sugar += food.macros.sugar;
    } else {
      // Create new meal
      const newMeal: MealEntry = {
        id: `meal_${Date.now()}`,
        userId: 'user1',
        timestamp: new Date(),
        mealType,
        foods: [food],
        totalCalories: food.calories,
        macros: { ...food.macros },
      };
      this.mockData.mealLog.push(newMeal);
    }
  }

  async addWaterIntake(amount: number): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const waterEntry: WaterIntake = {
      id: `water_${Date.now()}`,
      userId: 'user1',
      timestamp: new Date(),
      amount,
      source: 'plain_water',
    };

    this.waterIntakeLog.push(waterEntry);
    this.mockData.currentWaterIntake += amount;
  }

  async searchFood(query: string): Promise<FoodItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock food database
    const mockFoods: FoodItem[] = [
      {
        id: 'apple',
        name: 'Apple',
        quantity: 182,
        unit: 'g',
        calories: 95,
        macros: { protein: 0.5, carbohydrates: 25, fats: 0.3, fiber: 4.4, sugar: 19 },
        servingSize: { amount: 182, unit: 'g', description: '1 medium apple' },
        foodCategory: 'fruits',
        verified: true,
      },
      {
        id: 'banana',
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
        id: 'chicken_breast',
        name: 'Chicken Breast',
        quantity: 100,
        unit: 'g',
        calories: 165,
        macros: { protein: 31, carbohydrates: 0, fats: 3.6, fiber: 0, sugar: 0 },
        servingSize: { amount: 100, unit: 'g', description: '100g raw' },
        foodCategory: 'protein',
        verified: true,
      },
      {
        id: 'oatmeal',
        name: 'Oatmeal',
        quantity: 40,
        unit: 'g',
        calories: 150,
        macros: { protein: 5, carbohydrates: 27, fats: 3, fiber: 4, sugar: 1 },
        servingSize: { amount: 40, unit: 'g', description: '1/2 cup dry' },
        foodCategory: 'grains',
        verified: true,
      },
      {
        id: 'almonds',
        name: 'Almonds',
        quantity: 28,
        unit: 'g',
        calories: 164,
        macros: { protein: 6, carbohydrates: 6, fats: 14, fiber: 3.5, sugar: 1.2 },
        servingSize: { amount: 28, unit: 'g', description: '1 oz (23 almonds)' },
        foodCategory: 'protein',
        verified: true,
      },
    ];

    // Simple search filter
    const filtered = mockFoods.filter(food =>
      food.name.toLowerCase().includes(query.toLowerCase())
    );

    return filtered;
  }

  async getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock barcode lookup - in real implementation, this would call a food database API
    const mockBarcodeData: Record<string, FoodItem> = {
      '123456789': {
        id: 'yogurt_chobani',
        name: 'Greek Yogurt Plain',
        brand: 'Chobani',
        barcode: '123456789',
        quantity: 170,
        unit: 'g',
        calories: 130,
        macros: { protein: 20, carbohydrates: 9, fats: 0, fiber: 0, sugar: 6 },
        servingSize: { amount: 170, unit: 'g', description: '1 container' },
        foodCategory: 'dairy',
        verified: true,
      },
    };

    return mockBarcodeData[barcode] || null;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  async generateMealTimingRecommendations(): Promise<string[]> {
    // Mock meal timing recommendations based on workout schedule
    return [
      'Consider eating a light snack 30-60 minutes before your workout',
      'Post-workout meal should include protein and carbs within 2 hours',
      'Try to eat your largest meal 3-4 hours before bedtime',
    ];
  }

  async getNutritionInsights(): Promise<NutritionInsight[]> {
    // Generate dynamic insights based on current nutrition data
    const data = await this.getTodaysNutrition();
    const insights: NutritionInsight[] = [];

    // Hydration insight
    const hydrationPercentage = (data.currentWaterIntake / data.waterIntakeGoal) * 100;
    if (hydrationPercentage < 80) {
      insights.push({
        id: 'hydration_low',
        type: 'hydration',
        message: `You're ${Math.round(hydrationPercentage)}% towards your daily water goal`,
        recommendation: `Try to drink another ${data.waterIntakeGoal - data.currentWaterIntake}ml to stay well hydrated`,
        priority: hydrationPercentage < 50 ? 'high' : 'medium',
        timestamp: new Date(),
        actionable: true,
      });
    }

    // Calorie insight
    if (data.caloriesRemaining < 0) {
      insights.push({
        id: 'calories_over',
        type: 'calorie_surplus',
        message: `You're ${Math.abs(data.caloriesRemaining)} calories over your daily goal`,
        recommendation: 'Consider lighter options for your remaining meals or add some extra activity',
        priority: 'medium',
        timestamp: new Date(),
        actionable: true,
      });
    }

    // Macro balance insights
    if (data.macroTargets.protein.percentage < 70) {
      insights.push({
        id: 'protein_low',
        type: 'macro_balance',
        message: 'Your protein intake is below target',
        recommendation: 'Consider adding lean protein sources like chicken, fish, or legumes to your next meal',
        priority: 'medium',
        timestamp: new Date(),
        actionable: true,
      });
    }

    return insights;
  }
}

export const nutritionService = new NutritionService();