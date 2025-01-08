import React, { createRef, useEffect, useRef, useState } from 'react'
import { Animated, Text, View } from 'react-native'
import OnboardingPage from './OnboardingPage'
import { fontSizeMultiplier, getMargin } from '../../utils/dimensions'
import Figures from './Figures'

const Onboarding1 = ({index, navigation}: { index: number, navigation: any }) => {
  const mainAnim = new Animated.Value(0)

  useEffect(() => {
    Animated.timing(mainAnim, {
      toValue: 1,
      duration: 15000,
      delay: 0,
      useNativeDriver: true
    }).start()
  }, [])

  return (
    <OnboardingPage index={index}>
      <View style={{
        flex: 1,
        // alignItems: 'center',
        marginTop: 100,
        marginHorizontal: getMargin()
      }}>
        <Animated.Text style={{
          fontFamily: 'PTSerif-Bold',
          fontSize: 64 * fontSizeMultiplier(),
          color: 'white',
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.08, 0.1, 1],
            outputRange: [0, 1, 1, 1]
          }),
          overflow: 'hidden'
        }}>Reams</Animated.Text>
        <Animated.Text style={{
          fontFamily: 'IBMPlexSansCond',
          fontSize: 24 * fontSizeMultiplier(),
          color: 'white',
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.1, 0.2, 1],
            outputRange: [0, 0, 1, 1]
          })
        }}>The Serious, Joyful and Open App for Readers</Animated.Text>
        <Animated.Text style={{
          fontFamily: 'IBMPlexSans',
          fontSize: 20 * fontSizeMultiplier(),
          lineHeight: 28,
          color: 'white',
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.22, 0.3, 1],
            outputRange: [0, 0, 1, 1]
          }),
          marginTop: getMargin() * 4,
        }}>Imagine an endless, beautiful magazine, filled only with articles that you want to read, from sources you choose.</Animated.Text>
        <Animated.Text style={{
          fontFamily: 'IBMPlexSans',
          fontSize: 20 * fontSizeMultiplier(),
          color: 'white',
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.75, 0.85, 1],
            outputRange: [0, 0, 1, 1]
          }),
          marginTop: getMargin()
        }}>Imagine <Text style={{ fontFamily: 'IBMPlexSans-Bold'}}>Reams</Text>.</Animated.Text>
      </View>
      <Animated.Text style={{
        fontFamily: 'IBMPlexSans-Italic',
        fontSize: 16 * fontSizeMultiplier(),
        color: 'white',
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        opacity: mainAnim.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 0, 0, 1] 
        })
      }}>swipe >>></Animated.Text>
      <Figures anim={mainAnim} />
    </OnboardingPage>
  )
}

export default Onboarding1
