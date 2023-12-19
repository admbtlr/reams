import './wdyr'
import 'react-native-gesture-handler'

import React from 'react'
import { AppRegistry } from 'react-native'
import {registerRootComponent} from 'expo'
import Rizzle from './components/Rizzle'

// import Share from './components/Share'

// if (__DEV__) {
//   const ReactRedux = require("react-redux/lib");
//   const whyDidYouRender = require('@welldone-software/why-did-you-render')
//   // whyDidYouRender(React)
//   // whyDidYouRender(React, {
//   //   trackAllPureComponents: true,
//   //   trackExtraHooks: [[ReactRedux, "useSelector"]]
//   // })
// }

// AppRegistry.registerComponent('rizzle', () => Rizzle)
// AppRegistry.registerComponent('RizzleShare', () => Share)

registerRootComponent(Rizzle)
