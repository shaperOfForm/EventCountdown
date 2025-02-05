// app/layout.jsx
import React, { useContext } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import Slider from '@react-native-community/slider';
import { HueOffsetProvider, HueOffsetContext } from './HueOffsetContext';

function HueOffsetSlider() {
  const { hueOffset, setHueOffset } = useContext(HueOffsetContext);
  return (
    <View style={styles.sliderOverlay}>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={355} // Hue offset in degrees
          step={1}
          value={hueOffset}
          onValueChange={setHueOffset}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#000"
        />
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    <HueOffsetProvider>
      <View style={styles.container}>
        {/* Header with design image */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../assets/images/design.png')}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        {/* Routed content (e.g. HomeScreen and others) */}
        <View style={styles.contentContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {/* Slider overlay */}
        <HueOffsetSlider />
      </View>
    </HueOffsetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Enables absolute positioning for slider overlay
  },
  headerContainer: {
    height: 80,
    width: '100%',
  },
  headerImage: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
  },
  sliderOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
  },
  sliderWrapper: {
    width: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background for visibility
    borderRadius: 5,
    padding: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
