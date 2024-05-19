module.exports = {
  "env": {
    "production": {
      "plugins": ["transform-remove-console"]
    }
  },
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin',
  ]    
}
