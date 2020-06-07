import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Animated,
  Dimensions,
  Easing,
  Text,
  View
} from 'react-native'
import AnimatedEllipsis from './AnimatedEllipsis'
import { hslString } from '../utils/colors'
import { isIphoneX, fontSizeMultiplier } from '../utils'
import {
  textInfoMonoStyle
} from '../utils/styles'

const screenWidth = Dimensions.get('window').width
const offscreenDistance = -28
const transformAnim = new Animated.Value(0)

export default function Message (props) {
  const [isVisible, setVisible] = useState([])
  const [visibleMessage, setVisibleMessage] = useState([])

  const message = useSelector(state => state.toolbar.message)

  if (isVisible && message.length === 0) {
    Animated.timing(transformAnim, {
      toValue: offscreenDistance,
      easing: Easing.out(Easing.quad),
      useNativeDrive: true
    }).start(_ => {
      setVisibleMessage(message)
      setVisible(false)
    })
  } else if (!isVisible && message.length > 0) {
    setVisibleMessage(message)
    Animated.timing(transformAnim, {
      toValue: 0,
      easing: Easing.out(Easing.quad),
      duration: 200,
      useNativeDrive: true
    }).start(_ => {
      setVisible(true)
    })
  }

  return /*message.length === 0 ? null :*/ (
    <Animated.View style={{
      position: 'absolute',
      top: isIphoneX() ? 38 : 6 * fontSizeMultiplier(),
      width: screenWidth,
      flex: 1,
      flexAlign: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: transformAnim.interpolate({
        inputRange: [offscreenDistance, offscreenDistance * 0.9, 0],
        outputRange: [0, 1, 1]
      }),
      transform: [{
        translateY: transformAnim
      }]
    }}>
      <View style={{
        backgroundColor: hslString('logo1'),
        width: 'auto',
        // height: 20,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 3,
        borderRadius: (13 * fontSizeMultiplier() + 10) / 2,
        shadowRadius: 20,
        shadowColor: 'black',
        shadowOpacity: 0.2,
        flexDirection: 'row'
      }}>
        <Text style={{
          ...textInfoMonoStyle,
          fontSize: 13 * fontSizeMultiplier(),
          lineHeight: 13 * fontSizeMultiplier(),
          color: hslString('white')
        }}>{visibleMessage}<AnimatedEllipsis style={{ 
          color: hslString('white'),
          marginLeft: -2
        }} /></Text>
      </View>
    </Animated.View>
  )
}
