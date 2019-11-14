import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import ImageResizeMode from 'react-native/Libraries/Image/ImageResizeMode'
import SplashScreen from 'react-native-splash-screen'
import { useDispatch } from 'react-redux'

import { hslString } from '../utils/colors'
import { isFirstLaunch } from '../utils'

export default function Splash ({ fadeOut }) {
  const { height, width } = Dimensions.get('window')
  const rizzleAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(1)
  const fadeAnim = new Animated.Value(0)
  const dispatch = useDispatch()

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

  useEffect(() => {
    if (hasAnimated) {
      Animated.timing(
        scaleAnim,
        {
          toValue: 20,
          duration: 500
        }
      ).start(() => {
        setFaded(true)
      })
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
        if (!isVisible && !hasFaded) {
          Animated.timing(
            scaleAnim,
            {
              toValue: 20,
              duration: 500
            }
          ).start(() => {
            setFaded(true)
          })
        }
      })
  })

  hideWhenReady()

  return hasFaded ? null :
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: hslString('rizzleBG'),
        opacity: scaleAnim.interpolate({
          inputRange: [1, 20],
          outputRange: [1, 0]
        }),
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: [{
          scale: scaleAnim
        }]
        // opacity: interpolate
      }}
    >
      <Image
        onLoadEnd={() => SplashScreen.hide()}
        resizeMode='cover'
        source={require('../assets/images/splash.png')}
        style={{
          flex: 1,
          height: undefined,
          width: undefined
        }}
      />
      <Animated.View style={{
        position: 'absolute',
        bottom: -height * 0.25,
        left: width * 0.25,
        zIndex: 10,
        transform: [{
          translateY: rizzleAnim
        }]
      }}>
        <Image
          resizeMode='contain'
          source={require('../assets/images/wordmark.png')}
          style={{
            flex: 1,
            width: width * 0.5
          }}
        />
      </Animated.View>
    </Animated.View>
}