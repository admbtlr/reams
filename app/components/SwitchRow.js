import React, { useState } from 'react'
import {
  Dimensions,
  ScrollView,
  Switch,
  Text,
  View
} from 'react-native'
import { hslString } from '../utils/colors'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'
import { isIphoneX, isIpad, fontSizeMultiplier } from '../utils'

const screenWidth = Dimensions.get('window').width
const margin = screenWidth * 0.03

export default SwitchRow = ({help, icon, label, value, onValueChange}) => <View style={{
  flex: 0,
  flexDirection: 'column',
  marginBottom: margin,
  paddingTop: margin,
  borderTopColor: hslString('rizzleText', '', 0.2),
  borderTopWidth: 1
}}>
  <View style={{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }}>
    <View style={{
      width: 16,
      marginLeft: 8 // the internal padding of a TextButton, to align icons
    }}>{ icon }</View>
    <View style={{ flex: 1 }}>
    <Text style={{
      ...textInfoStyle(),
    }}>{label}</Text>
  { help && false &&
    <View style={{ flexDirection: 'row' }}> 
      <Text style={{
        ...textInfoStyle(),
        fontSize: 10 * fontSizeMultiplier(),
        flex: 1
      }}>{help}</Text>
  </View>
  }
    </View>
    <Switch 
      onValueChange={onValueChange}
      trackColor={{
        false: hslString('rizzleText', '', 0.3),
        true: hslString('rizzleText')
      }}
      value={value}
    />
  </View>
</View>