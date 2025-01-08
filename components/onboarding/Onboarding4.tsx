import React, { useEffect, useState } from 'react'
import { Animated, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/reducers'
import OnboardingPage from './OnboardingPage'
import { fontSizeMultiplier, getMargin } from '../../utils/dimensions'
import { textBoldStyle, textLargeBoldStyle, textStyle } from './Onboarding'
import { getRizzleButtonIcon } from '../../utils/rizzle-button-icons'

const Onboarding4 = ({ index }: { index: number }) => {
  const mainAnim = new Animated.Value(0)
  const onboardingIndex = useSelector((state: RootState) => state.config.onboardingIndex)

  console.log('onboardingIndex', onboardingIndex)

  // so this is weird
  // if the app has been opened from an emailed link, the onboardingIndex will be 2, 
  // because that's where it left off with the enter email screen
  // but if the user is going back and forth between the onboarding screens, it might be 0
  const [isVisible, setIsVisible] = useState(onboardingIndex <= 2)
  useEffect(() => {
    setIsVisible(onboardingIndex <= 2)
  }, [onboardingIndex])

  useEffect(() => {
    if (isVisible)  {
      Animated.timing(mainAnim, {
        toValue: 1,
        duration: 25000,
        delay: 0,
        useNativeDriver: true
      }).start()
    }
  }, [isVisible])

  return (
    <OnboardingPage index={index}>
      <View style={{
        flex: 1,
        marginHorizontal: getMargin(),
        justifyContent: 'center',
      }}>
        <Animated.Text style={{
          ...textLargeBoldStyle,
          textAlign: 'left',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.03, 1],
            outputRange: [0, 1, 1]
          }),
        }}>Thanks for choosing Reams!</Animated.Text>
        { /* Using a View here because android can't do opacity on the icons */}
        <Animated.View style={{
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.07, 0.1, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>
          <Text style={{
            ...textStyle,
            textAlign: 'left',
          }}>There are two areas in Reams: the {getRizzleButtonIcon('rss', 'white', null, null, true, 0.7)}&#160;<Text style={textBoldStyle}>Feed</Text> and the {getRizzleButtonIcon('saved', 'white', null, null, true, 0.7)}&#160;<Text style={textBoldStyle}>Library</Text>.</Text>
        </Animated.View>
        { /* Using a View here because android can't do opacity on the icons */}
        <Animated.View style={{
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.2, 0.23, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>
          <Animated.Text style={{
            ...textStyle,
            textAlign: 'left',
          }}>New articles enter your {getRizzleButtonIcon('rss', 'white', null, null, true, 0.7)}&#160;<Text style={textBoldStyle}>Feed</Text> via RSS, or from newsletters. Want to keep one of the articles forever? Save it to your {getRizzleButtonIcon('saved', 'white', null, null, true, 0.7)}&#160;<Text style={textBoldStyle}>Library</Text>.</Animated.Text>
        </Animated.View>
        <Animated.Text style={{
          ...textStyle,
          textAlign: 'left',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.5, 0.53, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>You can also save articles to your library from Safari (or 3rd party apps) with the <Text style={textBoldStyle}>Reams share extension</Text>.</Animated.Text> 
        <Animated.Text style={{
          ...textStyle,
          textAlign: 'left',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: mainAnim.interpolate({
            inputRange: [0, 0.8, 0.83, 1],
            outputRange: [0, 0, 1, 1]
          }),
        }}>(Extensions for desktop browsers will be available very soon!)</Animated.Text> 
      </View>
      <Animated.Text style={{
        fontFamily: 'IBMPlexSans-Italic',
        fontSize: 14 * fontSizeMultiplier(),
        color: 'white',
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        opacity: mainAnim.interpolate({
          inputRange: [0, 0.9, 0.93, 1],
          outputRange: [0, 0, 1, 1]
        }),
      }}>swipe >>></Animated.Text>
    </OnboardingPage>
  )
}

export default Onboarding4
