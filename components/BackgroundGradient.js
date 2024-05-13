import React from 'react';
import { hslString } from '../utils/colors';
import { LinearGradient } from 'expo-linear-gradient';

export const BackgroundGradient = ({ index = 0 }) => (
  <LinearGradient
    colors={Math.floor(index / 2) % 2 == 0 ?
      [hslString('logo2'), hslString('logo1')] :
      [hslString('logo1'), hslString('logo2')]}
    end={{ x: index % 2 === 0 ? -1 : 0, y: 1 }}
    start={{ x: index % 2 === 0 ? 1 : 2, y: 0 }}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }} />

);
