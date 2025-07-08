import { CLEAR_READ_ITEMS, Item, ItemType } from '@/store/items/types'
import React, { Fragment, useEffect, useState } from 'react'
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native'
import Reanimated, {
  useAnimatedStyle,
  useAnimatedProps,
  interpolate,
  Extrapolate,
  Extrapolation,
} from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import { deepEqual, id } from '@/utils'
import { fontSizeMultiplier, getMargin, getStatusBarHeight, hasNotchOrIsland, isPortrait } from '@/utils/dimensions'
import { hslString } from '@/utils/colors'
import { getRizzleButtonIcon } from '@/utils/rizzle-button-icons'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/reducers'
import { getItems, getScrollRatio } from '@/utils/get-item'
import { Feed } from '@/store/feeds/types'
import { getItem as getItemSQLite } from "@/storage/sqlite"
import { getItem as getItemIDB } from "@/storage/idb-storage"
import { Newsletter } from '@/store/newsletters/types'
import log from '@/utils/log'
import Favicon from '@/components/Favicon'
import { useColor } from '@/hooks/useColor'
import { useAnimation } from './AnimationContext'
import { useBufferedItems } from './BufferedItemsContext'

const entities = require('entities')

interface TopBarProps {
  emitter: {
    emit: (type: string) => null
  }
  item: Item,
  itemIndex: number,
  pageWidth: number,
}

