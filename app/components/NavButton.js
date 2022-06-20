import React from 'react'
import {
  Animated,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { hslString } from '../utils/colors'
import { getInset, getMargin } from '../utils'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'

const expansionRatio = 0.1

export default NavButton = ({ children, icon, onPress, text, hasBottomBorder, hasTopBorder, viewStyle={}, index, scrollAnim }) => (
  <Animated.View style={{
    marginTop: 1,
    transform: [{
      translateY: scrollAnim ? scrollAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-1 + expansionRatio + index * expansionRatio, 0, 0]
      }) : 0
    }]
  }}>
    { hasTopBorder && 
      <Animated.View style={{
        height: 1,
        width: '100%',
        backgroundColor: hslString('rizzleText', '', 0.2),
        transform: [{
          translateY: scrollAnim ? scrollAnim.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [0 - expansionRatio - index * expansionRatio, 0, 0]
          }) : 0
        }]
      }} />
    }
    <Animated.View style={{
      transform: [{
        translateY: scrollAnim ? scrollAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [ index === 0 ? -expansionRatio / 2 : 0, 0, 0]
        }) : 0
      }]
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
          justifyContent: 'flex-start',
          width: '100%',
          paddingTop: getMargin() / 2,
          paddingBottom: getMargin() / 2,
          ...viewStyle
        }}>
          { icon }
          { text ?
            <Text style={{ 
              ...textInfoStyle(),
              flex: 1,
            }}>{ text }</Text> :
            children ? children : null
          }
          <View style={{ 
            alignSelf: 'flex-end'
          }}>{ getRizzleButtonIcon('forward', viewStyle.color || hslString('rizzleText')) }</View>
        </View>
      </TouchableOpacity>
    </Animated.View>
    { hasBottomBorder && 
      <Animated.View style={{
        height: 1,
        width: '100%',
        backgroundColor: hslString('rizzleText', '', 0.2),
        transform: [{
          translateY: scrollAnim ? scrollAnim.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [index * expansionRatio, 0, 0]
          }) : 0
        }]
      }} />
    }
  </Animated.View>
)
