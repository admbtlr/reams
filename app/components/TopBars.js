import React, { useState } from 'react'
import {
  Animated,
  Dimensions,
  StatusBar,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'
import TopBarContainer from '../containers/TopBar'
import { isIphoneX } from '../utils'
import { getClampedScrollAnim } from '../utils/animation-handlers'
import Reactotron from 'reactotron-react-native'

export const STATUS_BAR_HEIGHT = 70 + (isIphoneX() ? 44 : 22)

const screenWidth = Dimensions.get('window').width

function TopBars ({
  index,
  isOnboarding,
  items,
  numItems,
  panAnim,
  setScrollAnimSetterAndListener
}) {
  if (!items) return null
  panAnim = panAnim || new Animated.Value(0)
  const panAnimDivisor = screenWidth

  const [clampedScrollAnim, setClampedScrollAnim] = useState(new Animated.Value(0))
  const dispatch = useDispatch()

  const scrollListener = {
    onStatusBarDown: () => {
      StatusBar.setHidden(false)
      dispatch({ type: 'UI_SHOW_ITEM_BUTTONS' })
    },
    onStatusBarDownBegin: () => {},
    onStatusBarUp: () => {
      dispatch({ type: 'UI_HIDE_ALL_BUTTONS' })
    },
    onStatusBarUpBegin: () => {
      StatusBar.setHidden(true)
    },
    onStatusBarReset: () => {
      StatusBar.setHidden(false)
      dispatch({ type: 'UI_SHOW_ITEM_BUTTONS' })
    }
  }

  setScrollAnimSetterAndListener(setClampedScrollAnim, scrollListener)

  console.log('RENDERING TOPBARS')
  Reactotron.log('RENDERING TOPBARS')

  const opacityRanges = items && items.map((item, index) => {
    let inputRange = [panAnimDivisor * index, panAnimDivisor * (index + 0.5), panAnimDivisor * (index + 1)]
    let outputRange = [1, 1, 0]
    if (index > 0) {
      inputRange.unshift(panAnimDivisor * (index - 1))
      outputRange.unshift(0)
    }
    return { inputRange, outputRange }
  })

  const topBarOpacityRanges = items && items.map((item, index) => {
    let inputRange = [panAnimDivisor * index, panAnimDivisor * (index + 0.9), panAnimDivisor * (index + 1)]
    let outputRange = [1, 0, 0]
    if (index > 0) {
      inputRange.unshift(panAnimDivisor * (index - 1))
      outputRange.unshift(0)
    }
    return { inputRange, outputRange }
  })

  const titleTransformRanges = items && items.map((item, index) => {
    let inputRange = [panAnimDivisor * index, panAnimDivisor * (index + 1)]
    let outputRange = [0, -20]
    if (index > 0) {
      inputRange = [0, panAnimDivisor * (index - 1)].concat(inputRange)
      outputRange = [30, 30].concat(outputRange)
    }
    return { inputRange, outputRange }
  })

  const opacityAnims = items.map((item, i) => panAnim ?
      panAnim.interpolate(opacityRanges[i]) :
      1)
  const titleTransformAnims = items.map((item, i) => panAnim ?
      panAnim.interpolate(titleTransformRanges[i]) :
      0)

  // this depends on whether there is a previous item, which is the case if index > 0
  const panTransformAnim = index > 0 ?
    panAnim.interpolate({
      inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
      outputRange: [
        STATUS_BAR_HEIGHT,
        0,
        STATUS_BAR_HEIGHT
      ]
    }) :
    panAnim.interpolate({
      inputRange: [0, panAnimDivisor],
      outputRange: [0, STATUS_BAR_HEIGHT]
    })

  const clampedAnimatedValue = Animated.diffClamp(
    Animated.add(clampedScrollAnim, panTransformAnim),
    -STATUS_BAR_HEIGHT,
    0
  )

  const topBars = items.map((item, i) => (
    <TopBarContainer
      clampedAnimatedValue={clampedAnimatedValue}
      key={item ? item._id : i}
      item={item}
      opacityAnim={opacityAnims[i]}
      titleTransformAnim={titleTransformAnims[i]}
      isVisible={i === 1}
      index={index + i - 1}
      numItems={numItems}
    />
  ))

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 0,
      transform: [{
        translateY: clampedAnimatedValue
      }],
      width: '100%',
      zIndex: 10
    }}>
      {topBars}
    </Animated.View>
  )
}

function areEqual (prevProps, nextProps) {
  const mapItem = item => item ?
    {
      _id: item._id,
      feed_color: item.feed_color,
      feed_id: item.feed_id,
      feed_title: item.feed_title,
      feedIconDimensions: item.feedIconDimensions,
      hasCachedFeedIcon: item.hasCachedFeedIcon
    } :
    null

  return prevProps.items && nextProps.items &&
    JSON.stringify(prevProps.items.map(mapItem)) ===
      JSON.stringify(nextProps.items.map(mapItem)) &&
    prevProps.panAnim === nextProps.panAnim
}

export default React.memo(TopBars, areEqual)
