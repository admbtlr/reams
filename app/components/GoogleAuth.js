import React from 'react'
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { GoogleSignin } from '@react-native-community/google-signin'
import auth from '@react-native-firebase/auth'
import { textButtonStyle } from '../utils/styles'

class GoogleAuth extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.onLoginOrRegister = this.onLoginOrRegister.bind(this)
    this.onLogout = this.onLogout.bind(this)
  }

  // https://medium.com/@chrisbianca/getting-started-with-firebase-authentication-on-react-native-a1ed3d2d6d91
  onLoginOrRegister () {
    GoogleSignin.signIn()
      .then((data) => {
        // Create a new Firebase credential with the token
        const credential = auth.GoogleAuthProvider.credential(data.idToken, data.accessToken)
        // Login with the credential
        return auth().signInWithCredential(credential)
      })
      .then((details) => {
        // If you need to do anything with the user, do it here
        // The user will be logged in automatically by the
        // `onAuthStateChanged` listener we set up in App.js earlier
        console.log(details.user._user)
        this.props.setBackend('rizzle', {
          uid: details.user.uid,
          email: details.user.email
        })
      })
      .catch((error) => {
        const { code, message } = error
        // For details of error codes, see the docs
        // The message contains the default Firebase string
        // representation of the error
        console.log(message)
      })
  }

  onLogout () {
    console.log('Log out!')
    GoogleSignin.signOut()
      .then(() => auth().signOut())
      .then(() => this.props.setBackend())
      .catch(err => {
        console.log(err)
      })
  }

  render () {
    return this.props.isLoggedIn ? (
      <View style={{
        marginTop: 20,
        marginBottom: 20,
      }}>
        <TouchableOpacity
          onPress={this.onLogout}
          style={{
            alignSelf: 'center'
          }}
        >
          <Text style={textButtonStyle()}>Log out</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View>
        <TouchableOpacity
          onPress={this.onLoginOrRegister}
          style={{
            marginBottom: 40,
            marginLeft: 20,
            marginRight: 20
          }}>
          <View style={{
            flexDirection: 'row'
          }}>
            <Image
              source={require('../img/google-logo.png')}
              width={24}
              height={24}
              style={{
                width: 24,
                height: 24,
                marginRight: 12
              }}
            />
            <Text style={{
              ...textButtonStyle(),
              color: '#B61C2D'
            }}>Sign in with Google</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

export default GoogleAuth
