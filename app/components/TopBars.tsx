import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Animated,
  Dimensions,
  StatusBar,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'
import { 
  HIDE_ALL_BUTTONS,
  SHOW_ITEM_BUTTONS
} from '../store/ui/types'

import TopBarContainer from '../containers/TopBar'
import { getStatusBarHeight, hasNotchOrIsland } from '../utils'
import { Item } from '../store/items/types'
import TopBar from './TopBar'
import isEqual from 'lodash.isequal'

interface TopBarsProps {
  index: number,
  initialBufferIndex: number,
  items: Item[],
  navigation: any,
  openFeedModal: (feedId: string) => void,
  panAnim?: Animated.Value,
  setClampedScrollAnimSetterAndListener: (setter: (anim: Animated.Value) => void, listener: any) => void,
  setScrollAnimSetterAndListener: (setter: (anim: Animated.Value) => void) => void,
  setBufferIndexChangeListener: (setter: (index: number) => void) => void
}

interface clampedScrollListener {
  onStatusBarDown: () => void
  onStatusBarDownBegin: () => void
  onStatusBarUp: () => void
  onStatusBarUpBegin: () => void
  onStatusBarReset: () => void
}

interface rangeMap {
  inputRange: number[]
  outputRange: number[]
}

const initialClampedScrollAnim = new Animated.Value(0)

function TopBars (props: TopBarsProps) {
  const {
    index,
    initialBufferIndex = 1,
    items,
    navigation,
    openFeedModal,
    panAnim,
    setClampedScrollAnimSetterAndListener,
    setScrollAnimSetterAndListener,
    setBufferIndexChangeListener
  }  = props 
  if (!items) return null
  const screenWidth = Dimensions.get('window').width
  const panAnimDivisor = screenWidth

  const [clampedScrollAnim, setClampedScrollAnim] = useState<Animated.Value>(initialClampedScrollAnim)
  const [scrollAnim, setScrollAnim] = useState(new Animated.Value(0))
  const [bufferIndex, setBufferIndex] = useState(initialBufferIndex)
  const [clampedAnimatedValue, setClampedAnimatedValue] = useState<Animated.AnimatedDiffClamp<string | number>>()
  const dispatch = useDispatch()
  // const prevItemsRef = useRef(items)
  // useEffect(() => {
  //   prevItemsRef.current = items
  // }, [])
  // const prevItems = prevItemsRef.current

  useEffect(() => {
    const listener = {
      onStatusBarDown: () => {
        StatusBar.setHidden(false, 'slide')
        dispatch({ type: SHOW_ITEM_BUTTONS })
      },
      onStatusBarDownBegin: () => {},
      onStatusBarUp: () => {
        StatusBar.setHidden(true, 'slide')
        dispatch({ type: HIDE_ALL_BUTTONS })
      },
      onStatusBarUpBegin: () => {
        StatusBar.setHidden(true, 'slide')
      },
      onStatusBarReset: () => {
        StatusBar.setHidden(false, 'slide')
        dispatch({ type: SHOW_ITEM_BUTTONS })
      }
    }
    setClampedScrollAnimSetterAndListener(setClampedScrollAnim, listener)
    setBufferIndexChangeListener(setBufferIndex)
    setScrollAnimSetterAndListener(setScrollAnim)
  }, [])

  // useEffect(() => {
  //   if (props.initialBufferIndex !== initialBufferIndex && items !== prevItems) {
  //     setBufferIndex(initialBufferIndex)
  //   }
  // }, [initialBufferIndex, items])

  const opacityRanges: rangeMap[] = items && items.map((item, index) => {
    let inputRange = [panAnimDivisor * index, panAnimDivisor * (index + 0.5), panAnimDivisor * (index + 1)]
    let outputRange = [1, 1, 0]
    if (index > 0) {
      inputRange.unshift(panAnimDivisor * (index - 1))
      outputRange.unshift(0)
    }
    return { inputRange, outputRange }
  })

  const titleTransformRanges: rangeMap[] = items && items.map((item, index) => {
    let inputRange = [panAnimDivisor * index, panAnimDivisor * (index + 1)]
    let outputRange = [0, -20]
    if (index > 0) {
      inputRange = [0, panAnimDivisor * (index - 1)].concat(inputRange)
      outputRange = [30, 30].concat(outputRange)
    }
    return { inputRange, outputRange }
  })

  const opacityAnims: (Animated.AnimatedInterpolation<any> | 0)[] = items.map((item, i) => panAnim ?
      panAnim.interpolate(opacityRanges[i]) :
      0)
  const titleTransformAnims: (Animated.AnimatedInterpolation<any> | 0)[] = items.map((item, i) => panAnim ?
      panAnim.interpolate(titleTransformRanges[i]) :
      0)

  useEffect(() => {
    setClampedAnimatedValue(Animated.diffClamp(
      clampedScrollAnim,
      0 - getStatusBarHeight(),
      0
    ))
  }, [clampedScrollAnim])

  const isVisible = (i: number) => i === bufferIndex
  const topBars = items.map((item, i) => (
    <TopBar
      clampedAnimatedValue={clampedAnimatedValue && isVisible(i) ? clampedAnimatedValue : new Animated.Value(0)}
      index={index > 0 ? index + i - 1 : index + i}
      isVisible={isVisible(i)}
      item={item}
      key={item ? item._id : new Number(i).toString()}
      navigation={navigation}
      opacityAnim={opacityAnims ? opacityAnims[i] : new Animated.Value(1)}
      openFeedModal={openFeedModal}
      scrollAnim={scrollAnim || new Animated.Value(0)}
      titleTransformAnim={titleTransformAnims ? titleTransformAnims[i] : new Animated.Value(0)}
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
  // return null

}

export default TopBars