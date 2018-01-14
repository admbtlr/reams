import {Animated} from 'react-native'
import {STATUS_BAR_HEIGHT} from '../components/TopBar.js'

let scrollListeners = []
let scrollHandlerChangeListeners = []

let panListeners = []

let panValueAnimated
let scrollAnim = new Animated.Value(0)

let clamped
let clampedAnim = new Animated.Value(0)
let clampedAnimNormalised = new Animated.Value(1)

let resetAnim = new Animated.Value(0)

let scrollValue = 0
let clampedScrollValue = 0
let resetValue = 0

let initiated = false

// export function onScrollStart (e) {
//   scrollListeners.forEach((listener) => listener('start', e))
// }

// export function registerScrollListener (listener) {
//   scrollListeners.push(listener)
// }

// export function registerScrollHandlerChangeListener (listener) {
//   scrollHandlerChangeListeners.push(listener)
// }

// export function onPanStart (e) {
//   panListeners.forEach((listener) => listener('start', e))
// }

// export function onPanEnd (e) {
//   panListeners.forEach((listener) => listener('end', e))
// }

// export function registerPanListener (listener) {
//   panListeners.push(listener)
// }

// export function panHandler (value) {
//   panValueAnimated = value
// }

// export function getPanValueAnimated () {
//   return panValueAnimated
// }

function reset () {
  scrollValue = 0
  clampedScrollValue = 0
  resetValue = 0
  scrollAnim.removeAllListeners()
  resetAnim.removeAllListeners()
  // TODO fix this!
  // this animation needs to happen AFTER swipeable views has re-rendered
  this.setTimeout(() => {
    Animated.timing(resetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, 100)
}

export function scrollHandler (value) {
  if (initiated) {
    reset()
  }
  initiated = true
  scrollAnim = value
  clamped = Animated
    .diffClamp(
      Animated.add(
        scrollAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0, 0, 1]
        }),
        resetAnim),
      0,
      STATUS_BAR_HEIGHT)

  // now we have to recreate the diffClamped value
  // because of https://github.com/facebook/react-native/pull/12620
  scrollAnim.addListener(({ value }) => {
    const diff = value - scrollValue
    scrollValue = value
    clampedScrollValue = Math.min(
      Math.max(clampedScrollValue + diff, 0),
      STATUS_BAR_HEIGHT,
    )
  })
  resetAnim.addListener(({ value }) => {
    resetValue = value;
  })


  clampedAnim = clamped.interpolate({
    inputRange: [0, STATUS_BAR_HEIGHT],
    outputRange: [0, - STATUS_BAR_HEIGHT],
    extrapolate: 'clamp'
  })
  clampedAnimNormalised = clamped.interpolate({
    inputRange: [0, STATUS_BAR_HEIGHT],
    outputRange: [1, 0],
    extrapolateLeft: 'clamp'
  })
}

export function onScrollEnd (e) {
  console.log('Scroll ended!')
  const toValue = scrollValue > STATUS_BAR_HEIGHT &&
    clampedScrollValue > (STATUS_BAR_HEIGHT) / 2
    ? resetValue + STATUS_BAR_HEIGHT
    : resetValue - STATUS_BAR_HEIGHT


  console.log('Scroll ended! Need to animate ' + toValue)
  Animated.timing(resetAnim, {
    toValue,
    duration: 200,
    useNativeDriver: true,
  }).start(() => {
    // resetAnim.setValue(0)
  })
}

export function getScrollValueAnimated () {
  return scrollAnim
}

export function getAnimatedValue () {
  return clampedAnim
}

export function getAnimatedValueNormalised () {
  return clampedAnimNormalised
}
