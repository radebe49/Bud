/**
 * Mock RevenueCat service for subscription management
 * Simulates RevenueCat functionality for demo purposes
 */

import { storageService, STORAGE_KEYS } from '../../../shared/services/storageService';
import { 
  SubscriptionPlan, 
  PaywallConfig, 
  SubscriptionStatus, 
  PurchaseResult,
  PaywallFeature,
  Testimonial
} from '../types/paywallTypes';

class MockRevenueCatService {
  private static instance: MockRevenueCatService;

  private constructor() {}

  public static getInstance(): MockRevenueCatService {
    if (!MockRevenueCatService.instance) {
      MockRevenueCatService.instance = new MockRevenueCatService();
    }
    return MockRevenueCatService.instance;
  }

  // Get available subscription plans
  getSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'bud_monthly',
        name: 'Monthly',
        description: 'Full access to Bud Health Coach',
        price: '$9.99',
        period: 'monthly',
        features: [
          'Unlimited AI coaching conversations',
          'Personalized workout plans',
          'Nutrition tracking & insights',
          'Sleep optimization guidance',
          'Progress tracking & analytics'
        ]
      },
      {
        id: 'bud_yearly',
        name: 'Yearly',
        description: 'Best value - Save 56%',
        price: '$52.99',
        period: 'yearly',
        originalPrice: '$119.88',
        discount: '56% OFF',
        features: [
          'Everything in Monthly',
          'Advanced health insights',
          'Priority customer support',
          'Exclusive workout programs',
          'Meal planning & recipes',
          'Premium health reports',
          'Early access to new features'
        ],
        isPopular: true,
        isBestValue: true
      }
    ];
  }

  // Get paywall configuration
  getPaywallConfig(): PaywallConfig {
    return {
      title: 'Unlock Your Full Health Potential',
      subtitle: 'Join thousands who transformed their health with Bud\'s personalized AI coaching',
      plans: this.getSubscriptionPlans(),
      features: [
        {
          id: 'ai_coaching',
          title: 'AI Health Coach',
          description: 'Get personalized guidance 24/7 from Bud, your intelligent health companion',
          icon: '🤖'
        },
        {
          id: 'workout_plans',
          title: 'Custom Workouts',
          description: 'Adaptive fitness plans that evolve with your progress and preferences',
          icon: '💪'
        },
        {
          id: 'nutrition_tracking',
          title: 'Smart Nutrition',
          description: 'Track meals, get insights, and receive personalized nutrition recommendations',
          icon: '🥗'
        },
        {
          id: 'sleep_optimization',
          title: 'Sleep Coaching',
          description: 'Optimize your sleep quality with personalized bedtime routines and insights',
          icon: '😴'
        },
        {
          id: 'progress_analytics',
          title: 'Progress Analytics',
          description: 'Detailed insights and trends to keep you motivated and on track',
          icon: '📊'
        },
        {
          id: 'health_integration',
          title: 'Health Data Sync',
          description: 'Connect with Apple Health, Google Fit, and other health platforms',
          icon: '🔗'
        }
      ],
      testimonials: [
        {
          id: '1',
          name: 'Sarah M.',
          text: 'Bud helped me lose 20 pounds and build healthy habits that actually stick!',
          rating: 5
        },
        {
          id: '2',
          name: 'Mike R.',
          text: 'The personalized workouts are amazing. It\'s like having a personal trainer in my pocket.',
          rating: 5
        },
        {
          id: '3',
          name: 'Jessica L.',
          text: 'My sleep quality improved dramatically with Bud\'s coaching. I wake up refreshed every day!',
          rating: 5
        }
      ]
    };
  }

  // Mock purchase function
  async purchaseSubscription(planId: string): Promise<PurchaseResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const plans = this.getSubscriptionPlans();
      const selectedPlan = plans.find(plan => plan.id === planId);

      if (!selectedPlan) {
        return {
          success: false,
          error: 'Invalid subscription plan'
        };
      }

      // Mock successful purchase
      const subscriptionStatus: SubscriptionStatus = {
        isSubscribed: true,
        plan: selectedPlan,
        expiresAt: this.calculateExpirationDate(selectedPlan.period),
        isTrialActive: false
      };

      // Save subscription status
      await storageService.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, subscriptionStatus);

      return {
        success: true,
        plan: selectedPlan
      };
    } catch (error) {
      return {
        success: false,
        error: 'Purchase failed. Please try again.'
      };
    }
  }

  // Mock restore purchases
  async restorePurchases():  Promise<SubscriptionStatus> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const status = await storageService.getItem<SubscriptionStatus>(STORAGE_KEYS.SUBSCRIPTION_STATUS);
      
      if (status && status.isSubscribed) {
        // Check if subscription is still valid
        if (status.expiresAt && new Date() > new Date(status.expiresAt)) {
          // Subscription expired
          const expiredStatus: SubscriptionStatus = {
            isSubscribed: false
          };
          await storageService.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, expiredStatus);
          return expiredStatus;
        }
        return status;
      }

      return {
        isSubscribed: false
      };
    } catch (error) {
      return {
        isSubscribed: false
      };
    }
  }

  // Get current subscription status
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const status = await storageService.getItem<SubscriptionStatus>(STORAGE_KEYS.SUBSCRIPTION_STATUS);
      
      if (status) {
        // Check if subscription is still valid
        if (status.expiresAt && new Date() > new Date(status.expiresAt)) {
          // Subscription expired
          const expiredStatus: SubscriptionStatus = {
            isSubscribed: false
          };
          await storageService.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, expiredStatus);
          return expiredStatus;
        }
        return status;
      }

      return {
        isSubscribed: false
      };
    } catch (error) {
      return {
        isSubscribed: false
      };
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    const status = await this.getSubscriptionStatus();
    return status.isSubscribed;
  }

  // Start free trial (mock)
  async startFreeTrial(): Promise<PurchaseResult> {
    try {
      const trialStatus: SubscriptionStatus = {
        isSubscribed: true,
        isTrialActive: true,
        trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        plan: {
          id: 'trial',
          name: 'Free Trial',
          description: '7-day free trial',
          price: 'Free',
          period: 'monthly',
          features: ['Full access for 7 days']
        }
      };

      await storageService.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, trialStatus);

      return {
        success: true,
        plan: trialStatus.plan
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to start trial'
      };
    }
  }

  // Cancel subscription (mock)
  async cancelSubscription(): Promise<boolean> {
    try {
      const canceledStatus: SubscriptionStatus = {
        isSubscribed: false
      };
      await storageService.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, canceledStatus);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper method to calculate expiration date
  private calculateExpirationDate(period: 'monthly' | 'yearly' | 'lifetime'): Date | undefined {
    const now = new Date();
    
    switch (period) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      case 'lifetime':
        return undefined; // Lifetime doesn't expire
      default:
        return undefined;
    }
  }

  // Mock method to simulate RevenueCat initialization
  async initialize(): Promise<void> {
    console.log('Mock RevenueCat initialized');
    // In real implementation, this would configure RevenueCat SDK
  }

  // Get pricing for display
  getFormattedPrice(plan: SubscriptionPlan): string {
    if (plan.period === 'yearly') {
      const monthlyPrice = parseFloat(plan.price.replace('$', '')) / 12;
      return `${plan.price}/year (${monthlyPrice.toFixed(2)}/month)`;
    }
    return `${plan.price}/${plan.period}`;
  }

  // Mock analytics tracking
  trackPaywallEvent(event: 'viewed' | 'purchase_started' | 'purchase_completed' | 'dismissed', planId?: string): void {
    console.log(`Paywall event: ${event}`, planId ? `Plan: ${planId}` : '');
    // In real implementation, this would track events for analytics
  }
}

export const mockRevenueCatService = MockRevenueCatService.getInstance();