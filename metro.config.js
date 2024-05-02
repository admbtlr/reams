const { getDefaultConfig, mergeConfig, MetroConfig } = require('expo/metro-config')

const {
 createSentryMetroSerializer
} = require("@sentry/react-native/dist/js/tools/sentryMetroSerializer");

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type MetroConfig}
 */
const config = {
 serializer: {
  customSerializer: createSentryMetroSerializer()
 }
};

module.exports = {
  ...getDefaultConfig(__dirname), 
  config
}