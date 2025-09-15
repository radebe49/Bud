/**
 * Tests for MockRevenueCatService
 */

import { mockRevenueCatService } from '../mockRevenueCatService';
import { storageService } from '../../../../shared/services/storageService';

// Mock storage service
jest.mock('../../../../shared/services/storageService');

describe('MockRevenueCatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionPlans', () => {
    it('should return available subscription plans', () => {
      const plans = mockRevenueCatService.getSubscriptionPlans();
      
      expect(plans).toBeDefined();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
      
      // Check that plans have required properties
      plans.forEach(plan => {
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(plan.price).toBeDefined();
        expect(plan.period).toBeDefined();
        expect(Array.isArray(plan.features)).toBe(true);
      });
    });

    it('should include monthly and yearly plans', () => {
      const plans = mockRevenueCatService.getSubscriptionPlans();
      
      const periods = plans.map(plan => plan.period);
      expect(periods).toContain('monthly');
      expect(periods).toContain('yearly');
      expect(plans.length).toBe(2);
    });
  });

  describe('getPaywallConfig', () => {
    it('should return paywall configuration', () => {
      const config = mockRevenueCatService.getPaywallConfig();
      
      expect(config).toBeDefined();
      expect(config.title).toBeDefined();
      expect(config.subtitle).toBeDefined();
      expect(Array.isArray(config.plans)).toBe(true);
      expect(Array.isArray(config.features)).toBe(true);
      expect(Array.isArray(config.testimonials)).toBe(true);
    });

    it('should include features with icons and descriptions', () => {
      const config = mockRevenueCatService.getPaywallConfig();
      
      config.features.forEach(feature => {
        expect(feature.id).toBeDefined();
        expect(feature.title).toBeDefined();
        expect(feature.description).toBeDefined();
        expect(feature.icon).toBeDefined();
      });
    });
  });

  describe('purchaseSubscription', () => {
    it('should successfully purchase a valid subscription', async () => {
      (storageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await mockRevenueCatService.purchaseSubscription('bud_monthly');
      
      expect(result.success).toBe(true);
      expect(result.plan).toBeDefined();
      expect(result.plan?.id).toBe('bud_monthly');
      expect(storageService.setItem).toHaveBeenCalledWith(
        'subscription_status',
        expect.objectContaining({
          isSubscribed: true,
          plan: expect.objectContaining({ id: 'bud_monthly' })
        })
      );
    });

    it('should fail for invalid subscription plan', async () => {
      const result = await mockRevenueCatService.purchaseSubscription('invalid_plan');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid subscription plan');
    });

    it('should handle storage errors', async () => {
      (storageService.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await mockRevenueCatService.purchaseSubscription('bud_monthly');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Purchase failed. Please try again.');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription status from storage', async () => {
      const mockStatus = {
        isSubscribed: true,
        plan: { id: 'bud_yearly', name: 'Yearly' },
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      };

      (storageService.getItem as jest.Mock).mockResolvedValue(mockStatus);

      const status = await mockRevenueCatService.getSubscriptionStatus();
      
      expect(status).toEqual(mockStatus);
    });

    it('should return not subscribed if no status in storage', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue(null);

      const status = await mockRevenueCatService.getSubscriptionStatus();
      
      expect(status.isSubscribed).toBe(false);
    });

    it('should handle expired subscriptions', async () => {
      const expiredStatus = {
        isSubscribed: true,
        plan: { id: 'bud_monthly', name: 'Monthly' },
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };

      (storageService.getItem as jest.Mock).mockResolvedValue(expiredStatus);
      (storageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const status = await mockRevenueCatService.getSubscriptionStatus();
      
      expect(status.isSubscribed).toBe(false);
      expect(storageService.setItem).toHaveBeenCalledWith(
        'subscription_status',
        { isSubscribed: false }
      );
    });
  });

  describe('hasActiveSubscription', () => {
    it('should return true for active subscription', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue({
        isSubscribed: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      const hasActive = await mockRevenueCatService.hasActiveSubscription();
      
      expect(hasActive).toBe(true);
    });

    it('should return false for no subscription', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue(null);

      const hasActive = await mockRevenueCatService.hasActiveSubscription();
      
      expect(hasActive).toBe(false);
    });
  });

  describe('startFreeTrial', () => {
    it('should start a free trial', async () => {
      (storageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await mockRevenueCatService.startFreeTrial();
      
      expect(result.success).toBe(true);
      expect(result.plan?.id).toBe('trial');
      expect(storageService.setItem).toHaveBeenCalledWith(
        'subscription_status',
        expect.objectContaining({
          isSubscribed: true,
          isTrialActive: true,
          trialExpiresAt: expect.any(Date)
        })
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription', async () => {
      (storageService.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await mockRevenueCatService.cancelSubscription();
      
      expect(result).toBe(true);
      expect(storageService.setItem).toHaveBeenCalledWith(
        'subscription_status',
        { isSubscribed: false }
      );
    });

    it('should handle cancellation errors', async () => {
      (storageService.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await mockRevenueCatService.cancelSubscription();
      
      expect(result).toBe(false);
    });
  });

  describe('restorePurchases', () => {
    it('should restore valid purchases', async () => {
      const validStatus = {
        isSubscribed: true,
        plan: { id: 'bud_yearly', name: 'Yearly' },
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      (storageService.getItem as jest.Mock).mockResolvedValue(validStatus);

      const status = await mockRevenueCatService.restorePurchases();
      
      expect(status).toEqual(validStatus);
    });

    it('should return not subscribed if no purchases to restore', async () => {
      (storageService.getItem as jest.Mock).mockResolvedValue(null);

      const status = await mockRevenueCatService.restorePurchases();
      
      expect(status.isSubscribed).toBe(false);
    });
  });

  describe('trackPaywallEvent', () => {
    it('should track paywall events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockRevenueCatService.trackPaywallEvent('viewed');
      mockRevenueCatService.trackPaywallEvent('purchase_started', 'bud_monthly');

      expect(consoleSpy).toHaveBeenCalledWith('Paywall event: viewed', '');
      expect(consoleSpy).toHaveBeenCalledWith('Paywall event: purchase_started', 'Plan: bud_monthly');

      consoleSpy.mockRestore();
    });
  });
});