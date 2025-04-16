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
import { fontSizeMultiplier } from '../utils/dimensions'
import { isIpad } from '../utils/dimensions'
import { hasNotchOrIsland } from '../utils/dimensions'

const screenWidth = Dimensions.get('window').width
const margin = screenWidth * 0.03

export default SwitchRow = ({help, icon, label, value, onValueChange, testID}) => <View testID={testID} style={{
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
    <Text 
      testID={testID ? `${testID}-label` : 'switch-row-label'}
      style={{
        ...textInfoStyle(),
      }}
    >{label}</Text>
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
      testID={testID ? `${testID}-switch` : 'switch-row-toggle'}
      onValueChange={onValueChange}
      trackColor={{
        false: hslString('rizzleText', '', 0.3),
        true: hslString('rizzleText')
      }}
      value={value}
    />
  </View>
</View>