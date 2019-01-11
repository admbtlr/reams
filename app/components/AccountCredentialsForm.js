import { Formik } from 'formik'
import React from 'react'
import { Button, Dimensions, Text, TextInput, View } from 'react-native'
import OnePassword from 'react-native-onepassword'

const services = {
  feedbin: 'https://feedbin.com',
  feedWrangler: 'https://feedwrangler.com',
  feedly: 'https://feedly.com'
}

const baseStyles = {
  fontFamily: 'IBMPlexMono',
  textAlign: 'left',
  color: 'hsl(300, 20%, 20%)'
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
      is1Password: true
    }
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
      console.log(`Found user ${username} with a ${password.length} character password`)
    } catch (e) {
      console.warn('User did not choose a login in the OnePassword prompt.')
    }
  }

  render = () => {
    const width = Dimensions.get('window').width
    return (
      <Formik
        onSubmit={({ username, password }) => {
          console.log(`username: ${username}`);
          console.log(`password: ${password}`);
        }}
        render={({
          handleChange,
          handleSubmit,
          values: { username, password }
        }) => (
          <View>
            <TextInput
              onChangeText={handleChange('username')}
              style={styles.textInputStyle}
              value={username}
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
                value={password}
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