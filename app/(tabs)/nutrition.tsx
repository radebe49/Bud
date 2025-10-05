import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { ProgressRing } from '../../src/shared/components/ProgressRing';
import { MetricCard } from '../../src/shared/components/MetricCard';
import { NutritionScreen } from '../../src/features/nutrition/screens/NutritionScreen';

export default function NutritionTab() {
  return <NutritionScreen />;
}