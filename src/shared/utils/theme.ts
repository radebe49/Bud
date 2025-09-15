/**
 * Modern Design System Theme
 * Inspired by clean health app designs
 * Optimized for large screens (6.7 inch displays)
 */

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Screen size detection for responsive design
export const isLargeScreen = screenWidth >= 428; // 6.7 inch and above
export const isXLargeScreen = screenWidth >= 480; // Future larger devices

// Dynamic scaling functions for large screens
const getScaledSize = (baseSize: number, scaleFactor: number = 1.1) => {
  if (isXLargeScreen) return Math.round(baseSize * scaleFactor * 1.1);
  if (isLargeScreen) return Math.round(baseSize * scaleFactor);
  return baseSize;
};

const getScaledSpacing = (baseSpacing: number) => {
  if (isXLargeScreen) return Math.round(baseSpacing * 1.2);
  if (isLargeScreen) return Math.round(baseSpacing * 1.1);
  return baseSpacing;
};

export const Theme = {
  // Colors
  colors: {
    // Primary brand colors
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      500: '#4F46E5',
      600: '#4338CA',
      700: '#3730A3',
    },
    
    // Neutral grays
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    
    // Health metric colors
    health: {
      sleep: '#8B5CF6',
      water: '#06B6D4',
      heartRate: '#EF4444',
      calories: '#F97316',
      steps: '#10B981',
      workouts: '#3B82F6',
    },
    
    // Background colors
    background: {
      primary: '#FAFAFA',
      secondary: '#FFFFFF',
      surface: '#F8FAFC',
    },
  },
  
  // Typography - Enhanced for large screens
  typography: {
    // Font sizes - Dynamically scaled for large displays
    fontSize: {
      xs: getScaledSize(12),
      sm: getScaledSize(14),
      base: getScaledSize(16),
      lg: getScaledSize(18),
      xl: getScaledSize(20),
      '2xl': getScaledSize(24),
      '3xl': getScaledSize(30),
      '4xl': getScaledSize(36),
      '5xl': getScaledSize(42), // Added for large screen headers
      '6xl': getScaledSize(48), // Added for hero text
    },
    
    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    
    // Line heights - Optimized for readability on large screens
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    
    // Letter spacing for better readability
    letterSpacing: {
      tighter: -0.05,
      tight: -0.025,
      normal: 0,
      wide: 0.025,
      wider: 0.05,
      widest: 0.1,
    },
  },
  
  // Spacing - Enhanced for large screens with better touch targets
  spacing: {
    0: 0,
    1: getScaledSpacing(4),
    2: getScaledSpacing(8),
    3: getScaledSpacing(12),
    4: getScaledSpacing(16),
    5: getScaledSpacing(20),
    6: getScaledSpacing(24),
    7: getScaledSpacing(28),
    8: getScaledSpacing(32),
    9: getScaledSpacing(36),
    10: getScaledSpacing(40),
    11: getScaledSpacing(44),
    12: getScaledSpacing(48),
    14: getScaledSpacing(56),
    16: getScaledSpacing(64),
    20: getScaledSpacing(80),
    24: getScaledSpacing(96),
    28: getScaledSpacing(112),
    32: getScaledSpacing(128),
  },
  
  // Touch targets - Optimized for large screens
  touchTargets: {
    small: getScaledSize(44), // Minimum recommended
    medium: getScaledSize(48), // Comfortable
    large: getScaledSize(56), // Generous for large screens
    xlarge: getScaledSize(64), // Maximum for primary actions
  },
  
  // Border radius - Enhanced for large screens
  borderRadius: {
    none: 0,
    xs: getScaledSize(2),
    sm: getScaledSize(4),
    base: getScaledSize(8),
    md: getScaledSize(12),
    lg: getScaledSize(16),
    xl: getScaledSize(20),
    '2xl': getScaledSize(24),
    '3xl': getScaledSize(32),
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Animation timing - Optimized for large screens
  animations: {
    // Duration in milliseconds
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
      slower: 500,
      slowest: 800,
    },
    
    // Easing curves
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Component specific styles - Enhanced for large screens
  components: {
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: getScaledSize(16),
      padding: getScaledSpacing(20),
      minHeight: getScaledSize(120),
      ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: getScaledSize(2) },
        shadowOpacity: 0.06,
        shadowRadius: getScaledSize(8),
        elevation: 2,
      },
    },
    
    button: {
      primary: {
        backgroundColor: '#4F46E5',
        borderRadius: getScaledSize(12),
        paddingVertical: getScaledSpacing(16),
        paddingHorizontal: getScaledSpacing(24),
        minHeight: getScaledSize(48), // Touch target
      },
      secondary: {
        backgroundColor: '#F3F4F6',
        borderRadius: getScaledSize(12),
        paddingVertical: getScaledSpacing(16),
        paddingHorizontal: getScaledSpacing(24),
        minHeight: getScaledSize(48), // Touch target
      },
    },
    
    input: {
      backgroundColor: '#F9FAFB',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      borderRadius: getScaledSize(12),
      paddingVertical: getScaledSpacing(16),
      paddingHorizontal: getScaledSpacing(16),
      minHeight: getScaledSize(48), // Touch target
      fontSize: getScaledSize(16),
    },
    
    // Message bubble styles for large screens
    messageBubble: {
      maxWidth: isLargeScreen ? '85%' : '78%',
      borderRadius: getScaledSize(24),
      paddingVertical: getScaledSpacing(14),
      paddingHorizontal: getScaledSpacing(18),
      marginBottom: getScaledSpacing(20),
    },
    
    // Progress ring styles for large screens
    progressRing: {
      small: getScaledSize(60),
      medium: getScaledSize(80),
      large: getScaledSize(120),
      xlarge: getScaledSize(160), // For large screen emphasis
    },
  },
};

export type ThemeType = typeof Theme;