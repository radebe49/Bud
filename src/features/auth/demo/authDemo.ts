/**
 * Demo script showcasing the authentication functionality
 */

import { authService } from '../services/authService';
import { onboardingService } from '../services/onboardingService';

export class AuthDemo {
  public async runDemo(): Promise<void> {
    console.log('🔐 Bud Health Coach - Authentication Demo\n');

    try {
      // Demo 1: Sign up new user
      console.log('📝 Demo 1: User Signup');
      const signupCredentials = {
        email: 'demo@budhealth.app',
        password: 'demo123',
        name: 'Demo User'
      };

      console.log(`Signing up user: ${signupCredentials.email}`);
      const newUser = await authService.signup(signupCredentials);
      console.log(`✅ User created: ${newUser.name} (${newUser.email})`);
      console.log(`   User ID: ${newUser.id}`);
      console.log(`   Created: ${newUser.createdAt.toLocaleString()}\n`);

      // Demo 2: Logout
      console.log('🚪 Demo 2: User Logout');
      await authService.logout();
      console.log('✅ User logged out\n');

      // Demo 3: Login existing user
      console.log('🔑 Demo 3: User Login');
      const loginCredentials = {
        email: 'demo@budhealth.app',
        password: 'demo123'
      };

      console.log(`Logging in user: ${loginCredentials.email}`);
      const loggedInUser = await authService.login(loginCredentials);
      console.log(`✅ User logged in: ${loggedInUser.name}`);
      console.log(`   Last login: ${loggedInUser.lastLoginAt.toLocaleString()}\n`);

      // Demo 4: Check authentication status
      console.log('🔍 Demo 4: Authentication Status');
      const isAuthenticated = await authService.isAuthenticated();
      const currentUser = await authService.getCurrentUser();
      console.log(`Is authenticated: ${isAuthenticated}`);
      console.log(`Current user: ${currentUser?.name || 'None'}\n`);

      // Demo 5: Update profile
      console.log('👤 Demo 5: Update Profile');
      const updatedUser = await authService.updateProfile({
        name: 'Demo User Updated'
      });
      console.log(`✅ Profile updated: ${updatedUser.name}\n`);

      // Demo 6: Complete onboarding with authenticated user
      console.log('🎯 Demo 6: Complete Onboarding');
      const onboardingData = {
        goals: ['lose_weight', 'improve_fitness'],
        equipment: ['dumbbells', 'yoga_mat'],
        fitnessLevel: 'intermediate' as const,
        preferences: {
          workoutDuration: 45,
          workoutFrequency: 4,
          preferredWorkoutTime: 'morning' as const,
          communicationStyle: 'encouraging' as const
        },
        completed: true
      };

      const userProfile = await onboardingService.completeOnboarding(
        onboardingData,
        currentUser?.email
      );
      console.log(`✅ Onboarding completed for: ${userProfile.email}`);
      console.log(`   Goals: ${onboardingData.goals.join(', ')}`);
      console.log(`   Fitness level: ${onboardingData.fitnessLevel}`);
      console.log(`   Equipment: ${onboardingData.equipment.join(', ')}\n`);

      // Demo 7: Error handling
      console.log('❌ Demo 7: Error Handling');
      
      try {
        await authService.signup({
          email: 'demo@budhealth.app', // Duplicate email
          password: 'newpassword'
        });
      } catch (error) {
        console.log(`Expected error: ${error instanceof Error ? error.message : error}`);
      }

      try {
        await authService.login({
          email: 'demo@budhealth.app',
          password: 'wrongpassword'
        });
      } catch (error) {
        console.log(`Expected error: ${error instanceof Error ? error.message : error}`);
      }

      try {
        await authService.signup({
          email: 'invalid-email',
          password: 'password123'
        });
      } catch (error) {
        console.log(`Expected error: ${error instanceof Error ? error.message : error}`);
      }

      console.log('\n✅ Authentication demo completed successfully!');

    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  public async demonstratePaywallFlow(): Promise<void> {
    console.log('\n💳 Paywall & Subscription Demo\n');

    try {
      const { mockRevenueCatService } = await import('../services/mockRevenueCatService');

      // Demo 1: Get paywall configuration
      console.log('📋 Demo 1: Paywall Configuration');
      const paywallConfig = mockRevenueCatService.getPaywallConfig();
      console.log(`Title: ${paywallConfig.title}`);
      console.log(`Subtitle: ${paywallConfig.subtitle}`);
      console.log(`Available plans: ${paywallConfig.plans.length}`);
      console.log(`Features: ${paywallConfig.features.length}`);
      console.log(`Testimonials: ${paywallConfig.testimonials?.length || 0}\n`);

      // Demo 2: Show subscription plans
      console.log('💰 Demo 2: Subscription Plans');
      const plans = mockRevenueCatService.getSubscriptionPlans();
      plans.forEach(plan => {
        console.log(`${plan.name}: ${plan.price}/${plan.period}`);
        if (plan.discount) console.log(`  Discount: ${plan.discount}`);
        if (plan.isPopular) console.log('  🔥 POPULAR');
        if (plan.isBestValue) console.log('  ⭐ BEST VALUE');
        console.log(`  Features: ${plan.features.length} included\n`);
      });

      // Demo 3: Purchase subscription
      console.log('🛒 Demo 3: Purchase Subscription');
      console.log('Purchasing yearly subscription...');
      const purchaseResult = await mockRevenueCatService.purchaseSubscription('bud_yearly');
      
      if (purchaseResult.success) {
        console.log(`✅ Purchase successful!`);
        console.log(`   Plan: ${purchaseResult.plan?.name}`);
        console.log(`   Price: ${purchaseResult.plan?.price}`);
      } else {
        console.log(`❌ Purchase failed: ${purchaseResult.error}`);
      }

      // Demo 4: Check subscription status
      console.log('\n📊 Demo 4: Subscription Status');
      const status = await mockRevenueCatService.getSubscriptionStatus();
      console.log(`Is subscribed: ${status.isSubscribed}`);
      if (status.plan) {
        console.log(`Active plan: ${status.plan.name}`);
        console.log(`Expires: ${status.expiresAt?.toLocaleDateString() || 'Never (Lifetime)'}`);
      }
      if (status.isTrialActive) {
        console.log(`Trial active until: ${status.trialExpiresAt?.toLocaleDateString()}`);
      }

      // Demo 5: Start free trial
      console.log('\n🆓 Demo 5: Free Trial');
      await mockRevenueCatService.cancelSubscription(); // Reset for trial demo
      console.log('Starting 7-day free trial...');
      const trialResult = await mockRevenueCatService.startFreeTrial();
      
      if (trialResult.success) {
        console.log(`✅ Trial started successfully!`);
        console.log(`   Duration: 7 days`);
        console.log(`   Full access included`);
      }

      // Demo 6: Restore purchases
      console.log('\n🔄 Demo 6: Restore Purchases');
      console.log('Restoring previous purchases...');
      const restoreStatus = await mockRevenueCatService.restorePurchases();
      console.log(`Restored subscription: ${restoreStatus.isSubscribed}`);
      if (restoreStatus.plan) {
        console.log(`Restored plan: ${restoreStatus.plan.name}`);
      }

      console.log('\n✅ Paywall demo completed!');

    } catch (error) {
      console.error('❌ Paywall demo failed:', error);
    }
  }

  public async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up demo data...');
    
    try {
      // Reset onboarding
      await onboardingService.resetOnboarding();
      
      // Logout current user
      await authService.logout();
      
      console.log('✅ Demo cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Export function to run the full demo
export async function runAuthDemo(): Promise<void> {
  const demo = new AuthDemo();
  
  await demo.runDemo();
  await demo.demonstratePaywallFlow();
  await demo.cleanup();
  
  console.log('\n🎉 All authentication demos completed!');
}

// Allow running the demo directly
if (require.main === module) {
  runAuthDemo().catch(console.error);
}