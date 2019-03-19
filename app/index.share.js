/**
 * @format
 */

// import React, { Component } from 'react'
// import { Provider } from 'react-redux'
// import configureStore from './redux/store/configureStore.js'
import { AppRegistry, Text, View } from 'react-native'
// import { Sentry } from 'react-native-sentry'
// import App from './components/App.js'
import Share from './components/Share.js'

// let store = configureStore()

// if (window.__DEV__) {
//   window.getState = store.getState
// }

// Sentry
//   .config('https://1dad862b663640649e6c46afed28a37f:08138824595d4469b62aaba4c01c71f4@sentry.io/195309')
//   .install()

// export default class Rizzle extends Component {
//   render () {
//     return (
//       <Provider store={store}>
//         <App />
//       </Provider>
//     )
//   }
// }

// AppRegistry.registerComponent('rizzle', () => Rizzle)
AppRegistry.registerComponent('RizzleShare', () => Share)

// export default class Rizzle extends Component {
//   render () {
//     return (
//       <View style={{flex: 1}}>
//         <Text style={{flex: 1, textAlign: 'center', fontSize: 32, marginTop: '50%'}}>Rizzle, yo</Text>
//       </View>
//     )
//   }
// }

// AppRegistry.registerComponent('rizzle', () => Rizzle)