/**
 * @format
 */

import React from 'react'
import { AppRegistry } from 'react-native'
import Rizzle from './components/Rizzle.js'
import Share from './components/Share.js'

if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React)
  import('./reactotron.config').then(() => console.log('Reactotron Configured'))
}

AppRegistry.registerComponent('rizzle', () => Rizzle)
AppRegistry.registerComponent('RizzleShare', () => Share)
