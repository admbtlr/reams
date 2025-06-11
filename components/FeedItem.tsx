import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ActivityIndicator, Animated, Dimensions, Easing, Linking, Platform, ScrollView, Text, View } from 'react-native'
import CoverImage from './CoverImage'
import ItemBody from './ItemBody'
import ItemTitleContainer from '../containers/ItemTitle'
import { deepEqual, deviceCanHandleAnimations, diff, getCachedCoverImagePath } from '../utils/'
import { getDimensions, getMargin, getStatusBarHeight } from '../utils/dimensions'
import { hslString } from '../utils/colors'
import { getItem as getItemSQLite } from "@/storage/sqlite"
import { getItem as getItemIDB } from "@/storage/idb-storage"
import log from '../utils/log'
import Nudge from './Nudge'
import { MAX_DECORATION_FAILURES } from '../sagas/decorate-items'
import { Item, ItemInflated, SET_SCROLL_OFFSET } from '../store/items/types'
import { SHOW_IMAGE_VIEWER } from '../store/ui/types'
import { getCurrentItem, getIndex, getItems } from '../utils/get-item'
import { useColor } from '../hooks/useColor'
import type { RootState } from '../store/reducers'

export const INITIAL_WEBVIEW_HEIGHT = 1000

// Types
type FeedColor = [number, number, number]

interface ImageDimensions {
  width: number;
  height: number;
}

interface FaceCentreNormalised {
  x: number;
  y: number;
}

interface FontClasses {
  heading: string;
  body: string;
}

interface CoverImageStyles {
  isInline?: boolean;
  [key: string]: any;
}

interface ItemStyles {
  coverImage?: CoverImageStyles;
  fontClasses?: FontClasses;
  hasFeedBGColor?: boolean;
  isCoverInline?: boolean;
  [key: string]: any;
}

interface ScrollRatio {
  html?: number;
  mercury?: number;
  [key: string]: number | undefined;
}

interface FeedItemProps {
  _id: string;
  coverImageComponent?: React.ComponentType<any>;
  setTimerFunction?: (timer: number | null) => void;
  emitter: {
    on: (event: string, callback: () => void, id?: string) => void;
    off: (id: string) => void;
  };
  panAnim: Animated.Value;
  onScrollEnd: (offset: number) => void;
  setScrollAnim: (anim: Animated.Value) => void;
}

