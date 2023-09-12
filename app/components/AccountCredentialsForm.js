import { Formik } from 'formik'
import * as Yup from 'yup'
import React from 'react'
import { Button, Dimensions, LayoutAnimation, Text, TextInput, TouchableOpacity, View } from 'react-native'
import AnimatedEllipsis from 'react-native-animated-ellipsis'
import EncryptedStorage from 'react-native-encrypted-storage'

import { sendEmailLink } from '../backends/reams'
import { init } from '../backends/readwise'
import { authenticate } from '../backends'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier, getMargin } from '../utils'
import {
  textInputStyle,
  textLabelStyle,
  textButtonStyle,
  textInfoStyle,
  textInfoBoldStyle,
  textInfoItalicStyle
} from '../utils/styles'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { BackgroundGradient } from './Onboarding'
import { supabase } from '../storage/supabase'

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
      token: '', // readwise only
      isSubmitting: false
    }

    this.authenticateUser = this.authenticateUser.bind(this)
  }

  async authenticateUser ({username, password, email, token}, {setSubmitting, setErrors}) {
    const { service, setBackend, unsetBackend } = this.props
    if (service === 'reams') {
      email = email.trim()
      this.props.setSignInEmail(email)
      await sendEmailLink(email)
      console.log(`email: ${email}`)
    } else if (service === 'readwise') {
      setBackend('readwise', {
        accessToken: token
      })
      setSubmitting(false)
      this.setState({
        isAuthenticated: true
      })
    } else {
      const response = await authenticate({username, password}, service)
      console.log(response)
      if (response.status === 'success') {
        if (service === 'feedwrangler') {
          setBackend('feedwrangler', {
            accessToken: response.token
          })
        } else if (service === 'feedbin') {
          await EncryptedStorage.setItem("feedbin_password", password)
          setBackend('feedbin', {
            username
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
    const initialValues = service === 'reams' ?
      { email: this.state.email } :
      service === 'readwise' ?
        { accessToken: this.state.token } :
        {
          username: this.state.username,
          password: this.state.password
        }
    let loggedInUserName
    switch (service) {
      case 'feedbin':
        loggedInUserName = user.backends.find(b => b.name === 'feedbin')?.username
        break
      case 'reams':
        loggedInUserName = user.email
        break
    }
    const validationSchemaShape = service === 'reams' ?
      Yup.object().shape({
        email: Yup.string().trim().email('That doesn’t look like a valid email...').required('Required')
      }) :
        service === 'readwise' ?
          Yup.object().shape({
            token: Yup.string().required('Required')
          }) :
          Yup.object().shape({
            username: Yup.string().required('Required'),
            password: Yup.string().required('Required')
          })

    const reamsText = (isWhite) => <Text 
      style={{
        ...textInfoStyle(isWhite ? 'white' : 'black'),
        marginBottom: getMargin()
      }}><Text style={textInfoBoldStyle(isWhite ? 'white' : 'black')}>Reams Basic</Text> is free, but it doesn’t sync with other devices or apps.</Text>
      
    const launchBrowser =  async (url) => {
      try {
        await InAppBrowser.isAvailable()
        InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'close',
          preferredBarTintColor: hslString('rizzleBG'),
          preferredControlTintColor: hslString('rizzleText'),
          animated: true,
          modalEnabled: true,
          // modalPresentationStyle: "popover",
          // readerMode: true,
          // enableBarCollapsing: true,
        })
      } catch (error) {
        console.log('openLink', error)
      }
    }

    const isServiceExtra = (service) => service === 'readwise'

    const SubmitButton = ({ errors, handleSubmit, isSubmitting, isValid }) => {
      const errorsText = (
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
      )
      return isSubmitting ?
        <Text style={{
          ...textLabelStyle(),
          marginTop: 12,
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
        { errors?.submit && errorsText }
    }
    
    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        isInitialValid={this.state.email || this.state.username || this.state.token ? true : false}
        onSubmit={this.authenticateUser}
        validationSchema={validationSchemaShape}
      >
        {({
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
                paddingTop: 16 * fontSizeMultiplier(),
                // paddingLeft: 16 * fontSizeMultiplier(),
                // paddingRight: 16 * fontSizeMultiplier(),
                paddingBottom: 32 * fontSizeMultiplier(),
                marginTop: 16 * fontSizeMultiplier(),
                flex: 0,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}>
                { service === 'basic' ?
                  <View style={{
                    marginLeft: -24 * fontSizeMultiplier(),
                    marginRight: -24 * fontSizeMultiplier()
                  }}>
                    { !!isActive && reamsText() }
                  </View> :
                  <React.Fragment>
                    { loggedInUserName &&
                      <Text style={{
                        ...textInfoBoldStyle('white'),
                        marginTop: -10,
                        marginBottom: 10,
                        textAlign: 'left'
                      }}>
                        <Text style={textInfoStyle('white')}>Logged in as </Text>{ loggedInUserName }
                      </Text>
                    }
                    <TouchableOpacity
                      accessibilityLabel={`Stop using ${serviceDisplay}`}
                      color={hslString('white')}
                      onPress={async () => {
                        if (service === 'feedbin') {
                          EncryptedStorage.removeItem("feedbin_password")
                        }
                        if (service === 'reams') {
                          await supabase.auth.signOut()
                          // reams calls UNSET_BACKEND in the AuthProvider
                        } else {
                          unsetBackend(service) 
                        }
                      }}
                      style={{
                        marginTop: 16 * fontSizeMultiplier(),
                        width: '100%'
                      }}
                      testID={`${service}-logout-button`}
                    >
                      <Text style={{
                        ...textInfoStyle('white'),
                        textDecorationLine: 'underline',
                        textAlign: 'center'
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
                service === 'readwise' ? (
                  <View style={{
                    paddingVertical: 16 * fontSizeMultiplier(),
                    marginHorizontal: 16 * fontSizeMultiplier(),
                    alignItems: 'center',
                  }}>
                    <TouchableOpacity onPress={ () => launchBrowser('https://readwise.io/access_token') }>
                      <Text style={{
                          ...textInfoStyle('logo1'),
                          textDecorationLine: 'underline'
                        }}>Log in to Readwise</Text>
                    </TouchableOpacity>
                    <Text style={{
                      ...textInfoItalicStyle(),
                      margin: 16 * fontSizeMultiplier(),
                      padding: 0
                    }}>... and then enter the token below:</Text>
                    <View style={{ 
                      flex: 1,
                      width: '100%' 
                    }}>
                      <TextInput
                        onChangeText={handleChange('token')}
                        style={{
                          ...textInputStyle(),
                          width: '100%'
                        }}
                        testID={`${service}-token-text-input`}
                        value={values.token}
                      />
                      <Text style={textLabelStyle()}>Token</Text>
                    </View>
                    <SubmitButton 
                      errors={errors} 
                      handleSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                      isValid={isValid}
                    />
                  </View>
                ): (
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
                  <SubmitButton 
                    errors={errors} 
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                  />
                </View>
              ))
            }
          </View>
        )}
      </Formik>
    )
  }
}

export default AccountCredentialsForm