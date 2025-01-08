import React, { useEffect, useState } from 'react'
import { Animated, Easing, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/reducers'
import { textBoldStyle, textLargeStyle, textStyle } from './Onboarding'
import { fontSizeMultiplier, getMargin } from '../../utils/dimensions'
import { hslString } from '../../utils/colors'
import OnboardingPage from './OnboardingPage'
import Figures from './Figures'

const Onboarding2 = ({ index }: { index: number}) => {
  const mainAnim = new Animated.Value(0)
  const loopAnim = new Animated.Value(0)
  const onboardingIndex = useSelector((state: RootState) => state.config.onboardingIndex)
  const [isVisible, setIsVisible] = useState(onboardingIndex === index)
  useEffect(() => {
    setIsVisible(onboardingIndex === index)
  }, [onboardingIndex])

  useEffect(() => {
    console.log('onboarding2 effect', isVisible)
    if (isVisible) {
      Animated.parallel([
      Animated.timing(mainAnim, {
        toValue: 1,
        duration: 15000,
        delay: 0,
        useNativeDriver: true
      }),
      Animated.loop(Animated.timing(loopAnim, {
        toValue: 1.2,
        duration: 10000,
        delay: 0,
        easing: Easing.linear,
        useNativeDriver: true
      }))
    ]).start()
    }
  }, [isVisible])

  const textLargeAbsoluteStyle = {
    ...textLargeStyle,
    fontFamily: 'IBMPlexSans-Bold',
    fontSize: 25 * fontSizeMultiplier(),
    color: hslString('logo3'),
    position: 'absolute',
    right: 0,
    // top: 1,
    // textAlign: 'center',
  }

  return (
    <OnboardingPage index={index}>
      <View style={{
        flex: 1,
        // alignItems: 'center',
        marginTop: 80 * fontSizeMultiplier(),
        marginHorizontal: getMargin(),
        overflow: 'hidden'
      }}>
        <Animated.Text style={{
          ...textStyle,
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.03, 0.05, 1],
            outputRange: [0, 1, 1, 1]
          }),
        }}>Reams uses <Text style={textBoldStyle}>infernally complex logic</Text>, a <Text style={textBoldStyle}>sprinkling of AI</Text> and a whole lot of attention to <Text style={textBoldStyle}>typrographic detail</Text> to turn your reading into a stunning, immersive experience.</Animated.Text>
        <Animated.Text style={{
          ...textStyle,
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.2, 0.25, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>All you have to do is <Text style={textBoldStyle}>swipe</Text> between the articles, like <Text style={textBoldStyle}>flipping the pages of a magazine</Text>.</Animated.Text>
        <Animated.View style={{ 
          // marginTop: 48,
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.4, 0.45, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>
          <Animated.Text style={{
            ...textLargeStyle,
            marginTop: 24
          }}>And of course you can</Animated.Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
            <View style={{ flex: 1 }}>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [1, 1,    0,   0,    0,   0,    0,   0,    0,   0,   0,  0,    1]
              })}}>read </Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    1,   1,    0,   0,    0,   0,    0,   0,   0,  0,    0]
              })}}>save</Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    0,   0,    1,   1,    0,   0,    0,   0,   0,  0,    0]
              })}}>tag</Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    0,   0,    0,   0,    1,   1,    0,   0,   0,  0,    0]
              })}}>annotate</Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    0,   0,    0,   0,    0,   0,    1,   1,   0,  0,    0]
              })}}>share</Animated.Text>
            <Animated.Text style={{
              ...textLargeAbsoluteStyle,
              opacity: loopAnim.interpolate({
                inputRange: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1, 1.15, 1.2],
                outputRange: [0, 0,    0,   0,    0,   0,    0,   0,    0,   0,   1,  1,    0]
              })}}>highlight</Animated.Text>
            </View>
            <View style={{ flex: 0 }}>
              <Text style={textLargeStyle}> each article.</Text>
            </View>            
          </View>
        </Animated.View>
      </View>
      <Animated.Text style={{
        fontFamily: 'IBMPlexSans-Italic',
        fontSize: 14 * fontSizeMultiplier(),
        color: 'white',
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        opacity: mainAnim.interpolate({
          inputRange: [0, 0.8, 0.85, 1],
          outputRange: [0, 0, 1, 1]
        }),
      }}>swipe >>></Animated.Text>
      <Figures anim={mainAnim} />
    </OnboardingPage>
  )
}

export default Onboarding2
