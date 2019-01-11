import { Formik } from 'formik'
import React from 'react'
import { Button, Text, TextInput, View } from 'react-native'

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

const AccountCredentialsForm = () => (
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
        <TextInput
          onChangeText={handleChange('password')}
          style={styles.textInputStyle}
          value={password}
        />
        <Text style={styles.textLabelStyle}>Password</Text>
        <Button
          title="Submit"
          onPress={handleSubmit}
        />
      </View>
    )}
  />
)

export default AccountCredentialsForm