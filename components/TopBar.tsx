import { CLEAR_READ_ITEMS, Item, ItemType } from '../store/items/types'
import React, { Fragment, useEffect, useState } from 'react'
import {
  Animated,
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { CommonActions, useNavigation } from '@react-navigation/native'
import Svg, { Circle, G, Rect, Path } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { deepEqual, id } from '../utils'
import { getMargin, getStatusBarHeight } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { isPortrait } from '../utils/dimensions'
import { hasNotchOrIsland } from '../utils/dimensions'
import { getLightness, hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/reducers'
import { getItems, getScrollRatio } from '../utils/get-item'
import { Feed } from '../store/feeds/types'
import { getItem as getItemSQLite } from "../storage/sqlite"
import { getItem as getItemIDB } from "../storage/idb-storage"
import { Newsletter } from '../store/newsletters/types'
import log from '../utils/log'
import Favicon from './Favicon'
import { useColor } from '../hooks/useColor'

const entities = require('entities')

/* Props:
- clampedAnimatedValue
- filter *
- index
- isDarkMode *
- isOnboarding *
- isVisible
- item
- navigation
- numItems
- opacityAnim
- openFeedModal
- setDisplayMode *
- titleTransformAnim

(* = container)
*/
interface TopBarProps {
  clampedAnimatedValue: Animated.AnimatedInterpolation<string | number> | undefined,
  emitter: {
    emit: (type: string) => null
  }
  index: number
  isVisible: boolean,
  item: Item,
  key: string,
  navigation: any,
  opacityAnim: number | Animated.AnimatedInterpolation<string | number>,
  openFeedModal: (feedId: string) => void,
  scrollAnim: number | Animated.AnimatedInterpolation<string | number>,
  titleTransformAnim: number | Animated.AnimatedInterpolation<string | number>,
}

export default function TopBar({
  clampedAnimatedValue,
  emitter,
  item,
  navigation,
  opacityAnim,
  openFeedModal,
  scrollAnim,
  titleTransformAnim,
  isVisible,
  index
}: TopBarProps) {
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const items = useSelector((state: RootState) => getItems(state), deepEqual)
  const scrollRatios = useSelector((state: RootState) => getScrollRatio(state, item))
  const orientation = useSelector(state => state.config.orientation)
  const [numItems, setNumItems] = useState(items.length)
  const [isBackgroundTransparent, setIsBackgroundTransparent] = useState(false)
  useEffect(() => {
    setNumItems(items.length)
  }, [items.length])
  const filter = useSelector((state: RootState) => state.config.filter || null)
  const isOnboarding = useSelector((state: RootState) => state.config.isOnboarding)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  let feed: Feed | Newsletter | undefined
  if (item.isNewsletter) {
    feed = useSelector((state: RootState) => state.newsletters.newsletters.find(n => n._id === item.feed_id))
  } else {
    feed = useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === item.feed_id))
  }
  // const feedLocal: FeedLocal | undefined = useSelector((state: RootState) => state.feedsLocal.feeds.find(f => f._id === item.feed_id))
  // const webviewHeight = useSelector((state: RootState) => getItems(state).find(i => i._id === item._id)?.webviewHeight || 0)
  const color = useColor(feed?.rootUrl || feed?.url || item.url)

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

  const getBackgroundOpacityAnim = () => {
    if (isBackgroundTransparent && typeof scrollAnim == 'object') {
      return scrollAnim.interpolate({
        inputRange: [0, getStatusBarHeight(), getStatusBarHeight() + 50],
        outputRange: [0, 0, 1]
      })
    } else if (isBackgroundTransparent) {
      return 0
    } else {
      return 1
    }
  }

  const feedTitle = feed?.title ?
    entities.decode(feed.title) :
    (!!item && item.url?.split('/').length > 3) ? item.url.split('/')[2] : ''

  const titleOpacity = typeof scrollAnim !== 'number' && isVisible ?
    scrollAnim.interpolate({
      inputRange: [0, 100, 140],
      outputRange: [0, 0, 1]
    }) : 0

  const getCurrentContent = (): string => item.showMercuryContent ? 'mercury' : 'html'
  const scrollRatio = item.showMercuryContent ?
    scrollRatios?.mercury :
    scrollRatios?.html

  const hasScrollRatio = scrollRatio !== undefined && scrollRatio > 0

  return isOnboarding ? null :
    (
      <View>
        <Animated.View
          key={item ? item._id : id()}
          pointerEvents={isVisible ? 'auto' : 'none'}
          style={{
            ...getStyles().textHolder,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            opacity: opacityAnim,
            overflow: 'hidden',
            // paddingTop: 80,
            position: 'absolute',
            // top: hasNotchOrIsland() ? -240 : -260,
            shadowOffset: {
              width: 0,
              height: 1
            },
            shadowRadius: 1,
            shadowOpacity: 0.1,
            shadowColor: 'rgba(0, 0, 0, 1)',
            transform: [{
              translateY: (isVisible && clampedAnimatedValue !== undefined) ? clampedAnimatedValue : 0
            }]
          }}
        >
          <Animated.View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: getBackgroundColor(),
            opacity: getBackgroundOpacityAnim()
          }}>
          </Animated.View>
          <BackButton
            isDarkMode={isDarkMode}
            navigation={navigation}
            isSaved={displayMode === ItemType.saved}
            color={getForegroundColor()}
          />
          <View style={{
            // backgroundColor: 'yellow',
            top: hasNotchOrIsland() && isPortrait() ? 44 : 22,
            flex: 1,
            marginLeft: 60 * fontSizeMultiplier(),
            marginRight: 60 * fontSizeMultiplier()
          }}>
            <TouchableOpacity
              key={`inner-{id()}`}
              onPress={() => {
                if (isOnboarding || displayMode === ItemType.saved) return
                if (feed !== undefined) openFeedModal(feed._id)
              }}
              style={{
                backgroundColor: 'transparent',
                height: 70 * fontSizeMultiplier(),
              }}>
              <Animated.View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 64 * fontSizeMultiplier(),
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                opacity: isVisible && typeof scrollAnim !== 'number' ?
                  scrollAnim.interpolate({
                    inputRange: [0, 120, 160],
                    outputRange: [1, 1, 0]
                  }) : 1,
                transform: [{
                  translateY: titleTransformAnim || 0
                }]
              }}>
                <View>
                  <Favicon
                    // this is a hot mess because newsletters have a url instead of a rootUrl
                    url={feed?.rootUrl || feed?.url || item.url}
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
                      'Unread Stories')} • {index + 1} / {numItems}</Text>
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
                      // color: this.getBorderBottomColor(item)
                      color: getForegroundColor(),
                      // height: 36,
                      // paddingBottom: 15,
                      textAlign: feed ?
                        'left' : 'center',
                      // textDecorationLine: displayMode === ItemType.saved ? 'none' : 'underline'
                    }}
                  >
                    {feedTitle}
                  </Text>
                </View>
              </Animated.View>
              <Animated.View style={
                Platform.OS === 'web' ? {
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 64 * fontSizeMultiplier(),
                  marginTop: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  opacity: titleOpacity,
                  position: 'absolute',
                  width: '100%',
                } :
                  {
                    marginTop: 6,
                    opacity: typeof scrollAnim !== 'number' && isVisible ?
                      scrollAnim.interpolate({
                        inputRange: [0, 100, 140],
                        outputRange: [0, 0, 1]
                      }) : 0,
                    position: 'absolute',
                    width: '100%',
                  }
              }>
                <Text
                  style={{
                    ...getStyles().feedName,
                    fontSize: 12 * fontSizeMultiplier(),
                    lineHeight: Platform.OS === 'web' ? 18 * fontSizeMultiplier() : undefined,
                    fontFamily: filter ?
                      'IBMPlexSansCond-Bold' :
                      'IBMPlexSansCond',
                    color: getForegroundColor(),
                    opacity: Platform.OS !== 'web' && titleOpacity === 0 ? 0 : 1,
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
                    // color: this.getBorderBottomColor(item)
                    color: getForegroundColor(),
                    opacity: Platform.OS !== 'web' && titleOpacity === 0 ? 0 : 1,
                    textAlign: 'center'
                  }}
                >
                  {item?.title}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
          <View style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 50
          }}>
            {hasScrollRatio &&
              <TouchableOpacity
                onPress={() => emitter.emit('scrollToRatio')}
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  marginBottom: 16 * fontSizeMultiplier(),
                  paddingRight: getMargin() / 2,
                }}
              >
                {getRizzleButtonIcon('bookmark', getForegroundColor(), 'transparent', true, false)}
              </TouchableOpacity>
            }
          </View>
        </Animated.View>
      </View>)
}

