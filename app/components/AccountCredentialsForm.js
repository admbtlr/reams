import { Formik } from 'formik'
import * as Yup from 'yup'
import React from 'react'
import { Button, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native'
import OnePassword from 'react-native-onepassword'
import AnimatedEllipsis from 'react-native-animated-ellipsis'

import RizzleAuth from './RizzleAuth'
import { sendEmailLink } from '../backends/rizzle'
import { authenticate } from '../backends'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier } from '../utils'
import {
  textInputStyle,
  textLabelStyle,
  textButtonStyle,
  textInfoStyle,
  textInfoBoldStyle,
  textInfoItalicStyle
} from '../utils/styles'

const services = {
  feedbin: 'https://feedbin.com',
  feedwrangler: 'https://feedwrangler.net',
  feedly: 'https://feedly.com'
}

const baseStyles = {
  fontFamily: 'IBMPlexMono',
  textAlign: 'left',
  color: hslString('rizzleText')
}

export const formElementStyles = {
  textInfoStyle: {
    ...baseStyles,
    fontFamily: 'IBMPlexSans',
    marginLeft: 20 * fontSizeMultiplier(),
    marginRight: 20 * fontSizeMultiplier(),
    marginTop: 40 * fontSizeMultiplier(),
    fontSize: 18 * fontSizeMultiplier()
  }
}

