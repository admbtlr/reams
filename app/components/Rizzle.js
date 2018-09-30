import React, { Component } from 'react'
import { Provider } from 'react-redux'
import configureStore from '../redux/store/configureStore.js'
import { Sentry } from 'react-native-sentry'
import SplashScreen from 'react-native-splash-screen'
import AppContainer from '../containers/App.js'
import ActionExtensionScreen from './Action'
import { setBackend } from '../redux/backends'

export default class Rizzle extends Component {
  static defaultProps = {
    isActionExtension: false
  }

  constructor (props) {
    super(props)
    this.props = props

    setBackend('rizzle')

    this.store = configureStore()

    Sentry
      .config('https://1dad862b663640649e6c46afed28a37f:08138824595d4469b62aaba4c01c71f4@sentry.io/195309')
      .install()

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
      <AppContainer />

    return (
      <Provider store={this.store}>
        { component }
      </Provider>
    )
  }
}

