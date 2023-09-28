const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const ReactWebConfig = require('react-web-config/lib/ReactWebConfig').ReactWebConfig;
const path = require('path');
const envFilePath = path.resolve(__dirname, '.env');
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  config.plugins[4].definitions = {
    ...config.plugins[4].definitions,
    ...ReactWebConfig(envFilePath).definitions,
  };
  config.resolve.alias["react-native-config"] = "react-web-config";
  config.resolve.alias["react-native-linear-gradient"] = "react-native-web-linear-gradient";
  config.resolve.alias["react-native-webview"] = "react-native-web-webview";
  config.resolve.alias["redux-persist-filesystem-storage"] = "";

//  config.modules = { rules: [] }
  // config.module.rules.push({
  //   test: /\.css$/i,
  //   use: ["style-loader", "css-loader"],
  // })

  return config;
};
