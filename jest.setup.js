global.fetch = require('jest-fetch-mock')

import mockClipboard from '@react-native-clipboard/clipboard/jest/clipboard-mock.js'

jest.mock('@react-native-clipboard/clipboard', () => mockClipboard)

jest.mock("redux-devtools-expo-dev-plugin", () => { })

// needed for expo/sqlite and others
process.env.EXPO_OS = 'ios'

// all this is taken from https://reactnavigation.org/docs/7.x/testing#mocking-native-dependencies
// include this line for mocking react-native-gesture-handler
import 'react-native-gesture-handler/jestSetup'

// include this section and the NativeAnimatedHelper section for mocking react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => { }

  return Reanimated
})

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
