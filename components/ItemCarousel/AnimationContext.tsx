import { getStatusBarHeight } from '@/utils/dimensions'
import { logAnimationEvent } from '@/utils/feature-flags'
import React, { createContext, useContext, ReactNode, useMemo, useRef, useCallback } from 'react'
import { useSharedValue, SharedValue, makeMutable } from 'react-native-reanimated'

interface AnimationContextType {
  horizontalScroll: SharedValue<number>
  currentIndex: SharedValue<number>
  // Per-item shared values, lazily created and keyed by item _id.
  // Only rendered items (~window size) get entries; entries are pruned
  // when an item leaves the rendered window.
  getVerticalScroll: (id: string) => SharedValue<number>
  getHeaderVisible: (id: string) => SharedValue<number>
  getButtonsVisible: (id: string) => SharedValue<number>
  pruneAnimationValues: (keepIds: string[]) => void
  scrollDirection: SharedValue<number>
  isScrolling: SharedValue<boolean>
  isHorizontalScrolling: SharedValue<boolean>
  isTouchActive: SharedValue<boolean>
  scrollVelocity: SharedValue<number>
}

interface AnimationProviderProps {
  children: ReactNode
}

const AnimationContext = createContext<AnimationContextType | null>(null)

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  // Shared values for the new Reanimated animation system
  const horizontalScroll = useSharedValue(0)
  const currentIndex = useSharedValue(0)

  // Per-item shared values keyed by item _id. Shared values can't be created
  // with useSharedValue outside of render, so we use makeMutable for lazy entries.
  const verticalScrollsRef = useRef<Map<string, SharedValue<number>>>(new Map())
  const headerVisiblesRef = useRef<Map<string, SharedValue<number>>>(new Map())
  const buttonsVisiblesRef = useRef<Map<string, SharedValue<number>>>(new Map())

  const getOrCreate = useCallback(
    (mapRef: React.MutableRefObject<Map<string, SharedValue<number>>>, id: string, initial: number) => {
      let sv = mapRef.current.get(id)
      if (!sv) {
        sv = makeMutable(initial) as SharedValue<number>
        mapRef.current.set(id, sv)
      }
      return sv
    },
    []
  )

  const getVerticalScroll = useCallback(
    (id: string) => getOrCreate(verticalScrollsRef, id, 0),
    [getOrCreate]
  )
  const getHeaderVisible = useCallback(
    (id: string) => getOrCreate(headerVisiblesRef, id, 0),
    [getOrCreate]
  )
  const getButtonsVisible = useCallback(
    (id: string) => getOrCreate(buttonsVisiblesRef, id, 1), // 1 = visible, 0 = hidden
    [getOrCreate]
  )

  // Drop entries for items that have left the rendered window
  const pruneAnimationValues = useCallback((keepIds: string[]) => {
    const keep = new Set(keepIds)
    for (const mapRef of [verticalScrollsRef, headerVisiblesRef, buttonsVisiblesRef]) {
      for (const id of Array.from(mapRef.current.keys())) {
        if (!keep.has(id)) mapRef.current.delete(id)
      }
    }
  }, [])

  // Additional shared values for more granular control
  const scrollDirection = useSharedValue(0) // 1 = down, -1 = up, 0 = none
  const isScrolling = useSharedValue(false)
  const isHorizontalScrolling = useSharedValue(false)
  const isTouchActive = useSharedValue(false)
  const scrollVelocity = useSharedValue(0)

  const value = useMemo(() => ({
    // Primary animation values
    horizontalScroll,
    currentIndex,
    getVerticalScroll,
    getHeaderVisible,
    getButtonsVisible,
    pruneAnimationValues,

    // Secondary animation values
    scrollDirection,
    isScrolling,
    isHorizontalScrolling,
    isTouchActive,
    scrollVelocity,
  }), [horizontalScroll, currentIndex, getVerticalScroll, getHeaderVisible, getButtonsVisible, pruneAnimationValues, scrollDirection, isScrolling, isHorizontalScrolling, isTouchActive, scrollVelocity])

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

// Helper hook returning the full animation context
export const useAnimationValues = (): AnimationContextType => {
  return useAnimation()
}
