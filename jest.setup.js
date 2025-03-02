global.fetch = require('jest-fetch-mock')

import mockClipboard from '@react-native-clipboard/clipboard/jest/clipboard-mock.js';

jest.mock('@react-native-clipboard/clipboard', () => mockClipboard);

jest.mock("redux-devtools-expo-dev-plugin", () => {});

// needed for expo/sqlite and others
process.env.EXPO_OS = 'ios'
