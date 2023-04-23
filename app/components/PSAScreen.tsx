import React, { useEffect } from 'react'
import {
  Animated,
  Dimensions,
  Linking,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import NavButton from './NavButton'
import { hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { fontSizeMultiplier, getInset, getMargin, getStatusBarHeight } from '../utils'
import { textInfoBoldStyle, textInfoStyle } from '../utils/styles'
import { ItemType, SET_DISPLAY_MODE } from '../store/items/types'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { RootState } from 'store/reducers'
import { useNavigation } from '@react-navigation/native'

export default function PSAScreen({}) {
  const isOnboarding = useSelector((state: RootState) => state.config.isOnboarding)
  const isPortrait = useSelector((state: RootState) => state.config.orientation === 'portrait')
  const dispatch = useDispatch()
  const navigation = useNavigation()


  const width = Dimensions.get('window').width
  const buttonWidth = width > 950 ?
    600 :
    '100%'

  const margin = getMargin()
  const height = Dimensions.get('window').height
  const textStyles = (color) => ({
    ...textInfoStyle(color),
    marginTop: margin,
    marginBottom: margin,
    marginLeft: 0,
    marginRight: 0,
    // padding: 8 * fontSizeMultiplier(),
  })
  const italicStyles = {
    fontFamily: 'IBMPlexSans-Italic'
  }
  const textTipStyles = (color) => ({
    ...textStyles(color),
    fontSize: 18 * fontSizeMultiplier(),
    lineHeight: 26 * fontSizeMultiplier(),
    marginTop: 0,
    marginBottom: 0,
    color
  })
  const textTipStylesBold = (color) => ({
    ...textTipStyles(color),
    fontFamily: 'IBMPlexSans-Bold'
  })

  // console.log(Config)

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hslString('rizzleBG'),
        marginBottom: 0
      }}
      testID='psa-screen'
    >
      <Text style={{
        ...textInfoBoldStyle('rizzleText'),
        // marginBottom: getMargin() * 0.5,
      }}>Deeply Superficial</Text>
    </View>
  )
}
