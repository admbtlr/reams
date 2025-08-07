import './wdyr'
import 'react-native-gesture-handler'
import 'react-native-get-random-values'
import 'core-js/actual/url'
import 'core-js/actual/url-search-params'

import { registerRootComponent } from 'expo'
import Rizzle from './components/Rizzle'

// AppRegistry.registerComponent('rizzle', () => Rizzle)
// AppRegistry.registerComponent('RizzleShare', () => Share)

// LogBox.ignoreLogs(['new NativeEventEmitter()'])
registerRootComponent(Rizzle)
