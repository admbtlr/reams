import { Formik } from 'formik'
import * as Yup from 'yup'
import React from 'react'
import { Button, Dimensions, LayoutAnimation, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

const width = Dimensions.get('window').width
class AccountCredentialsForm extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      username: '',
      password: '',
      isSubmitting: false
    }

    this.authenticateUser = this.authenticateUser.bind(this)
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
      if (response.status === 'success') {
        if (service === 'feedwrangler') {
          setBackend('feedwrangler', {
            accessToken: response.token
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
    const { isActive, isExpanded, service, setBackend, unsetBackend, user } = this.props
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

    const reamsText = (isWhite) => <Text 
      style={{
        ...textInfoStyle(isWhite ? 'white' : 'black'),
        marginBottom: width * 0.05
      }}><Text style={textInfoBoldStyle(isWhite ? 'white' : 'black')}>Reams Basic</Text> is free, but it doesn’t sync with other devices or apps.</Text>
      
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
                paddingTop: 16 * fontSizeMultiplier(),
                paddingLeft: 16 * fontSizeMultiplier(),
                paddingRight: 16 * fontSizeMultiplier(),
                paddingBottom: 16 * fontSizeMultiplier(),
                marginTop: 16 * fontSizeMultiplier(),
                flex: 0,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                { service === 'basic' ?
                  <View style={{
                    marginLeft: -24 * fontSizeMultiplier(),
                    marginRight: -24 * fontSizeMultiplier()
                  }}>
                    { !!isActive && reamsText(true) }
                  </View> :
                  <React.Fragment>
                    { service !== 'feedwrangler' &&
                      <Text style={textInfoStyle('white')}>
                        <Text style={textInfoBoldStyle('white')}>Username: </Text>{user.username || user.email}
                      </Text>
                    }
                    <TouchableOpacity
                      accessibilityLabel={`Stop using ${serviceDisplay}`}
                      color={hslString('white')}
                      onPress={() => setBackend('basic')}
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
                  </React.Fragment>
                }
              </View> :
              ( service === 'basic' ?
                <View style={{ marginTop: 20, marginBottom: 20 }}>
                  { reamsText(false) }
                  <TouchableOpacity
                      accessibilityLabel={'Use Reams Basic'}
                      color={hslString('white')}
                      onPress={ () => {
                        LayoutAnimation.configureNext({ 
                          duration: 500, 
                          create: { type: 'linear', property: 'opacity' }, 
                          update: { type: 'spring', springDamping: 0.4 }, 
                          delete: { duration: 100, type: 'linear', property: 'opacity' } 
                        })
                        setBackend('basic')
                        // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
                        this.setState({
                          isAuthenticated: true
                        })
                      }}
                      style={{
                        alignSelf: 'center',
                        marginTop: 5,
                        marginBottom: 5
                      }}
                    >
                      <Text style={{
                        ...textInfoStyle('logo1'),
                        textDecorationLine: 'underline'
                      }}>Use Reams Basic</Text>
                    </TouchableOpacity>
                </View> :
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