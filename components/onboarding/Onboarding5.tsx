import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TOGGLE_ONBOARDING } from '../../store/config/types'
import { ActionSheetIOS, Animated, Easing, Image, Pressable, Text, View } from 'react-native'
import OnboardingPage from './OnboardingPage'
import { fontSizeMultiplier, getMargin } from '../../utils/dimensions'
import { textLargeBoldStyle, textLargeStyle, textStyle } from './Onboarding'
import TextButton from '../TextButton'
import { textInfoStyle } from '../../utils/styles'
import { RootState } from '../../store/reducers'

const Onboarding5 = ({ index, navigation }: { index: number, navigation: any }) => {
  const dispatch = useDispatch()
  const [isFinished, setIsFinished] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isShareSheetClosed, setIsShareSheetClosed] = useState(false)
  const onboardingIndex = useSelector((state: RootState) => state.config.onboardingIndex)
  const endOnboarding = () => dispatch({ type: TOGGLE_ONBOARDING, isOnboarding: false })
  const anim = new Animated.Value(0)
  const mainAnim = new Animated.Value(0)

  useEffect(() => {
    setIsVisible(onboardingIndex === index)
  }, [onboardingIndex])

  useEffect(() => {
    console.log('onboarding2 effect', isFinished)
    if (isFinished) {
      Animated.timing(mainAnim, {
        toValue: 1,
        duration: 15000,
        delay: 0,
        useNativeDriver: true
      }).start()
    }
  }, [isFinished])



  const endOnboardingAndResetNav = () => {
    endOnboarding()
    navigation.reset({
      index: 0,
      routes: [{name: 'Initial'}]})
  }

  const openShareSheet = () => {
    ActionSheetIOS.showShareActionSheetWithOptions({
        url: 'https://reams.app',
        message: 'Reams is for people who love to read. It‘s all about the immersive pleasures of text and image.',
        subject: 'Reams'
      },
      (error) => {
        console.error(error)
      },
      (success, method) => {
        setIsShareSheetClosed(true)
      }
    )
  }

  useEffect(() => {
    if (!isFinished) return
    Animated.timing(anim, {
      toValue: 1,
      duration: 800,
      delay: 0,
      useNativeDriver: true,
      easing: Easing.linear
    }).start()
  }, [isFinished])

  return (
    <OnboardingPage index={index}>
      <View style={{
        flex: 1,
        marginHorizontal: getMargin(),
        marginTop: getMargin() * 2,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Animated.Text style={{
          ...textLargeStyle,
          textAlign: 'center',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: anim.interpolate({
            inputRange: [0, 0.25, 0.75, 1],
            outputRange: [1, 1, 0, 0]
          }),
        }}>Let’s set up the share extension now</Animated.Text>
        <Animated.Text style={{
          ...textStyle,
          textAlign: 'center',
          marginBottom: 24 * fontSizeMultiplier(),
          opacity: anim.interpolate({
            inputRange: [0, 0.25, 0.75, 1],
            outputRange: [1, 1, 0, 0]
          }),
        }}>Watch the short video below to see how to enable the extension:</Animated.Text>
        <Animated.View style={{
          opacity: anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0, 0]
          }),
        }}>
          <Image 
            source={require('../../assets/images/reams-enable-share.webp')} 
            style={{
              backgroundColor: 'white',
              borderColor: 'rgba(0,0,0,0.8)',
              borderWidth: 2,
              width: 150,
              height: 328,
              margin: getMargin(),
              marginBottom: 48 * fontSizeMultiplier(),
              borderRadius: 18
            }}
          />
        </Animated.View>
        <Animated.View style={{
          position: 'absolute',
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          }),
        }}>
          <Animated.Text style={{
            ...textLargeBoldStyle,
            textAlign: 'center',
            marginBottom: 24 * fontSizeMultiplier(),
            opacity: mainAnim.interpolate({
              inputRange: [0, 0.03, 0.05, 1],
              outputRange: [0, 1, 1, 1]
            })
          }}>You have full access to Reams for one month</Animated.Text>
          <Animated.Text style={{
            ...textStyle,
            textAlign: 'center',
            marginBottom: 24 * fontSizeMultiplier(),
            opacity: mainAnim.interpolate({
              inputRange: [0, 0.1, 0.13, 1],
              outputRange: [0, 0, 1, 1]
            })
          }}>After one month, you won’t be able to add any more sites or newsletters to your feed without paying for a (very cheap!) subscription.</Animated.Text>
          <Animated.Text style={{
            ...textStyle,
            textAlign: 'center',
            marginBottom: 24 * fontSizeMultiplier(),
            opacity: mainAnim.interpolate({
              inputRange: [0, 0.3, 0.33, 1],
              outputRange: [0, 0, 1, 1]
            })
          }}>(New articles will still enter your feed from the sites and newsletters that you’ve already added, though)</Animated.Text>
          <Image 
            source={require('../../assets/images/ream.png')} 
            style={{
              alignSelf: 'center'
            }}
          />
          <Animated.View style={{
            opacity: mainAnim.interpolate({
              inputRange: [0, 0.4, 0.43, 1],
              outputRange: [0, 0, 1, 1]
            })
          }}>
            <TextButton
              onPress={endOnboardingAndResetNav}
              text='Start using Reams!'
            />
          </Animated.View>
        </Animated.View>
        {isFinished || (
          <>
            <TextButton
              buttonStyle={{marginBottom: 24 * fontSizeMultiplier()}}              
              onPress={openShareSheet}
              text='Open share sheet'
            />
            <TextButton
              buttonStyle={{opacity: isShareSheetClosed ? 1 : 0}}
              onPress={() => setIsFinished(true)}
              text='OK, done!'
            />
            <Pressable 
              onPress={() => setIsFinished(true)}
              style={{
                marginTop: -24 * fontSizeMultiplier(),
                opacity: isShareSheetClosed ? 0 : 1
              }}>
              <Text style={ textInfoStyle() }>Skip</Text>
            </Pressable>
          </>
        )}
      </View>
    </OnboardingPage>
  )
}

export default Onboarding5
