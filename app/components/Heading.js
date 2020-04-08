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
      flexDirection: 'row',
      paddingBottom: isBigger ? 30 : 6
    }}>
      {showBack && <BackButton
        onPress={onBack}
      />}
      {title ? <Text style={{
        fontFamily: 'PTSerif-Bold',
        fontSize: isBigger ? 40 : 32,
        lineHeight: isBigger ? 50 : 36,
        paddingTop: 18,
        textAlign: 'center',
        color,
        flex: 1
      }}>{title}</Text> : null}
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
