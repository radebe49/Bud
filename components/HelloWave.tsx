import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
// Temporarily disable Reanimated to fix runtime error
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withRepeat,
//   withSequence,
//   withTiming,
// } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

export function HelloWave() {
  // Temporarily disable animation to fix Reanimated runtime error
  // const rotationAnimation = useSharedValue(0);

  // useEffect(() => {
  //   rotationAnimation.value = withRepeat(
  //     withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
  //     4 // Run the animation 4 times
  //   );
  // }, [rotationAnimation]);

  // const animatedStyle = useAnimatedStyle(() => ({
  //   transform: [{ rotate: `${rotationAnimation.value}deg` }],
  // }));

  return (
    <View>
      <ThemedText style={styles.text}>👋</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