export const FeedItem: React.FC<FeedItemProps> = (props) => {
  const {
    _id,
    coverImageComponent,
    setTimerFunction,
    emitter,
    panAnim,
    onScrollEnd,
    setScrollAnim
  } = props

  const dispatch = useDispatch()

  // Redux selectors
  const items = useSelector((state: RootState) => getItems(state))
  const currentIndex = useSelector((state: RootState) => getIndex(state))
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const orientation = useSelector((state: RootState) => state.config.orientation)
  const fontSize = useSelector((state: RootState) => state.ui.fontSize)
  const isImageViewerVisible = useSelector((state: RootState) => state.ui.imageViewerVisible)
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const hostColors = useSelector((state: RootState) => state.hostColors.hostColors)

  // Find the current item
  const itemIndex = items.findIndex(item => item._id === _id)
  const rawItem = items[itemIndex]

  const colorFromHook = useColor(rawItem?.url)
  const host = rawItem?.url ? new URL(rawItem.url).hostname : ''
  const color = hostColors.find(hc => hc.host === host) || colorFromHook

  // Early return if item not found
  if (!rawItem) return null

  // Find related feed or newsletter
  const feed = useSelector((state: RootState) =>
    state.feeds.feeds.find(f => f._id === rawItem.feed_id)
  )
  const newsletter = useSelector((state: RootState) =>
    state.newsletters.newsletters.find(n => n._id === rawItem.feed_id)
  )
  const feed_color = feed?.color || newsletter?.color
  const showMercuryContent = rawItem.showMercuryContent !== undefined ?
    rawItem.showMercuryContent :
    feed?.isMercury

  // Complete item with additional data
  const item: Item = {
    ...rawItem,
    showMercuryContent
  }

  // Is this item currently visible
  const isVisible = currentIndex === itemIndex

  // Refs
  const scrollView = useRef<ScrollView>(null)
  const view = useRef<View>(null)

  // Animation refs
  const scrollAnim = useRef(new Animated.Value(0)).current
  const anims = useRef<Animated.AnimatedInterpolation<number>[]>([])
  const prevPanAnim = useRef<Animated.Value | null>(null)
  const isRevealing = useRef<boolean>(false)
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null)

  // State
  const [webViewHeight, setWebViewHeight] = useState<number>(INITIAL_WEBVIEW_HEIGHT)
  const [inflatedItem, setInflatedItem] = useState<ItemInflated | null>(null)
  const [hasRendered, setHasRendered] = useState<boolean>(false)
  const [animsUpdated, setAnimsUpdated] = useState<number>(Date.now())

  // use a ref so that we can reference this value within a closure
  // i.e. the scrollToOffset function below
  const webViewHeightRef = useRef(webViewHeight)
  // Update the ref whenever webViewHeight changes
  useEffect(() => {
    webViewHeightRef.current = webViewHeight
  }, [webViewHeight])

  // Other refs to replace class properties
  const screenDimensions = useRef(Dimensions.get('window')).current
  const wasShowCoverImage = useRef<boolean | undefined>(item.showCoverImage)
  const currentScrollOffset = useRef<number>(0)
  const hasBegunScroll = useRef<boolean>(false)
  const pendingWebViewHeight = useRef<number | null>(null)
  const pendingWebViewHeightId = useRef<NodeJS.Timeout | null>(null)
  const isAnimating = useRef<boolean>(false)
  const hasMounted = useRef<boolean>(false)

  // Action creators
  const showImageViewer = (url: string): void => {
    dispatch({
      type: SHOW_IMAGE_VIEWER,
      url
    })
  }

  const setScrollOffset = (item: Item, offset: number, totalHeight: number): void => {
    dispatch({
      type: SET_SCROLL_OFFSET,
      item,
      offset,
      scrollRatio: Number(Number.parseFloat((offset / totalHeight).toString()).toPrecision(4))
    })
  }

  // Initialize animated values
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    initAnimatedValues()
    if (isVisible) {
      setScrollAnim(scrollAnim)
    }
  }, [isVisible, panAnim])

  // Component mount/unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    emitter.on('scrollToRatio', scrollToRatioIfVisible, item._id)
    inflateItemAndSetState(item)
    hasMounted.current = true

    return () => {
      emitter.off(item._id)
    }
  }, [])

  // Component update for decoration status
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if ((item.isNewsletter || item.isExternal) &&
      (item.isDecorated || item.isHtmlCleaned || item.isMercuryCleaned)) {
      inflateItemAndSetState(item)
    }
  }, [
    item.isDecorated,
    item.isHtmlCleaned,
    item.isMercuryCleaned
  ])

  // Reveal animation effect
  useEffect(() => {
    if (!hasRendered && (item.isDecorated ||
      (item.decoration_failures && item.decoration_failures >= MAX_DECORATION_FAILURES))) {
      const reveal = new Animated.Value(1)
      isRevealing.current = true

      const animation = Animated.timing(reveal, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })

      animation.start(({ finished }) => {
        if (finished) {
          isRevealing.current = false
          setHasRendered(true)
        }
      })
    }
  }, [hasRendered, item.isDecorated, item.decoration_failures])

  const initAnimatedValues = (): void => {
    const newAnims = [0, 0, 0, 0, 0, 0].map((a, i) => {
      const inputRange = [0, 0.3, 0.7, 1, 1.3 - i * 0.05, 1.7 + i * 0.05, 2]
      const outputRange = [0, 0.3, 0.7, 1, 1.3, 1.7, 2]

      return panAnim.interpolate({
        inputRange,
        outputRange
      })
    })

    if (hasMounted.current && prevPanAnim.current !== panAnim) {
      anims.current = newAnims
      prevPanAnim.current = panAnim
      setAnimsUpdated(Date.now())
    } else {
      anims.current = newAnims
    }
  }

  interface StyleWithTransform {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    transform?: Array<{ [key: string]: any }>;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any;
  }

  const addAnimation = (
    style: StyleWithTransform,
    anim: Animated.AnimatedInterpolation<number>,
    isVisible: boolean
  ): StyleWithTransform => {
    const width = getMargin()
    const transform = style.transform || []
    if (isVisible) {
      return {
        ...style,
        left: width,
        opacity: anim.interpolate({
          inputRange: [0, 1, 1.05, 1.1, 2],
          outputRange: [1, 1, 1, 1, 1]
        }),
        transform: [
          ...transform,
          {
            translateX: anim.interpolate({
              inputRange: [0, 1.01, 1.1, 2],
              outputRange: [-width, -width, -width, -width]
            })
          }
        ]
      }
    }
    return {
      ...style,
      left: width,
      opacity: anim.interpolate({
        inputRange: [0, 1, 1.05, 1.1, 2],
        outputRange: [1, 1, 1, 0, 0]
      }),
      transform: [
        ...transform,
        {
          translateX: anim.interpolate({
            inputRange: [0, 1.01, 1.1, 2],
            outputRange: [-width, -width, width * 4, width * 4]
          })
        }
      ]
    }
  }

  const inflateItemAndSetState = async (itemToInflate: Item): Promise<void> => {
    try {
      const inflated = Platform.OS === 'web' ?
        await getItemIDB(itemToInflate) :
        await getItemSQLite(itemToInflate)

      if (!inflated) {
        return
      }

      // check whether title is first words of content
      if (inflated.content_html?.length !== undefined && inflated.content_html?.length < 1000 &&
        inflated.content_html
          .replace(/<.*?>/g, '')
          .trim()
          .startsWith(inflated.title.replace('...', ''))) {
        inflated.title = ''
      }
      if (inflated.content_html?.length !== undefined && inflated.content_html?.length < 1000 &&
        inflated.excerpt?.replace(/<.*?>/g, '')
          .trim()
          .startsWith(inflated.excerpt.replace('...', ''))) {
        inflated.excerpt = ''
      }

      setInflatedItem({
        ...itemToInflate,
        ...inflated
      })
    } catch (err) {
      log('inflateItemAndSetState', err)
    }
  }

  const scrollToRatioIfVisible = (): void => {
    if (isVisible) {
      scrollToOffset(false, false)
    }
  }

  const scrollToOffset = (isOverridable = false, useTimeout = true): void => {
    if (isOverridable && hasBegunScroll.current) return
    if (!scrollView.current) return
    if (!item.scrollRatio || typeof item.scrollRatio !== 'object') return

    const scrollRatio = item.scrollRatio[item.showMercuryContent ? 'mercury' : 'html']
    if (!scrollRatio || scrollRatio === 0) return

    setTimeout(() => {
      if (scrollView.current) {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (scrollView.current as any).scrollTo({
          x: 0,
          // use the ref to escape the problem of webViewHeight being inside the closure
          y: scrollRatio * webViewHeightRef.current,
          animated: true
        })
      }
    }, useTimeout ? 2000 : 0)
  }

  const updateWebViewHeight = (height: number): void => {
    if (!height || Math.abs(height - webViewHeight) < height * 0.1) {
      return
    }
    setWebViewHeight(height)
  }

  const onScrollEndDrag = (e: { nativeEvent: { contentOffset: { y: number } } }): void => {
    const offset = e.nativeEvent.contentOffset.y
    scrollEndTimer.current = setTimeout(() => {
      onMomentumScrollEnd(offset)
    }, 250)
  }

  const onMomentumScrollBegin = (): void => {
    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current)
    }
    hasBegunScroll.current = true
  }

  const onMomentumScrollEnd = (scrollOffset: number | { nativeEvent: { contentOffset: { y: number } } }): void => {
    const offset = typeof scrollOffset === 'number' ?
      scrollOffset :
      scrollOffset.nativeEvent.contentOffset.y

    currentScrollOffset.current = offset
    if (inflatedItem) {
      setScrollOffset(inflatedItem, offset, webViewHeight)
    }
    onScrollEnd(offset)
  }

  const onNavigationStateChange = (event: { url: string; jsEvaluationValue: string }): void => {
    // this means we're loading an image
    if (event.url.startsWith('react-js-navigation')) return
    const calculatedHeight = Number.parseInt(event.jsEvaluationValue)
    if (calculatedHeight) {
      updateWebViewHeight(calculatedHeight)
    }
  }

  const emptyState = (
    <View style={{
      width: screenDimensions.width,
      height: screenDimensions.height,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ActivityIndicator size="large" color={hslString('rizzleFG')} />
    </View>
  )

  if (!inflatedItem) {
    return emptyState
  }

  const {
    title,
    faceCentreNormalised,
    hasCoverImage,
    imageDimensions,
    showCoverImage,
    styles,
    created_at,
    savedAt
  } = inflatedItem

  const reveal = new Animated.Value(hasRendered ? 0 : 1)

  const isCoverInline = orientation !== 'landscape' && styles?.isCoverInline

  const bodyColor = isDarkMode ?
    'black' :
    styles?.hasFeedBGColor && !!color && JSON.stringify(color) !== '[0,0,0]' ?
      `hsl(${(color[0] + 180) % 360}, 15%, 90%)` :
      hslString('bodyBG')

  if (!styles || Object.keys(styles).length === 0) {
    return emptyState
  }

  const coverImage = showCoverImage ?
    <CoverImage
      styles={styles.coverImage}
      scrollAnim={scrollAnim}
      imagePath={hasCoverImage ? getCachedCoverImagePath(inflatedItem) : undefined}
      imageDimensions={hasCoverImage ? imageDimensions : undefined}
      faceCentreNormalised={faceCentreNormalised}
      orientation={orientation}
    /> :
    null

  const bodyStyle: StyleWithTransform = {
    backgroundColor: bodyColor
  }

  return (
    <View
      ref={view}
      style={{
        backgroundColor: bodyColor,
        flex: 1,
        overflow: 'hidden'
      }}
    >
      {(showCoverImage && !isCoverInline) && coverImage}
      <Animated.View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 250,
        width: screenDimensions.width,
        backgroundColor: bodyColor,
        opacity: scrollAnim.interpolate({
          inputRange: [0, 250, 251],
          outputRange: [0, 0, 1]
        })
      }} />
      <Animated.ScrollView
        onScroll={
          Animated.event(
            [{
              nativeEvent: {
                contentOffset: { y: scrollAnim }
              }
            }],
            {
              useNativeDriver: true
            }
          )
        }
        onMomentumScrollBegin={onMomentumScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={() => { hasBegunScroll.current = true }}
        onScrollEndDrag={onScrollEndDrag}
        pinchGestureEnabled={false}
        ref={scrollView}
        scrollEventThrottle={1}
        style={{
          flex: 1,
          minHeight: 100,
          minWidth: 100
        }}
      >
        {(isCoverInline || !showCoverImage || !coverImage) &&
          <Nudge
            feed_id={item.feed_id}
            scrollAnim={scrollAnim}
          />
        }
        {(showCoverImage && isCoverInline) && coverImage}
        <ItemTitleContainer
          anims={anims.current}
          addAnimation={addAnimation}
          backgroundColor={bodyColor}
          item={inflatedItem}
          isVisible={isVisible}
          title={title}
          excerpt={inflatedItem.excerpt}
          date={savedAt ? savedAt * 1000 : created_at}
          scrollOffset={scrollAnim}
          font={styles.fontClasses.heading}
          bodyFont={styles.fontClasses.body}
          hasCoverImage={hasCoverImage}
          showCoverImage={showCoverImage}
          isCoverInline={isCoverInline}
        />
        <Animated.View style={webViewHeight !== INITIAL_WEBVIEW_HEIGHT && // avoid https://sentry.io/organizations/adam-butler/issues/1608223243/
          (styles.coverImage?.isInline || !showCoverImage) ?
          addAnimation(bodyStyle, anims.current[5], isVisible) :
          bodyStyle}
        >
          <View style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            paddingTop: 100,
            backgroundColor: bodyColor
          }}>
            <ActivityIndicator size="large" color={hslString('rizzleFG')} />
          </View>
          <ItemBody
            bodyColor={bodyColor}
            item={{
              ...inflatedItem,
              ...item
            }}
            orientation={orientation}
            showImageViewer={showImageViewer}
            updateWebViewHeight={updateWebViewHeight}
            webViewHeight={webViewHeight}
          />
        </Animated.View>
      </Animated.ScrollView>
      {!hasRendered &&
        <Animated.View
          style={{
            backgroundColor: bodyColor,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: reveal
          }}
        >
          {emptyState}
        </Animated.View>
      }
    </View>
  )
}

export default FeedItem
