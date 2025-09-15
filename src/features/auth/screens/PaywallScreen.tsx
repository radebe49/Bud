/**
 * Enhanced Paywall screen with modern design
 * Inspired by top health apps (MyFitnessPal, MacroFactor, etc.)
 * Mock RevenueCat implementation for demo purposes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { mockRevenueCatService } from '../services/mockRevenueCatService';
import { SubscriptionPlan, PaywallConfig } from '../types/paywallTypes';
import { AllSetScreen } from './AllSetScreen';

interface PaywallScreenProps {
  onPurchase: () => void;
  onBack?: () => void;
  onSubscriptionSuccess?: () => void;
  onRestore?: () => void;
}

const { width, height } = Dimensions.get('window');
const isLargeScreen = width >= 428;
const isTablet = width >= 768;

export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onPurchase,
  onBack,
  onSubscriptionSuccess,
  onRestore
}) => {
  const [paywallConfig, setPaywallConfig] = useState<PaywallConfig | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('bud_yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showAllSetScreen, setShowAllSetScreen] = useState(false);

  useEffect(() => {
    loadPaywallConfig();
    mockRevenueCatService.trackPaywallEvent('viewed');
  }, []);

  const loadPaywallConfig = () => {
    const config = mockRevenueCatService.getPaywallConfig();
    setPaywallConfig(config);
    
    // Auto-select the popular plan
    const popularPlan = config.plans.find(plan => plan.isPopular);
    if (popularPlan) {
      setSelectedPlan(popularPlan.id);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);
    mockRevenueCatService.trackPaywallEvent('purchase_started', selectedPlan);

    try {
      const result = await mockRevenueCatService.purchaseSubscription(selectedPlan);
      
      if (result.success) {
        mockRevenueCatService.trackPaywallEvent('purchase_completed', selectedPlan);
        setShowAllSetScreen(true);
      } else {
        Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    
    try {
      const status = await mockRevenueCatService.restorePurchases();
      
      if (status.isSubscribed) {
        setShowAllSetScreen(true);
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions were found to restore.');
      }
    } catch (error) {
      Alert.alert('Restore Failed', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleStartTrial = async () => {
    setIsLoading(true);
    
    try {
      const result = await mockRevenueCatService.startFreeTrial();
      
      if (result.success) {
        setShowAllSetScreen(true);
      } else {
        Alert.alert('Trial Failed', result.error || 'Failed to start trial. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start trial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan === plan.id;
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          plan.isPopular && styles.popularPlanCard
        ]}
        onPress={() => setSelectedPlan(plan.id)}
        disabled={isLoading}
      >
        {plan.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
          </View>
        )}
        
        {plan.isBestValue && (
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueBadgeText}>BEST VALUE</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={[styles.planName, isSelected && styles.selectedPlanText]}>
            {plan.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.planPrice, isSelected && styles.selectedPlanText]}>
              {plan.price}
            </Text>
            {plan.originalPrice && (
              <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
            )}
          </View>
          {plan.discount && (
            <Text style={styles.discountText}>{plan.discount}</Text>
          )}
        </View>

        <Text style={[styles.planDescription, isSelected && styles.selectedPlanText]}>
          {plan.description}
        </Text>

        <View style={styles.featuresContainer}>
          {plan.features.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[styles.featureText, isSelected && styles.selectedPlanText]}>
                {feature}
              </Text>
            </View>
          ))}
          {plan.features.length > 3 && (
            <Text style={[styles.moreFeatures, isSelected && styles.selectedPlanText]}>
              +{plan.features.length - 3} more features
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleProceedToApp = () => {
    onPurchase();
    onSubscriptionSuccess?.();
  };

  if (showAllSetScreen) {
    return <AllSetScreen onProceedToApp={handleProceedToApp} />;
  }

  if (!paywallConfig) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          {/* Back Button */}
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.budAvatar}>
              <Text style={styles.budEmoji}>🤖</Text>
            </View>
            <Text style={styles.title}>{paywallConfig.title}</Text>
            <Text style={styles.subtitle}>{paywallConfig.subtitle}</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            {paywallConfig.features.slice(0, 4).map((feature) => (
              <View key={feature.id} style={styles.featureRow}>
                <Text style={styles.featureRowIcon}>{feature.icon}</Text>
                <View style={styles.featureRowContent}>
                  <Text style={styles.featureRowTitle}>{feature.title}</Text>
                  <Text style={styles.featureRowDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Subscription Plans */}
          <View style={styles.plansSection}>
            <Text style={styles.plansTitle}>Choose Your Plan</Text>
            {paywallConfig.plans.map(renderPlanCard)}
          </View>



          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.subscribeButton, isLoading && styles.disabledButton]}
              onPress={handlePurchase}
              disabled={isLoading || isRestoring}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.subscribeButtonText}>
                  Start My Subscription
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.trialButton, isLoading && styles.disabledButton]}
              onPress={handleStartTrial}
              disabled={isLoading || isRestoring}
            >
              <Text style={styles.trialButtonText}>
                Start 7-Day Free Trial
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isLoading || isRestoring}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />
              ) : (
                <Text style={styles.restoreButtonText}>Restore Purchases</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Legal Text */}
          <View style={styles.legalSection}>
            <Text style={styles.legalText}>
              Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
            </Text>
            <Text style={styles.legalText}>
              Terms of Service • Privacy Policy
            </Text>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingHorizontal: isLargeScreen ? 24 : 20,
    paddingVertical: isLargeScreen ? 32 : 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: isLargeScreen ? 32 : 24,
  },
  budAvatar: {
    width: isLargeScreen ? 80 : 70,
    height: isLargeScreen ? 80 : 70,
    borderRadius: isLargeScreen ? 40 : 35,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 20 : 16,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  budEmoji: {
    fontSize: isLargeScreen ? 40 : 35,
    color: 'white',
  },
  title: {
    fontSize: isLargeScreen ? 28 : 24,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: isLargeScreen ? 16 : 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: isLargeScreen ? 24 : 22,
    fontWeight: '400',
  },
  featuresSection: {
    marginBottom: isLargeScreen ? 32 : 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 16 : 12,
    backgroundColor: '#f8f9fa',
    padding: isLargeScreen ? 16 : 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  featureRowIcon: {
    fontSize: isLargeScreen ? 24 : 20,
    marginRight: isLargeScreen ? 16 : 12,
  },
  featureRowContent: {
    flex: 1,
  },
  featureRowTitle: {
    fontSize: isLargeScreen ? 16 : 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureRowDescription: {
    fontSize: isLargeScreen ? 14 : 13,
    color: '#666666',
    lineHeight: isLargeScreen ? 20 : 18,
  },
  plansSection: {
    marginBottom: isLargeScreen ? 32 : 24,
  },
  plansTitle: {
    fontSize: isLargeScreen ? 20 : 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: isLargeScreen ? 20 : 16,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: isLargeScreen ? 20 : 16,
    marginBottom: isLargeScreen ? 16 : 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPlanCard: {
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  popularPlanCard: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: isLargeScreen ? 20 : 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  selectedPlanText: {
    color: '#1a1a1a',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: isLargeScreen ? 24 : 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: isLargeScreen ? 16 : 14,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: isLargeScreen ? 14 : 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  planDescription: {
    fontSize: isLargeScreen ? 14 : 13,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresContainer: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 16,
    color: '#4ECDC4',
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: isLargeScreen ? 14 : 13,
    color: '#1a1a1a',
    flex: 1,
  },
  moreFeatures: {
    fontSize: isLargeScreen ? 13 : 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 4,
  },

  actionsSection: {
    marginBottom: isLargeScreen ? 24 : 20,
  },
  subscribeButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: isLargeScreen ? 18 : 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: isLargeScreen ? 16 : 12,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  subscribeButtonText: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: '700',
    color: 'white',
  },
  trialButton: {
    backgroundColor: 'white',
    paddingVertical: isLargeScreen ? 16 : 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: isLargeScreen ? 16 : 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  trialButtonText: {
    fontSize: isLargeScreen ? 16 : 15,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#666666',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.7,
  },
  legalSection: {
    alignItems: 'center',
  },
  legalText: {
    fontSize: isLargeScreen ? 12 : 11,
    color: '#999999',
    textAlign: 'center',
    lineHeight: isLargeScreen ? 16 : 14,
    marginBottom: 8,
  },
});