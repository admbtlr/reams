import { Formik } from 'formik'
import * as Yup from 'yup'
import React from 'react'
import { Button, Dimensions, Text, TextInput, View } from 'react-native'
import OnePassword from 'react-native-onepassword'

import { hslString } from '../utils/colors'
import { authenticate } from '../redux/backends'

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
    marginLeft: 16,
    marginRight: 16,
    marginTop: 40,
    fontSize: 20,
    borderBottomWidth: 1
  },
  textValueStyle: {
    ...baseStyles,
    fontSize: 12
  },
  textLabelStyle: {
    ...baseStyles,
    fontSize: 12,
    marginLeft: 16,
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

  async authenticateUser ({username, password}) {
    await authenticate(username, password, this.props.service)
    console.log(`username: ${username}`)
    console.log(`password: ${password}`)
  }

  render = () => {
    const width = Dimensions.get('window').width
    const initialValues = {
      username: this.state.username,
      password: this.state.password
    }
    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.authenticateUser}
        validationSchema={Yup.object().shape({
          username: Yup.string()
            .required('Required'),
          password: Yup.string()
            .required('Required')
          })}
        render={({
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          values
        }) => (
          <View>
            <TextInput
              onChangeText={handleChange('username')}
              style={styles.textInputStyle}
              value={values.username}
            />
            <Text style={styles.textLabelStyle}>User name</Text>
            <View style={{
              position: 'relative'
            }}>
              <TextInput
                onChangeText={handleChange('password')}
                secureTextEntry={true}
                style={{
                  ...styles.textInputStyle,
                  flex: 1
                }}
                value={values.password}
              />
              { this.state.is1Password &&
                <View style={{
                  position: 'absolute',
                  top: 32,
                  right: 10
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
        )}
      />
    )
  }
}

export default AccountCredentialsForm