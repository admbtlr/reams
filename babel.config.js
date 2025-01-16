module.exports = api => {

  api.cache(false)

  return {
    "env": {
      "production": {
        "plugins": ["transform-remove-console"]
      }
    },
    presets: [
      'babel-preset-expo',
      ['@babel/preset-typescript', {allowDeclareFields: true}]
    ],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      'react-native-reanimated/plugin',
    ]    
  }
}
