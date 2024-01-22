module.exports = {
  "env": {
    "production": {
      "plugins": ["transform-remove-console"]
    }
  },
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    'react-native-reanimated/plugin',
  ]    
}
