module.exports = api => {

  api.cache(false)

  return {
    "env": {
      "production": {
        "plugins": ["transform-remove-console"]
      }
    },
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      'react-native-reanimated/plugin',
      [
        'module:react-native-dotenv',
        {
          moduleName: 'react-native-dotenv',
          verbose: false,
        },
      ]
    ]    
  }
}
