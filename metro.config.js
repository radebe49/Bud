const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path aliases for Metro bundler
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
  '@/components': path.resolve(__dirname, './components'),
  '@/constants': path.resolve(__dirname, './constants'),
  '@/hooks': path.resolve(__dirname, './hooks'),
  '@/assets': path.resolve(__dirname, './assets'),
  '@/features': path.resolve(__dirname, './src/features'),
  '@/shared': path.resolve(__dirname, './src/shared'),
  '@/navigation': path.resolve(__dirname, './src/navigation'),
};

module.exports = config;