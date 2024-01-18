import React, { Component, Ref } from 'react'
import { Provider } from 'react-redux'
import {
  InteractionManager,
  Linking,
  Platform,
  StatusBar,
  View
} from 'react-native'
import { Link, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { initStore, persistor } from '../store'
import * as Sentry from 'sentry-expo'
// import AppContainer from '../containers/App'
import AppStateListenerContainer from '../containers/AppStateListener'
import ConnectionListener from './ConnectionListener'
import Analytics from './Analytics'
import Splash from './Splash'
import Message from './Message'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-react-native'
import OrientationListener from './OrientationListener'
import { PersistGate } from 'redux-persist/integration/react'
import HelpTipProvider from './HelpTipProvider'
import { supabase } from '../storage/supabase'
import { AuthProvider } from './AuthProvider'
import { initSQLite } from '../storage/sqlite'
import Config from 'react-native-config'
import RizzleModal from './RizzleModal'
import { ModalProvider } from './ModalProvider'
import { hslString } from '../utils/colors'
import App from './App'
import MigrationsProvider from './MigrationProvider'

export interface Props {
  isActionExtension?: boolean
}

export interface State {}

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
// const routingInstrumentation = Platform.OS !== 'web' ? new Sentry.ReactNavigationInstrumentation() : null

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
    store = initStore()

    if (Platform.OS !== 'web') {
      initSQLite()
      Sentry.init({
        dsn: Config.SENTRY_DSN,
        enableAutoSessionTracking: true,
        debug: __DEV__
      })
    }

    // this is a stupid hack to stop AppState firing on startup
    // which it does on the device in some circumstances
    global.isStarting = true
    setTimeout(() => {
      global.isStarting = false
    }, 5000)
  }

  async componentDidMount () {
    if (Platform.OS !== 'web') {
      InteractionManager.setDeadline(100)
      await tf.ready()
      console.log('Tensor Flow is ready')    
    }
  }

  render () {
    const PersistGateWrapper = ({children}: {children: any}) => {
      if (Platform.OS === 'web') {
        return children
      } else {
        return (
          <PersistGate
            loading={<View />}
            onBeforeLift={() => {}}
            persistor={persistor}>            
            {children}
          </PersistGate>
        )
      }
    }

    return (
      <NavigationContainer        
        ref={this.navigation}
        onReady={() => {
          if (Platform.OS !== 'web') {
            // routingInstrumentation?.registerNavigationContainer(this.navigation);
           }
        }}
        theme={{
          colors: {
            background: hslString('rizzleBG'),
          }
        }}
      >
        <Provider store={store}>
          <PersistGateWrapper>
            <AuthProvider>
              <View style={{
                flex: 1,
                backgroundColor: 'black'/*hslString('rizzleBG')*/}}>
                <StatusBar
                  barStyle='light-content'
                  hidden={false} />
                <ConnectionListener />
                { Platform.OS === 'web' || <OrientationListener /> }
                { Platform.OS === 'web' || <Analytics /> } 
                <MigrationsProvider>
                  <AppStateListenerContainer>
                    <ModalProvider>
                      <App />
                      <Message />
                      <RizzleModal />
                    </ModalProvider>
                    <HelpTipProvider />
                  </AppStateListenerContainer>
                </MigrationsProvider>
                <Splash />
              </View>
            </AuthProvider>
          </PersistGateWrapper>
        </Provider>
      </NavigationContainer>
    )
  }
}
