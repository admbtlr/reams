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
import { useRenderedWindow } from './bufferedItemsStore'
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

  // One TopBar per rendered window slot only (≤ window size)
  const renderedWindow = useRenderedWindow()

  if (renderedWindow.length === 0) return null

  const topBars = renderedWindow.map(({ slotIndex }) => {
    const pageWidth = screenWidth

    return (
      <TopBar
        key={`top-bar-${slotIndex}`}
        emitter={emitter}
        isTitleOnly={isTitleOnly}
        slotIndex={slotIndex}
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
