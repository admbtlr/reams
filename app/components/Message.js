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
  textInfoStyle,
  textInfoBoldStyle

} from '../utils/styles'

const screenWidth = Dimensions.get('window').width
const offscreenDistance = 130
const transformAnim = new Animated.Value(0)

export default function Message (props) {
  const [isVisible, setVisible] = useState([])
  const [visibleMessage, setVisibleMessage] = useState([])

  const message = useSelector(state => state.ui.message)
  const buttonsVisible = useSelector(state => state.ui.itemButtonsVisible)
  // const message = "This is the message"
  // const visibleMessage = "This is the visible message"
  // const isVisible = false
  // const setVisible = () => true
  // const setVisibleMessage = () => true

  if (isVisible && message.length === 0) {
    Animated.timing(transformAnim, {
      toValue: offscreenDistance,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    }).start(_ => {
      setVisibleMessage(message)
      setVisible(false)
    })
  } else if (!isVisible && message.length > 0) {
    setVisibleMessage(message)
    Animated.timing(transformAnim, {
      toValue: buttonsVisible ? 0 : 60,
      easing: Easing.out(Easing.quad),
      duration: 200,
      delay: buttonsVisible ? 0 : 600,
      useNativeDriver: true
    }).start(_ => {
      setVisible(true)
    })
  } else if (isVisible && message.length > 0) {
    // this means that the button visibility has changed (I think)
    Animated.timing(transformAnim, {
      toValue: buttonsVisible ? 0 : 60,
      easing: Easing.out(Easing.quad),
      duration: 200,
      delay: buttonsVisible ? 0 : 600,
      useNativeDriver: true
    }).start()
  }

  return /*message.length === 0 ? null :*/ (
    <Animated.View style={{
      position: 'absolute',
      bottom: 90,
      width: screenWidth,
      flex: 1,
      flexAlign: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: transformAnim.interpolate({
        inputRange: [0, offscreenDistance * 0.1, offscreenDistance],
        outputRange: [0.95, 0.95, 0.95]
      }),
      transform: [{
        translateY: transformAnim
      }]
    }}>
      <View style={{
        backgroundColor: hslString('buttonBG'),
        borderWidth: 1,
        borderColor: hslString('rizzleFG', '', 0.5),
        width: 'auto',
        // height: 20,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 10,
        paddingBottom: 8,
        borderRadius: (18 * fontSizeMultiplier() + 28) / 2,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 5
        },
    flexDirection: 'row'
      }}>
        <Text style={{
          ...textInfoBoldStyle('rizzleFG'),
          fontSize: 14 * fontSizeMultiplier(),
          lineHeight: 20 * fontSizeMultiplier(),
        }}>{visibleMessage}<AnimatedEllipsis style={{ 
          color: hslString('rizzleText'),
          marginLeft: -2
        }} /></Text>
      </View>
    </Animated.View>
  )
}