class AccountCredentialsForm extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      is1Password: true,
      username: '',
      password: '',
      isSubmitting: false
    }

    this.onePasswordHandler = this.onePasswordHandler.bind(this)
    this.authenticateUser = this.authenticateUser.bind(this)
  }

  async componentDidMount () {
    try {
      const is1Password = await OnePassword.isSupported()
      this.setState({
        ...this.state,
        is1Password
      })
    } catch (e) {
      console.log('OnePassword not installed on this device.')
      // this.setState({
      //   ...this.state,
      //   is1Password: false
      // })
    }
  }

  async onePasswordHandler (service) {
    const url = services[service]
    try {
      const url = services[service]
      const creds = await OnePassword.findLogin(url)
      const { username, password } = creds
      this.setState({
        ...this.state,
        username,
        password
      })
      console.log(`Found user ${username} with a ${password.length} character password`)
    } catch (e) {
      console.warn('User did not choose a login in the OnePassword prompt.')
    }
  }

  async authenticateUser ({username, password, email}, {setSubmitting, setErrors}) {
    const { service, setBackend } = this.props
    if (service === 'rizzle') {
      email = email.trim()
      this.props.setSignInEmail(email)
      await sendEmailLink(email)
      console.log(`email: ${email}`)
    } else {
      const response = await authenticate({username, password}, service)
      console.log(response)
      if (response === 'success') {
        if (service === 'feedwrangler') {
          setBackend('feedwrangler', {
            accessToken: response
          })
        } else if (service === 'feedbin') {
          setBackend('feedbin', {
            username,
            password
          })
        }
        setSubmitting(false)
        this.setState({
          isAuthenticated: true
        })
      } else {
        setErrors({
          submit: 'Error: please check username and password'
        })
        setSubmitting(false)
        this.setState({
          isAuthenticated: false
        })
      }
    }
  }

  render = () => {
    const { isActive, service, unsetBackend, user } = this.props
    const serviceDisplay = service === 'basic' ?
      'Rizzle Basic' :
      service[0].toUpperCase() + service.slice(1)
    const initialValues = this.props.service === 'rizzle' ?
      {
        email: this.state.email
      } :
      {
        username: this.state.username,
        password: this.state.password
      }
    const validationSchemaShape = service === 'rizzle' ?
      Yup.object().shape({
        email: Yup.string().trim().email('That doesn’t look like a valid email...').required('Required')
      }) :
      Yup.object().shape({
        username: Yup.string().required('Required'),
        password: Yup.string().required('Required')
      })
    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        isInitialValid={this.state.email || this.state.username}
        onSubmit={this.authenticateUser}
        validationSchema={validationSchemaShape}
        render={({
          errors,
          handleChange,
          handleReset,
          handleSubmit,
          isSubmitting,
          isValid,
          submitCount,
          values
        }) => (
          <View style={{
            flex: 0
          }}>
            { isActive ?
              <View style={{
                // backgroundColor: hslString('logo1'),
                paddingTop: 16,
                paddingLeft: 16,
                paddingRight: 16,
                paddingBottom: 16,
                marginTop: 16,
                flex: 0,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Text
                  style={{
                    ...textInfoItalicStyle('white'),
                    marginTop: 0,
                    textAlign: 'center'
                  }}>You are using {serviceDisplay}.</Text>
                { service === 'basic' ||
                  <Text style={textInfoStyle('white')}>
                    <Text style={textInfoBoldStyle('white')}>Username: </Text>{user.username || user.email}
                  </Text>
                }        
                <TouchableOpacity
                  accessibilityLabel={`Stop using ${serviceDisplay}`}
                  color={hslString('white')}
                  onPress={unsetBackend}
                  style={{
                    marginTop: 16
                  }}
                  testID={`${service}-logout-button`}
                >
                  <Text style={{
                    ...textInfoStyle('white'),
                    textDecorationLine: 'underline'
                  }}>Stop using {serviceDisplay}</Text>
                </TouchableOpacity>
              </View> :
              ( service === 'rizzle' ?
                <RizzleAuth
                  backend={this.props.backend}
                  errors={errors}
                  handleChange={handleChange}
                  handleReset={handleReset}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isValid={isValid}
                  submitCount={submitCount}
                  values={values}
                  user={user}
                /> :
                <View style={{
                  paddingTop: 16,
                  paddingLeft: 16,
                  paddingRight: 16,
                  marginTop: 16,
                  marginBottom: 16
                }}>
                  <TextInput
                    autoCapitalize='none'
                    keyboardType='email-address'
                    onChangeText={handleChange('username')}
                    style={textInputStyle()}
                    testID={`${service}-username-text-input`}
                    value={values.username}
                  />
                  <Text style={textLabelStyle()}>User name</Text>
                  <View style={{
                    position: 'relative',
                    height: 48
                  }}>
                    <TextInput
                      onChangeText={handleChange('password')}
                      secureTextEntry={true}
                      style={{
                        ...textInputStyle(),
                        marginTop: 24
                      }}
                      testID={`${service}-password-text-input`}
                      value={values.password}
                    />
                    { this.state.is1Password &&
                      <View style={{
                        position: 'absolute',
                        top: 16,
                        right: 0
                      }}>
                        <Button
                          title='1P'
                          onPress={() => this.onePasswordHandler(this.props.service)} />
                      </View>
                    }
                  </View>
                  <Text style={textLabelStyle()}>Password</Text>
                  { isSubmitting ?
                    <Text style={{
                      ...textLabelStyle(),
                      marginTop: 6,
                      textAlign: 'center'
                    }}>Submitting...</Text> :
                    <TouchableOpacity
                      accessibilityLabel={`Authenticate with ${service[0].toUpperCase() + service.slice(1)}`}
                      color={hslString('white')}
                      disabled={isSubmitting || !isValid}
                      onPress={handleSubmit}
                      style={{
                        alignSelf: 'center',
                        marginTop: 5,
                        marginBottom: 5
                      }}
                      testID={`${service}-submit-button`}
                    >
                      <Text style={{
                        ...textInfoStyle('logo1'),
                        textDecorationLine: 'underline'
                      }}>Submit</Text>
                    </TouchableOpacity>
                  }
                  { errors.submit &&
                    <View style={{
                      backgroundColor: hslString('logo2'),
                      padding: 5,
                      marginLeft: -16,
                      marginRight: -16
                    }}>
                      <Text style={{
                        ...textLabelStyle(),
                        color: hslString('white'),
                        textAlign: 'center'
                      }}>{ errors.submit }</Text>
                    </View>
                  }
                </View>
              )
            }
          </View>
        )}
      />
    )
  }
}

export default AccountCredentialsForm