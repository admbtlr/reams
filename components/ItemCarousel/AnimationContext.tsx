import { HIDE_ALL_BUTTONS, SHOW_ITEM_BUTTONS } from '@/store/ui/types'
import { getStatusBarHeight } from '@/utils/dimensions'
import { logAnimationEvent } from '@/utils/feature-flags'
import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from 'react'
import { StatusBar } from 'react-native'
import { useSharedValue, SharedValue, useAnimatedScrollHandler, withTiming, runOnJS, ScrollHandler, ScrollHandlers, ScrollHandlerProcessed } from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import { BUFFER_LENGTH } from './constants'

interface AnimationContextType {
  horizontalScroll: SharedValue<number>
  verticalScrolls: SharedValue<number>[]
  headerVisibles: SharedValue<number>[]
  buttonsVisibles: SharedValue<number>[]
  currentIndex: SharedValue<number>
  bufferIndex: number
  setBufferIndex: (index: number) => void
  scrollDirection: SharedValue<number>
  isScrolling: SharedValue<boolean>
  scrollVelocity: SharedValue<number>
}

interface AnimationProviderProps {
  children: ReactNode
}

const AnimationContext = createContext<AnimationContextType | null>(null)

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  // Shared values for the new Reanimated animation system
  const horizontalScroll = useSharedValue(0)
  const verticalScrolls = new Array(BUFFER_LENGTH).fill(0).map(() => useSharedValue(0))
  const headerVisibles = new Array(BUFFER_LENGTH).fill(0).map(() => useSharedValue(0))
  const buttonsVisibles = new Array(BUFFER_LENGTH).fill(0).map(() => useSharedValue(1)) // 1 = visible, 0 = hidden
  const currentIndex = useSharedValue(0)
  const [bufferIndex, setBufferIndex] = useState(1) // Position within current 5-item buffer

  const setBufferIndexCallback = useCallback((index: number) => {
    setBufferIndex(index)
  }, [])

  // Additional shared values for more granular control
  const scrollDirection = useSharedValue(0) // 1 = down, -1 = up, 0 = none
  const isScrolling = useSharedValue(false)
  const scrollVelocity = useSharedValue(0)

  const value = useMemo(() => ({
    // Primary animation values
    horizontalScroll,
    verticalScrolls,
    headerVisibles,
    buttonsVisibles,
    currentIndex,
    bufferIndex,
    setBufferIndex: setBufferIndexCallback,

    // Secondary animation values
    scrollDirection,
    isScrolling,
    scrollVelocity,
  }), [horizontalScroll, verticalScrolls, headerVisibles, buttonsVisibles, currentIndex, bufferIndex, setBufferIndexCallback, scrollDirection, isScrolling, scrollVelocity])

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  )
}

export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }
  return context
}

// Helper functions for animation values
export const useAnimationValues = (): AnimationContextType => {
  const {
    horizontalScroll,
    verticalScrolls,
    headerVisibles,
    buttonsVisibles,
    currentIndex,
    bufferIndex,
    setBufferIndex,
    scrollDirection,
    isScrolling,
    scrollVelocity
  } = useAnimation()

  return {
    horizontalScroll,
    verticalScrolls,
    headerVisibles,
    buttonsVisibles,
    currentIndex,
    bufferIndex,
    setBufferIndex,
    scrollDirection,
    isScrolling,
    scrollVelocity
  }
}

// Animation state helpers
// export const useHeaderState = (): SharedValue<number> => {
//   const { headerVisible } = useAnimation()
//   return headerVisible
// }

// export const useButtonsState = (): SharedValue<number> => {
//   const { buttonsVisible } = useAnimation()
//   return buttonsVisible
// }

// export const useScrollState = () => {
//   const { verticalScroll, scrollDirection, isScrolling, scrollVelocity } = useAnimation()
//   return {
//     verticalScroll,
//     scrollDirection,
//     isScrolling,
//     scrollVelocity,
//   }
// }

// export const usePagingState = () => {
//   const { horizontalScroll, currentIndex, bufferIndex, setBufferIndex } = useAnimation()
//   return {
//     horizontalScroll,
//     currentIndex,
//     bufferIndex,
//     setBufferIndex,
//   }
// }
