import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Platform-specific Lottie component
const LottieAnimation = ({ source, style, autoPlay = true, loop = false, ...props }) => {
  // For now, use a simple fallback for all platforms to avoid bundling issues
  return (
    <View style={[styles.webContainer, style]}>
      <Text style={styles.webAnimationText}>🎉</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webAnimationText: {
    fontSize: 80,
  },
});

export default LottieAnimation; 