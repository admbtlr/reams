const path = require('path');
const dotenv = require('dotenv');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

const envFilePath = path.resolve(__dirname, '.env');

console.log('envFilePath', envFilePath);

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.alias["react-native-config"] = "react-web-config";
  config.resolve.alias["react-native-webview"] = "react-native-web-webview";
  config.resolve.alias["redux-persist-filesystem-storage"] = "";
  config.resolve.alias["@tensorflow/tfjs"] = path.resolve(__dirname, "./web-mocks/tf.js");
  config.resolve.alias["@tensorflow/tfjs-react-native"] = path.resolve(__dirname, "./web-mocks/tf.js");
  config.resolve.alias["mixpanel-react-native"] = path.resolve(__dirname, "./web-mocks/tf.js");
  config.resolve.alias["react-native-image-filter-kit"] = path.resolve(__dirname, "./web-mocks/tf.js");
  config.resolve.alias["@invertase/react-native-apple-authentication"] = path.resolve(__dirname, "./web-mocks/tf.js");
  config.resolve.alias["redux-persist-filesystem-storage"] = path.resolve(__dirname, "./web-mocks/tf.js");
  
  config.plugins.push(
    // https://github.com/tanhauhau/react-web-config/issues/2#issue-717612918
    new webpack.DefinePlugin({
      __REACT_WEB_CONFIG__: JSON.stringify(dotenv.config({ path: envFilePath }).parsed),
    }),
  );

  return config;
};
