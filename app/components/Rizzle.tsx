import React, { Component, Ref } from 'react'
import { Provider } from 'react-redux'
import {
  InteractionManager,
  Linking,
  StatusBar,
  View
} from 'react-native'
import { Link, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { configureStore, doBackgroundFetch, persistor } from '../store'
import * as Sentry from '@sentry/react-native'
import AppContainer from '../containers/App'
import AppStateListenerContainer from '../containers/AppStateListener'
import ConnectionListener from './ConnectionListener'
import RizzleModalContainer from '../containers/RizzleModal'
import Analytics from './Analytics'
import Splash from './Splash'
import Message from './Message'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-react-native'
import OrientationListener from './OrientationListener'
import BackgroundFetch from "react-native-background-fetch";
import { PersistGate } from 'redux-persist/integration/react'
import HelpTipProvider from './HelpTipProvider'
import { supabase } from '../storage/supabase'
import { AuthProvider } from './AuthProvider'
import { initSQLite } from '../storage/sqlite'

export interface Props {
  isActionExtension?: boolean
}

export interface State {}

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationV5Instrumentation()

let store: object | undefined = {}

export default class Rizzle extends Component<Props, State> {
  navigation: Ref<NavigationContainerRef> = React.createRef()

  static defaultProps = {
    isActionExtension: false
  }

  constructor (props: Props) {
    super(props)

    this.state = {}
    store = undefined

    // is there any special reason why the store was only configured after an anonymous login?
    store = configureStore()

    Sentry.init({
      dsn: 'https://1dad862b663640649e6c46afed28a37f@sentry.io/195309',
      enableAutoSessionTracking: true
    })

    initSQLite()

    // this is a stupid hack to stop AppState firing on startup
    // which it does on the device in some circumstances
    global.isStarting = true
    setTimeout(() => {
      global.isStarting = false
    }, 5000)
  }

  async componentDidMount () {
    InteractionManager.setDeadline(100)
    await this.initBackgroundFetch()
    if (!global.isBackgroundFetch) {
      await tf.ready()
      console.log('Tensor Flow is ready')    
    }
  }

  async initBackgroundFetch () {
    let currentTaskId: string | undefined

    const onEvent = async (taskId: string) => {
      global.isBackgroundFetch = true
      currentTaskId = taskId
      console.log('Background Fetch event', taskId)
      console.log('Calling configure store')
      Sentry.captureMessage('Background fetch: store is ' + store === undefined ? 'undefined' : 'defined')
      // if the app isn't currently running
      if (store === undefined) {
        Sentry.captureMessage('Background fetch: configuring store')
        store = await configureStore(() => doBackgroundFetch(backgroundFetchFinished))
      } else {
        await doBackgroundFetch(backgroundFetchFinished)
      }
    }

    const backgroundFetchFinished = () => {
      console.log('Persisting store')
      persistor.persist()
      console.log('Background Fetch finished', currentTaskId)
      BackgroundFetch.finish(currentTaskId)
      currentTaskId = undefined
      global.isBackgroundFetch = false
    }

    const onTimeout = async (taskId: string) => {
      console.warn('Background Fetch timeout', taskId)
      Sentry.captureMessage('Background Fetch timeout')
      BackgroundFetch.finish(taskId)
      currentTaskId = undefined
      global.isBackgroundFetch = false
    }

    let status = await BackgroundFetch.configure({minimumFetchInterval: 15}, onEvent, onTimeout)
    Sentry.captureMessage('[BackgroundFetch] configure status: ' + status)
    console.log('[BackgroundFetch] configure status: ', status)
  }

  render () {
    if (global.isBackgroundFetch) {
      return null
    }
    
    const onBeforeLift = () => {}

    const App = (
      <NavigationContainer        
        ref={this.navigation}
        onReady={() => {
          routingInstrumentation.registerNavigationContainer(this.navigation);
        }}
      >
        <Provider store={store}>
          <PersistGate
            loading={<View />}
            onBeforeLift={onBeforeLift}
            persistor={persistor}>
            <AuthProvider>
              <View style={{
                flex: 1,
                backgroundColor: 'black'/*hslString('rizzleBG')*/}}>
                <StatusBar
                  barStyle='light-content'
                  hidden={false} />
                <ConnectionListener />
                <OrientationListener />
                <Analytics />
                <AppStateListenerContainer>
                  <AppContainer />
                  <Message />
                  <RizzleModalContainer />
                  <HelpTipProvider />
                  <Splash />
                </AppStateListenerContainer>
              </View>
            </AuthProvider>
          </PersistGate>
        </Provider>
      </NavigationContainer>
    )
    return App
  }
}
