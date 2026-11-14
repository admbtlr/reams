module.exports = {
  project: {
    ios: {},
    android: {}, // grouped into "project"
  },
  assets: ['./assets/fonts/'], // stays the same
  // commands: require('./path-to-commands.js'), // formerly "plugin", returns an array of commands
  dependencies: {
    // podspec lives in ios/ subfolder, so autolinking misses it — point at it explicitly
    'react-native-text-size': {
      platforms: {
        ios: {
          podspecPath: './node_modules/react-native-text-size/ios/RNTextSize.podspec'
        }
      }
    }
  }
};