// HueOffsetContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HueOffsetContext = createContext({
  hueOffset: 0,
  setHueOffset: () => {},
});

export const HueOffsetProvider = ({ children }) => {
  const [hueOffset, setHueOffset] = useState(0);

  // When the provider mounts, load the saved hue offset (if any)
  useEffect(() => {
    async function loadHueOffset() {
      try {
        const storedHue = await AsyncStorage.getItem('@hueOffset');
        if (storedHue !== null) {
          setHueOffset(parseInt(storedHue, 10));
        }
      } catch (e) {
        console.error('Failed to load hue offset:', e);
      }
    }
    loadHueOffset();
  }, []);

  // Whenever hueOffset changes, persist it
  useEffect(() => {
    async function saveHueOffset() {
      try {
        await AsyncStorage.setItem('@hueOffset', hueOffset.toString());
      } catch (e) {
        console.error('Failed to save hue offset:', e);
      }
    }
    saveHueOffset();
  }, [hueOffset]);

  return (
    <HueOffsetContext.Provider value={{ hueOffset, setHueOffset }}>
      {children}
    </HueOffsetContext.Provider>
  );
};
