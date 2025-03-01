module.exports = api => {

  api.cache(true)

  return {
    "env": {
      "production": {
        "plugins": ["transform-remove-console"]
      }
    },
    presets: [
      ['babel-preset-expo', { "jsxImportSource": "@welldone-software/why-did-you-render" }],
      ['@babel/preset-typescript', {allowDeclareFields: true}],
    ],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      'react-native-reanimated/plugin',
    ]    
  }
}
