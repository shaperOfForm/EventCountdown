// ThemeContext.js
import React, { createContext, useContext } from 'react';
import tinycolor from 'tinycolor2';

// Set base theme to reflect your original purple scheme.
// When hueOffset is 0, these are the colors that will be used.
const baseTheme = {
  backgroundColor: '#792DE7',        // Use your purple for the background
  textColor: '#FFFFFF',              // White text (or any color that contrasts well)
  gradientColors: ['#792DE7', '#4B1382'], // Your original purple gradient colors
};

const ThemeContext = createContext(baseTheme);

export const ThemeProvider = ({ hueOffset, children }) => {
  // When hueOffset is 0, the colors remain unchanged (i.e. your original purple)
  const shiftedTheme = {
    backgroundColor: tinycolor(baseTheme.backgroundColor)
      .spin(hueOffset)
      .toHexString(),
    textColor: tinycolor(baseTheme.textColor)
      .spin(hueOffset)
      .toHexString(),
    gradientColors: baseTheme.gradientColors.map((color) =>
      tinycolor(color).spin(hueOffset).toHexString()
    ),
  };

  return (
    <ThemeContext.Provider value={shiftedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;