/**
 * Setup Screen - Third screen of onboarding flow
 * Equipment and experience level selection
 * Clean white background design inspired by modern health apps
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { onboardingService } from '../services/onboardingService';
import { Equipment, FitnessLevel, EquipmentOption, FitnessLevelOption } from '../types/authTypes';

interface SetupScreenProps {
  onComplete: (equipment: Equipment[], fitnessLevel: FitnessLevel) => void;
  onBack: () => void;
}

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 428; // 6.7 inch detection

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onComplete,
  onBack,
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [selectedFitnessLevel, setSelectedFitnessLevel] = useState<FitnessLevel | null>(null);

  const equipmentOptions = onboardingService.getEquipmentOptions();
  const fitnessLevelOptions = onboardingService.getFitnessLevelOptions();

  const toggleEquipment = (equipmentId: Equipment) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };

  const selectFitnessLevel = (level: FitnessLevel) => {
    setSelectedFitnessLevel(level);
  };

  const handleComplete = () => {
    if (selectedFitnessLevel && selectedEquipment.length > 0) {
      onComplete(selectedEquipment, selectedFitnessLevel);
    }
  };

  const canContinue = selectedFitnessLevel && selectedEquipment.length > 0;

  const renderEquipmentCard = (equipment: EquipmentOption) => {
    const isSelected = selectedEquipment.includes(equipment.id);
    
    return (
      <TouchableOpacity
        key={equipment.id}
        style={[
          styles.equipmentCard,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => toggleEquipment(equipment.id)}
      >
        <Text style={styles.equipmentIcon}>{equipment.icon}</Text>
        <Text style={[styles.equipmentTitle, isSelected && styles.selectedText]}>
          {equipment.title}
        </Text>
        <Text style={[styles.equipmentDescription, isSelected && styles.selectedDescription]}>
          {equipment.description}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFitnessLevelCard = (level: FitnessLevelOption) => {
    const isSelected = selectedFitnessLevel === level.id;
    
    return (
      <TouchableOpacity
        key={level.id}
        style={[
          styles.fitnessCard,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => selectFitnessLevel(level.id)}
      >
        <Text style={styles.fitnessIcon}>{level.icon}</Text>
        <Text style={[styles.fitnessTitle, isSelected && styles.selectedText]}>
          {level.title}
        </Text>
        <Text style={[styles.fitnessDescription, isSelected && styles.selectedDescription]}>
          {level.description}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Let's personalize your experience</Text>
          <Text style={styles.subtitle}>
            Tell us about your equipment and fitness level
          </Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Equipment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Equipment</Text>
            <Text style={styles.sectionSubtitle}>Select all that you have access to</Text>
            <View style={styles.equipmentGrid}>
              {equipmentOptions.map(renderEquipmentCard)}
            </View>
          </View>

          {/* Fitness Level Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Level</Text>
            <Text style={styles.sectionSubtitle}>Choose the option that best describes you</Text>
            <View style={styles.fitnessGrid}>
              {fitnessLevelOptions.map(renderFitnessLevelCard)}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              !canContinue && styles.disabledButton,
            ]}
            onPress={handleComplete}
            disabled={!canContinue}
          >
            <Text style={[
              styles.completeButtonText,
              !canContinue && styles.disabledButtonText,
            ]}>
              Complete Setup
            </Text>
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressDots}>
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
              <View style={[styles.progressDot, styles.activeDot]} />
            </View>
            <Text style={styles.progressText}>3 of 3</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: isLargeScreen ? 32 : 24,
  },
  header: {
    paddingTop: isLargeScreen ? 20 : 16,
    paddingBottom: isLargeScreen ? 24 : 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isLargeScreen ? 20 : 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  backButtonText: {
    fontSize: isLargeScreen ? 20 : 18,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  title: {
    fontSize: isLargeScreen ? 28 : 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: isLargeScreen ? 12 : 8,
    letterSpacing: -0.5,
    lineHeight: isLargeScreen ? 34 : 30,
  },
  subtitle: {
    fontSize: isLargeScreen ? 16 : 15,
    color: '#666666',
    lineHeight: isLargeScreen ? 24 : 22,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: isLargeScreen ? 32 : 24,
  },
  sectionTitle: {
    fontSize: isLargeScreen ? 20 : 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: isLargeScreen ? 15 : 14,
    color: '#666666',
    marginBottom: isLargeScreen ? 20 : 16,
    fontWeight: '400',
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isLargeScreen ? 12 : 10,
  },
  equipmentCard: {
    width: isLargeScreen ? '48%' : '47%',
    backgroundColor: 'white',
    borderRadius: isLargeScreen ? 16 : 14,
    padding: isLargeScreen ? 16 : 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    position: 'relative',
    minHeight: isLargeScreen ? 120 : 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fitnessGrid: {
    gap: isLargeScreen ? 12 : 10,
  },
  fitnessCard: {
    backgroundColor: 'white',
    borderRadius: isLargeScreen ? 14 : 12,
    padding: isLargeScreen ? 16 : 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  equipmentIcon: {
    fontSize: isLargeScreen ? 28 : 24,
    marginBottom: isLargeScreen ? 12 : 8,
  },
  equipmentTitle: {
    fontSize: isLargeScreen ? 15 : 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  equipmentDescription: {
    fontSize: isLargeScreen ? 12 : 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: isLargeScreen ? 16 : 14,
    fontWeight: '400',
  },
  fitnessIcon: {
    fontSize: isLargeScreen ? 28 : 24,
    marginRight: isLargeScreen ? 16 : 12,
  },
  fitnessTitle: {
    fontSize: isLargeScreen ? 16 : 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  fitnessDescription: {
    fontSize: isLargeScreen ? 14 : 13,
    color: '#666666',
    flex: 1,
    lineHeight: isLargeScreen ? 18 : 16,
    fontWeight: '400',
  },
  selectedText: {
    color: '#1a1a1a',
  },
  selectedDescription: {
    color: '#666666',
  },
  checkmark: {
    position: 'absolute',
    top: isLargeScreen ? 12 : 8,
    right: isLargeScreen ? 12 : 8,
    width: isLargeScreen ? 24 : 20,
    height: isLargeScreen ? 24 : 20,
    borderRadius: isLargeScreen ? 12 : 10,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: isLargeScreen ? 14 : 12,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomSection: {
    paddingVertical: isLargeScreen ? 24 : 20,
  },
  completeButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: isLargeScreen ? 18 : 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    fontSize: isLargeScreen ? 18 : 16,
    fontWeight: '700',
    color: 'white',
  },
  disabledButtonText: {
    color: '#999999',
  },
  progressSection: {
    alignItems: 'center',
    marginTop: isLargeScreen ? 24 : 20,
  },
  progressDots: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4ECDC4',
    width: 24,
    borderRadius: 4,
  },
  progressText: {
    fontSize: isLargeScreen ? 14 : 13,
    color: '#666666',
    fontWeight: '500',
  },
});