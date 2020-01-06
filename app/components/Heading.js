import React, { Fragment } from 'react'
import {
  Text,
  View
} from 'react-native'
import { hslString } from '../utils/colors'
import XButton from './XButton'
import BackButton from './BackButton'

export default Heading = ({title, showClose, onClose, showBack, onBack}) =>
  <Fragment>
    <View style={{
      alignItems: 'flex-end',
      flexDirection: 'row'
    }}>
      {showBack && <BackButton
        onPress={onBack}
      />}
      <Text style={{
        fontFamily: 'IBMPlexSerif-Bold',
        fontSize: 32,
        lineHeight: 32,
        marginBottom: 6,
        paddingTop: 18,
        textAlign: 'left',
        color: hslString('rizzleText')
      }}>{title}</Text>
      {showClose && <XButton
        onPress={onClose}
        style={{ top: -5 }}
      />}
    </View>
    <View style={{
      height: 1,
      backgroundColor: hslString('rizzleText'),
      opacity: 0.2,
      marginBottom: 16
    }} />
  </Fragment>
