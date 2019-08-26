import React, { Fragment } from 'react'
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { formElementStyles } from './AccountCredentialsForm'

const AddFeedForm = ({}) => {
  const width = Dimensions.get('window').width
  const margin = width * 0.04

  return (<View style={{
    height: 64,
    padding: margin
    }}>
      <TextInput
        style={formElementStyles.textInputStyle}
      />
    </View>)
}

export default AddFeedForm