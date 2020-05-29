import React from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Path} from 'react-native-svg'
import {hslString} from '../utils/colors'

export default function BackButton({ isLight, onPress, style }) {
  return (
    <View style={{
      position: 'absolute',
      top: 2,
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
          width: 14,
          height: 28
        }}>
        <Svg
          height='28'
          width='14'
          fill='none'>
          <Path
            d="M12 24l-10-10 10-10"
            stroke={hslString('rizzleText')}
            strokeWidth={4}
            strokeLinecap='round'
            strokeLinejoin='round' />
        </Svg>
      </TouchableOpacity>
    </View>
  )
}
