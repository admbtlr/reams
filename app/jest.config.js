module.exports = {
  preset: 'jest',
  transform: {
    '\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  }
}