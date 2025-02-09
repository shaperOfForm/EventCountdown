import React, { useContext } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { HueOffsetProvider, HueOffsetContext } from '../HueOffsetContext';

export default function HueSlider() {
  const { hueOffset, setHueOffset } = useContext(HueOffsetContext);

  return (
    <View style={styles.sliderOverlay}>
      <View style={styles.sliderWrapper}>
        <View style={styles.gradientTrack}>
          <LinearGradient
            colors={[
              'hsl(270, 100%, 50%)',
              'hsl(330, 100%, 50%)',
              'hsl(30, 100%, 50%)',
              'hsl(90, 100%, 50%)',
              'hsl(150, 100%, 50%)',
              'hsl(210, 100%, 50%)',
              'hsl(269, 100%, 50%)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={355}
          step={1}
          value={hueOffset}
          onValueChange={setHueOffset}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#fff"
        />
      </View>
    </View>
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
  gradientTrack: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 4,
    borderRadius: 3,
    transform: [{ translateY: 7.5 }],
    overflow: 'hidden',
    zIndex: 0,
  },
  slider: {
    width: '100%',
    height: 40,
    zIndex: 1,
  },
});
