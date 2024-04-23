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
  //       // experimentalImportSupport: false,
  //       inlineRequires: false,
  //     },
  //   })
  // }
  const defaultConfig = await getDefaultConfig();
  const { assetExts } = defaultConfig.resolver;

  return {
    server: {
      rewriteRequestUrl: (url) => {
        if (!url.endsWith('.bundle')) {
          return url;
        }
        // https://github.com/facebook/react-native/issues/36794
        // JavaScriptCore strips query strings, so try to re-add them with a best guess.
        return url + '?platform=ios&dev=true&minify=false&modulesOnly=false&runModule=true';
      }, // ...
    }, // ...
    resolver: {
      // Add bin to assetExts
      assetExts: [...assetExts, 'bin'],
    },
  };
})();