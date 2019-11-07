import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Animated,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import ImageResizeMode from 'react-native/Libraries/Image/ImageResizeMode'
import SplashScreen from 'react-native-splash-screen'

import {hslString} from '../utils/colors'

export default function Splash ({ fadeOut }) {
  const { height, width } = Dimensions.get('window')
  const rizzleAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(1)
  const fadeAnim = new Animated.Value(0)

  const [isVisible, setVisible] = useState(true)

  // const hasRehydrated = useSelector(state => )
  // if (!hasLaunched or hasRehydrated) {
  //   setVisible(false)
  // }

  useEffect(() => {
    // do the scaleAnim then set to opacity of 0
  }, [isVisible])

  useEffect(() => {
    fadeOut || Animated.spring(
      rizzleAnim,
      {
        toValue: -height * 0.333,
        delay: 1000,
        speed: 8,
        bounciness: 18,
        useNativeDriver: true
      }).start()
  })

  // return <Animated.View
  //   style={{
  //     position: 'absolute',
  //     top: 0,
  //     left: 0,
  //     bottom: 0,
  //     right: 0,
  //     backgroundColor: hslString('rizzleBG'),
  //     opacity: scaleAnim.interpolate({
  //       inputRange: [1, 10],
  //       outputRange: [1, 0]
  //     }),
  //     transform: [{
  //       scale: scaleAnim
  //     }]
  //     // opacity: interpolate
  //   }}>
  //     <Image
  //       onLoadEnd={() => SplashScreen.hide()}
  //       resizeMode='cover'
  //       source={require('../assets/images/splash.png')}
  //       style={{
  //         flex: 1,
  //         height: undefined,
  //         width: undefined
  //       }}
  //     />
  //     <Animated.View style={{
  //       position: 'absolute',
  //       bottom: -height * 0.25,
  //       left: width * 0.25,
  //       zIndex: 10,
  //       transform: [{
  //         translateY: rizzleAnim
  //       }]
  //     }}>
  //       <Image
  //         resizeMode='center'
  //         source={require('../assets/images/wordmark.png')}
  //         style={{
  //           flex: 1,
  //           width: width * 0.5
  //         }}
  //       />
  //     </Animated.View>
  //   </Animated.View>
  return null
}