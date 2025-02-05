// HueOffsetContext.js
import React, { createContext, useState } from 'react';

export const HueOffsetContext = createContext({
  hueOffset: 0,
  setHueOffset: () => {},
});

export const HueOffsetProvider = ({ children }) => {
  const [hueOffset, setHueOffset] = useState(0);
  return (
    <HueOffsetContext.Provider value={{ hueOffset, setHueOffset }}>
      {children}
    </HueOffsetContext.Provider>
  );
};
