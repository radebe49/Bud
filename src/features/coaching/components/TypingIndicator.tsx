import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { 
  getScaleForScreen,
  getSpacingForScreen
} from '../../../shared/utils/animations';

interface TypingIndicatorProps {
  visible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.budAvatar, {
        width: getScaleForScreen(32),
        height: getScaleForScreen(32),
        borderRadius: getScaleForScreen(16),
      }]}>
        <IconSymbol name="brain.head.profile" size={getScaleForScreen(20)} color="#007AFF" />
      </View>
      
      <ThemedView style={[styles.bubble, {
        paddingHorizontal: getSpacingForScreen(16),
        paddingVertical: getSpacingForScreen(12),
        borderRadius: getScaleForScreen(20),
        borderBottomLeftRadius: getScaleForScreen(4),
      }]}>
        <View style={[styles.dotsContainer, { height: getScaleForScreen(20) }]}>
          <View style={[styles.dot, {
            width: getScaleForScreen(8),
            height: getScaleForScreen(8),
            borderRadius: getScaleForScreen(4),
          }]} />
          <View style={[styles.dot, {
            width: getScaleForScreen(8),
            height: getScaleForScreen(8),
            borderRadius: getScaleForScreen(4),
          }]} />
          <View style={[styles.dot, {
            width: getScaleForScreen(8),
            height: getScaleForScreen(8),
            borderRadius: getScaleForScreen(4),
          }]} />
        </View>
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: getSpacingForScreen(16),
    alignItems: 'flex-end',
    paddingHorizontal: getSpacingForScreen(16),
    justifyContent: 'flex-start',
  },
  budAvatar: {
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacingForScreen(8),
    marginBottom: getSpacingForScreen(2),
  },
  bubble: {
    backgroundColor: '#F0F0F0',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: '#666666',
    marginHorizontal: getSpacingForScreen(2),
  },
});