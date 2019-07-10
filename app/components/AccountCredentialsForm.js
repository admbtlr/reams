import { Formik } from 'formik'
import * as Yup from 'yup'
import React from 'react'
import { Button, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native'
import OnePassword from 'react-native-onepassword'

import RizzleAuth from './RizzleAuth'
import { sendEmailLink } from '../redux/backends/rizzle'
import { authenticate } from '../redux/backends'
import { hslString } from '../utils/colors'

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
  }
}

class AccountCredentialsForm extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      is1Password: true,
      username: '',
      password: ''
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

  async authenticateUser ({username, password, email}) {
    if (this.props.service === 'rizzle') {
      await sendEmailLink(email)
      console.log(`email: ${email}`)
    } else {
      const accessToken = await authenticate({username, password}, this.props.service)
      this.props.setBackend('feedwrangler', accessToken)
    }
  }

  render = () => {
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
      {
        email: Yup.string().required('Required')
      } :
      {
        username: Yup.string().required('Required'),
        password: Yup.string().required('Required')
      }
    const user = this.props.user
    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        isInitialValid={this.state.email || this.state.username}
        onSubmit={this.authenticateUser}
        validationSchema={Yup.object().shape()}
        render={({
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          values
        }) => (
          <View>
            { this.props.service === 'rizzle' ?
              <RizzleAuth
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isValid={isValid}
                values={values}
                user={user}
              /> :
              <View style={{
                paddingTop: 16,
                paddingLeft: 16,
                paddingRight: 16,
                marginTop: 16
              }}>
                <TextInput
                  onChangeText={handleChange('username')}
                  style={styles.textInputStyle}
                  value={values.username}
                />
                <Text style={styles.textLabelStyle}>User name</Text>
                <View style={{
                  position: 'relative',
                  height: 48
                }}>
                  <TextInput
                    onChangeText={handleChange('password')}
                    secureTextEntry={true}
                    style={{
                      ...styles.textInputStyle,
                      marginTop: 24
                    }}
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
                <Text style={styles.textLabelStyle}>Password</Text>
                <Button
                  disabled={isSubmitting || !isValid}
                  title="Submit"
                  onPress={handleSubmit}
                />
              </View>
            }
          </View>
        )}
      />
    )
  }
}

export default AccountCredentialsForm