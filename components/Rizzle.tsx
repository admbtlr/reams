import React, { Ref, useEffect } from 'react'
import { Provider } from 'react-redux'
import {
  InteractionManager,
  Platform,
  StatusBar,
  View
} from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { Link, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { initStore, persistor } from '../store'
import * as Sentry from '@sentry/react-native'
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
import { AuthProvider } from './AuthProvider'
import { initSQLite } from '../storage/sqlite'
import RizzleModal from './RizzleModal'
import { ModalProvider } from './ModalProvider'
import { hslString } from '../utils/colors'
import App from './App'
import MigrationsProvider from './MigrationProvider'
import log from '../utils/log'
import { DebugProvider } from './DebugContext'

export interface Props {
  isActionExtension?: boolean
}

export interface State { }

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
// const routingInstrumentation = Platform.OS !== 'web' ? new Sentry.ReactNavigationInstrumentation() : null

let store: object | undefined = initStore()

// this is a stupid hack to stop AppState firing on startup
// which it does on the device in some circumstances
global.isStarting = true
setTimeout(() => {
  global.isStarting = false
}, 5000)

// Prevent native splash screen from autohiding before App component declaration
SplashScreen.preventAutoHideAsync()
  .then((result) => console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`))
  .catch(console.warn); // it's good to explicitly catch and inspect any error

const Rizzle = () => {
  let navigation: Ref<NavigationContainerRef>
  useEffect(() => {
    navigation = React.createRef()
    if (Platform.OS !== 'web') {
      const initTensorFlow = async () => {
        try {
          await tf.ready()
          console.log('Tensor Flow is ready')
        } catch (error: any) {
          log('Error loading Tensor Flow', error)
        }
      }
      initSQLite()
      Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        debug: __DEV__
      })
      initTensorFlow()
      InteractionManager.setDeadline(100)
    }
  }, [])

  const PersistGateWrapper = ({ children }: { children: any }) => {
    if (Platform.OS === 'web') {
      return children
    } else {
      return (
        <PersistGate
          loading={<View />}
          onBeforeLift={() => { }}
          persistor={persistor}>
          {children}
        </PersistGate>
      )
    }
  }

  return (
    <NavigationContainer
      ref={navigation}
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
          <DebugProvider>
            <AuthProvider>
              <View style={{
                flex: 1,
                backgroundColor: 'black',
                overflow: 'hidden'
              }}>
                {Platform.OS === 'ios' &&
                  <StatusBar
                    barStyle='light-content'
                    hidden={false} />}
                <ConnectionListener />
                {Platform.OS === 'web' || <OrientationListener />}
                <Analytics />
                <MigrationsProvider>
                  <ModalProvider>
                    <AppStateListenerContainer>
                      <App />
                      <Message />
                      <RizzleModal />
                    </AppStateListenerContainer>
                  </ModalProvider>
                  <HelpTipProvider />
                </MigrationsProvider>
                <Splash />
              </View>
            </AuthProvider>
          </DebugProvider>
        </PersistGateWrapper>
      </Provider>
    </NavigationContainer>
  )

}

export default Sentry.wrap(Rizzle)

// class RizzleOld extends Component<Props, State> {
//   navigation: Ref<NavigationContainerRef> = React.createRef()

//   static defaultProps = {
//     isActionExtension: false
//   }

//   constructor (props: Props) {
//     super(props)

//     this.state = {}
//     store = undefined

//     // is there any special reason why the store was only configured after an anonymous login?
//     store = initStore()

//     if (Platform.OS !== 'web') {
//       const initTensorFlow = async () => {
//         try {
//           await tf.ready()
//           console.log('Tensor Flow is ready')
//         } catch (error: any) {
//           log('Error loading Tensor Flow', error)
//         }
//       }
//       initSQLite()
//       InteractionManager.setDeadline(100)
//       Sentry.init({
//         dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
//         debug: __DEV__
//       })
//       initTensorFlow()
//       InteractionManager.setDeadline(100)
//     }

//     // this is a stupid hack to stop AppState firing on startup
//     // which it does on the device in some circumstances
//     global.isStarting = true
//     setTimeout(() => {
//       global.isStarting = false
//     }, 5000)
//   }

//   async componentDidMount () {
//     if (Platform.OS !== 'web') {
//       InteractionManager.setDeadline(100)
//       try {
//         await tf.ready()
//         console.log('Tensor Flow is ready')
//       } catch (error: any) {
//         log('Error loading Tensor Flow', error)
//       }
//     }
//   }

//   render () {
//     const PersistGateWrapper = ({children}: {children: any}) => {
//       if (Platform.OS === 'web') {
//         return children
//       } else {
//         return (
//           <PersistGate
//             loading={<View />}
//             onBeforeLift={() => {}}
//             persistor={persistor}>
//             {children}
//           </PersistGate>
//         )
//       }
//     }

//     return (
//       <NavigationContainer
//         ref={this.navigation}
//         onReady={() => {
//           if (Platform.OS !== 'web') {
//             // routingInstrumentation?.registerNavigationContainer(this.navigation);
//            }
//         }}
//         theme={{
//           colors: {
//             background: hslString('rizzleBG'),
//           }
//         }}
//       >
//         <Provider store={store}>
//           <PersistGateWrapper>
//             <AuthProvider>
//               <View style={{
//                 flex: 1,
//                 backgroundColor: 'black'/*hslString('rizzleBG')*/}}>
//                 <StatusBar
//                   barStyle='light-content'
//                   hidden={false} />
//                 <ConnectionListener />
//                 { Platform.OS === 'web' || <OrientationListener /> }
//                 { Platform.OS === 'web' || <Analytics /> }
//                 <MigrationsProvider>
//                   <ModalProvider>
//                     <AppStateListenerContainer>
//                       <App />
//                       <Message />
//                       <RizzleModal />
//                     </AppStateListenerContainer>
//                   </ModalProvider>
//                   <HelpTipProvider />
//                 </MigrationsProvider>
//                 <Splash />
//               </View>
//             </AuthProvider>
//           </PersistGateWrapper>
//         </Provider>
//       </NavigationContainer>
//     )
//   }
// }
