import React from 'react'
import {
  Animated,
  Dimensions,
  View
} from 'react-native'
import TopBarContainer from '../containers/TopBar'
import { isIphoneX } from '../utils'
import Reactotron from 'reactotron-react-native'

export const STATUS_BAR_HEIGHT = 70 + (isIphoneX() ? 44 : 22)

const screenWidth = Dimensions.get('window').width

function TopBars ({
  index,
  isOnboarding,
  items,
  numItems,
  panAnim,
  setTopBarScrollAnimSetterAndListener
}) {
  panAnim = panAnim || new Animated.Value(0)
  const panAnimDivisor = screenWidth

  if (!items) return null

  console.log('RENDERING TOPBARS')
  Reactotron.log('RENDERING TOPBARS')

  const opacityRanges = items && items.map((item, index) => {
    let inputRange = [panAnimDivisor * index, panAnimDivisor * (index + 0.9), panAnimDivisor * (index + 1)]
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

  const topBars = items.map((item, i) => (
    <TopBarContainer
      key={item ? item._id : i}
      item={item}
      opacityAnim={opacityAnims[i]}
      clampedScrollAnim={/*this.state.clampedScrollAnims[item._id]*/new Animated.Value(0)}
      titleTransformAnim={titleTransformAnims[i]}
      panTransformAnim={panTransformAnim}
      isVisible={i === 1}
      index={index + i - 1}
      numItems={numItems}
      setTopBarScrollAnimSetterAndListener={setTopBarScrollAnimSetterAndListener}
    />
  ))

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      width: '100%',
      zIndex: 10
    }}>
      {topBars}
    </View>
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
    prevProps.panAnim === nextProps.panAnim/* ||
    this.state.clampedScrollAnims !== nextState.clampedScrollAnims ||
    prevProps.scrollAnim !== nextProps.scrollAnim ||
    ((prevProps.panAnim && nextProps.panAnim) ?
      prevProps.panAnim.__getValue() !== nextProps.panAnim.__getValue() :
      prevProps.panAnim !== nextProps.panAnim)
  )*/
}

export default React.memo(TopBars, areEqual)
