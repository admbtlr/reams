/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
 const { getDefaultConfig } = require('metro-config');

 module.exports = (async () => {
  // transformer: {
  //   getTransformOptions: async () => ({
  //     transform: {
  //       experimentalImportSupport: false,
  //       inlineRequires: true,
  //     },
  //   }),
  // },
  const defaultConfig = await getDefaultConfig();
  const { assetExts } = defaultConfig.resolver;

  return {
    resolver: {
      // Add bin to assetExts
      assetExts: [...assetExts, 'bin'],
    },
  };
})();