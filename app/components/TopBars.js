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
  navigation,
  numItems,
  panAnim,
  setScrollAnimSetterAndListener,
  setBufferIndexChangeListener
}) {
  if (!items) return null
  panAnim = panAnim || new Animated.Value(0)
  const panAnimDivisor = screenWidth

  const [clampedScrollAnim, setClampedScrollAnim] = useState(new Animated.Value(0))
  const [bufferIndex, setBufferIndex] = useState(index > 0 ? 1 : 0)
  const dispatch = useDispatch()

  const scrollListener = {
    onStatusBarDown: () => {
      StatusBar.setHidden(false)
      dispatch({ type: 'UI_SHOW_ITEM_BUTTONS' })
    },
    onStatusBarDownBegin: () => {},
    onStatusBarUp: () => {
      StatusBar.setHidden(true)
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
  setBufferIndexChangeListener(setBufferIndex)

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

  // need to make a kind of sawtooth so that each panAnimDivisor will reach STATUS_BAR_HEIGHT
  // I think....
  let inputRange = []
  let outputRange = []
  const hasScrollOffset = (item) => (
    item.scrollRatio && (items.scrollRatio.html || items.scrollRatio.mercury)
  )

  for (var i = 0; i < items.length; i++) {
    const tooth = panAnimDivisor * i
    const value = hasScrollOffset ? 0 : STATUS_BAR_HEIGHT
    inputRange = inputRange.concat([tooth])
    outputRange = outputRange.concat([value])
  }

  // const panTransformTopBarAnim = index > 0 ?
  //   panAnim.interpolate({
  //     inputRange: [panAnimDivisor * index - 1, panAnimDivisor * index, panAnimDivisor * index + 1],
  //     outputRange: [
  //       STATUS_BAR_HEIGHT,
  //       0,
  //       STATUS_BAR_HEIGHT
  //     ]
  //   }) :
  //   panAnim.interpolate({
  //     inputRange: [0, panAnimDivisor, panAnimDivisor + 1, panAnimDivisor * 2],
  //     outputRange: [0, STATUS_BAR_HEIGHT]
  //   })

  const panTransformTopBarAnim = outputRange.length > 2 ?
    panAnim.interpolate({ inputRange, outputRange }) :
    new Animated.Value(0)

  const clampedAnimatedValue = Animated.diffClamp(
    // Animated.add(clampedScrollAnim, panTransformTopBarAnim),
    clampedScrollAnim,
    -STATUS_BAR_HEIGHT,
    0
  )

  const topBars = items.map((item, i) => (
    <TopBarContainer
      clampedAnimatedValue={clampedAnimatedValue}
      key={item ? item._id : i}
      item={item}
      navigation={navigation}
      opacityAnim={opacityAnims[i]}
      titleTransformAnim={titleTransformAnims[i]}
      isVisible={i === bufferIndex}
      index={index + i - 1}
      numItems={numItems}
    />
  ))

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 0,
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
