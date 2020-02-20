import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Animated,
  Dimensions,
  Text,
  View
} from 'react-native'
import { hslString } from '../utils/colors'
import { isIphoneX, fontSizeMultiplier } from '../utils'
import {
  textInfoStyle
} from '../utils/styles'

const screenWidth = Dimensions.get('window').width

const transformAnim = new Animated.Value(-20)

export default function Message (props) {
  const [isVisible, setVisible] = useState([])

  const message = useSelector(state => {
    return state.toolbar.message.length === 0 ?
      'Message here' :
      state.toolbar.message
  })

  if (isVisible && message.length === 0) {
    setVisible(false)
  } else if (!isVisible && message.length > 0) {
    setVisible(true)
  }

  return /*message.length === 0 ? null :*/ (
    <View style={{
      position: 'absolute',
      top: isIphoneX ? 38 : 2,
      width: screenWidth,
      flex: 1,
      flexAlign: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
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
        shadowOpacity: 0.4
      }}>
        <Text style={textInfoStyle}>{message}</Text>
      </View>
    </View>
  )
}
