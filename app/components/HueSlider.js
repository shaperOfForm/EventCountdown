// components/HueSlider.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export default function HueSlider({ hue, onHueChange }) {
  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={359}
        step={1}
        value={hue}
        onValueChange={onHueChange}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
  },
  slider: {
    width: 150,
    height: 40,
  },
});
