// app/_layout.jsx
import React, { useContext } from 'react';
import {
  Platform,
  View,
  StyleSheet,
  useWindowDimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { HueOffsetProvider, HueOffsetContext } from './HueOffsetContext';
import Slider from '@react-native-community/slider';

// Base width for responsive scaling
const guidelineBaseWidth = 350;
const useScale = () => {
  const { width } = useWindowDimensions();
  return (size) => (width / guidelineBaseWidth) * size;
};

export default function Layout() {
  const scale = useScale();

  // Static header height in pixels
  const headerHeight = 65;
  // Slider dimensions (unchanged)
  const sliderHeight = scale(30);
  const trackHeight = scale(2);
  const knobDiameter = 30;
  const knobMarginTop = (trackHeight - knobDiameter) / 4;

  return (
    <HueOffsetProvider>
      <View style={styles.container}>
        {/* Header with fixed height */}
        <View style={[styles.headerContainer, { height: headerHeight }]}>
          <Image
            source={require('../assets/images/design.png')}
            style={styles.headerImage}
            resizeMode="stretch"
            accessibilityLabel="Decorative header image"
          />
        </View>

        {/* Slider positioned at the header/content boundary */}
        <View
          style={[
            styles.sliderOverlay,
            {
              top: headerHeight - sliderHeight / 2,
              height: sliderHeight,
            },
          ]}
        >
          {Platform.OS === 'web' ? (
            <>
              {/* Inject CSS for thumb sizing */}
              <style>{`
                input.hue-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  width: ${knobDiameter}px;
                  height: ${knobDiameter}px;
                  margin-top: ${knobMarginTop}px;
                  background: #ffffff;
                  border: 2px solid #4B1382;
                  border-radius: 50%;
                  cursor: pointer;
                }
                input.hue-slider::-moz-range-thumb {
                  width: ${knobDiameter}px;
                  height: ${knobDiameter}px;
                  margin-top: ${knobMarginTop}px;
                  background: #ffffff;
                  border: 2px solid #4B1382;
                  border-radius: 50%;
                  cursor: pointer;
                }
              `}</style>
              <WebSlider sliderHeight={sliderHeight} trackHeight={trackHeight} />
            </>
          ) : (
            <NativeSlider sliderHeight={sliderHeight} trackHeight={trackHeight} />
          )}
        </View>

        {/* Main content */}
        <View style={styles.contentContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    </HueOffsetProvider>
  );
}

function WebSlider({ sliderHeight, trackHeight }) {
  const { hueOffset, setHueOffset } = useContext(HueOffsetContext);

  return (
    <View style={{ width: '80%', height: sliderHeight, position: 'relative' }}>
      {/* Gradient track */}
      <LinearGradient
        colors={[
          'hsl(270,100%,50%)',
          'hsl(330,100%,50%)',
          'hsl(30,100%,50%)',
          'hsl(90,100%,50%)',
          'hsl(150,100%,50%)',
          'hsl(210,100%,50%)',
          'hsl(269,100%,50%)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: trackHeight,
          marginTop: -trackHeight / 2,
          borderRadius: trackHeight / 2,
          zIndex: 0,
        }}
      />
      {/* Transparent input */}
      <input
        type="range"
        className="hue-slider"
        min="0"
        max="360"
        step="1"
        value={hueOffset}
        onChange={(e) => setHueOffset(Number(e.target.value))}
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          background: 'transparent',
          zIndex: 1,
        }}
      />
    </View>
  );
}

function NativeSlider({ sliderHeight, trackHeight }) {
  const { hueOffset, setHueOffset } = useContext(HueOffsetContext);

  return (
    <View style={{ width: '80%', height: sliderHeight, position: 'relative' }}>
      {/* Gradient track */}
      <View
        style={{
          position: 'absolute',
          left: trackHeight * 10,
          right: trackHeight * 10,
          top: sliderHeight / 2 - trackHeight / 2,
          height: trackHeight,
          borderRadius: trackHeight / 2,
          zIndex: 0,
        }}
      >
        <LinearGradient
          colors={[
            'hsl(270,100%,50%)',
            'hsl(330,100%,50%)',
            'hsl(30,100%,50%)',
            'hsl(90,100%,50%)',
            'hsl(150,100%,50%)',
            'hsl(210,100%,50%)',
            'hsl(269,100%,50%)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Slider control */}
      <Slider
        style={{ width: '100%', height: sliderHeight, zIndex: 1 }}
        minimumValue={0}
        maximumValue={360}
        step={1}
        value={hueOffset}
        onValueChange={setHueOffset}
        minimumTrackTintColor="transparent"
        maximumTrackTintColor="transparent"
        thumbTintColor="#ffffff"
        accessible
        accessibilityLabel="Hue Offset Slider"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { width: '100%', position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  sliderOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  contentContainer: { flex: 1 },
});
