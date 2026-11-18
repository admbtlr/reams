import React, { useEffect, useLayoutEffect, useRef, useContext, useState } from 'react'
import {
  Animated,
  Dimensions,
  Platform,
  View,
} from 'react-native'
import Reanimated, {
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated'
import ItemComponent from '@/components/Item'
import Onboarding from '@/components/onboarding/Onboarding'
import { hslString } from '@/utils/colors'
import { SessionContext } from '@/components/AuthProvider'
import { useAnimation } from './AnimationContext'
import { logAnimationEvent } from '@/utils/feature-flags'
import {
  useRenderedWindow,
  useCurrentSlot,
  useSetCurrentSlot,
  useListResetCount,
} from './bufferedItemsStore'
import { useBufferedItemsManager } from './useBufferedItemsManager'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/reducers'
import { getItems } from '@/utils/get-item'

interface SwipeableViewsReanimatedProps {
  isOnboarding?: boolean
  emitter: any
  onScrollEnd: (offset: number) => void
  onTextSelection?: () => void
}

const SwipeableViewsReanimated: React.FC<SwipeableViewsReanimatedProps> = (props) => {
  const {
    isOnboarding,
    emitter,
    onScrollEnd,
    onTextSelection,
  } = props

  // Initialize the buffered items manager
  useBufferedItemsManager()

  // Get data from Zustand store
  const renderedWindow = useRenderedWindow()
  const currentSlot = useCurrentSlot()
  const setCurrentSlot = useSetCurrentSlot()
  const listResetCount = useListResetCount()

  // Redux
  const dispatch = useDispatch()
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const numItems = useSelector((state: RootState) => getItems(state).length)

  // Animation context for Reanimated shared values
  const { horizontalScroll, pruneAnimationValues } = useAnimation()

  // Session context for onboarding logic
  const sessionContext = useContext(SessionContext)

  const navigation = useNavigation()

  // Onboarding keeps its own local slot position - it does not touch the item store
  const [onboardingSlot, setOnboardingSlot] = useState(0)

  // Refs
  const scrollViewRef = useRef<Reanimated.ScrollView>(null)
  const panAnimsRef = useRef<{ [key: string]: Animated.Value }>({})

  // Screen dimensions
  const screenWidth = Dimensions.get('window').width
  const pageWidth = screenWidth

  // Onboarding pages: 3 before login, 2 after
  const onboardingPages = sessionContext?.session?.user ? [3, 4] : [0, 1, 2]

  // The ScrollView content width is fixed: numItems slots for items,
  // or one slot per onboarding page. Slots are stable empty Views; only
  // slots inside the rendered window mount an Item inside.
  const slotCount = isOnboarding ? onboardingPages.length : numItems

  // Set of slot indices that currently render an Item
  const renderedSlots = new Set(renderedWindow.map(w => w.slotIndex))
  const windowBySlot = new Map(renderedWindow.map(w => [w.slotIndex, w.item]))

  // Prune per-item shared values for items that left the rendered window
  useEffect(() => {
    if (!isOnboarding) {
      pruneAnimationValues(renderedWindow.map(w => w.item._id))
    }
  }, [renderedWindow, isOnboarding, pruneAnimationValues])

  // Create stable animated values for each rendered item
  useEffect(() => {
    if (!isOnboarding) {
      const newPanAnims: { [key: string]: Animated.Value } = {}
      renderedWindow.forEach(({ item }) => {
        if (!panAnimsRef.current[item._id]) {
          newPanAnims[item._id] = new Animated.Value(1)
        } else {
          newPanAnims[item._id] = panAnimsRef.current[item._id]
        }
      })
      panAnimsRef.current = newPanAnims
    }
  }, [renderedWindow, isOnboarding])

  // Re-anchor scroll position synchronously before paint whenever the item
  // list is reset (filter/display-mode change or clear)
  useLayoutEffect(() => {
    if (scrollViewRef.current) {
      const x = screenWidth * currentSlot
      scrollViewRef.current.scrollTo({
        x,
        y: 0,
        animated: false
      })
      horizontalScroll.value = x
    }
  }, [listResetCount, screenWidth, horizontalScroll])

  // Update slot helper - the slot index maps directly to the ScrollView offset
  const updateSlot = (newSlot: number) => {
    if (isOnboarding) {
      setOnboardingSlot(Math.max(0, Math.min(newSlot, onboardingPages.length - 1)))
      return
    }
    if (newSlot !== currentSlot) {
      setCurrentSlot(newSlot, dispatch, displayMode)
    }
  }

  // Reanimated scroll handler for horizontal paging
  const reanimatedScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Update horizontal scroll position in shared value
      horizontalScroll.value = event.contentOffset.x
    },
    onEndDrag: (event) => {
      // only update the slot if the drag ended on a snap point
      // otherwise there will be some momentum happening
      if (event.contentOffset.x % screenWidth === 0) {
        const newSlot = Math.round(event.contentOffset.x / screenWidth)
        runOnJS(updateSlot)(newSlot)
      }
    },
    onMomentumEnd: (event) => {
      const newSlot = Math.round(event.contentOffset.x / screenWidth)
      runOnJS(updateSlot)(newSlot)

      if (__DEV__) {
        runOnJS(logAnimationEvent)('horizontal-scroll-momentum-end', {
          offset: event.contentOffset.x,
          newSlot
        })
      }
    }
  })

  let children

  if (isOnboarding) {
    // Onboarding pages become slots in the same full-width ScrollView,
    // with the same window logic (pages are few, so all are rendered)
    children = onboardingPages.map((page, slotIndex) => (
      <View key={`onboarding-slot-${slotIndex}`} style={{ width: screenWidth }}>
        {slotIndex >= Math.max(0, onboardingSlot - 1) && (
          <Onboarding
            key={`onboarding-${page}`}
            index={page}
            isVisible={onboardingSlot === slotIndex}
            navigation={navigation}
          />
        )}
      </View>
    ))
  } else {
    // Full-width virtualized carousel: numItems stable slots, only the
    // rendered window mounts Items. Slots never move or re-mount.
    children = Array.from({ length: slotCount }, (_, slotIndex) => {
      const item = windowBySlot.get(slotIndex)
      return (
        <View key={`slot-${slotIndex}`} style={{ width: screenWidth }}>
          {item && (
            <ItemComponent
              key={item._id}
              _id={item._id}
              slotIndex={slotIndex}
              emitter={emitter}
              onScrollEnd={onScrollEnd}
              panAnim={panAnimsRef.current[item._id] || new Animated.Value(1)}
            />
          )}
        </View>
      )
    })
  }

  return (
    <Reanimated.ScrollView
      ref={scrollViewRef}
      bounces={false}
      contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
      decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.9}
      disableIntervalMomentum={true}
      disableScrollViewPanResponder={Platform.OS === 'android'}
      horizontal
      keyboardShouldPersistTaps="handled"
      onScroll={reanimatedScrollHandler}
      overScrollMode="never"
      scrollEventThrottle={16}
      scrollToOverflowEnabled={true}
      showsHorizontalScrollIndicator={false}
      snapToInterval={pageWidth}
      snapToAlignment="start"
      style={{
        flex: 1,
        flexDirection: 'row',
        height: Dimensions.get('window').height,
        backgroundColor: hslString('bodyBG')
      }}
    >
      {children}
    </Reanimated.ScrollView>
  )
}

export default SwipeableViewsReanimated
