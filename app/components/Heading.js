import React, { Fragment } from 'react'
import {
  Text,
  View
} from 'react-native'
import { hslString } from '../utils/colors'
import XButton from './XButton'
import BackButton from './BackButton'

export default Heading = ({title, isBigger, isWhite, showClose, onClose, showBack, onBack}) => {
  const color = isWhite ? hslString('white') : hslString('rizzleText')
  const xStyle = !showClose ?
    {} :
    isBigger ?
      {
        position: 'absolute',
        top: 0,
        right: 0
      } :
      {
        top: -5
      }
  return <Fragment>
    <View style={{
      alignItems: 'flex-end',
      flexDirection: 'row'
    }}>
      {showBack && <BackButton
        onPress={onBack}
      />}
      <Text style={{
        fontFamily: 'PTSerif-Bold',
        fontSize: isBigger ? 40 : 32,
        lineHeight: isBigger ? 50 : 36,
        marginBottom: isBigger ? 30 : 6,
        paddingTop: 18,
        textAlign: isBigger ? 'center' : 'left',
        color,
        flex: isBigger ? 1 : 0
      }}>{title}</Text>
      {showClose && <XButton
        onPress={onClose}
        style={xStyle}
        isLight={isWhite}
      />}
    </View>
    <View style={{
      height: 1,
      backgroundColor: color,
      opacity: 0.2,
      marginBottom: isBigger ? 25 : 16
    }} />
  </Fragment>
}