import React from 'react'
import { Animated, LayoutAnimation, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { getMargin } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { textInfoStyle, textLabelStyle } from '../utils/styles'
import { hslString } from '../utils/colors'
import { SET_FILTER } from 'store/config/types'

export default function FeedFilterIndicator ({ scrollAnim }) {
  const currentFilterIds = useSelector(state => state.config.feedFilter)
  const currentFeeds = useSelector(state => state.feeds.feeds.find(feed => currentFilterIds.indexOf(feed._id) > -1))
  const dispatch = useDispatch()

  const style = {
    ...textLabelStyle(),
    fontSize: 14 * fontSizeMultiplier(),
    fontFamily: 'IBMPlexSans'
  }

  const expansionRatio = 0.1

  return (
    currentFilterIds.length === 1 &&
      <>
        <Animated.View style={{
          flexDirection: "row",
          flexAlign: "center",
          marginVertical: getMargin() / 2,
          transform: [{
            translateY: scrollAnim ? scrollAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0 - expansionRatio - 5 * expansionRatio, 0, 0]
            }) : 0
          }]
        }}>
          <Text style={{
            flex: 1,
            ...style,
            alignSelf: 'center',
          }}>Currently filtered for stories from <Text style={{
            fontFamily: 'IBMPlexSans-Bold'
          }}>{currentFeeds[0].title}</Text></Text>
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
              dispatch({ type: SET_FILTER, filter: null })
            }}
          >
            <View style={{
              flex: 0,
              ...style
            }}>
              { getRizzleButtonIcon('x', hslString('rizzleText')) }
            </View>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{
          height: 1,
          width: '100%',
          backgroundColor: hslString('rizzleText', '', 0.2),
          transform: [{
            translateY: scrollAnim ? scrollAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0 - expansionRatio - 4 * expansionRatio, 0, 0]
            }) : 0
          }]
        }} />
      </>       
  )
}
