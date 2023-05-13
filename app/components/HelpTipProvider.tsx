import React from 'react'
import { Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/reducers'
import { textInfoStyle } from '../utils/styles'
import { fontSizeMultiplier, getMargin } from '../utils'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { TouchableOpacity } from 'react-native'
import { xIcon } from '../utils/icons'
import { HIDE_HELPTIP } from '../store/ui/types'
import { hslString } from '../utils/colors'

const helpTips:{ key: string, text: string }[] = [{
  key: 'feedsScreen',
  text: 'Tap a feed or tag to read the articles, tap and hold to edit.' 
}]

export default function HelpTipProvider () {
  const shouldBeVisible = useSelector((state: RootState) => state.ui.isHelpTipVisible)
  const key = useSelector((state: RootState) => state.ui.helpTipKey)
  const displayedHelpTips = useSelector((state: RootState) => state.ui.displayedHelpTips)
  const isVisible = shouldBeVisible && key !== null && !displayedHelpTips?.includes(key)
  const helpTip = helpTips.find(tip => tip.key === key)
  const dispatch = useDispatch()

  return (
    <View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
      pointerEvents='box-none'
    >
      { isVisible && helpTip && (
        <View
          style={{
            position: 'absolute',
            flex: 1,
            flexDirection: 'row',
            bottom: 0,
            left: 0,
            width: '100%',
            // height: 60,
            backgroundColor: 'rgba(30, 30, 30,0.8)',
            padding: getMargin(),
          }}
        >
          <View style={{
            flex: 1, 
            // backgroundColor: 'blue'
          }}>
            <Text
              style={{
                ...textInfoStyle,
                color: 'hsla(0, 0%, 100%, 0.9)',
                // fontSize: 12 * fontSizeMultiplier(),
              }}
            >{ helpTip.text }</Text>
          </View>
          <View style={{
            width: 24 * fontSizeMultiplier(),
            // backgroundColor: 'red',
          }}>
            <TouchableOpacity
              onPress={() => { dispatch({ type: HIDE_HELPTIP, key })}}
              style={{
                marginTop: -3,
                // backgroundColor: 'green',
                width: 32 * fontSizeMultiplier(),
                justifyContent: 'center',
                alignItems: 'flex-end',
                flex: 1
                // flex: 0,
                // padding: 10,
              //   paddingTop: 20,
              //   paddingRight: 0,
              //   width: 10 + 32 * fontSizeMultiplier()
              }}>
              {xIcon('white', 24)}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}