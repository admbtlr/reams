import React, { Component, Ref } from 'react'
import { Provider } from 'react-redux'
import {
  InteractionManager,
  StatusBar,
  View
} from 'react-native'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { configureStore } from '../store'
import * as Sentry from '@sentry/react-native'
import AppContainer from '../containers/App'
import AppStateListenerContainer from '../containers/AppStateListener'
import ConnectionListenerContainer from '../containers/ConnectionListener'
import RizzleModalContainer from '../containers/RizzleModal'
import Splash from './Splash'
import Message from './Message'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-react-native'

export interface Props {
  isActionExtension?: boolean
}

export interface State {}

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationV5Instrumentation()

export default class Rizzle extends Component<Props, State> {
  store?: object
  navigation: Ref<NavigationContainerRef> = React.createRef()

  static defaultProps = {
    isActionExtension: false
  }

  constructor (props: Props) {
    super(props)

    this.state = {}
    this.store = undefined

    // is there any special reason why the store was only configured after an anonymous login?
    this.store = configureStore()

    Sentry.init({
      dsn: 'https://1dad862b663640649e6c46afed28a37f@sentry.io/195309',
      enableAutoSessionTracking: true
    })

    // this is a stupid hack to stop AppState firing on startup
    // which it does on the device in some circumstances
    global.isStarting = true
    setTimeout(() => {
      global.isStarting = false
    }, 5000)
  }

  // https://www.ekreative.com/universal-linking-in-react-native-for-ios/
  async componentDidMount () {
    // set up deep linking
    InteractionManager.setDeadline(100)

    await tf.ready()
    console.log('Tensor Flow is ready')
    
  }

  render () {
    return (
      <NavigationContainer        
        ref={this.navigation}
        onReady={() => {
          // Register the navigation container with the instrumentation inside onReady
          routingInstrumentation.registerNavigationContainer(this.navigation);
        }}
      >
        <Provider store={this.store}>
          <View style={{
            flex: 1,
            backgroundColor: 'black'/*hslString('rizzleBG')*/}}>
            <StatusBar
              barStyle='light-content'
              hidden={false} />
            <AppStateListenerContainer />
            <ConnectionListenerContainer />
            <AppContainer />
            <Message />
            <RizzleModalContainer />
            <Splash />
          </View>
        </Provider>
      </NavigationContainer>
    )
  }
}
