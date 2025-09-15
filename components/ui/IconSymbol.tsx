// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconSymbolName = 
  | 'house.fill'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'heart.fill'
  | 'cross.fill'
  | 'message.fill'
  | 'moon.fill'
  | 'fork.knife'
  | 'bolt.fill'
  | 'figure.run'
  | 'figure.cycling'
  | 'flame.fill'
  | 'brain.head.profile'
  | 'drop.fill'
  | 'scale.3d'
  | 'arrow.up'
  | 'arrow.down'
  | 'arrow.right'
  | 'minus'
  | 'chart.bar.fill'
  | 'trophy.fill'
  | 'moon.stars.fill'
  | 'figure.walk'
  | 'camera.fill'
  | 'mic.fill'
  | 'person.crop.circle.badge.checkmark';

type IconMapping = Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'heart.fill': 'favorite',
  'cross.fill': 'local-hospital',
  'message.fill': 'chat',
  'moon.fill': 'bedtime',
  'fork.knife': 'restaurant',
  'bolt.fill': 'flash-on',
  'figure.run': 'directions-run',
  'figure.cycling': 'directions-bike',
  'flame.fill': 'local-fire-department',
  'brain.head.profile': 'psychology',
  'drop.fill': 'water-drop',
  'scale.3d': 'monitor-weight',
  'arrow.up': 'keyboard-arrow-up',
  'arrow.down': 'keyboard-arrow-down',
  'arrow.right': 'keyboard-arrow-right',
  'minus': 'remove',
  'chart.bar.fill': 'bar-chart',
  'trophy.fill': 'emoji-events',
  'moon.stars.fill': 'bedtime',
  'figure.walk': 'directions-walk',
  'person.crop.circle.badge.checkmark': 'support-agent',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
