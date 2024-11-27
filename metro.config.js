const { getDefaultConfig, mergeConfig, MetroConfig } = require('expo/metro-config')
const path = require('path')

const { getSentryExpoConfig } = require("@sentry/react-native/metro")

const config = getSentryExpoConfig(__dirname)

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === 'redux-persist-filesystem-storage' ||
      moduleName === '@tensorflow/tfjs' ||
      moduleName === '@tensorflow/tfjs-react-native' ||
      moduleName === 'mixpanel-react-native' ||
      moduleName === 'react-native-image-filter-kit' ||
      moduleName === '@invertase/react-native-apple-authentication' ||
      moduleName === 'react-native-haptic-feedback' ||
      moduleName === 'redux-persist-filesystem-storage') {
      return {
        type: 'empty',
        path: ''
      }
    }
    if (moduleName === 'react-native-config') {
      console.log(path.join(__dirname, 'node_modules/react-web-config/lib/index.js'))
      return {
        filePath: path.join(__dirname, 'node_modules/react-web-config/lib/index.js'),
        type: 'sourceFile'
      }
    }
    if (moduleName == 'react-native-webview') {
      console.log(path.join(__dirname, 'node_modules/react-native-web-webview/dist/index.js'))
      return {
        filePath: path.join(__dirname, 'node_modules/react-native-web-webview/dist/index.js'),
        type: 'sourceFile'
      }
    }
  }

  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
