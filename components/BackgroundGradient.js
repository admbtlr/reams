import React from 'react';
import { hslString } from '../utils/colors';
import { LinearGradient } from 'expo-linear-gradient';

const xValues = [-1, 0, 1, 2]

export const BackgroundGradient = ({ index = 0 }) => (
  <LinearGradient
    colors={index % 4 === 0 || index % 4 === 3  ?
      [hslString('logo1', 'darkmodable'), hslString('logo2', 'darkmodable')] :
      [hslString('logo2', 'darkmodable'), hslString('logo1', 'darkmodable')]}
    end={{ x: xValues[index % 4], y: index % 4 === 0 || index % 4 === 3 ? 1 : 0 }}
    start={{ x: xValues[(index + 2) % 4], y: index % 4 === 0 || index % 4 === 3 ? 0 : 1 }}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }} />

);
