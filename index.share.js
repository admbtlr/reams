import 'react-native-gesture-handler'
import 'react-native-get-random-values'

import React from 'react'
import { AppRegistry } from 'react-native'
// import Rizzle from './components/Rizzle'
import Share from './components/Share'

if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  })
}

// AppRegistry.registerComponent('rizzle', () => Rizzle)
AppRegistry.registerComponent('RizzleShare', () => Share)
