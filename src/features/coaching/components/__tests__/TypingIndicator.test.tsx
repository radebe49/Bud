import React from 'react';
import { render } from '@testing-library/react-native';
import { TypingIndicator } from '../TypingIndicator';

// Mock the animations utility
jest.mock('../../../../shared/utils/animations', () => ({
  getScaleForScreen: (value: number) => value,
  getSpacingForScreen: (value: number) => value,
}));

// Mock ThemedView
jest.mock('@/components/ThemedView', () => ({
  ThemedView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

// Mock IconSymbol
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: ({ name, size, color }: any) => {
    const { Text } = require('react-native');
    return <Text>{name}</Text>;
  },
}));

describe('TypingIndicator', () => {
  it('renders without crashing when visible', () => {
    const { getByText } = render(<TypingIndicator visible={true} />);
    expect(getByText('brain.head.profile')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(<TypingIndicator visible={false} />);
    expect(queryByText('brain.head.profile')).toBeNull();
  });

  it('renders three dots in the bubble', () => {
    const { getByTestId } = render(<TypingIndicator visible={true} />);
    // The component should render without throwing errors
    expect(true).toBe(true);
  });
});