export default function TopBar({
  emitter,
  item,
  itemIndex,
  pageWidth,
}: TopBarProps) {
  const dispatch = useDispatch()
  const navigation = useNavigation()

  // Animation context
  const { horizontalScroll, verticalScrolls, headerVisibles } = useAnimation()

  const { bufferStartIndex } = useBufferedItems()

  const screenWidth = useWindowDimensions().width

  // Debug: Log when isVisible changes
  // useEffect(() => {
  //   if (__DEV__) {
  //     console.log(`[TopBar] Item ${itemIndex} isVisible changed to: ${isVisible}`)
  //   }
  // }, [isVisible, itemIndex])

  // Redux selectors
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const items = useSelector((state: RootState) => getItems(state), deepEqual)
  const scrollRatios = useSelector((state: RootState) => getScrollRatio(state, item))
  const orientation = useSelector((state: RootState) => state.config.orientation)
  const filter = useSelector((state: RootState) => state.config.filter || null)
  const isOnboarding = useSelector((state: RootState) => state.config.isOnboarding)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)

  // State
  const [numItems, setNumItems] = useState(items.length)
  const [isBackgroundTransparent, setIsBackgroundTransparent] = useState(false)

  useEffect(() => {
    setNumItems(items.length)
  }, [items.length])

  // Feed data
  let feed: Feed | Newsletter | undefined
  if (item.isNewsletter) {
    feed = useSelector((state: RootState) => state.newsletters.newsletters.find(n => n._id === item.feed_id))
  } else {
    feed = useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === item.feed_id))
  }

  const color = useColor(feed?.rootUrl || feed?.url || item.url)
  const statusBarHeight = getStatusBarHeight()

  useEffect(() => {
    const checkStyles = async () => {
      try {
        const inflatedItem = Platform.OS === 'web' ?
          await getItemIDB(item) :
          await getItemSQLite(item)
        const isCoverInline = (inflatedItem?.styles?.isCoverInline && orientation === 'portrait') || false
        setIsBackgroundTransparent(!!item.showCoverImage && !isCoverInline)
      } catch (e) {
        log('TopBar checkStyles', e)
      }
    }
    checkStyles()
  }, [item._id])

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    // Horizontal opacity animation (fading between pages)
    let inputRange = [pageWidth * itemIndex, pageWidth * (itemIndex + 0.5), pageWidth * (itemIndex + 1)]
    let outputRange = [1, 1, 0]
    if (itemIndex > 0) {
      inputRange.unshift(pageWidth * (itemIndex - 1))
      outputRange.unshift(0)
    }

    const opacity = interpolate(
      horizontalScroll.value,
      inputRange,
      outputRange,
      Extrapolation.CLAMP
    )

    // Direct scroll tracking using headerVisible offset (only for visible TopBar)
    const translateY = -headerVisibles[itemIndex].value *
      (Math.round(horizontalScroll.value / screenWidth) === itemIndex ? 1 : 0)

    return {
      // useAnimatedStyle is called once on the JS thread and then on the UI thread
      // this leads to a flash of the wrong TopBar when the carousel is re-rendered
      opacity: global._WORKLET ? opacity : 0,
      transform: [{ translateY }],
    }
  }, [itemIndex, pageWidth, screenWidth])

  const titleTransformStyle = useAnimatedStyle(() => {
    // Title transform animation based on horizontal scroll
    let inputRange = [pageWidth * itemIndex, pageWidth * (itemIndex + 1)]
    let outputRange = [0, -20]
    if (itemIndex > 0) {
      inputRange = [0, pageWidth * (itemIndex - 1)].concat(inputRange)
      outputRange = [30, 30].concat(outputRange)
    }

    const translateY = interpolate(
      horizontalScroll.value,
      inputRange,
      outputRange,
      Extrapolate.CLAMP
    )

    return {
      transform: [{ translateY }],
    }
  }, [itemIndex, pageWidth])

  const backgroundOpacityStyle = useAnimatedStyle(() => {
    const isVisible = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    if (isBackgroundTransparent && isVisible) {
      const opacity = interpolate(
        verticalScrolls[itemIndex].value,
        [0, statusBarHeight, statusBarHeight + 50],
        [0, 0, 1],
        Extrapolate.CLAMP
      )
      return { opacity }
    } else if (isBackgroundTransparent) {
      return { opacity: 0 }
    }
    return { opacity: 1 }
  }, [itemIndex, screenWidth, isBackgroundTransparent, statusBarHeight])

  const feedInfoOpacityStyle = useAnimatedStyle(() => {
    const isVisible = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    if (!isVisible) return { opacity: 1 }

    const opacity = interpolate(
      verticalScrolls[itemIndex].value,
      [0, 120, 160],
      [1, 1, 0],
      Extrapolate.CLAMP
    )

    return { opacity }
  }, [itemIndex, screenWidth])

  const titleOpacityStyle = useAnimatedStyle(() => {
    const isVisible = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    if (!isVisible) return { opacity: 0 }

    const opacity = interpolate(
      verticalScrolls[itemIndex].value,
      [0, 100, 140],
      [0, 0, 1],
      Extrapolate.CLAMP
    )

    return { opacity }
  }, [itemIndex, screenWidth])

  const animatedPointerEvents = useAnimatedProps(() => {
    const isVisible = Math.round(horizontalScroll.value / screenWidth) === itemIndex
    return { pointerEvents: isVisible ? ('auto' as const) : ('none' as const) }
  })

  // Helper functions
  const getBackgroundColor = () => {
    if (color) {
      return color
    } else {
      return 'black'
    }
  }

  const getForegroundColor = () => {
    return 'white'
  }

  const feedTitle = feed?.title ?
    entities.decode(feed.title) :
    (!!item && item.url?.split('/').length > 3) ? item.url.split('/')[2] : ''

  const getCurrentContent = (): string => item.showMercuryContent ? 'mercury' : 'html'
  const scrollRatio = item.showMercuryContent ?
    scrollRatios?.mercury :
    scrollRatios?.html

  const hasScrollRatio = scrollRatio !== undefined && scrollRatio > 0

  const clearReadItems = () => dispatch({
    type: CLEAR_READ_ITEMS
  })

  return isOnboarding ? null : (
    <View>
      <Reanimated.View
        key={item ? item._id : id()}
        animatedProps={animatedPointerEvents}
        style={[
          {
            ...getStyles().textHolder,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'absolute',
            shadowOffset: {
              width: 0,
              height: 1
            },
            shadowRadius: 1,
            shadowOpacity: 0.1,
            shadowColor: 'rgba(0, 0, 0, 1)',
          },
          containerStyle
        ]}
      >
        <Reanimated.View style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: getBackgroundColor(),
          },
          backgroundOpacityStyle
        ]} />

        {/* Back Button */}
        <Reanimated.View style={{
          position: 'absolute',
          left: 0,
          bottom: 8 * fontSizeMultiplier(),
          width: 32,
          height: 48,
          paddingRight: 50
        }}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
              clearReadItems()
            }}
            style={{
              paddingBottom: 10,
              paddingLeft: 0,
              paddingRight: 50,
              paddingTop: 10
            }}
          >
            {getRizzleButtonIcon('back', getForegroundColor(), 'transparent', true, false)}
          </TouchableOpacity>
        </Reanimated.View>

        {/* Main Content */}
        <View style={{
          top: hasNotchOrIsland() && isPortrait() ? 44 : 22,
          flex: 1,
          marginLeft: 60 * fontSizeMultiplier(),
          marginRight: 60 * fontSizeMultiplier()
        }}>
          <TouchableOpacity
            key={`inner-{id()}`}
            onPress={() => {
              if (isOnboarding || displayMode === ItemType.saved) return
              if (feed !== undefined) navigation.navigate('FeedExpanded', { feed, navigation })
            }}
            style={{
              backgroundColor: 'transparent',
              height: 70 * fontSizeMultiplier(),
            }}
          >
            {/* Feed Info */}
            <Reanimated.View style={[
              {
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 64 * fontSizeMultiplier(),
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
              },
              titleTransformStyle,
              feedInfoOpacityStyle
            ]}>
              <View>
                <Favicon
                  url={(feed && 'rootUrl' in feed ? feed.rootUrl : feed?.url) || item.url}
                />
              </View>
              <View style={{
                flexDirection: 'column',
                marginTop: 0,
              }}>
                <Text
                  style={{
                    ...getStyles().feedName,
                    fontSize: 12 * fontSizeMultiplier(),
                    fontFamily: filter ?
                      'IBMPlexSansCond' :
                      'IBMPlexSansCond',
                    color: getForegroundColor(),
                    textAlign: 'left'
                  }}
                >{filter?.type ?
                  (filter.type == 'category' ?
                    filter.title :
                    'Feed') :
                  (displayMode === ItemType.saved ?
                    'Library' :
                    'Unread Stories')} • {itemIndex + bufferStartIndex + 1} / {numItems}</Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode='tail'
                  style={{
                    ...getStyles().feedName,
                    fontSize: 18 * fontSizeMultiplier(),
                    lineHeight: 22 * fontSizeMultiplier(),
                    fontFamily: filter ?
                      'IBMPlexSansCond-Bold' :
                      'IBMPlexSansCond',
                    color: getForegroundColor(),
                    textAlign: feed ?
                      'left' : 'center',
                  }}
                >
                  {feedTitle}
                </Text>
              </View>
            </Reanimated.View>

            {/* Article Title (appears on scroll) */}
            <Reanimated.View style={[
              Platform.OS === 'web' ? {
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 64 * fontSizeMultiplier(),
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                position: 'absolute',
                width: '100%',
              } : {
                marginTop: 6,
                position: 'absolute',
                width: '100%',
              },
              titleOpacityStyle
            ]}>
              <Text
                style={{
                  ...getStyles().feedName,
                  fontSize: 12 * fontSizeMultiplier(),
                  lineHeight: Platform.OS === 'web' ? 18 * fontSizeMultiplier() : undefined,
                  fontFamily: filter ?
                    'IBMPlexSansCond-Bold' :
                    'IBMPlexSansCond',
                  color: getForegroundColor(),
                  textAlign: 'center',
                  textDecorationLine: 'underline'
                }}
              >{feedTitle}</Text>
              <Text
                numberOfLines={2}
                ellipsizeMode='tail'
                style={{
                  ...getStyles().feedName,
                  fontSize: 16 * fontSizeMultiplier(),
                  lineHeight: 20 * fontSizeMultiplier(),
                  fontFamily: filter ?
                    'IBMPlexSansCond-Bold' :
                    'IBMPlexSansCond-Bold',
                  color: getForegroundColor(),
                  textAlign: 'center'
                }}
              >
                {item?.title}
              </Text>
            </Reanimated.View>
          </TouchableOpacity>
        </View>

        {/* Scroll Ratio Button */}
        <View style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 50
        }}>
          {hasScrollRatio &&
            <TouchableOpacity
              onPress={() => {
                emitter.emit('scrollToRatio')
              }}
              style={{
                ...getStyles().feedName,
                fontSize: 16 * fontSizeMultiplier(),
                lineHeight: 20 * fontSizeMultiplier(),
                fontFamily: filter ?
                  'IBMPlexSansCond-Bold' :
                  'IBMPlexSansCond-Bold',
                color: getForegroundColor(),
                textAlign: 'center'
              }}
            >
              {getRizzleButtonIcon('bookmark', getForegroundColor(), 'transparent', true, false)}
            </TouchableOpacity>
          }
        </View>
      </Reanimated.View>
    </View>
  )
}

const getStyles = () => {
  return {
    topBar: {
      position: 'absolute',
      top: 0,
      height: hasNotchOrIsland() && isPortrait() ? 44 : 22,
      width: '100%',
    },
    textHolder: {
      position: 'absolute',
      top: 0,
      width: '100%',
      flexDirection: 'row',
      height: getStatusBarHeight(),
      backgroundColor: 'transparent',
      zIndex: -1
    },
    feedName: {
      color: hslString('rizzleFG'),
      fontSize: 20 * fontSizeMultiplier(),
      fontFamily: 'IBMPlexMono',
      textAlign: 'center',
      marginLeft: 5
    },
    feedActions: {
      flex: 1,
      color: hslString('rizzleFG'),
      fontSize: 20 * fontSizeMultiplier(),
      fontFamily: 'IBMPlexMono',
      height: 36 * fontSizeMultiplier(),
      textAlign: 'center',
      padding: 10
    }
  }
}

export const getTopBarHeight = () => getStatusBarHeight()
