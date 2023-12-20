const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.alias["react-native-webview"] = "react-native-web-webview";
  config.resolve.alias["redux-persist-filesystem-storage"] = "";
  
  return config;
};
