/**
 * Paywall and subscription related types
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  originalPrice?: string;
  discount?: string;
  features: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

export interface PaywallConfig {
  title: string;
  subtitle: string;
  plans: SubscriptionPlan[];
  features: PaywallFeature[];
  testimonials?: Testimonial[];
}

export interface PaywallFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan?: SubscriptionPlan;
  expiresAt?: Date;
  isTrialActive?: boolean;
  trialExpiresAt?: Date;
}

export interface PurchaseResult {
  success: boolean;
  plan?: SubscriptionPlan;
  error?: string;
}