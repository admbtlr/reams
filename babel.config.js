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
      ['@babel/preset-typescript', { allowDeclareFields: true }],
    ],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      'react-native-reanimated/plugin',
      ['@babel/plugin-transform-react-jsx', {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
        importSource: '@welldone-software/why-did-you-render',
      }]
    ]
  }
}
