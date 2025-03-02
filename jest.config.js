module.exports = {
  globals: {
    __TEST__: true,
  },
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Adding this line solved the issue
    '^.+\\.tsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|@sentry|@tensorflow|gl-react-native|redux-persist-filesystem-storage|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@invertase/react-native-apple-authentication)',
  ],
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@shopify/react-native-skia$': '<rootDir>/__mocks__/@shopify/react-native-skia.js',
  }
}
