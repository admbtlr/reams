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
  textInfoStyle
} from '../utils/styles'

const screenWidth = Dimensions.get('window').width
const offscreenDistance = -25
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
      top: isIphoneX() ? 38 : 2,
      width: screenWidth,
      flex: 1,
      flexAlign: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      transform: [{
        translateY: transformAnim
      }]
    }}>
      <View style={{
        backgroundColor: hslString('white'),
        width: 'auto',
        height: 18,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 9,
        shadowRadius: 20,
        shadowColor: 'black',
        shadowOpacity: 0.2,
        flexDirection: 'row'
      }}>
        <Text style={textInfoStyle}>{visibleMessage}</Text>
        <AnimatedEllipsis style={{ 
          color: 'black',
          marginLeft: -2
        }} />
      </View>
    </Animated.View>
  )
}
