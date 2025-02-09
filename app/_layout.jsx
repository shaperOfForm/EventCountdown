// app/layout.jsx
import React, { useContext } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';

// HueOffsetContext from your own HueOffsetContext.js
import { HueOffsetProvider, HueOffsetContext } from './HueOffsetContext';

function HueOffsetSlider() {
  const { hueOffset, setHueOffset } = useContext(HueOffsetContext);

  return (
    <View style={styles.sliderOverlay}>
      <View style={styles.sliderWrapper}>
        {/* 1) The narrow gradient bar behind the slider's track */}
        <View style={styles.gradientTrack}>
          <LinearGradient
            colors={[
              'hsl(270, 100%, 50%)',    // Red
              'hsl(330, 100%, 50%)',   // Yellow
              'hsl(30, 100%, 50%)',  // Green
              'hsl(90, 100%, 50%)',  // Cyan
              'hsl(150, 100%, 50%)',  // Blue
              'hsl(210, 100%, 50%)',  // Magenta
              'hsl(269, 100%, 50%)',  // Almost Red
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* 2) The slider, using a transparent track so the gradient is visible */}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={355}
          step={1}
          value={hueOffset}
          onValueChange={setHueOffset}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#fff"  // White slider thumb
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
            accessibilityLabel="decorative"
            accessible={true}
          />
        </View>

        {/* Routed content (e.g. screens) */}
        <View style={styles.contentContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {/* Slider overlay at the top */}
        <HueOffsetSlider />
      </View>
    </HueOffsetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
    top: '6.25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderWrapper: {
    width: '80%',
    padding: 10,
    position: 'relative',
  },
  // A slim bar with a gradient behind the slider's track
  gradientTrack: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 4,           // Track thickness
    borderRadius: 3,     // Round edges
    transform: [{ translateY: 7.5 }],  // Vertically center
    overflow: 'hidden',
    zIndex: 0,
  },
  slider: {
    width: '100%',
    height: 40,
    zIndex: 1,
  },
});
