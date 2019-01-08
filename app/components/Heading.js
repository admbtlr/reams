import React from 'react'
import {
  Text,
  View
} from 'react-native'
import XButton from './XButton'

export default Heading = ({title, showClose, onClose}) =>
  <View>
    <Text style={{
      fontFamily: 'IBMPlexSerif-Bold',
      fontSize: 32,
      lineHeight: 32,
      marginBottom: 4,
      textAlign: 'left',
      color: 'hsl(300, 20%, 20%)',
    }}>{title}</Text>
    {showClose && <XButton
      onPress={onClose}
      style={{ top: -5 }}
    />}
    <View style={{
      height: 1,
      backgroundColor: 'hsl(300, 20%, 20%)',
      opacity: 0.2,
      marginBottom: 16
    }} />
  </View>
