import { nutritionService } from '../nutritionService';
import type { MealType, FoodItem } from '../../types/nutritionTypes';

describe('NutritionService', () => {
  describe('getTodaysNutrition', () => {
    it('should return nutrition tracking data', async () => {
      const result = await nutritionService.getTodaysNutrition();
      
      expect(result).toBeDefined();
      expect(result.dailyCalorieGoal).toBeGreaterThan(0);
      expect(result.caloriesConsumed).toBeGreaterThanOrEqual(0);
      expect(result.waterIntakeGoal).toBeGreaterThan(0);
      expect(result.currentWaterIntake).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.mealLog)).toBe(true);
      expect(Array.isArray(result.nutritionInsights)).toBe(true);
    });

    it('should calculate macro percentages correctly', async () => {
      const result = await nutritionService.getTodaysNutrition();
      
      Object.values(result.macroTargets).forEach(macro => {
        expect(macro.target).toBeGreaterThan(0);
        expect(macro.current).toBeGreaterThanOrEqual(0);
        expect(macro.percentage).toBeGreaterThanOrEqual(0);
        expect(macro.percentage).toBe(Math.round((macro.current / macro.target) * 100));
      });
    });
  });

  describe('searchFood', () => {
    it('should return food items matching search query', async () => {
      const results = await nutritionService.searchFood('apple');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      const apple = results.find(food => food.name.toLowerCase().includes('apple'));
      expect(apple).toBeDefined();
      expect(apple?.calories).toBeGreaterThan(0);
      expect(apple?.macros).toBeDefined();
    });

    it('should return empty array for non-matching search', async () => {
      const results = await nutritionService.searchFood('nonexistentfood123');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should return case-insensitive results', async () => {
      const lowerResults = await nutritionService.searchFood('apple');
      const upperResults = await nutritionService.searchFood('APPLE');
      
      expect(lowerResults.length).toBe(upperResults.length);
    });
  });

  describe('addFoodToMeal', () => {
    const mockFood: FoodItem = {
      id: 'test-food',
      name: 'Test Food',
      quantity: 100,
      unit: 'g',
      calories: 200,
      macros: { protein: 10, carbohydrates: 20, fats: 5, fiber: 3, sugar: 2 },
      servingSize: { amount: 100, unit: 'g' },
      foodCategory: 'protein',
      verified: true,
    };

    it('should add food to meal successfully', async () => {
      await expect(
        nutritionService.addFoodToMeal('breakfast', mockFood)
      ).resolves.not.toThrow();
    });

    it('should update nutrition totals after adding food', async () => {
      const beforeData = await nutritionService.getTodaysNutrition();
      const beforeCalories = beforeData.caloriesConsumed;
      
      await nutritionService.addFoodToMeal('snack', mockFood);
      
      const afterData = await nutritionService.getTodaysNutrition();
      expect(afterData.caloriesConsumed).toBe(beforeCalories + mockFood.calories);
    });
  });

  describe('addWaterIntake', () => {
    it('should add water intake successfully', async () => {
      await expect(
        nutritionService.addWaterIntake(500)
      ).resolves.not.toThrow();
    });

    it('should update water intake totals', async () => {
      const beforeData = await nutritionService.getTodaysNutrition();
      const beforeWater = beforeData.currentWaterIntake;
      
      await nutritionService.addWaterIntake(250);
      
      const afterData = await nutritionService.getTodaysNutrition();
      expect(afterData.currentWaterIntake).toBe(beforeWater + 250);
    });
  });

  describe('getFoodByBarcode', () => {
    it('should return food for valid barcode', async () => {
      const result = await nutritionService.getFoodByBarcode('123456789');
      
      expect(result).toBeDefined();
      expect(result?.barcode).toBe('123456789');
      expect(result?.calories).toBeGreaterThan(0);
    });

    it('should return null for invalid barcode', async () => {
      const result = await nutritionService.getFoodByBarcode('invalid-barcode');
      
      expect(result).toBeNull();
    });
  });

  describe('generateMealTimingRecommendations', () => {
    it('should return array of recommendations', async () => {
      const recommendations = await nutritionService.generateMealTimingRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(typeof recommendations[0]).toBe('string');
    });
  });

  describe('getNutritionInsights', () => {
    it('should return nutrition insights', async () => {
      const insights = await nutritionService.getNutritionInsights();
      
      expect(Array.isArray(insights)).toBe(true);
      
      insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.message).toBeDefined();
        expect(insight.recommendation).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(insight.priority);
        expect(typeof insight.actionable).toBe('boolean');
      });
    });
  });
});