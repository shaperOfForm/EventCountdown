// app/layout.jsx
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import Slider from '@react-native-community/slider';
import { ThemeProvider } from './ThemeContext'; // Adjust the path if needed

export default function Layout() {
  // The slider controls a hue offset in degrees (0–355)
  const [hueOffset, setHueOffset] = useState(0);

  return (
    // Wrap the entire app with the ThemeProvider so every screen gets the theme.
    <ThemeProvider hueOffset={hueOffset}>
      <View style={styles.container}>
        {/* Header with design image */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../assets/images/design.png')}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        {/* Routed content (HomeScreen and others) */}
        <View style={styles.contentContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {/* Slider overlay in the middle of the screen */}
        <View style={styles.sliderOverlay}>
          <View style={styles.sliderWrapper}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={355} // Hue offset in degrees
              step={1}           // Ensure discrete steps; helps with visual alignment
              value={hueOffset}  // Controlled value starting at 0
              onValueChange={setHueOffset}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#000"
            />
          </View>
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    position: 'relative', // Needed for absolute positioning of slider overlay
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
    alignItems: 'center',    // Center horizontally
    justifyContent: 'center' // Center vertically
  },
  sliderWrapper: {
    width: '80%', // Adjust as needed
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent for visibility
    borderRadius: 5,
    padding: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});