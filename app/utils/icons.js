import React from 'react'
import Svg, { Line } from 'react-native-svg'
import { fontSizeMultiplier } from './index'
import { hslString } from './colors'


export const xIcon = (color = hslString('rizzleText'))  => <Svg
  viewBox='0 0 32 32'
  height={ 32 * fontSizeMultiplier() }
  width={ 32 * fontSizeMultiplier() }
  fill='none'
  stroke={color}
  strokeWidth='3'
  strokeLinecap='round'
  strokeLinejoin='round'>
  <Line x1='18' y1='6' x2='6' y2='18' />
  <Line x1='6' y1='6' x2='18' y2='18' />
</Svg>

