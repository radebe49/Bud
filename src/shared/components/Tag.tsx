import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface TagProps {
  text: string;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function Tag({ 
  text, 
  color = '#007AFF', 
  backgroundColor, 
  size = 'medium',
  style 
}: TagProps) {
  const getTagStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.tag];
    
    if (backgroundColor) {
      baseStyle.push({ backgroundColor });
    } else {
      baseStyle.push({ backgroundColor: `${color}15` }); // 15% opacity
    }
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.tagSmall);
        break;
      case 'large':
        baseStyle.push(styles.tagLarge);
        break;
      default:
        baseStyle.push(styles.tagMedium);
    }
    
    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.tagText, { color }];
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.tagTextSmall);
        break;
      case 'large':
        baseStyle.push(styles.tagTextLarge);
        break;
      default:
        baseStyle.push(styles.tagTextMedium);
    }
    
    return baseStyle;
  };

  return (
    <View style={[getTagStyle(), style]}>
      <ThemedText style={getTextStyle()}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tagSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontWeight: '500',
  },
  tagTextSmall: {
    fontSize: 10,
  },
  tagTextMedium: {
    fontSize: 12,
  },
  tagTextLarge: {
    fontSize: 14,
  },
});