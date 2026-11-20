import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  NativeScrollEvent,
  StatusBar,
  View,
  useWindowDimensions
} from 'react-native'
import Reanimated, {
  useAnimatedScrollHandler,
  useAnimatedProps,
  runOnJS,
  useSharedValue,
  withTiming,
  interpolate,
  useAnimatedStyle,
  useAnimatedReaction
} from 'react-native-reanimated'
import CoverImage from '../CoverImage'
import ItemBody from './ItemBody'
import ItemTitle from '../ItemTitle'
import { getCachedCoverImagePath, getHost } from '../../utils/'
import { getMargin, getStatusBarHeight } from '../../utils/dimensions'
import { hslString } from '../../utils/colors'
import log from '../../utils/log'
import Nudge from '../Nudge'
import { MAX_DECORATION_FAILURES } from '../../sagas/decorate-items'
import {
  Item as TItem,
  ItemInflated,
  SET_SCROLL_OFFSET
} from '../../store/items/types'
import {
  HIDE_ALL_BUTTONS,
  SHOW_IMAGE_VIEWER,
  SHOW_ITEM_BUTTONS
} from '../../store/ui/types'
import { getIndex, getItems, selectFilteredItems } from '../../utils/get-item'
import { useColor } from '../../hooks/useColor'
import type { RootState } from '../../store/reducers'
import { useAnimation } from '@/components/ItemCarousel/AnimationContext'
import {
  useReanimatedScroll,
  logAnimationEvent
} from '../../utils/feature-flags'
import {
  useCurrentSlot,
  useItemAtSlot
} from '../ItemCarousel/bufferedItemsStore'

const entities = require('entities')

// Types

interface ItemProps {
  _id: string
  coverImageComponent?: React.ComponentType<any>
  setTimerFunction?: (timer: number | null) => void
  emitter: {
    on: (event: string, callback: () => void, id?: string) => void
    off: (id: string) => void
  }
  slotIndex: number
  panAnim: Animated.Value
  onScrollEnd: (offset: number) => void
  // setScrollAnim: (anim: Animated.Value) => void;
}

