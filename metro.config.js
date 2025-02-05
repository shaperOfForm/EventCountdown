// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const defaultResolver = require('metro-resolver').resolve;

module.exports = (async () => {
  // Get the default Expo Metro configuration
  const config = await getDefaultConfig(__dirname);

  // Override the resolveRequest function to intercept the request for Platform
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'react-native/Libraries/Utilities/Platform') {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'shims/Platform.js'),
      };
    }
    // Fallback to the default resolver for all other modules
    return defaultResolver(context, moduleName, platform);
  };

  return config;
})();
