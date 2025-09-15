/**
 * Splash Screen Component
 * Simple white background with "Bud" text in the center
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isLargeScreen = width >= 428;

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.budText}>Bud</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  budText: {
    fontSize: isLargeScreen ? 48 : 40,
    fontWeight: 'bold',
    color: 'black',
    letterSpacing: 2,
  },
});