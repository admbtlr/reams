import React, { useEffect, useLayoutEffect, useRef, useContext } from 'react'
import {
  Animated,
  Dimensions,
  Platform,
} from 'react-native'
import Reanimated, {
  useAnimatedScrollHandler,
  runOnJS,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated'
import ItemComponent from '@/components/Item'
import Onboarding from '@/components/onboarding/Onboarding'
import { hslString } from '@/utils/colors'
import { SessionContext } from '@/components/AuthProvider'
import { useAnimation } from './AnimationContext'
import { logAnimationEvent } from '@/utils/feature-flags'
import { useBufferedItems, useBufferStartIndex, useBufferIndex, useSetBufferIndex } from './bufferedItemsStore'
import { useBufferedItemsManager } from './useBufferedItemsManager'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/reducers'

interface SwipeableViewsReanimatedProps {
  isOnboarding?: boolean
  emitter: any
  onScrollEnd: (offset: number) => void
  onTextSelection?: () => void
  // updateIndex: (index: number) => void
}

const SwipeableViewsReanimated: React.FC<SwipeableViewsReanimatedProps> = (props) => {
  const {
    isOnboarding,
    emitter,
    onScrollEnd,
    onTextSelection,
    // updateIndex,
  } = props

  // Initialize the buffered items manager
  useBufferedItemsManager()

  // Get data from Zustand store
  const bufferedItems = useBufferedItems()
  const bufferStartIndex = useBufferStartIndex()
  const bufferIndex = useBufferIndex()
  const setBufferIndex = useSetBufferIndex()

  // Redux
  const dispatch = useDispatch()
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)

  // Animation context for Reanimated shared values
  const { horizontalScroll, headerVisibles, buttonsVisibles, verticalScrolls } = useAnimation()

  // reset animation values when re-rendering
  useEffect(() => {
    headerVisibles.forEach(hv => hv.set(0))
    buttonsVisibles.forEach(bv => bv.set(1))
    verticalScrolls.forEach(vs => vs.set(0))
  }, [bufferedItems])

  // Session context for onboarding logic
  const sessionContext = useContext(SessionContext)

  const navigation = useNavigation()

  // Refs
  const scrollViewRef = useRef<Reanimated.ScrollView>(null)
  const panAnimsRef = useRef<{ [key: string]: Animated.Value }>({})

  // Screen dimensions
  const screenWidth = Dimensions.get('window').width
  const pageWidth = screenWidth

  // Update current index ref and context values
  // useEffect(() => {
  //   currentBufferIndexRef.current = index
  //   currentIndex.value = index
  //   // Update buffer index (index === 0 ? 0 : 1 matches the buffer logic)
  //   const newBufferIndex = index === 0 ? 0 : 1
  //   setBufferIndex(newBufferIndex)
  //   if (__DEV__) {
  //     console.log(`[SwipeableViews] useEffect index change: index=${index}, newBufferIndex=${newBufferIndex}`)
  //   }
  // }, [index, currentIndex, setBufferIndex])

  // refresh the currentBufferIndexRef when the buffer is rebuilt

  // Create stable animated values for each item
  useEffect(() => {
    if (!isOnboarding && bufferedItems) {
      const newPanAnims: { [key: string]: Animated.Value } = {}
      bufferedItems.forEach((item) => {
        if (!panAnimsRef.current[item._id]) {
          newPanAnims[item._id] = new Animated.Value(1)
        } else {
          newPanAnims[item._id] = panAnimsRef.current[item._id]
        }
      })
      panAnimsRef.current = newPanAnims
    }
  }, [bufferedItems, isOnboarding])

  // Set initial scroll position synchronously before paint
  useLayoutEffect(() => {
    if (scrollViewRef.current) {
      // Calculate initial scroll position from Redux index
      const x = screenWidth * (bufferStartIndex === 0 ? 0 : 1)
      
      scrollViewRef.current.scrollTo({
        x,
        y: 0,
        animated: false
      })
      horizontalScroll.value = x
    }
  }, [bufferedItems, screenWidth, bufferStartIndex, horizontalScroll])

  // Update index helper
  const updateBufferIndex = (newBufferIndex: number) => {
    const indexDelta = newBufferIndex - bufferIndex
    if (indexDelta !== 0) {
      // Update Redux (for all app logic that depends on index changes)
      const newIndex = bufferStartIndex + newBufferIndex

      setBufferIndex(newBufferIndex, dispatch, displayMode)
      // updateIndex(newIndex)

      // Update buffer index: increment/decrement from current buffer position

      // if (__DEV__) {
      //   console.log(`[SwipeableViews] updateIndex: oldIndex=${newBufferIndex - indexDelta}, newBufferIndex=${newBufferIndex}, newBufferIndex=${newBufferIndex}`)
      // }
    }
  }

  // Reanimated scroll handler for horizontal paging
  const reanimatedScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Update horizontal scroll position in shared value
      horizontalScroll.value = event.contentOffset.x

      // if (__DEV__) {
      //   // Log scroll events for debugging
      //   runOnJS(logAnimationEvent)('horizontal-scroll', {
      //     offset: event.contentOffset.x,
      //     page: Math.round(event.contentOffset.x / screenWidth)
      //   })
      // }
    },
    onEndDrag: (event) => {
      // only call updateBufferIndex if the drag ended on a snap point
      // otherwise there will be some momentum happening
      if (event.contentOffset.x % screenWidth === 0) {
        const newBufferIndex = Math.round(event.contentOffset.x / screenWidth)
        runOnJS(updateBufferIndex)(newBufferIndex)
      }

      //   if (__DEV__) {
      //     runOnJS(logAnimationEvent)('horizontal-scroll-end-drag', {
      //       offset: event.contentOffset.x,
      //       newBufferIndex
      //     })
      //   }
    },
    onMomentumEnd: (event) => {
      const newBufferIndex = Math.round(event.contentOffset.x / screenWidth)
      runOnJS(updateBufferIndex)(newBufferIndex)

      if (__DEV__) {
        runOnJS(logAnimationEvent)('horizontal-scroll-momentum-end', {
          offset: event.contentOffset.x,
          newBufferIndex
        })
      }
    }
  })

  // Render slide helper
  const renderSlide = ({ _id, index: itemIndex, isVisible, panAnim }: any) => (
    <ItemComponent
      _id={_id}
      emitter={emitter}
      itemIndex={itemIndex}
      // setScrollAnim={setScrollAnim}
      onScrollEnd={onScrollEnd}
      panAnim={panAnim}
    />
  )

  let children

  if (isOnboarding) {
    // Onboarding logic - 3 pages before login, 2 after
    let pages = []
    if (sessionContext?.session?.user) {
      pages = [3, 4]
    } else {
      pages = [0, 1, 2]
    }
    children = pages.map((page, pageIndex) => (
      <Onboarding
        key={page}
        index={page}
        isVisible={bufferIndex === pageIndex}
        navigation={navigation}
      />
    ))
  } else {
    // Regular item slides
    children = bufferedItems.map((item, itemIndex) => {
      // Create interpolation ranges for pan animation
      let inputRange = [pageWidth * itemIndex, pageWidth * (itemIndex + 1), pageWidth * bufferedItems.length]
      let outputRange = [1, 0, 1]
      if (itemIndex > 0) {
        inputRange = [0, pageWidth * (itemIndex - 1)].concat(inputRange)
        outputRange = [2, 2].concat(outputRange)
      }

      // Use stable animated value for this item
      const panAnim = panAnimsRef.current[item._id] || new Animated.Value(1)

      return (
        <ItemComponent
          key={item._id}
          _id={item._id}
          emitter={emitter}
          itemIndex={itemIndex}
          // setScrollAnim={setScrollAnim}
          onScrollEnd={onScrollEnd}
          panAnim={panAnim}
        />
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
