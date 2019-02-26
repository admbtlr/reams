import React from 'react'
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { GoogleSignin } from 'react-native-google-signin'
import firebase from 'react-native-firebase'

// https://medium.com/@chrisbianca/getting-started-with-firebase-authentication-on-react-native-a1ed3d2d6d91
const onLoginOrRegister = () => {
  GoogleSignin.signIn()
    .then((data) => {
      // Create a new Firebase credential with the token
      const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken)
      // Login with the credential
      return firebase.auth().signInWithCredential(credential)
    })
    .then((user) => {
      // If you need to do anything with the user, do it here
      // The user will be logged in automatically by the
      // `onAuthStateChanged` listener we set up in App.js earlier
    })
    .catch((error) => {
      const { code, message } = error
      // For details of error codes, see the docs
      // The message contains the default Firebase string
      // representation of the error
      console.log(message)
    })
}

export default GoogleAuth = () =>
  <View>
    <TouchableOpacity
      onPress={onLoginOrRegister}
      style={{
        backgroundColor: 'red',
        color: 'white'
      }}>
      <Text>Log in with Google</Text>
    </TouchableOpacity>
  </View>
