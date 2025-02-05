// app/layout.jsx
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import Slider from '@react-native-community/slider';
import { HueRotate } from 'react-native-color-matrix-image-filters';

export default function Layout() {
  // The hue value is in radians (0 to 2π, with 2π ≈ 6.28319)
  const [hue, setHue] = useState(0);

  return (
    <View style={styles.container}>
      {/* Header Container with design image and overlayed HueSlider */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/design.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        {/* HueSlider overlay */}
        <View style={styles.hueSliderWrapper}>
          <Slider
            style={styles.hueSlider}
            minimumValue={0}
            maximumValue={6.28319} // Full rotation in radians (0 to 2π)
            value={hue}
            onValueChange={setHue}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#000"
          />
        </View>
      </View>
      {/* Wrap the Stack with a HueRotate filter to apply the hue shift */}
      <HueRotate amount={hue}>
        <Stack screenOptions={{ headerShown: false }} />
      </HueRotate>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  headerContainer: {
    height: 80,
    width: '100%',
    position: 'relative', // Needed for absolute positioning of the slider overlay
  },
  headerImage: {
    flex: 1,
    width: '100%',
  },
  hueSliderWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background for better slider visibility
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hueSlider: {
    width: '100%',
    height: 40,
  },
});
