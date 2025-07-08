import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ActivityIndicator, Animated, Dimensions, Platform, ScrollView, StatusBar, View, useWindowDimensions } from 'react-native'
import Reanimated, { useAnimatedScrollHandler, runOnJS, useSharedValue, withTiming, interpolate, useAnimatedStyle, useAnimatedReaction } from 'react-native-reanimated'
import CoverImage from './CoverImage'
import ItemBody from './ItemBody'
import ItemTitle from './ItemTitle'
import { getCachedCoverImagePath } from '../utils/'
import { getMargin, getStatusBarHeight } from '../utils/dimensions'
import { hslString } from '../utils/colors'
import { getItem as getItemSQLite } from "@/storage/sqlite"
import { getItem as getItemIDB } from "@/storage/idb-storage"
import log from '../utils/log'
import Nudge from './Nudge'
import { MAX_DECORATION_FAILURES } from '../sagas/decorate-items'
import { Item, ItemInflated, SET_SCROLL_OFFSET } from '../store/items/types'
import { HIDE_ALL_BUTTONS, SHOW_IMAGE_VIEWER, SHOW_ITEM_BUTTONS } from '../store/ui/types'
import { getIndex, getItems } from '../utils/get-item'
import { useColor } from '../hooks/useColor'
import type { RootState } from '../store/reducers'
import { useAnimation } from '@/components/ItemCarousel/AnimationContext'
import { useReanimatedScroll, logAnimationEvent } from '../utils/feature-flags'

export const INITIAL_WEBVIEW_HEIGHT = 1000

// Types

interface FeedItemProps {
  _id: string;
  coverImageComponent?: React.ComponentType<any>;
  setTimerFunction?: (timer: number | null) => void;
  emitter: {
    on: (event: string, callback: () => void, id?: string) => void;
    off: (id: string) => void;
  };
  itemIndex: number;
  panAnim: Animated.Value;
  onScrollEnd: (offset: number) => void;
  // setScrollAnim: (anim: Animated.Value) => void;
}

