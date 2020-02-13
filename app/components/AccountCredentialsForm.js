import { Formik } from 'formik'
import * as Yup from 'yup'
import React from 'react'
import { Button, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native'
import OnePassword from 'react-native-onepassword'
import AnimatedEllipsis from 'react-native-animated-ellipsis'

import RizzleAuth from './RizzleAuth'
import { sendEmailLink } from '../redux/backends/rizzle'
import { authenticate } from '../redux/backends'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier } from '../utils'

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
  textInputStyle: {
    ...baseStyles,
    // padding: 8,
    fontSize: 20 * fontSizeMultiplier(),
    borderBottomColor: hslString('rizzleText'),
    borderBottomWidth: 1
  },
  textValueStyle: {
    ...baseStyles,
    fontSize: 12 * fontSizeMultiplier()
  },
  textLabelStyle: {
    ...baseStyles,
    fontSize: 12 * fontSizeMultiplier(),
    marginTop: 3
  },
  textButtonStyle: {
    ...baseStyles,
    fontSize: 16 * fontSizeMultiplier(),
    textDecorationLine: 'underline'
  },
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
    const { isActive, service } = this.props
    const width = Dimensions.get('window').width
    const initialValues = this.props.service === 'rizzle' ?
      {
        email: this.state.email
      } :
      {
        username: this.state.username,
        password: this.state.password
      }
    const validationSchemaShape = this.props.service === 'rizzle' ?
      Yup.object().shape({
        email: Yup.string().trim().email('That doesn’t look like a valid email...').required('Required')
      }) :
      Yup.object().shape({
        username: Yup.string().required('Required'),
        password: Yup.string().required('Required')
      })
    const user = this.props.user
    const { isErrored, isAuthenticated } = this.state
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
            flex: 1
          }}>
            { service === 'rizzle' ?
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
              ( isActive ?
                <View style={{
                  paddingTop: 16,
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingBottom: 16,
                  marginTop: 16,
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Text
                    style={{
                      ...formElementStyles.textInfoStyle,
                      color: hslString('white'),
                      marginTop: 0,
                      textAlign: 'center'
                    }}>You are using {service[0].toUpperCase() + service.slice(1)}.</Text>
                  <Button
                    color={hslString('white')}
                    title={`Stop using ${service[0].toUpperCase() + service.slice(1)}`}
                    onPress={this.props.unsetBackend}
                    testID={`${service}-logout-button`}
                  />
                </View> :
                <View style={{
                  paddingTop: 16,
                  paddingLeft: 16,
                  paddingRight: 16,
                  marginTop: 16
                }}>
                  <TextInput
                    autoCapitalize='none'
                    onChangeText={handleChange('username')}
                    style={formElementStyles.textInputStyle}
                    testID={`${service}-username-text-input`}
                    value={values.username}
                  />
                  <Text style={formElementStyles.textLabelStyle}>User name</Text>
                  <View style={{
                    position: 'relative',
                    height: 48
                  }}>
                    <TextInput
                      onChangeText={handleChange('password')}
                      secureTextEntry={true}
                      style={{
                        ...formElementStyles.textInputStyle,
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
                  <Text style={formElementStyles.textLabelStyle}>Password</Text>
                  { isSubmitting ?
                    <Text style={{
                      ...formElementStyles.textLabelStyle,
                      marginTop: 6,
                      textAlign: 'center'
                    }}>Submitting...</Text> :
                    <Button
                      disabled={isSubmitting || !isValid}
                      title="Submit"
                      onPress={handleSubmit}
                      testID={`${service}-submit-button`}
                    />
                  }
                  { errors.submit &&
                    <View style={{
                      backgroundColor: hslString('logo2'),
                      padding: 5,
                      marginLeft: -16,
                      marginRight: -16
                    }}>
                      <Text style={{
                        ...formElementStyles.textLabelStyle,
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