import React from 'react'
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { hslString } from '../utils/colors'
import { getInset, getMargin } from '../utils'
import { textInfoStyle } from '../utils/styles'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'

export default NavButton = ({ children, icon, onPress, text, hasBottomBorder, hasTopBorder, viewStyle={} }) => (
  <View style={{
    borderBottomColor: hslString('rizzleText', '', 0.2),
    borderBottomWidth: hasBottomBorder ? 1 : 0,
    borderTopColor: hslString('rizzleText', '', 0.2),
    borderTopWidth: hasTopBorder ? 1 : 0,
    marginTop: 1
  }}>
    <TouchableOpacity 
      onPress={ onPress }
      style={{
        width: '100%'
      }}
      >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingTop: getMargin() / 2,
        paddingBottom: getMargin() / 2,
        ...viewStyle
      }}>
        { icon }
        { text ?
          <Text style={{ 
            ...textInfoStyle(),
            flex: 1   
          }}>{ text }</Text> :
          children ? children : null
        }
        <View style={{ 
          alignSelf: 'flex-end'
        }}>{ getRizzleButtonIcon('forward', hslString('rizzleText')) }</View>
      </View>
    </TouchableOpacity>
  </View>
)
