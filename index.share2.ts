import 'react-native-gesture-handler'
import 'react-native-get-random-values'

import React from 'react'
import { AppRegistry, Text, View } from 'react-native'
import Share2 from './components/Share2'

if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  })
}

// AppRegistry.registerComponent('rizzle', () => Rizzle)
AppRegistry.registerComponent('RizzleShare2', () => Share2)
