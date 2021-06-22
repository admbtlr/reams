import 'react-native-gesture-handler'

import React from 'react'
import { AppRegistry } from 'react-native'
import Share from './components/Share'

// if (__DEV__) {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render')
//   whyDidYouRender(React)
// }

// AppRegistry.registerComponent('rizzle', () => Rizzle)
AppRegistry.registerComponent('RizzleShare', () => Share)
// AppRegistry.registerComponent('RizzleShare', () => require('./components/Share'))