const Item: React.FC<ItemProps> = (props) => {
  const { _id, emitter, slotIndex, onScrollEnd, panAnim } = props

  const dispatch = useDispatch()

  const inflatedItem = useItemAtSlot(slotIndex) as ItemInflated

  // Redux selectors
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const orientation = useSelector(
    (state: RootState) => state.config.orientation
  )

  const [adjustedTitle, setAdjustedTitle] = useState<string | undefined>(
    inflatedItem.title
  )
  const [adjustedExcerpt, setAdjustedExcerpt] = useState<string | undefined>(
    inflatedItem.excerpt
  )

  useEffect(() => {
    // check whether title is first words of content
    const content =
      inflatedItem?.content_html?.length !== undefined &&
      inflatedItem?.content_html?.length > 0
        ? inflatedItem.content_html
        : inflatedItem.content_mercury
    if (content === undefined || content === null || content.length > 1000)
      return
    if (
      entities
        .decode(content.substring(0, 200))
        .replace(/<.*?>/g, '')
        .trim()
        .startsWith(inflatedItem?.title.replace('...', ''))
    ) {
      setAdjustedTitle('')
    }
    if (
      inflatedItem?.excerpt != null &&
      content
        .substring(0, 200)
        .replace(/<.*?>/g, '')
        .trim()
        .startsWith(inflatedItem.excerpt.replace('...', ''))
    ) {
      setAdjustedExcerpt('')
    }
  }, [inflatedItem])

  // Find related feed or newsletter
  const feed = useSelector((state: RootState) =>
    state.feeds.feeds.find((f) => f._id === inflatedItem?.feed_id)
  )
  const newsletter = useSelector((state: RootState) =>
    state.newsletters.newsletters.find((n) => n._id === inflatedItem?.feed_id)
  )

  // do we already have the color?
  const host = getHost(inflatedItem, feed)
  const cachedColor = useSelector(
    (state: RootState) =>
      state.hostColors.hostColors.find((hc) => hc.host === host)?.color
  )
  const hookColor = useColor(host, cachedColor === undefined)
  const color = hookColor || cachedColor

  const showMercuryContent =
    inflatedItem?.showMercuryContent !== undefined
      ? inflatedItem.showMercuryContent
      : feed?.isMercury

  // Complete item with additional data
  const item: TItem | undefined = inflatedItem && {
    ...inflatedItem,
    showMercuryContent
  }

  // Refs
  const view = useRef<View>(null)

  // Animation refs
  const scrollAnim = useRef(new Animated.Value(0)).current
  const anims = useRef<Animated.AnimatedInterpolation<number>[]>([])
  const prevPanAnim = useRef<Animated.Value | null>(null)
  const hasRendered = useRef<boolean>(false)
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null)

  const currentSlot = useCurrentSlot()

  // State
  // height of the Underlay (cover + title), measured via onLayout; drives
  // the WebView's native paddingTop. In full-bleed mode the Underlay is a
  // full screen, so the padding is the screen height.
  const [underlayHeight, setUnderlayHeight] = useState<number | null>(null)
  // bumped to re-trigger in-page scroll restoration inside the WebView
  const [restoreScrollNonce, setRestoreScrollNonce] = useState<number>(0)
  // const [inflatedItem, setInflatedItem] = useState<ItemInflated | null>(null)
  const [animsUpdated, setAnimsUpdated] = useState<number>(Date.now())
  const [isVisible, setIsVisible] = useState<boolean>(slotIndex === currentSlot)

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
      url,
      itemId: item._id
    })
  }

  // Component mount/unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (item === undefined) return
    emitter.on('scrollToRatio', scrollToRatioIfVisible, item._id)
    // inflateItemAndSetState(item)
    hasMounted.current = true

    return () => {
      emitter.off(item._id)
    }
  }, [item])

  // Component update for decoration status
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // useEffect(() => {
  //   if ((item?.isNewsletter || item?.isExternal) &&
  //     (item?.isDecorated || item?.isHtmlCleaned || item?.isMercuryCleaned)) {
  //     inflateItemAndSetState(item)
  //   }
  // }, [
  //   item?.isDecorated,
  //   item?.isHtmlCleaned,
  //   item?.isMercuryCleaned
  // ])

  // Reveal animation effect
  useEffect(() => {
    if (
      !hasRendered.current &&
      (item?.isDecorated ||
        (item?.decoration_failures &&
          item?.decoration_failures >= MAX_DECORATION_FAILURES))
    ) {
      const reveal = new Animated.Value(1)

      const animation = Animated.timing(reveal, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })

      animation.start(({ finished }) => {
        if (finished) {
          hasRendered.current = true
        }
      })
    }
  }, [hasRendered.current, item?.isDecorated, item?.decoration_failures])

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
    transform?: Array<{ [key: string]: any }>
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any
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

  const scrollToRatioIfVisible = (): void => {
    if (isVisible) {
      scrollToOffset(false, false)
    }
  }

  const scrollToOffset = (isOverridable = false, useTimeout = true): void => {
    if (isOverridable && hasBegunScroll.current) return
    if (!item?.scrollRatio || typeof item?.scrollRatio !== 'object') return

    const scrollRatio =
      item.scrollRatio[item.showMercuryContent ? 'mercury' : 'html']
    if (!scrollRatio || scrollRatio === 0) return

    // the WebView scrolls itself; restoration happens in-page (see ItemBody)
    setTimeout(
      () => {
        setRestoreScrollNonce(Date.now())
      },
      useTimeout ? 2000 : 0
    )
  }

  // SCROLL HANDLER
  const {
    getButtonsVisible,
    getHeaderVisible,
    getVerticalScroll,
    horizontalScroll,
    isScrolling,
    isHorizontalScrolling,
    isTouchActive
  } = useAnimation()
  // Gesture lock, WebView side: while the carousel is scrolling horizontally,
  // the WebView must not scroll vertically in the same gesture
  const webViewAnimatedProps = useAnimatedProps(() => ({
    scrollEnabled: !isHorizontalScrolling.value
  }))

  // Per-item shared values keyed by this item's _id
  const verticalScroll = getVerticalScroll(_id)
  const headerVisible = getHeaderVisible(_id)
  const buttonsVisible = getButtonsVisible(_id)
  const statusBarHeight = getStatusBarHeight()

  const screenWidth = useWindowDimensions().width

  const setButtonsVisible = (isVisible: boolean) => {
    dispatch({
      type: isVisible ? SHOW_ITEM_BUTTONS : HIDE_ALL_BUTTONS
    })
  }

  // reset the shared scroll animation values as soon as this Item becomes visible
  useAnimatedReaction(
    () => horizontalScroll.value,
    () => {
      if (horizontalScroll.value / screenWidth === slotIndex) {
        // buttonsVisible.value = 1
        // headerVisible.value = 0
        // verticalScroll.value = 0
        runOnJS(setButtonsVisible)(true)
        runOnJS(setIsVisible)(true)
        // runOnJS(initAnimatedValues)
      }
    }
  )

  const setStatusBarVisible = (isStatusBarVisible: boolean) => {
    StatusBar.setHidden(!isStatusBarVisible)
  }

  // Runs on the UI thread via the WebView's native onScroll (the WebView is
  // wrapped in Reanimated.createAnimatedComponent in ItemBody). The WebView
  // only emits onScroll — no begin/end drag — so scroll end is detected with
  // a UI-runtime setTimeout (150ms after the last meaningful movement), and
  // only then crosses the bridge (runOnJS) to snap the header and toggle
  // buttons/status bar.
  const scrollDirection = useSharedValue(0) // 1 = down, -1 = up, 0 = none

  interface ScrollContext {
    lastY: number
    endTimeout?: number
  }

  const scrollHandler = useAnimatedScrollHandler<
    NativeScrollEvent,
    ScrollContext
  >(
    {
      onScroll: (event, ctx) => {
        const currentY = event.contentOffset.y
        const maxScrollY =
          event.contentSize.height - event.layoutMeasurement.height

        // Update scroll position with the raw offset (including negative
        // overscroll) so the Underlay/fake-bg keep their rubber-band bounce
        verticalScroll.value = currentY

        // ...but ignore out-of-range offsets for gesture logic: negative y
        // and beyond-max y are bounces, not scrolling — treating them as
        // movement hides the TopBar/buttons when the WebView bounces back.
        if (currentY < 0 || currentY > maxScrollY) {
          ctx.lastY = currentY
          return
        }

        const deltaY = currentY - (ctx.lastY ?? 0)
        ctx.lastY = currentY

        // Don't update header when near top/bottom to prevent bounce issues
        if (currentY >= 10 && currentY <= maxScrollY - 10) {
          // Update header offset based on scroll direction
          // Scrolling down (positive delta) - hide header
          // Scrolling up (negative delta) - show header
          headerVisible.value = Math.max(
            0,
            Math.min(statusBarHeight, headerVisible.value + deltaY)
          )
        }

        // Only lock the carousel to the vertical axis once the gesture has
        // meaningful vertical movement — horizontal swipes must pass through
        if (Math.abs(deltaY) > 1) {
          // vertical axis wins this gesture: lock the carousel, make sure
          // the WebView itself is not locked by a horizontal gesture
          isScrolling.value = true
          isHorizontalScrolling.value = false
          scrollDirection.value = deltaY > 0 ? 1 : -1

          // (re)schedule scroll-end detection on the UI thread. A pause
          // while the finger is still down is NOT the end of the gesture —
          // only release once the touch has ended and scrolling went idle,
          // otherwise a mid-gesture pause would let the carousel swipe.
          if (ctx.endTimeout !== undefined) {
            clearTimeout(ctx.endTimeout)
          }
          const checkEnd = () => {
            if (isTouchActive.value) {
              ctx.endTimeout = setTimeout(checkEnd, 150)
              return
            }
            isScrolling.value = false

            // Snap TopBar to fully visible or hidden based on last direction
            const threshold = statusBarHeight / 2
            let targetOffset = 0
            if (scrollDirection.value > 0) {
              targetOffset = statusBarHeight
            } else if (scrollDirection.value < 0) {
              targetOffset = 0
            } else {
              targetOffset =
                headerVisible.value > threshold ? statusBarHeight : 0
            }
            headerVisible.value = withTiming(targetOffset, { duration: 200 })

            const buttonsShown = scrollDirection.value <= 0
            buttonsVisible.value = buttonsShown ? 1 : 0
            runOnJS(setButtonsVisible)(buttonsShown)
            runOnJS(setStatusBarVisible)(targetOffset === 0)

            if (__DEV__) {
              runOnJS(logAnimationEvent)('scroll-end', { offset: currentY })
            }
          }
          ctx.endTimeout = setTimeout(checkEnd, 150)
        }
      }
    },
    []
  )
  // END SCROLL HANDLER

  // ANIMATED STYLES
  const fakeBgOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      verticalScroll.value,
      [0, 250, 251],
      [0, 0, 1]
    )
  }))
  // the Underlay scrolls away 1:1 with the WebView's scroll offset, as if
  // it were still inside the (now removed) ScrollView
  const underlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -verticalScroll.value }]
  }))
  // END ANIMATED STYLES

  // Early return if item not found
  if (!inflatedItem) return null

  const emptyState = (
    <View
      style={{
        width: screenDimensions.width,
        height: screenDimensions.height,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
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

  const reveal = new Animated.Value(hasRendered.current ? 0 : 1)

  const isCoverInline = orientation !== 'landscape' && styles?.isCoverInline
  const isFullBleed = !!showCoverImage && !isCoverInline
  const scrollRatio =
    item?.scrollRatio && typeof item.scrollRatio === 'object'
      ? item.scrollRatio[item.showMercuryContent ? 'mercury' : 'html']
      : undefined

  const colorArray = color?.match(/hsl\((\d+), (\d+)%, (\d+)%\)/)
  const bodyColor = isDarkMode
    ? 'black'
    : styles?.hasFeedBGColor &&
      !!colorArray &&
      !!colorArray[1] &&
      JSON.stringify(color) !== '[0,0,0]'
    ? `hsl(${(Number.parseInt(colorArray[1]) + 180) % 360}, 15%, 90%)`
    : hslString('bodyBG')

  if (!styles || Object.keys(styles).length === 0) {
    return emptyState
  }

  const coverImage = showCoverImage ? (
    <CoverImage
      styles={styles.coverImage}
      scrollAnim={scrollAnim}
      imagePath={
        hasCoverImage ? getCachedCoverImagePath(inflatedItem) : undefined
      }
      imageDimensions={hasCoverImage ? imageDimensions : undefined}
      faceCentreNormalised={faceCentreNormalised}
      orientation={orientation}
      isVisible={isVisible}
      itemId={_id}
    />
  ) : null

  return (
    <View
      ref={view}
      style={{
        backgroundColor: bodyColor,
        flex: 1,
        overflow: 'hidden'
      }}
    >
      {/* full-bleed cover stays fixed; the ItemBody slides over it */}
      {isFullBleed && coverImage}
      {/* fades bodyColor over the cover as you scroll */}
      <Reanimated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 250,
            width: screenDimensions.width,
            backgroundColor: bodyColor
          },
          fakeBgOpacityStyle
        ]}
      />
      {/* Underlay: cover (inline) + title, scrolls away 1:1 with the WebView.
          Its measured height becomes the WebView's transparent paddingTop. */}
      <Reanimated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          },
          underlayStyle
        ]}
        onLayout={(event) =>
          setUnderlayHeight(event.nativeEvent.layout.height)
        }
      >
        {(isCoverInline || !showCoverImage || !coverImage) && (
          <Nudge feed_id={item.feed_id} scrollAnim={scrollAnim} />
        )}
        {showCoverImage && isCoverInline && coverImage}
        <ItemTitle
          anims={anims.current}
          // addAnimation={addAnimation}
          backgroundColor={bodyColor}
          item={inflatedItem}
          isVisible={isVisible}
          itemId={_id}
          title={adjustedTitle}
          excerpt={adjustedExcerpt}
          date={savedAt ? savedAt * 1000 : created_at}
          scrollOffset={scrollAnim}
          font={styles.fontClasses?.heading}
          bodyFont={styles.fontClasses?.body}
          hasCoverImage={hasCoverImage}
          showCoverImage={showCoverImage}
          isCoverInline={isCoverInline}
        />
      </Reanimated.View>
      {/* ItemBody: a self-scrolling WebView on top, transparent paddingTop
          reveals the Underlay through the top window */}
      <ItemBody
        bodyColor={bodyColor}
        item={{
          ...inflatedItem,
          ...item
        }}
        orientation={orientation}
        showImageViewer={showImageViewer}
        paddingTop={
          isFullBleed ? screenDimensions.height : (underlayHeight ?? 0)
        }
        underlayReady={isFullBleed || underlayHeight !== null}
        onScroll={scrollHandler}
        animatedProps={webViewAnimatedProps}
        onTouchStart={() => {
          isTouchActive.value = true
        }}
        onTouchEnd={() => {
          isTouchActive.value = false
        }}
        onTouchCancel={() => {
          isTouchActive.value = false
        }}
        scrollRatio={scrollRatio}
        restoreScrollNonce={restoreScrollNonce}
      />
      {/*{!hasRendered.current &&
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
      }*/}
    </View>
  )
}

export default Item
