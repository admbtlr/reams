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
      position: 'relative',
      top: -10,
      ...style
    }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          width: 28,
          height: 28
        }}>
        <Svg
          height='28'
          width='28'
          fill='none'>
          <Path
            d="M15 18l-6-6 6-6"
            stroke={hslString('rizzleText')}
            strokeWidth={4}
            strokeLinecap='round'
            strokeLinejoin='round' />
        </Svg>
      </TouchableOpacity>
    </View>
  )
}
