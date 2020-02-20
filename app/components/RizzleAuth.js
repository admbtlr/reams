import React, { Fragment } from 'react'
import { Button, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native'
import GoogleAuth from '../containers/GoogleAuth'
import { authenticate } from '../redux/backends'
import { sendEmailLink } from '../redux/backends/rizzle'
import { hslString } from '../utils/colors'
import {
  textInputStyle,
  textLabelStyle,
  textButtonStyle,
  textInfoStyle,
  textInfoBoldStyle
} from '../utils/styles'

class RizzleAuth extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
  }

  render = () => {
    const {
      errors,
      handleChange,
      handleLogout,
      handleReset,
      handleSubmit,
      isSubmitting,
      isValid,
      submitCount,
      user,
      values
    } = this.props
    const isAuthenticated = this.props.backend === 'rizzle' && !!(user && user.email)
    return isAuthenticated ?
      <View style={{
        marginTop: 40
      }}>
        <Text style={textInfoStyle('white')}>
          <Text style={textInfoBoldStyle('white')}>Name:</Text> {user.displayName}</Text>
        <Text style={textInfoStyle('white')}>
          <Text style={textInfoBoldStyle('white')}>Email:</Text> {user.email}</Text>
        <Text style={{
          ...textInfoStyle('white'),
          fontSize: 12,
          lineHeight: 18
        }}>
          <Text style={{
            ...textInfoBoldStyle('white'),
            fontSize: 12
          }}>UserId:</Text> {user.uid}</Text>
        <GoogleAuth isLoggedIn={true}/>
      </View> :
      <View>
        { submitCount > 0 ?
          <Fragment>
            <Text style={{
              ...textInfoStyle(),
              marginTop: 40
            }}>Check your inbox and follow the link in the email we just sent you.</Text>
            <TouchableOpacity
              onPress={handleReset}
              style={{
                opacity: 0.8,
                marginLeft: 20,
                position: 'relative',
                top: 16
              }}
            >
              <Text style={{
                ...textButtonStyle(),
                marginTop: 24,
                marginBottom: 24
              }}>Didn't get an email?</Text>
            </TouchableOpacity>
          </Fragment>
          :
          <Fragment>
            <Text style={{
              ...textInfoStyle(),
              marginTop: 40
            }}>Passwordless login - enter your email and we'll send you a magic link:</Text>
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
                  autoCapitalize='none'
                  autoCompleteType='email'
                  keyboardType='email-address'
                  onChangeText={handleChange('email')}
                  style={textInputStyle()}
                  textContentType='emailAddress'
                  value={values.email}
                />
                { errors.email ?
                  <Text style={textLabelStyle()}>{errors.email}</Text> :
                  <Text style={textLabelStyle()}>Your email address</Text>
                }
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
                <Text style={textButtonStyle()}>Go</Text>
              </TouchableOpacity>
            </View>
          </Fragment>
        }
        <View style={{
          backgroundColor: '#cfcfcf',
          height: 1,
          marginBottom: 35,
          marginLeft: 20,
          marginRight: 20,
          marginTop: 40
        }}/>
        <Text style={{
          ...textInfoStyle(),
          marginBottom: 20,
          marginTop: 0
        }}>Or you can sign in with an existing account:</Text>
        <GoogleAuth/>
      </View>

  }
}

export default RizzleAuth