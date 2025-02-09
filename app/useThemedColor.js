import { useContext, useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { HueOffsetContext } from './HueOffsetContext';

export const useThemedColor = (baseColor) => {
  const { hueOffset } = useContext(HueOffsetContext);
  return useMemo(() => tinycolor(baseColor).spin(hueOffset).toHexString(), [baseColor, hueOffset]);
};
