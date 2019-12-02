import React, { Component } from 'react'
import { Provider } from 'react-redux'
import {
  Linking,
  StatusBar,
  View
} from 'react-native'
import DeepLinking from 'react-native-deep-linking'
import firebase from '@react-native-firebase/app'
import auth from '@react-native-firebase/auth'
import { configureStore } from '../redux/store'
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import * as Sentry from '@sentry/react-native'
import SplashScreen from 'react-native-splash-screen'
import { NavigationEvents } from 'react-navigation'
import { GoogleSignin } from '@react-native-community/google-signin'
import AppContainer from '../containers/App.js'
import AppStateListenerContainer from '../containers/AppStateListener.js'
import ConnectionListenerContainer from '../containers/ConnectionListener.js'
import RizzleModalContainer from '../containers/RizzleModal.js'
import Splash from './Splash'
import ActionExtensionScreen from './Action'
import { setBackend } from '../redux/backends'
import { hslString } from '../utils/colors'

export default class Rizzle extends Component {
  static defaultProps = {
    isActionExtension: false
  }

  constructor (props) {
    super(props)
    this.props = props

    this.state = {}
    this.store = null

    this.handleUrl = this.handleUrl.bind(this)

    // const firebaseConfig = {
    //   apiKey: "AIzaSyDsV89U3hnA0OInti2aAlCVk_Ymi04-A-o",
    //   authDomain: "rizzle-base.firebaseapp.com",
    //   databaseURL: "https://rizzle-base.firebaseio.com",
    //   storageBucket: "rizzle-base.appspot.com",
    //   messagingSenderId: "801044191408"
    // }

    const reactReduxFirebaseConfig = {
      userProfile: 'users', // firebase root where user profiles are stored
      // enableLogging: false, // enable/disable Firebase's database logging
      enableRedirectHandling: false // https://github.com/invertase/react-native-firebase/issues/431
    }

    // is there any special reason why the store was only configured after an anonymous login?
    this.store = configureStore()

    // firebase.auth()
    //   .signInAnonymously()
    //   .then(credential => {
    //     this.store = configureStore()
    //     this.store.dispatch({
    //       type: 'USER_SET_UID',
    //       uid: credential.user.uid
    //     })
    //     this.setState({ credential })
    //   })

    Sentry.init({
      dsn: 'https://1dad862b663640649e6c46afed28a37f@sentry.io/195309'
    })

    // if (__DEV__) SplashScreen.hide()

    // this is a stupid hack to stop AppState firing on startup
    // which it does on the device in some circumstances
    global.isStarting = true
    setTimeout(() => {
      global.isStarting = false
    }, 5000)

    console.disableYellowBox = true
  }

  // https://www.ekreative.com/universal-linking-in-react-native-for-ios/
  componentDidMount () {
    // set up deep linking
    this.addRoutesToDeepLinking()
    Linking.addEventListener('url', this.handleUrl)

    // listen for auth changes
    this.authSubscription = auth().onAuthStateChanged((details) => {
      this.store.dispatch({
        type: 'USER_SET_DETAILS',
        details
      })
      this.setState({ details })
      console.log('Authenticated! ' + details)
    })

    // https://github.com/react-native-community/react-native-google-signin
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
      webClientId: '801044191408-utktg7miqrgg8ii16rl0i63ul0oogmu8.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
      forceConsentPrompt: true, // [Android] if you want to show the authorization prompt at each login.
      accountName: '', // [Android] specifies an account name on the device that should be used
      // iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    })
  }

  handleUrl ({ url }) {
    console.log('Handle URL: ' + url)
    const that = this
    auth().signInWithEmailLink('a@btlr.eu', url)
      .then(res => {
        that.store.dispatch({
          type: 'CONFIG_SET_BACKEND',
          backend: 'rizzle'
        })

      })
      .catch(err => {
        console.log('Error logging in')
        that.store.dispatch({
          type: 'UI_SHOW_MODAL',
          modalProps: {
            modalText: [
              {
                text: 'Couldn’t sign in :(',
                style: ['title']
              },
              {
                text: err.message,
                style: ['text']
              }
            ],
            modalHideCancel: true,
            modalOnOk: () => {},
            modalShow: true
          }
        })
      })
    // Linking.canOpenURL(url).then((supported) => {
    //   if (supported) {
    //     DeepLinking.evaluateUrl(url)
    //   }
    // })
  }

  addRoutesToDeepLinking () {
    DeepLinking.addScheme('https://')
    DeepLinking.addRoute('/app.rizzle.net/sign-in', (response) => {
      navigate('Account')
    })
  }

  componentWillUnmount () {
    Linking.removeEventListener('url', this.handleUrl)
    this.authSubscription()
  }

  render () {
    const rrfConfig = {
      userProfile: 'users', // firebase root where user profiles are stored
      useFirestoreForProfile: true,
      // enableLogging: false, // enable/disable Firebase's database logging
      enableRedirectHandling: false // https://github.com/invertase/react-native-firebase/issues/431
    }

    // https://github.com/prescottprue/redux-firestore/issues/240
    // this needs changing once these issues are fixed
    const rrfProps = {
      firebase: firebase.app(),
      config: rrfConfig,
      dispatch: this.store.dispatch
    }

    const component = this.props.isActionExtension ?
      <ActionExtensionScreen /> :
      (<View style={{
        flex: 1,
        backgroundColor: hslString('rizzleBG')}}>
        <RizzleModalContainer />
        <StatusBar
          barStyle='light-content'
          hidden={false} />
        <AppStateListenerContainer />
        <ConnectionListenerContainer />
        <AppContainer />
        <Splash />
      </View>)

    console.log(rrfProps)

    return (
      <Provider store={this.store}>
        <ReactReduxFirebaseProvider {...rrfProps}>
          { component }
        </ReactReduxFirebaseProvider>
      </Provider>
    )
  }
}

