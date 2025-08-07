import { Item, ItemType, SAVE_ITEM, SET_KEEP_UNREAD, TOGGLE_MERCURY_VIEW, UNSAVE_ITEM } from '@/store/items/types'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ActionSheetIOS,
  Dimensions,
  Platform,
  View,
  useWindowDimensions,
} from 'react-native'
import Reanimated, {
  useAnimatedStyle,
  useAnimatedProps,
  withDelay,
  withTiming,
  interpolate,
  Extrapolate,
  SharedValue
} from 'react-native-reanimated'
import { getRizzleButtonIcon } from '@/utils/rizzle-button-icons'
import { hslString } from '@/utils/colors'
import { getMargin } from '@/utils/dimensions'
import { hasNotchOrIsland } from '@/utils/dimensions'
import type { RootState } from '@/store/reducers'
import type { Feed } from '@/store/feeds/types'
import { ADD_ITEM_TO_CATEGORY } from '@/store/categories/types'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { getItem as getItemSQLite } from "@/storage/sqlite"
import { getItem as getItemIDB } from "@/storage/idb-storage"
import type { Newsletter } from '@/store/newsletters/types'
import { useColor } from '@/hooks/useColor'
import { useAnimation } from './AnimationContext'

import ReamsButton from './ReamsButton'
import { useBufferedItem } from './bufferedItemsStore'
import { getHost } from '@/utils'

export const translateDistance = 80

// item.feed, item.url, item.showMercuryContent, item.isKeepUnread, item.isSaved
// itemInflated.content_mercury
// feed.color, feed.isMercury

interface ButtonSetProps {
  itemIndex: number
}

