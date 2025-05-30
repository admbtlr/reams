import React from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import Svg, { Line, Path } from 'react-native-svg'
import { hslString } from '../utils/colors'

export default function DrawerButton({ isLight, onPress, style = {} }) {
  return (
    <View style={{
      // position: 'absolute',
      top: -2,
      paddingTop: 10,
      paddingRight: 10,
      paddingLeft: 10,
      marginLeft: -10,
      zIndex: 10,
      ...style
    }}>
      <TouchableOpacity
        hitSlop={{
          top: 10,
          right: 10,
          bottom: 0,
          left: 10
        }}
        onPress={onPress}
        style={{
          width: 28,
          height: 28
        }}>
        <Svg
          height='28'
          width='28'
          fill='none'
          stroke={hslString('rizzleText')}
          strokeWidth={3}
          strokeLinecap='round'
          strokeLinejoin='round'>
          <Line x1='3' y1='4' x2='21' y2='4' />
          <Line x1='3' y1='12' x2='15' y2='12' />
          <Line x1='3' y1='20' x2='21' y2='20' />
        </Svg>
      </TouchableOpacity>
    </View>
  )
}
