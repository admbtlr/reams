import { Item, ItemType } from '../store/items/types'
import React, { Fragment, useEffect, useState } from 'react'
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { CommonActions } from '@react-navigation/native'
import Svg, {Circle, G, Rect, Path } from 'react-native-svg'
// import LinearGradient from 'react-native-linear-gradient'
import FeedIconContainer from '../containers/FeedIcon'
import { id, hasNotchOrIsland, fontSizeMultiplier, getStatusBarHeight, isPortrait } from '../utils'
import { hslString } from '../utils/colors'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/reducers'
import { getItems, getIndex } from '../utils/get-item'
import { Feed, FeedLocal } from '../store/feeds/types'
import { inflateItem } from '../storage/sqlite'

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
  index: number
  isVisible: boolean,
  item: Item,
  key: string,
  navigation: any,
  opacityAnim:  number | Animated.AnimatedInterpolation<string | number>,
  openFeedModal: (feedId: string) => void,
  scrollAnim:  number | Animated.AnimatedInterpolation<string | number>,
  titleTransformAnim:  number | Animated.AnimatedInterpolation<string | number>,
}

export default function TopBar({
  clampedAnimatedValue,
  item,
  navigation,
  opacityAnim,
  openFeedModal,
  scrollAnim,
  titleTransformAnim,
  isVisible,
  index
} : TopBarProps) {
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const items = useSelector((state: RootState) => getItems(state))
  const [numItems, setNumItems] = useState(items.length)
  const [isBackgroundTransparent, setIsBackgroundTransparent] = useState(false)
  useEffect(() => {
    setNumItems(items.length)
  }, [items.length])
  const filter = useSelector((state: RootState) => state.config.filter || null)
  const isOnboarding = useSelector((state: RootState) => state.config.isOnboarding)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const feed: Feed | undefined = useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === item.feed_id))
  const feedLocal: FeedLocal | undefined = useSelector((state: RootState) => state.feedsLocal.feeds.find(f => f._id === item.feed_id))
  const webviewHeight = useSelector((state: RootState) => getItems(state).find(i => i._id === item._id)?.webviewHeight || 0)

  useEffect(() => {
    const checkStyles = async () => {
      const inflatedItem = await inflateItem(item)
      const isCoverInline = inflatedItem?.styles?.isCoverInline || false
      setIsBackgroundTransparent(!!item.showCoverImage && !isCoverInline)
    }
    checkStyles()
  }, [item])

  const getBackgroundColor = () => {
    let feedColor = feed ? feed.color : null
    // if (item && item.showCoverImage && item.styles && !item.styles.isCoverInline && allowTransparent) {
    //   feedColor = 'transparent'
    // }
    const bgColor = displayMode == ItemType.saved ?
      hslString('rizzleBG') :
      (feedColor ?
        hslString(feedColor, 'desaturated') :
        hslString('rizzleSaved'))
    return bgColor
  }  

  const getForegroundColor = () => {
    return displayMode == ItemType.saved && !isBackgroundTransparent ?
      (isDarkMode ?
        'hsl(0, 0%, 80%)' :
        hslString('rizzleText')) :
        'white'
  }
    
  const getBackgroundOpacityAnim = () => {
    if (isBackgroundTransparent) {
      return scrollAnim.interpolate({
        inputRange: [0, getStatusBarHeight(), getStatusBarHeight() + 50],
        outputRange: [0, 0, 1]
      })
    } else {
      return 1
    }
  }
  
  const feedTitle = feed?.title ? feed.title : (!!item && item.url?.split('/').length > 3) ? item.url.split('/')[2] : ''

  const titleOpacity = typeof scrollAnim !== 'number' && isVisible ? 
    scrollAnim.interpolate({
      inputRange: [0, 100, 140],
      outputRange: [0, 0, 1]
    }) : 0
  
  const getCurrentContent = (): string => item.showMercuryContent ? 'mercury' : 'html'

  const hasScrollRatio = item && item.scrollRatio && item.scrollRatio[getCurrentContent()] > 0

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
            translateY: isVisible ? clampedAnimatedValue : 0
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
          { displayMode === ItemType.saved &&
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[hslString('logo1'), hslString('logo2')]}
              style={{
                position: 'absolute',
                height: 5,
                width: '100%',
                top: getStatusBarHeight() - 5,
                left: 0
              }}
            />
          }
        </Animated.View>
        <BackButton
          isDarkMode={isDarkMode}
          navigation={navigation}
          isSaved={displayMode === ItemType.saved}
          color={getForegroundColor()}
        />
        <View style={{
          top: hasNotchOrIsland() && isPortrait() ? 44 : 22,
          flex: 1,
          marginLeft: 80 * fontSizeMultiplier(),
          marginRight: 80 * fontSizeMultiplier()
        }}>
          <TouchableOpacity
            key={`inner-{id()}`}
            onPress={() => {
              if (isOnboarding || displayMode === ItemType.saved) return
              openFeedModal()
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
              { feed && 
                <View style={{marginTop: 2}}>
                  <FeedIconContainer
                    id={item.feed_id}
                    dimensions={feedLocal?.cachedIconDimensions}
                    bgColor={getBackgroundColor()}
                  />
                </View>
              }
              <View style={{
                flexDirection: 'column',
                marginTop: 0,
              }}>
                <Text
                  style={{
                    ...getStyles().feedName,
                    fontSize: 12 * fontSizeMultiplier(),
                    fontFamily: filter ?
                      'IBMPlexSansCond-Bold' :
                      'IBMPlexSansCond',
                    color: getForegroundColor(),
                    textAlign: feedLocal && feedLocal.hasCachedIcon ?
                      'left' : 'center'
                  }}
                >{filter?.type ?
                    (filter.type == 'category' ? 
                      filter.title :
                      'Feed') :
                    (displayMode === ItemType.saved ?
                      'Saved Stories' : 
                      'Unread Stories')} • { index + 1 } / { numItems }</Text>
                <Text
                  numberOfLines={2}
                  ellipsizeMode='tail'
                  style={{
                    ...getStyles().feedName,
                    fontSize: 18 * fontSizeMultiplier(),
                    lineHeight: 22 * fontSizeMultiplier(),
                    fontFamily: filter ?
                      'IBMPlexSansCond-Bold' :
                      'IBMPlexSansCond-Bold',
                    // color: this.getBorderBottomColor(item)
                    color: getForegroundColor(),
                    // height: 36,
                    // paddingBottom: 15,
                    textAlign: feedLocal && feedLocal.hasCachedIcon ?
                      'left' : 'center',
                    textDecorationLine: displayMode === ItemType.saved ? 'none' : 'underline'
                  }}
                >
                  {feedTitle}
                </Text>
              </View>
            </Animated.View>
            <Animated.View style={{
                marginTop: 10,
                opacity: typeof scrollAnim !== 'number' && isVisible ? 
                  scrollAnim.interpolate({
                    inputRange: [0, 100, 140],
                    outputRange: [0, 0, 1]
                  }) : 0,
                position: 'absolute',
                width: '100%',
              }}>
                <Text
                  style={{
                    ...getStyles().feedName,
                    fontSize: 12 * fontSizeMultiplier(),
                    lineHeight: 18 * fontSizeMultiplier(),
                    fontFamily: filter ?
                      'IBMPlexSansCond-Bold' :
                      'IBMPlexSansCond',
                    color: getForegroundColor(),
                    textAlign: 'center',
                    textDecorationLine: 'underline'
                  }}
                  >{ feedTitle }</Text>
                <Text
                  numberOfLines={2}
                  ellipsizeMode='tail'
                  style={{
                    ...getStyles().feedName,
                    fontSize: 16  * fontSizeMultiplier(),
                    lineHeight: 20 * fontSizeMultiplier(),
                    fontFamily: filter ?
                      'IBMPlexSansCond-Bold' :
                      'IBMPlexSansCond-Bold',
                    // color: this.getBorderBottomColor(item)
                    color: getForegroundColor(),
                    // height: 36,
                    // paddingBottom: 15,
                    hyphens: 'auto',
                    textAlign: 'center'
                  }}
                >
                  {item?.title}
                </Text>
              </Animated.View>
            </TouchableOpacity>
        </View>
        {/* <View style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 50
        }}>
          { hasScrollRatio &&
            <TouchableOpacity 
              style={{
                flex: 1,
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                marginBottom: 12 * fontSizeMultiplier(),
                paddingRight: 5 * fontSizeMultiplier(),
              }}
            >
              {getRizzleButtonIcon('bookmark', getForegroundColor(), 'transparent', true, false)}
            </TouchableOpacity>
          }
        </View> */}
    </Animated.View>
  </View>)
}

const getStyles= () => {
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

const BackButton = ({ color, isDarkMode, isSaved , navigation: { navigate } }: BackButtonProps) => (
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
        navigate('Feeds', { isSaved, transition: 'default' })
      }}
      style={{
        paddingBottom: 10,
        paddingLeft: 0,
        paddingRight: 50,
        paddingTop: 10        
      }}
    >
      { getRizzleButtonIcon('back', color, 'transparent', true, false) }
    </TouchableOpacity>
  </Animated.View>
)

export const getTopBarHeight = () => getStatusBarHeight()// +
  // (hasNotchOrIsland() ? 44 : 22)

