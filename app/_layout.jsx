import React, { useContext } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { HueOffsetProvider, HueOffsetContext } from './HueOffsetContext';

const guidelineBaseWidth = 350;

// Custom hook for responsive scaling
const useScale = () => {
  const { width } = useWindowDimensions();
  return (size) => (width / guidelineBaseWidth) * size;
};

export const HueOffsetSlider = ({ style }) => {
  const { hueOffset, setHueOffset } = useContext(HueOffsetContext);
  const scale = useScale();
  const sliderHeight = scale(40);
  const trackHeight = scale(4);
  const inset = scale(20);
  const endInset = sliderHeight / 2;

  return (
    <View style={[styles.sliderOverlay, style]}>
    <View style={[styles.sliderWrapper, { paddingVertical: scale(1), paddingHorizontal: inset }]}>
        <View
          style={[
            styles.gradientTrack,
            {
              left: endInset,
              right: endInset,
              height: trackHeight,
              borderRadius: scale(3),
              transform: [{ translateY: scale(7.5) }],

            },
          ]}
        >
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
          style={[styles.slider, { height: sliderHeight, width: '100%' }]}
          minimumValue={0}
          maximumValue={360} // Updated to cover the full hue range
          step={1}
          value={hueOffset}
          onValueChange={setHueOffset}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#fff"
          accessibilityLabel="Hue Offset Slider"
          accessible
        />
      </View>
    </View>
  );
};

export default function Layout() {
  const scale = useScale();

  return (
    <HueOffsetProvider>
      <View style={styles.container}>
        <View style={[styles.headerContainer, { height: scale(80) }]}>
          <Image
            source={require('../assets/images/design.png')}
            style={styles.headerImage}
            resizeMode="cover"
            accessibilityLabel="Decorative header image"
            accessible
          />
        </View>
        <View style={styles.contentContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
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
    width: '100%',
    maxHeight: 80,
    position: 'relative',
    zIndex: 10,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
  },
  sliderOverlay: {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
},
  sliderWrapper: {
    width: '80%',
    position: 'relative',
    marginVertical: 0,
  },
  gradientTrack: {
    position: 'absolute',
    top: '27.5%',
    overflow: 'hidden',
    zIndex: 30,
  },
  slider: {
    width: '100%',
    zIndex: 30,
  },
});