export default function ButtonSet({
  itemIndex,
}: ButtonSetProps) {
  // Get item from store using itemIndex
  const item = useBufferedItem(itemIndex)

  // Early return if no item provided
  if (!item) {
    return null
  }

  // Get animation context for button visibility with error handling
  const animationContext = useAnimation()
  const buttonsVisibles = animationContext.buttonsVisibles
  const screenWidth = useWindowDimensions().width
  const horizontalScroll = animationContext.horizontalScroll

  const pageWidth = useWindowDimensions().width

  const itemFeed = useSelector((state: RootState) => {
    let feed: Feed | Newsletter | undefined
    if (state.feeds?.feeds && state.newsletters?.newsletters && item) {
      feed = state.feeds.feeds.find(f => f._id === item.feed_id)
      if (!feed) {
        feed = state.newsletters.newsletters.find(n => n._id === item.feed_id)
      }
      return feed
    }
  })
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const [feed, setFeed] = useState<Feed | Newsletter | undefined>()

  // the stringified items actually only consist of _ids
  // this allows us to keep track of the real state of items
  // for keepUnread etc.
  const actualItem = useSelector((state: RootState) => displayMode === ItemType.unread ?
    state.itemsUnread.items.find(i => i._id === item._id) :
    state.itemsSaved.items.find(i => i._id === item._id))

  useEffect(() => {
    setFeed(itemFeed)
  }, [itemFeed])

  let isItemMercury: boolean | undefined
  useEffect(() => {
    isItemMercury = item &&
      (item.showMercuryContent || feed?.isMercury) &&
      !!item?.content_mercury
  }, [item, item, feed])

  let isKeepUnread: boolean | undefined
  useEffect(() => {
    isKeepUnread = item.isKeepUnread
  }, [item])

  const dispatch = useDispatch()

  const setSaved = (item: Item, isSaved: boolean) => {
    if (isSaved) {
      dispatch({
        type: SAVE_ITEM,
        item,
        savedAt: Date.now()
      })
      dispatch({
        type: ADD_ITEM_TO_CATEGORY,
        itemId: item._id,
        categoryId: 'inbox'
      })
    } else {
      dispatch({
        type: UNSAVE_ITEM,
        item
      })
    }
  }

  const showShareSheet = () => {
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: item.url,
      message: '',
    },
      (error) => {
        console.error(error)
      },
      (success, method) => {
      })
  }

  const toggleMercury = () => {
    dispatch({
      type: TOGGLE_MERCURY_VIEW,
      item
    })
  }

  const setKeepUnread = (item: Item, keepUnread: boolean) => {
    dispatch({
      type: SET_KEEP_UNREAD,
      item,
      keepUnread
    })
  }

  const launchBrowser = async () => {
    if (!item?.url) return
    if (Platform.OS === 'web') {
      window.open(item.url, '_blank')
    } else {
      try {
        await InAppBrowser.isAvailable()
        InAppBrowser.open(item.url, {
          // iOS Properties
          dismissButtonStyle: 'close',
          preferredBarTintColor: hslString('rizzleBG'),
          preferredControlTintColor: hslString('rizzleText'),
          animated: true,
          modalEnabled: true,
          enableBarCollapsing: true,
        })
      } catch (error) {
        console.log('openLink', error)
      }
    }
  }

  // do we already have the color?
  const host = getHost(item, feed)
  const cachedColor = useSelector((state: RootState) => state.hostColors.hostColors.find(hc => hc.host === host)?.color)
  const hookColor = useColor(host, cachedColor === undefined)
  const color = hookColor || cachedColor

  const borderColor = (isDarkMode || !color) ? hslString('rizzleText', 'ui') : color
  const backgroundColor = hslString('buttonBG')
  const borderWidth = 1

  // Reanimated animated style for button visibility
  // This replaces the old visibleAnim Animated.Value approach
  const buttonContainerStyle = useAnimatedStyle(() => {
    // Horizontal opacity animation (fading between pages)
    let inputRange = [pageWidth * itemIndex, pageWidth * (itemIndex + 1)]
    let outputRange = [1, 0]
    if (itemIndex > 0) {
      inputRange.unshift(pageWidth * (itemIndex - 1))
      outputRange.unshift(0)
    }

    const horizontalOpacity = interpolate(
      horizontalScroll.value,
      inputRange,
      outputRange,
      Extrapolate.CLAMP
    )

    return {
      // useAnimatedStyle is called once on the JS thread and then on the UI thread
      // this leads to a flash of the wrong ButtonSet when the carousel is re-rendered
      opacity: global._WORKLET ? horizontalOpacity : 0
    }
  }, [itemIndex, pageWidth, screenWidth])

  // Individual button animated styles with staggered timing
  const duration = 150
  const staggerDelay = 100 // ms between each button animation
  const shareButtonStyle = useAnimatedStyle(() => {
    const isCurrent = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    if (!isCurrent) return {}

    const isVisible = buttonsVisibles[itemIndex].value === 1

    return {
      transform: [{
        translateY: withTiming(
          isVisible ? 0 : translateDistance,
          { duration }
        )
      }]
    }
  }, [itemIndex, screenWidth])

  const saveButtonStyle = useAnimatedStyle(() => {
    const isCurrent = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    if (!isCurrent) return {}

    const isVisible = buttonsVisibles[itemIndex].value === 1

    return {
      transform: [{
        translateY: withDelay(staggerDelay, withTiming(
          isVisible ? 0 : translateDistance,
          { duration }
        ))
      }]
    }
  }, [itemIndex, screenWidth])

  const keepUnreadButtonStyle = useAnimatedStyle(() => {
    const isCurrent = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    if (!isCurrent) return {}

    const isVisible = buttonsVisibles[itemIndex].value === 1

    return {
      transform: [{
        translateY: withDelay(staggerDelay * 2, withTiming(
          isVisible ? 0 : translateDistance,
          { duration }
        ))
      }]
    }
  }, [itemIndex, screenWidth])

  const browserButtonStyle = useAnimatedStyle(() => {
    const isCurrent = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    if (!isCurrent) return {}

    const isVisible = buttonsVisibles[itemIndex].value === 1

    return {
      transform: [{
        translateY: withDelay(staggerDelay * 3, withTiming(
          isVisible ? 0 : translateDistance,
          { duration }
        ))
      }]
    }
  }, [itemIndex, screenWidth])

  const mercuryButtonStyle = useAnimatedStyle(() => {
    const isCurrent = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    if (!isCurrent) return {}

    const isVisible = buttonsVisibles[itemIndex].value === 1

    return {
      transform: [{
        translateY: withDelay(staggerDelay * 4, withTiming(
          isVisible ? 0 : translateDistance,
          { duration }
        ))
      }]
    }
  }, [itemIndex, screenWidth])

  const animatedPointerEvents = useAnimatedProps(() => {
    const isCurrent = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    return { pointerEvents: isCurrent ? ('box-none' as const) : ('none' as const) }
  })

  const showShareButton = Platform.OS === 'ios'
  const showMercuryButton = !!item?.content_mercury

  // Get styles function - simplified version of the original
  const getStyles = (allButtons: boolean) => {
    const screenDimensions = Dimensions.get('window')
    return {
      base: {
        position: 'absolute' as const,
        bottom: 0,
        width: screenDimensions.width < 500 ?
          '100%' :
          500,
        zIndex: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: allButtons ? 'space-between' : 'space-around',
        alignSelf: 'center',
        marginBottom: getMargin() / (hasNotchOrIsland() || Platform.OS === 'android' ? 1 : 2),
        paddingLeft: getMargin() / (screenDimensions.width < 321 ? 2 : 1),
        paddingRight: getMargin() / (screenDimensions.width < 321 ? 2 : 1)
      }
    }
  }

  return (
    <Reanimated.View
      animatedProps={animatedPointerEvents}
      style={[
        getStyles(showShareButton && showMercuryButton).base,
        buttonContainerStyle
      ]}>

      {showShareButton && (
        <ReamsButton
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          label='share'
          style={{
            ...shareButtonStyle,
            paddingLeft: 0,
          }}
          onPress={showShareSheet}
        >
          {getRizzleButtonIcon('showShareSheetIcon', borderColor, backgroundColor, true, false)}
        </ReamsButton>
      )}
      <ReamsButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        iconOff={displayMode == ItemType.saved ?
          getRizzleButtonIcon('trash', borderColor, backgroundColor, true, false) :
          getRizzleButtonIcon('saveButtonIconOff', borderColor, backgroundColor, true, false)}
        iconOn={displayMode == ItemType.saved ?
          getRizzleButtonIcon('trash', borderColor, backgroundColor, true, false) :
          getRizzleButtonIcon('saveButtonIconOn', borderColor, backgroundColor, true, false)}
        initialToggleState={item?.isSaved}
        isToggle={displayMode === ItemType.unread}
        label={displayMode === ItemType.saved ? 'delete' : 'save'}
        style={{
          ...saveButtonStyle,
          paddingHorizontal: displayMode === ItemType.unread ? 0 : 7,
        }}
        onPress={() => setSaved(item, !item.isSaved)}
      >
        {displayMode === ItemType.saved && getRizzleButtonIcon('trash', borderColor, backgroundColor, true, false)}
      </ReamsButton>
      {displayMode == ItemType.unread && __DEV__ && (
        <ReamsButton
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          iconOff={getRizzleButtonIcon('keep-unread-off', borderColor, backgroundColor, true, false)}
          iconOn={getRizzleButtonIcon('keep-unread-on', borderColor, backgroundColor, true, false)}
          initialToggleState={item.isKeepUnread}
          isToggle={true}
          onPress={() => setKeepUnread(item, !actualItem?.isKeepUnread)}
          style={keepUnreadButtonStyle}
        >
        </ReamsButton>
      )}
      <ReamsButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        label='browser'
        style={{
          ...browserButtonStyle,
          paddingLeft: 0,
        }}
        onPress={launchBrowser}
      >
        {getRizzleButtonIcon('launchBrowserIcon', borderColor, backgroundColor, true, false)}
      </ReamsButton>
      {showMercuryButton && (
        <ReamsButton
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          iconOff={getRizzleButtonIcon('toggleMercuryViewIconOff', borderColor, backgroundColor, true, false)}
          iconOn={getRizzleButtonIcon('toggleMercuryViewIconOn', borderColor, backgroundColor, true, false)}
          initialToggleState={item.showMercuryContent}
          isToggle={true}
          label='mercury'
          style={{
            ...mercuryButtonStyle,
            paddingLeft: 0,
          }}
          onPress={toggleMercury}
        />
      )}
    </Reanimated.View>
  )
}
