import React from 'react'
import { Button, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native'
import GoogleAuth from '../containers/GoogleAuth'
import { authenticate } from '../redux/backends'
import { sendEmailLink } from '../redux/backends/rizzle'
import { hslString } from '../utils/colors'

const baseStyles = {
  fontFamily: 'IBMPlexMono',
  textAlign: 'left',
  color: hslString('rizzleText')
}

const styles = {
  textInputStyle: {
    ...baseStyles,
    // padding: 8,
    fontSize: 20,
    borderBottomColor: hslString('rizzleText'),
    borderBottomWidth: 1
  },
  textValueStyle: {
    ...baseStyles,
    fontSize: 12
  },
  textLabelStyle: {
    ...baseStyles,
    fontSize: 12,
    marginTop: 3
  },
  textButtonStyle: {
    ...baseStyles,
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  textInfoStyle: {
    ...baseStyles,
    fontFamily: 'IBMPlexSans',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 40,
    fontSize: 18
  },
  textInfoMonoStyle: {
    ...baseStyles,
    fontFamily: 'IBMPlexMono',
    marginLeft: 20,
    marginRight: 20,
    lineHeight: 24,
    fontSize: 16
  }
}

class RizzleAuth extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render = () => {
    const {
      handleChange,
      handleLogout,
      handleSubmit,
      isSubmitting,
      isValid,
      user,
      values
    } = this.props
    const isAuthenticated = !!(user && user.email)
    return isAuthenticated ?
      <View style={{
        marginTop: 40
      }}>
        <Text style={styles.textInfoMonoStyle}>{user.displayName}</Text>
        <Text style={styles.textInfoMonoStyle}>{user.email}</Text>
        <Text style={styles.textInfoMonoStyle}>{user.uid}</Text>
        <GoogleAuth isLoggedIn={true}/>
      </View> :
      <View>
        <Text style={styles.textInfoStyle}>Passwordless login - enter your email and we'll send you a magic link:</Text>
        <View style={{
          // flex: 1,
          flexDirection: 'row',
          marginLeft: 20,
          marginRight: 20,
          marginTop: 40
        }}>
          <View style={{
            flexGrow: 1
          }}>
            <TextInput
              onChangeText={handleChange('email')}
              style={styles.textInputStyle}
              value={values.email}
            />
            <Text style={styles.textLabelStyle}>Your email address</Text>
          </View>
          <TouchableOpacity
            disabled={isSubmitting || !isValid}
            onPress={handleSubmit}
            style={{
              marginLeft: 20,
              position: 'relative',
              top: 8,
              width: 24
            }}
          >
            <Text style={styles.textButtonStyle}>Go</Text>
          </TouchableOpacity>
        </View>
        <View style={{
          backgroundColor: '#cfcfcf',
          height: 1,
          marginBottom: 35,
          marginLeft: 20,
          marginRight: 20,
          marginTop: 40
        }}/>
        <Text style={{
          ...styles.textInfoStyle,
          marginBottom: 20,
          marginTop: 0
        }}>Or you can sign in with an existing account:</Text>
        <GoogleAuth/>
      </View>

  }
}

export default RizzleAuth