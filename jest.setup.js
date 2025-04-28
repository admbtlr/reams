global.fetch = require('jest-fetch-mock')

import mockClipboard from '@react-native-clipboard/clipboard/jest/clipboard-mock.js'

jest.mock('@react-native-clipboard/clipboard', () => mockClipboard)

jest.mock("redux-devtools-expo-dev-plugin", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => [])
}))

// Mock redux-persist to avoid storage issues in tests
jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((_, reducers) => reducers),
    persistStore: jest.fn().mockImplementation(() => ({ purge: () => {} })),
  }
})

// Mock storage libraries
jest.mock('redux-persist-filesystem-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}))

// Mock utils.id function
// this avoids problems with the uuid module
jest.mock('./utils', () => {
  const originalModule = jest.requireActual('./utils')
  return {
    ...originalModule,
    id: jest.fn(() => '00000000-0000-0000-0000-000000000000')
  }
})

// Mock dimensions functions
jest.mock('./utils/dimensions', () => {
  return {
    hasNotchOrIsland: jest.fn(() => false),
    isIpad: jest.fn(() => false),
    isPortrait: jest.fn(() => true),
    screenWidth: 390,
    screenHeight: 844,
    getDimensions: jest.fn(() => ({ width: 390, height: 844 })),
    getSmallestDimension: jest.fn(() => 390),
    fontSizeMultiplier: jest.fn(() => 1),
    getInset: jest.fn(() => 20),
    getMargin: jest.fn(() => 10),
    getStatusBarHeight: jest.fn(() => 44)
  }
})

// Mock react-native-webview
jest.mock('react-native-webview', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  
  return {
    WebView: ({ source, originWhitelist, onMessage, testID, style, ref, containerStyle }) => {
      // Extract HTML content from source if available
      let content = "This is the content"
      if (source && source.html) {
        // Extract content from between <article> tags if possible
        const articleMatch = source.html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
        if (articleMatch && articleMatch[1]) {
          content = articleMatch[1].replace(/<[^>]*>/g, '')
        }
      }
      
      // Call onMessage with 'loaded' event after render
      React.useEffect(() => {
        if (onMessage) {
          setTimeout(() => {
            onMessage({ nativeEvent: { data: 'loaded' } })
            onMessage({ nativeEvent: { data: 'resize:500' } })
          }, 0)
        }
      }, [])
      
      return (
        <View testID="mock-webview" style={containerStyle || style}>
          <Text>{content}</Text>
        </View>
      )
    }
  }
})

// needed for expo/sqlite and others
process.env.EXPO_OS = 'ios'

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  setTag: jest.fn(),
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  lastEventId: jest.fn(),
  wrap: jest.fn(component => component),
  withScope: jest.fn(callback => callback()),
  getCurrentHub: jest.fn(() => ({
    getClient: jest.fn(() => ({
      getOptions: jest.fn(() => ({
        dsn: 'https://example.com',
      })),
    })),
    getScope: jest.fn(() => ({
      setTag: jest.fn(),
      setTags: jest.fn(),
      setUser: jest.fn(),
      setFingerprint: jest.fn(),
    })),
  })),
  Severity: {
    Error: 'error',
    Warning: 'warning',
    Info: 'info',
  },
}))

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
