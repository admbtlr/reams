import React from 'react'
import {
  Text,
  View
} from 'react-native'
import { hslString } from '../utils/colors'
import XButton from './XButton'

export default Heading = ({title, showClose, onClose}) =>
  <View>
    <Text style={{
      fontFamily: 'IBMPlexSerif-Bold',
      fontSize: 32,
      lineHeight: 32,
      marginBottom: 4,
      textAlign: 'left',
      color: hslString('rizzleText')
    }}>{title}</Text>
    {showClose && <XButton
      onPress={onClose}
      style={{ top: -5 }}
    />}
    <View style={{
      height: 1,
      backgroundColor: hslString('rizzleText'),
      opacity: 0.2,
      marginBottom: 16
    }} />
  </View>
