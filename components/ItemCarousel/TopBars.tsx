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
import { useBufferedItems } from './BufferedItemsContext'
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
  const { bufferStartIndex, bufferedItems } = useBufferedItems()
  const screenWidth = useWindowDimensions().width

  if (!bufferedItems) return null

  const topBars = bufferedItems.map((item, i) => {
    // Calculate horizontal opacity based on scroll position
    const bufferItemIndex = i
    const pageWidth = screenWidth

    return (
      <TopBar
        key={item ? item._id : i.toString()}
        emitter={emitter}
        isTitleOnly={isTitleOnly}
        item={item}
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
