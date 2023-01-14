import React from 'react'
import Svg, { Line, Path, Polygon, Polyline } from 'react-native-svg'
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

export const dustbinIcon = (color = hslString('rizzleText'), size=32, strokeWidth=2) => <Svg
  viewBox='0 0 24 32'
  height={ size * fontSizeMultiplier() }
  width={ size * 0.75 * fontSizeMultiplier() }
  fill='none'
  stroke={color}
  strokeWidth={strokeWidth}
  strokeLinecap='round'
  strokeLinejoin='round'>
  <Polyline
    points='3 6 5 6 21 6' />
  <Path
    d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
  <Line
    x1='10'
    y1='11'
    x2='10'
    y2='17' />
  <Line
    x1='14'
    y1='11'
    x2='14'
    y2='17' />
</Svg>

export const noteIcon = (color = hslString('rizzleText'), size=24, strokeWidth=2) => <Svg
  width={ size * fontSizeMultiplier() }
  height={ size * fontSizeMultiplier() }
  viewBox="0 0 24 24" 
  fill='none' 
  stroke={color}
  strokeWidth={strokeWidth}
  strokeLinecap='round' 
  strokeLinejoin='round'>
  <Path d='M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34' />
  <Polygon points='18 2 22 6 12 16 8 16 8 12 18 2' />
</Svg>

export const okIcon = (color = hslString('rizzleText')) => <Svg
  width={ 24 * fontSizeMultiplier() } 
  height={ 24 * fontSizeMultiplier() }
  viewBox="0 0 24 24" 
  fill="none" 
  stroke={color} 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>