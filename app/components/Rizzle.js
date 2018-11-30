import React, { Component } from 'react'
import { Provider } from 'react-redux'
import {
  StatusBar,
  View
} from 'react-native'
import firebase from 'react-native-firebase'
import configureStore from '../redux/store/configureStore.js'
import { Sentry } from 'react-native-sentry'
import SplashScreen from 'react-native-splash-screen'
import AppContainer from '../containers/App.js'
import AppStateListenerContainer from '../containers/AppStateListener.js'
import RizzleModalContainer from '../containers/RizzleModal.js'
import ActionExtensionScreen from './Action'
import { setBackend } from '../redux/backends'

export default class Rizzle extends Component {
  static defaultProps = {
    isActionExtension: false
  }

  constructor (props) {
    super(props)
    this.props = props

    this.state = {}
    this.store = null

    // const firebaseConfig = {
    //   apiKey: "AIzaSyDsV89U3hnA0OInti2aAlCVk_Ymi04-A-o",
    //   authDomain: "rizzle-base.firebaseapp.com",
    //   databaseURL: "https://rizzle-base.firebaseio.com",
    //   storageBucket: "rizzle-base.appspot.com",
    //   messagingSenderId: "801044191408"
    // }

    firebase.auth()
      .signInAnonymously()
      .then(credential => {
        this.store = configureStore()
        this.store.dispatch({
          type: 'USER_SET_UID',
          uid: credential.user.uid
        })
        this.setState({ credential })
      })

    Sentry.config('https://1dad862b663640649e6c46afed28a37f@sentry.io/195309').install()

    if (__DEV__) SplashScreen.hide()

    // this is a stupid hack to stop AppState firing on startup
    // which it does on the device in some circumstances
    global.isStarting = true
    setTimeout(() => {
      global.isStarting = false
    }, 5000)
  }

  render () {
    if (!this.state.credential) {
      console.log('Returning null')
      return null
    }

    const component = this.props.isActionExtension ?
      <ActionExtensionScreen /> :
      (<View style={{flex: 1}}>
        <RizzleModalContainer />
        <StatusBar
          barStyle='light-content'
          hidden={false} />
        <AppStateListenerContainer />
        <AppContainer />
      </View>)

    return (
      <Provider store={this.store}>
        { component }
      </Provider>
    )
  }
}

