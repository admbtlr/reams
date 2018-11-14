import React, { Component } from 'react'
import { Provider } from 'react-redux'
import {
  StatusBar,
  View
} from 'react-native'
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

    this.store = configureStore()

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

