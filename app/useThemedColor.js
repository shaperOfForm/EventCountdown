// useThemedColor.js
import { useContext } from 'react';
import tinycolor from 'tinycolor2';
import { HueOffsetContext } from './HueOffsetContext';

export const useThemedColor = (baseColor) => {
  const { hueOffset } = useContext(HueOffsetContext);
  // When hueOffset is 0 the color remains unchanged.
  return tinycolor(baseColor).spin(hueOffset).toHexString();
};