export const FeedItem: React.FC<FeedItemProps> = (props) => {
  const {
    _id,
    emitter,
    itemIndex,
    onScrollEnd,
  } = props

  const dispatch = useDispatch()

  // Redux selectors
  const items = useSelector((state: RootState) => getItems(state))
  const currentIndex = useSelector((state: RootState) => getIndex(state))
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const orientation = useSelector((state: RootState) => state.config.orientation)

  // Animation context (new Reanimated system)
  const animationContext = useAnimation()

  // Feature flag to control new vs old scroll behavior
  const useReanimatedScrollHandlers = useReanimatedScroll()

  // Find the current item
  const rawItem = items.find(item => item._id === _id)

  const color = useColor(rawItem?.url)

  // Find related feed or newsletter
  const feed = useSelector((state: RootState) =>
    state.feeds.feeds.find(f => f._id === rawItem?.feed_id)
  )
  const newsletter = useSelector((state: RootState) =>
    state.newsletters.newsletters.find(n => n._id === rawItem?.feed_id)
  )

  const showMercuryContent = rawItem?.showMercuryContent !== undefined ?
    rawItem.showMercuryContent :
    feed?.isMercury

  // Complete item with additional data
  const item: Item | undefined = rawItem && {
    ...rawItem,
    showMercuryContent
  }

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
  const [isVisible, setIsVisible] = useState<boolean>(false)

  // use a ref so that we can reference this value within a closure
  // i.e. the scrollToOffset function below
  const webViewHeightRef = useRef(webViewHeight)
  // Update the ref whenever webViewHeight changes
  useEffect(() => {
    webViewHeightRef.current = webViewHeight
  }, [webViewHeight])

  // Other refs to replace class properties
  const screenDimensions = useRef(Dimensions.get('window')).current
  const wasShowCoverImage = useRef<boolean | undefined>(item?.showCoverImage)
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

  // Component mount/unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (item === undefined) return
    emitter.on('scrollToRatio', scrollToRatioIfVisible, item._id)
    inflateItemAndSetState(item)
    hasMounted.current = true

    return () => {
      emitter.off(item._id)
    }
  }, [item])

  // Component update for decoration status
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if ((item?.isNewsletter || item?.isExternal) &&
      (item?.isDecorated || item?.isHtmlCleaned || item?.isMercuryCleaned)) {
      inflateItemAndSetState(item)
    }
  }, [
    item?.isDecorated,
    item?.isHtmlCleaned,
    item?.isMercuryCleaned
  ])

  // Reveal animation effect
  useEffect(() => {
    if (!hasRendered && (item?.isDecorated ||
      (item?.decoration_failures && item?.decoration_failures >= MAX_DECORATION_FAILURES))) {
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
  }, [hasRendered, item?.isDecorated, item?.decoration_failures])

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
    if (!item?.scrollRatio || typeof item?.scrollRatio !== 'object') return

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

  const onNavigationStateChange = (event: { url: string; jsEvaluationValue: string }): void => {
    // this means we're loading an image
    if (event.url.startsWith('react-js-navigation')) return
    const calculatedHeight = Number.parseInt(event.jsEvaluationValue)
    if (calculatedHeight) {
      updateWebViewHeight(calculatedHeight)
    }
  }

  // SCROLL HANDLER
  const { buttonsVisibles, headerVisibles, horizontalScroll, isScrolling, verticalScrolls } = useAnimation()
  const scrollBegin = useSharedValue(0)
  const lastScrollY = useSharedValue(0)
  const lastScrollDirection = useSharedValue(0) // 1 = down, -1 = up, 0 = none
  const statusBarHeight = getStatusBarHeight()

  const screenWidth = useWindowDimensions().width

  const setButtonsVisible = (isVisible: boolean) => {
    dispatch({
      type: isVisible ? SHOW_ITEM_BUTTONS : HIDE_ALL_BUTTONS
    })
  }

  // reset the shared scroll animation values as soon as this FeedItem becomes visible
  useAnimatedReaction(
    () => horizontalScroll.value,
    () => {
      if (horizontalScroll.value / screenWidth === itemIndex) {
        // buttonsVisible.value = 1
        // headerVisibles[itemIndex].value = 0
        // verticalScrolls[itemIndex].value = 0
        runOnJS(setButtonsVisible)(true)
        runOnJS(setIsVisible)(true)
        // runOnJS(initAnimatedValues)
      }
    })

  const setStatusBarVisible = (isStatusBarVisible: boolean) => {
    StatusBar.setHidden(!isStatusBarVisible)
  }

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: (event) => {
      isScrolling.value = true
      scrollBegin.value = event.contentOffset.y
      lastScrollY.value = event.contentOffset.y
    },
    onScroll: (event) => {
      // Update scroll position
      verticalScrolls[itemIndex].value = event.contentOffset.y

      // Track relative scroll movement for TopBar
      const currentY = event.contentOffset.y
      const deltaY = currentY - lastScrollY.value
      const contentHeight = event.contentSize.height
      const layoutHeight = event.layoutMeasurement.height
      const maxScrollY = contentHeight - layoutHeight

      // Don't update header when at top of page to prevent bounce issues
      if (currentY < 10) {
        headerVisibles[itemIndex].value = 0 // Keep header visible at top
        lastScrollY.value = currentY
        return
      }

      // Don't update header when at bottom of page to prevent bounce issues
      if (currentY > maxScrollY - 10) {
        // Keep current header state when at bottom to avoid bounce effects
        lastScrollY.value = currentY
        return
      }

      // Track scroll direction
      if (Math.abs(deltaY) > 1) { // Only update direction for meaningful movement
        lastScrollDirection.value = deltaY > 0 ? 1 : -1
      }

      // Update header offset based on scroll direction
      // Scrolling down (positive delta) - hide header
      // Scrolling up (negative delta) - show header
      const currentOffset = headerVisibles[itemIndex].value
      const newOffset = Math.max(0, Math.min(statusBarHeight, currentOffset + deltaY))

      headerVisibles[itemIndex].value = newOffset
      lastScrollY.value = currentY
    },
    onEndDrag: (event) => {
      isScrolling.value = false
      buttonsVisibles[itemIndex].value = event.contentOffset.y > scrollBegin.value ? 0 : 1

      runOnJS(setButtonsVisible)(buttonsVisibles[itemIndex].value === 1)

      // Snap TopBar to fully visible or hidden based on last scroll direction
      const currentOffset = headerVisibles[itemIndex].value
      const threshold = statusBarHeight / 2

      let targetOffset = 0
      if (lastScrollDirection.value > 0) {
        // Was scrolling down - snap to hidden
        targetOffset = statusBarHeight
      } else if (lastScrollDirection.value < 0) {
        // Was scrolling up - snap to visible
        targetOffset = 0
      } else {
        // No clear direction - snap based on current position
        targetOffset = currentOffset > threshold ? statusBarHeight : 0
      }

      runOnJS(setStatusBarVisible)(targetOffset === 0)

      headerVisibles[itemIndex].value = withTiming(targetOffset, { duration: 200 })

      if (__DEV__) {
        runOnJS(logAnimationEvent)('scroll-end-drag', {
          offset: event.contentOffset.y
        })
      }
    },
    onMomentumEnd: (event) => {
      // Only update shared values if this FeedItem is currently visible
      isScrolling.value = false

      // Snap TopBar to fully visible or hidden based on last scroll direction
      const currentOffset = headerVisibles[itemIndex].value
      const threshold = statusBarHeight / 2

      let targetOffset = 0
      if (lastScrollDirection.value > 0) {
        // Was scrolling down - snap to hidden
        targetOffset = statusBarHeight
      } else if (lastScrollDirection.value < 0) {
        // Was scrolling up - snap to visible
        targetOffset = 0
      } else {
        // No clear direction - snap based on current position
        targetOffset = currentOffset > threshold ? statusBarHeight : 0
      }

      headerVisibles[itemIndex].value = withTiming(targetOffset, { duration: 200 })

      if (__DEV__) {
        runOnJS(logAnimationEvent)('scroll-momentum-end', { offset: event.contentOffset.y })
      }
    }
  })
  // END SCROLL HANDLER

  // ANIMATED STYLES
  const fakeBgOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(verticalScrolls[itemIndex].value, [0, 250, 251], [0, 0, 1])
  }))
  // END ANIMATED STYLES

  // Early return if item not found
  if (!rawItem) return null

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

  const colorArray = color?.match(/hsl\((\d+), (\d+)%, (\d+)%\)/)
  const bodyColor = isDarkMode ?
    'black' :
    styles?.hasFeedBGColor && !!colorArray && !!colorArray[1] && JSON.stringify(color) !== '[0,0,0]' ?
      `hsl(${(Number.parseInt(colorArray[1]) + 180) % 360}, 15%, 90%)` :
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
      isVisible={isVisible}
      itemIndex={itemIndex}
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
      <Reanimated.View style={[{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 250,
        width: screenDimensions.width,
        backgroundColor: bodyColor,
      }, fakeBgOpacityStyle]} />
      <Reanimated.ScrollView
        onScroll={scrollHandler}
        // onMomentumScrollBegin={onMomentumScrollBegin}
        // onMomentumScrollEnd={onMomentumScrollEnd}
        // onScrollBeginDrag={() => {
        //   hasBegunScroll.current = true
        // }}
        // onScrollEndDrag={onScrollEndDrag}
        pinchGestureEnabled={false}
        ref={scrollView}
        scrollEventThrottle={useReanimatedScrollHandlers ? 16 : 1}
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
        <ItemTitle
          anims={anims.current}
          // addAnimation={addAnimation}
          backgroundColor={bodyColor}
          item={inflatedItem}
          isVisible={isVisible}
          itemIndex={itemIndex}
          title={title}
          excerpt={inflatedItem.excerpt}
          date={savedAt ? savedAt * 1000 : created_at}
          scrollOffset={scrollAnim}
          font={styles.fontClasses?.heading}
          bodyFont={styles.fontClasses?.body}
          hasCoverImage={hasCoverImage}
          showCoverImage={showCoverImage}
          isCoverInline={isCoverInline}
        />
        <Animated.View style={webViewHeight !== INITIAL_WEBVIEW_HEIGHT && // avoid https://sentry.io/organizations/adam-butler/issues/1608223243/
          (styles.coverImage?.isInline || !showCoverImage) ?
          //addAnimation(bodyStyle, anims.current[5], isVisible) :
          bodyStyle :
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
      </Reanimated.ScrollView>
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