const getStyles = () => {
  return {
    topBar: {
      // flex: 1,
      position: 'absolute',
      top: 0,
      height: hasNotchOrIsland() && isPortrait() ? 44 : 22,
      width: '100%',
    },
    textHolder: {
      // flex: 1,
      position: 'absolute',
      top: 0,
      width: '100%',
      flexDirection: 'row',
      height: getStatusBarHeight(),
      // overflow: 'hidden',
      backgroundColor: 'transparent',
      // shadowColor: '#000000',
      // shadowRadius: 1,
      // shadowOpacity: 0.1,
      // shadowOffset: {
      //   height: 1,
      //   width: 0
      // }
      zIndex: -1
    },
    feedName: {
      // flex: 1,
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
      // fontFamily: 'AvenirNext-Regular',
      fontFamily: 'IBMPlexMono',
      height: 36 * fontSizeMultiplier(),
      textAlign: 'center',
      padding: 10
    }
  }
}

interface BackButtonProps {
  color: string,
  isDarkMode: boolean,
  isSaved: boolean,
  navigation: any
}

const BackButton = ({ color, isDarkMode, isSaved }: BackButtonProps) => {
  const dispatch = useDispatch()
  const clearReadItems = () => dispatch({
    type: CLEAR_READ_ITEMS
  })
  const navigation = useNavigation()

  return (
    <Animated.View style={{
      position: 'absolute',
      left: 0,
      bottom: 8 * fontSizeMultiplier(),
      width: 32,
      height: 48,
      paddingRight: 50
    }}>
      <TouchableOpacity
        onPress={() => {
          navigation.popTo('Feed', { isSaved, transition: 'default' })
          clearReadItems()
        }}
        style={{
          paddingBottom: 10,
          paddingLeft: 0,
          paddingRight: 50,
          paddingTop: 10
        }}
      >
        {getRizzleButtonIcon('back', color, 'transparent', true, false)}
      </TouchableOpacity>
    </Animated.View>
  )
}

export const getTopBarHeight = () => getStatusBarHeight()// +
// (hasNotchOrIsland() ? 44 : 22)
