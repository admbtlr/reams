/**
 * Feature Flags for Reanimated Refactoring
 *
 * These flags control the gradual rollout of Reanimated features
 * during the migration from the old animation system.
 *
 * Start with all flags false, then enable one by one during testing.
 */

// Environment-based feature flag defaults (computed dynamically)
const isDevelopment = () => (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV === 'development'
const isTest = () => process.env.NODE_ENV === 'test'

// Main feature flags for Reanimated migration
export const FEATURES = {
  // Phase 1: Animation Context and Vertical Scroll
  USE_REANIMATED_SCROLL: true,         // FeedItem scroll handlers

  // Phase 2: Button Animations
  USE_REANIMATED_BUTTONS: true,        // ButtonSet animations

  // Phase 3: Horizontal Paging and TopBar
  USE_REANIMATED_PAGER: false,         // SwipeableViews horizontal paging
  USE_REANIMATED_TOPBAR: false,        // TopBar animations

  // Debug and Development flags
  ENABLE_ANIMATION_DEBUG: isDevelopment(),  // Show animation debug info
  ENABLE_ANIMATION_LOGGING: isDevelopment(), // Log animation events
  SHOW_ANIMATION_OVERLAY: false,       // Visual debugging overlay

  // Performance flags
  USE_NATIVE_DRIVER_FALLBACK: true,    // Use native driver for old animations
  ENABLE_ANIMATION_PROFILING: isDevelopment(), // Profile animation performance

  // Compatibility flags
  BRIDGE_OLD_AND_NEW_SYSTEMS: true,    // Enable compatibility layer
  MAINTAIN_OLD_LISTENERS: true,        // Keep old animation listeners during migration
}

// Feature flag functions for easier usage
export const useReanimatedScroll = () => FEATURES.USE_REANIMATED_SCROLL
export const useReanimatedButtons = () => FEATURES.USE_REANIMATED_BUTTONS
export const useReanimatedPager = () => FEATURES.USE_REANIMATED_PAGER
export const useReanimatedTopbar = () => FEATURES.USE_REANIMATED_TOPBAR

// Debug utilities
export const isAnimationDebugEnabled = () => FEATURES.ENABLE_ANIMATION_DEBUG
export const isAnimationLoggingEnabled = () => FEATURES.ENABLE_ANIMATION_LOGGING

// Utility to check if any Reanimated features are enabled
export const hasAnyReanimatedFeatures = () => {
  return FEATURES.USE_REANIMATED_SCROLL ||
    FEATURES.USE_REANIMATED_BUTTONS ||
    FEATURES.USE_REANIMATED_PAGER ||
    FEATURES.USE_REANIMATED_TOPBAR
}

// Utility to get current feature state for debugging
export const getFeatureState = () => {
  return {
    reanimatedScroll: FEATURES.USE_REANIMATED_SCROLL,
    reanimatedButtons: FEATURES.USE_REANIMATED_BUTTONS,
    reanimatedPager: FEATURES.USE_REANIMATED_PAGER,
    reanimatedTopbar: FEATURES.USE_REANIMATED_TOPBAR,
    debugEnabled: FEATURES.ENABLE_ANIMATION_DEBUG,
    loggingEnabled: FEATURES.ENABLE_ANIMATION_LOGGING,
  }
}

// Runtime feature flag override (for testing)
export const overrideFeatureFlag = (flagName, value) => {
  if (isDevelopment() || isTest()) {
    FEATURES[flagName] = value
    if (FEATURES.ENABLE_ANIMATION_LOGGING) {
      console.log(`[AnimationFeatureFlags] Override: ${flagName} = ${value}`)
    }
  } else {
    console.warn('[AnimationFeatureFlags] Feature flag overrides only available in development')
  }
}

// Enable all Reanimated features (for testing)
export const enableAllReanimatedFeatures = () => {
  if (isDevelopment() || isTest()) {
    FEATURES.USE_REANIMATED_SCROLL = true
    FEATURES.USE_REANIMATED_BUTTONS = true
    FEATURES.USE_REANIMATED_PAGER = true
    FEATURES.USE_REANIMATED_TOPBAR = true
    if (FEATURES.ENABLE_ANIMATION_LOGGING) {
      console.log('[AnimationFeatureFlags] All Reanimated features enabled')
    }
  } else {
    console.warn('[AnimationFeatureFlags] Feature flag overrides only available in development')
  }
}

// Disable all Reanimated features (rollback)
export const disableAllReanimatedFeatures = () => {
  FEATURES.USE_REANIMATED_SCROLL = false
  FEATURES.USE_REANIMATED_BUTTONS = false
  FEATURES.USE_REANIMATED_PAGER = false
  FEATURES.USE_REANIMATED_TOPBAR = false
  if (FEATURES.ENABLE_ANIMATION_LOGGING) {
    console.log('[AnimationFeatureFlags] All Reanimated features disabled')
  }
}

// Gradual rollout helper - enable features one by one
export const enableNextFeature = () => {
  if (!FEATURES.USE_REANIMATED_SCROLL) {
    FEATURES.USE_REANIMATED_SCROLL = true
    console.log('[AnimationFeatureFlags] Enabled Reanimated Scroll')
  } else if (!FEATURES.USE_REANIMATED_BUTTONS) {
    FEATURES.USE_REANIMATED_BUTTONS = true
    console.log('[AnimationFeatureFlags] Enabled Reanimated Buttons')
  } else if (!FEATURES.USE_REANIMATED_PAGER) {
    FEATURES.USE_REANIMATED_PAGER = true
    console.log('[AnimationFeatureFlags] Enabled Reanimated Pager')
  } else if (!FEATURES.USE_REANIMATED_TOPBAR) {
    FEATURES.USE_REANIMATED_TOPBAR = true
    console.log('[AnimationFeatureFlags] Enabled Reanimated TopBar')
  } else {
    console.log('[AnimationFeatureFlags] All features already enabled')
  }
}

// Animation logging utility
export const logAnimationEvent = (event, data = {}) => {
  if (FEATURES.ENABLE_ANIMATION_LOGGING) {
    console.log(`[Animation] ${event}`, data)
  }
}

// Performance monitoring
export const measureAnimationPerformance = (animationName, fn) => {
  if (!FEATURES.ENABLE_ANIMATION_PROFILING) {
    return fn()
  }

  const start = performance.now()
  const result = fn()
  const end = performance.now()

  console.log(`[AnimationPerf] ${animationName}: ${end - start}ms`)
  return result
}

// Export default configuration for easy importing
export default FEATURES
