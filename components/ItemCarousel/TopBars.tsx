import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  Platform,
  StatusBar,
  View,
  useWindowDimensions
} from 'react-native'
import Reanimated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'
import {
  HIDE_ALL_BUTTONS,
  SHOW_ITEM_BUTTONS
} from '@/store/ui/types'

import { getStatusBarHeight } from '@/utils/dimensions'
import { Item } from '@/store/items/types'
import TopBar from './TopBar'
import { useAnimation } from './AnimationContext'
import { useBufferedItemsLength } from './bufferedItemsStore'
import { useBufferedItemsManager } from './useBufferedItemsManager'
import { useNavigation } from '@react-navigation/native'

interface TopBarsProps {
  emitter: any,
  isTitleOnly: boolean | undefined
}

function TopBars(props: TopBarsProps) {
  const {
    emitter,
    isTitleOnly
  } = props

  const navigation = useNavigation()
  const screenWidth = useWindowDimensions().width

  // Get buffered items length from Zustand store
  const bufferedItemsLength = useBufferedItemsLength()

  if (bufferedItemsLength === 0) return null

  const topBars = Array.from({ length: bufferedItemsLength }, (_, i) => {
    const pageWidth = screenWidth

    return (
      <TopBar
        key={`top-bar-${i}`}
        emitter={emitter}
        isTitleOnly={isTitleOnly}
        itemIndex={i}
        pageWidth={pageWidth}
      />
    )
  })

  return (
    <Reanimated.View style={{
      position: 'absolute',
      top: 0,
      width: '100%',
      zIndex: 10
    }}>
      {topBars}
    </Reanimated.View>
  )
}

export default TopBars
