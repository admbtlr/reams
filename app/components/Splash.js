import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  Text
} from 'react-native'
import SplashScreen from 'react-native-splash-screen'

import { hslString } from '../utils/colors'
import { isFirstLaunch, fontSizeMultiplier } from '../utils'

export default function Splash () {
  const { height, width } = Dimensions.get('window')
  const rizzleAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(1)
  const fadeAnim = new Animated.Value(0)

  const [isVisible, setVisible] = useState(true)
  const [hasAnimated, setAnimated] = useState(false)
  const [hasFaded, setFaded] = useState(false)

  const hasRehydrated = useSelector(state => {
    return state._persist !== null
  })

  const hideWhenReady = async () => {
    const isFirst = await isFirstLaunch()
    if (!isFirst || hasRehydrated) {
      setVisible(false)
    }
  }

  let isSubscribed = true

  useEffect(() => {
    if (hasAnimated) {
      Animated.timing(
        scaleAnim,
        {
          toValue: 20,
          duration: 500,
          useNativeDriver: true
        }
      ).start(() => {
        if (isSubscribed) {
          setFaded(true)
        }
      })
    }
    return () => {
      isSubscribed = false
    }
  }, [isVisible])

  useEffect(() => {
    hasFaded || Animated.timing(
      rizzleAnim,
      {
        toValue: -height * 0.333,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }).start(() => {
        if (isSubscribed && !isVisible && !hasFaded) {
          Animated.timing(
            scaleAnim,
            {
              toValue: 20,
              duration: 500,
              useNativeDriver: true
            }
          ).start(() => {
            setFaded(true)
          })
        }
      })
      return () => {
        isSubscribed = false
      }
  })

  hideWhenReady()

  return hasFaded ? null :
    <Animated.View
      onLayout={() => {
        if (Platform.OS !== 'web') SplashScreen.hide()
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: hslString('rizzleBG', 'strict'),
        opacity: scaleAnim.interpolate({
          inputRange: [1, 20],
          outputRange: [1, 0]
        }),
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: [{
          scale: scaleAnim
        }],
        justifyContent: 'center',
        alignItems: 'center'
        // opacity: interpolate
      }}
    >
      <Image
        onLoadEnd={() => {
          if (Platform.OS !== 'web') SplashScreen.hide()
        }}
        // resizeMode='contain'
        source={require('../assets/images/already.png')}
        style={{
          // flex: 1,
          height: 256,
          width: 256
        }}
      />
      <Animated.View style={{
        position: 'absolute',
        bottom: -height * 0.25,
        // left: width * 0.333,
        zIndex: 10,
        transform: [{
          translateY: rizzleAnim
        }]
      }}>
        <Text
          style={{
            fontFamily: 'PTSerif-Bold',
            color: hslString('logo3'),
            fontSize: 40 * fontSizeMultiplier(),
            textAlign: 'center'
          }}
        >Already</Text>
      </Animated.View>
    </Animated.View>
}