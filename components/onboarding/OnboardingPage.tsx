import React from 'react'
import { Dimensions, View } from 'react-native'
import { hslString } from '../../utils/colors'
import { BackgroundGradient } from '../BackgroundGradient'

const OnboardingPage = ({ children, index }: { children: any | any[], index: number }) => (
  <View
    style={{
      backgroundColor: hslString('rizzleBG'),
      flex: 1,
      overflow: 'hidden',
      width: Dimensions.get('window').width
    }}
  >
    <BackgroundGradient index={index} />
    {children}
  </View>
)

export default OnboardingPage