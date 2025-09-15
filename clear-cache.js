#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧹 Clearing Metro cache...');

try {
  // Clear Metro cache
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.error('Error clearing cache:', error.message);
  process.exit(1);
}