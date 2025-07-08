import { Animated } from 'react-native'

// Keep references to important animation values from the old system
export const animationValues = {
  scrollAnim: null,
  clampedAnim: null,
  panAnim: null,
  resetAnim: null
}

// Function to update Reanimated values from RN Animated values
// This allows gradual migration where some components use old system
// and others use new Reanimated system
export const updateReanimatedFromAnimated = (reanimatedValue, animatedValue) => {
  if (!animatedValue || !reanimatedValue) return

  const listener = animatedValue.addListener(({ value }) => {
    if (reanimatedValue && typeof reanimatedValue.value !== 'undefined') {
      reanimatedValue.value = value
    }
  })

  // Return cleanup function
  return () => {
    if (animatedValue && listener) {
      animatedValue.removeListener(listener)
    }
  }
}

// Function to sync horizontal scroll between old and new systems
export const syncHorizontalScroll = (reanimatedHorizontalScroll, animatedPanAnim) => {
  return updateReanimatedFromAnimated(reanimatedHorizontalScroll, animatedPanAnim)
}

// Function to sync vertical scroll between old and new systems
export const syncVerticalScroll = (reanimatedVerticalScroll, animatedScrollAnim) => {
  return updateReanimatedFromAnimated(reanimatedVerticalScroll, animatedScrollAnim)
}

// Bridge function to update Reanimated UI state from old animation handlers
export const bridgeAnimationHandlers = (animationContext) => {
  const {
    headerVisibles,
    buttonsVisible,
    scrollDirection,
    isScrolling
  } = animationContext

  // Create a listener interface that matches the old system
  // but updates Reanimated shared values
  return {
    onStatusBarUp: () => {
      'worklet'
      headerVisible.value = 0 // Hide header
      buttonsVisible.value = 0 // Hide buttons
      scrollDirection.value = 1 // Scrolling up
    },
    onStatusBarDown: () => {
      'worklet'
      headerVisible.value = 1 // Show header
      buttonsVisible.value = 1 // Show buttons
      scrollDirection.value = -1 // Scrolling down
    },
    onStatusBarUpBegin: () => {
      'worklet'
      // In the new system, we can trigger immediately on scroll begin
      headerVisible.value = 0
      buttonsVisible.value = 0
      scrollDirection.value = 1
      isScrolling.value = true
    },
    onStatusBarDownBegin: () => {
      'worklet'
      // In the new system, we can trigger immediately on scroll begin
      headerVisible.value = 1
      buttonsVisible.value = 1
      scrollDirection.value = -1
      isScrolling.value = true
    },
    onStatusBarReset: () => {
      'worklet'
      headerVisible.value = 1
      buttonsVisible.value = 1
      scrollDirection.value = 0
      isScrolling.value = false
    }
  }
}

// Helper to create animated value references for gradual migration
export const createAnimatedValueRefs = () => {
  return {
    panAnim: new Animated.Value(0),
    scrollAnim: new Animated.Value(0),
    clampedAnim: new Animated.Value(0)
  }
}

// Utility to detect if we should use old or new animation system
// Based on feature flags that will be implemented
export const shouldUseReanimated = (featureFlags = {}) => {
  return {
    useReanimatedScroll: featureFlags.USE_REANIMATED_SCROLL || false,
    useReanimatedButtons: featureFlags.USE_REANIMATED_BUTTONS || false,
    useReanimatedTopbar: featureFlags.USE_REANIMATED_TOPBAR || false,
    useReanimatedPager: featureFlags.USE_REANIMATED_PAGER || false
  }
}

// Helper function to gradually transition opacity animations
export const createCompatibilityOpacityAnim = (
  reanimatedValue,
  animatedValue,
  useReanimated = false
) => {
  if (useReanimated) {
    return reanimatedValue
  } else {
    return animatedValue || new Animated.Value(1)
  }
}

// Helper function to gradually transition transform animations
export const createCompatibilityTransformAnim = (
  reanimatedValue,
  animatedValue,
  useReanimated = false
) => {
  if (useReanimated) {
    return reanimatedValue
  } else {
    return animatedValue || new Animated.Value(0)
  }
}

// Cleanup function for removing all compatibility listeners
export const cleanupCompatibilityListeners = (cleanupFunctions = []) => {
  cleanupFunctions.forEach(cleanup => {
    if (typeof cleanup === 'function') {
      cleanup()
    }
  })
}

// Export animation state constants for consistency
export const ANIMATION_STATES = {
  VISIBLE: 1,
  HIDDEN: 0,
  SCROLL_UP: 1,
  SCROLL_DOWN: -1,
  SCROLL_NONE: 0
}
