import './wdyr'
import 'react-native-gesture-handler'
import 'react-native-get-random-values'

import {registerRootComponent} from 'expo'
import { LogBox } from 'react-native'
import Rizzle from './components/Rizzle'

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

LogBox.ignoreLogs(['new NativeEventEmitter()'])

registerRootComponent(Rizzle)
