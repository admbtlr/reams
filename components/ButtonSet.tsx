import { Item, ItemInflated, ItemType, SAVE_ITEM, SET_KEEP_UNREAD, TOGGLE_MERCURY_VIEW, UNSAVE_ITEM } from '../store/items/types'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ActionSheetIOS,
  Animated,
  Dimensions,
  Platform,
  View,
} from 'react-native'
import RizzleButton from './RizzleButton'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { getLightness, hslString } from '../utils/colors'
import { getMargin } from '../utils/dimensions'
import { hasNotchOrIsland } from '../utils/dimensions'
import type { RootState } from '../store/reducers'
import type { Feed } from '../store/feeds/types'
import { ADD_ITEM_TO_CATEGORY } from '../store/categories/types'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { getItem as getItemSQLite } from "../storage/sqlite"
import { getItem as getItemIDB } from "../storage/idb-storage"
import type { Newsletter } from '../store/newsletters/types'
import { useColor } from '../hooks/useColor'

// isDarkMode, displayMode,
let areButtonsVisible = true

export const translateDistance = 80

interface ButtonSetProps {
  isCurrent: boolean,
  item: Item,
  opacityAnim: Animated.Value,
}

export default function ButtonSet({
  isCurrent,
  item,
  opacityAnim,
}: ButtonSetProps) {
  const [itemInflated, setItemInflated] = useState<ItemInflated | undefined>(undefined)
  useEffect(() => {
    Platform.OS === 'web' ?
      getItemIDB(item).then(setItemInflated) :
      getItemSQLite(item).then(setItemInflated)
  }, [item])
  const visible = useSelector((state: RootState) => state.ui.itemButtonsVisible)
  useEffect(() => {
    makeVisible(visible)
  }, [visible])
  const visibleRef = useRef(true)
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
    isItemMercury = itemInflated &&
      (item.showMercuryContent || feed?.isMercury) &&
      !!itemInflated?.content_mercury
  }, [item, itemInflated, feed])
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
      message: '',//this.selectedText, // TODO
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
          // modalPresentationStyle: "popover",
          // readerMode: true,
          enableBarCollapsing: true,
        })
      } catch (error) {
        console.log('openLink', error)
      }
    }
  }

  const visibleAnim = new Animated.Value(visibleRef.current ? 0 : 1)
  const toggleAnimMercury = new Animated.Value(0)

  const color = useColor(itemFeed?.rootUrl || itemFeed?.url || item.url)
  const borderColor = (isDarkMode || !color) ? hslString('rizzleText', 'ui') : color
  const backgroundColor = hslString('buttonBG')
  const borderWidth = 1

  const getMercuryToggleOpacity = (item: Item, isCurrent: boolean) => {
    if (isCurrent) {
      return toggleAnimMercury
    } else {
      return item && item.showMercuryContent ? 1 : 0
    }
  }

  const makeVisible = (imminentlyVisible: boolean) => {
    Animated.timing(
      visibleAnim,
      {
        toValue: imminentlyVisible ? 0 : 1,
        duration: 600,
        useNativeDriver: true
      }
    ).start(_ => {
      visibleRef.current = imminentlyVisible
    })
  }

  const startToggleAnimationMercury = () => {
    isItemMercury = !isItemMercury
    Animated.timing(toggleAnimMercury, {
      toValue: isItemMercury ? 1 : 0,
      delay: 250,
      duration: 500,
      useNativeDriver: false
    }).start()
  }

  const showShareButton = Platform.OS === 'ios'
  const showMercuryButton = !!itemInflated?.content_mercury

  return (
    <Animated.View
      pointerEvents={isCurrent ? 'box-none' : 'none'}
      style={{
        ...getStyles(showShareButton && showMercuryButton).base,
        opacity: opacityAnim || 1
      }}>
      {/* <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        iconOff={getRizzleButtonIcon('toggleViewButtonsIcon', borderColor, backgroundColor, true, false)}
        iconOn={getRizzleButtonIcon('toggleViewButtonsIcon', borderColor, backgroundColor, true, false)}
        initialToggleState={false}
        isToggle={true}
        style={{
          paddingLeft: 1,
          transform: [{
            translateY: isCurrent ? visibleAnim.interpolate({
              inputRange: [0, 0.167, 0.333, 0.5, 1],
              outputRange: [0, translateDistance * -0.2, translateDistance, translateDistance, translateDistance]
            }) : 0
          }]
        }}
        onPress={toggleViewButtons}
      /> */}
      {showShareButton && <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        label='share'
        style={{
          paddingLeft: 0,
          transform: [{
            translateY: isCurrent ? visibleAnim.interpolate({
              inputRange: [0, 0.167, 0.333, 0.5, 1],
              outputRange: [0, 0, translateDistance * -0.2, translateDistance, translateDistance]
            }) : 0
          }]
        }}
        onPress={showShareSheet}
      >
        {getRizzleButtonIcon('showShareSheetIcon', borderColor, backgroundColor, true, false)}
      </RizzleButton>
      }
      <RizzleButton
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
          paddingHorizontal: displayMode === ItemType.unread ? 0 : 7,
          transform: [
            {
              translateY: isCurrent ? visibleAnim.interpolate({
                inputRange: [0, 0.333, 0.5, 0.667, 1],
                outputRange: [0, 0, translateDistance * -0.2, translateDistance, translateDistance]
              }) : 0
            }
          ]
        }}
        onPress={() => setSaved(item, !item.isSaved)}
      >
        {displayMode === ItemType.saved && getRizzleButtonIcon('trash', borderColor, backgroundColor, true, false)}
      </RizzleButton>
      {displayMode == ItemType.unread && __DEV__ && (<RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        iconOff={getRizzleButtonIcon('keep-unread-off', borderColor, backgroundColor, true, false)}
        iconOn={getRizzleButtonIcon('keep-unread-on', borderColor, backgroundColor, true, false)}
        initialToggleState={item.isKeepUnread}
        isToggle={true}
        style={{
          transform: [
            {
              translateY: isCurrent ? visibleAnim.interpolate({
                inputRange: [0, 0.333, 0.5, 0.667, 1],
                outputRange: [0, 0, translateDistance * -0.2, translateDistance, translateDistance]
              }) : 0
            }
          ]
        }}
        onPress={() => setKeepUnread(item, !actualItem?.isKeepUnread)}
      >
      </RizzleButton>)}
      <RizzleButton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        borderWidth={borderWidth}
        label='browser'
        style={{
          paddingLeft: 0,
          transform: [{
            translateY: isCurrent ? visibleAnim.interpolate({
              inputRange: [0, 0.5, 0.667, 0.833, 1],
              outputRange: [0, 0, translateDistance * -0.2, translateDistance, translateDistance]
            }) : 0
          }]
        }}
        onPress={() => {
          launchBrowser()
        }}
      >
        {getRizzleButtonIcon('launchBrowserIcon', borderColor, backgroundColor, true, false)}
      </RizzleButton>
      {!!itemInflated?.content_mercury &&
        <RizzleButton
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          borderWidth={borderWidth}
          iconOff={getRizzleButtonIcon('showMercuryIconOff', borderColor, backgroundColor, !!itemInflated?.content_mercury, false)}
          iconOn={getRizzleButtonIcon('showMercuryIconOn', borderColor, backgroundColor, !!itemInflated?.content_mercury, false)}
          initialToggleState={isItemMercury}
          isToggle={true}
          label='full text'
          style={{
            paddingLeft: 2,
            transform: [{
              translateY: isCurrent ? visibleAnim.interpolate({
                inputRange: [0, 0.667, 0.833, 1],
                outputRange: [0, 0, translateDistance * -0.2, translateDistance]
              }) : 0
            }]
          }}
          onPress={!!itemInflated?.content_mercury ?
            () => toggleMercury() :
            () => false
          }
        />
      }
    </Animated.View>
  )
}


const getStyles = (allButtons = true) => {
  const screenDimensions = Dimensions.get('window')
  return {
    base: {
      position: 'absolute',
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
    },
    buttonSVG: {
      paddingLeft: 3
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      backgroundColor: 'transparent',
      fontFamily: 'IBMPlexMono',
      fontSize: 16,
    },
    buttonView: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: 50,
      height: 50,
    },
    sansText: {
      fontFamily: 'IBMPlexSansCond-Bold',
    },
    smallText: {
      fontSize: 10
    }
  }
}
