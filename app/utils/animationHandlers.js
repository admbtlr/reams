import {Animated} from 'react-native'
import {STATUS_BAR_HEIGHT} from '../components/TopBar.js'

let scrollListeners = []

let panAnim = new Animated.Value(0)
let panAnimDivisor = 1
let scrollAnim = new Animated.Value(0)

let clamped
let clampedAnim = new Animated.Value(0)

let resetAnim = new Animated.Value(0)

let scrollValue = 0
let clampedScrollValue = 0
let resetValue = 0
let prevScrollOffset = 0

let initiated = false

function reset (newScrollAnimValue) {
  const toValue = 0 - newScrollAnimValue
  scrollValue = 0
  clampedScrollValue = 0
  resetValue = 0
  prevScrollOffset = 0
  scrollAnim.removeAllListeners()
  resetAnim.removeAllListeners()
  scrollListeners.forEach((listener) => {
    listener.onStatusBarReset()
  })
  Animated.timing(resetAnim, {
    toValue,
    duration: 400,
    useNativeDriver: true
  }).start(() => {
    scrollListeners.forEach((listener) => {
      listener.onStatusBarReset()
    })
  })
}

export function panHandler (value, divisor) {
  panAnim = value
  panAnimDivisor = divisor
}

export function getPanValue () {
  return { panAnim, panAnimDivisor }
}

export function getClampedScrollAnim (feedItemScrollAnim) {
  if (feedItemScrollAnim === undefined) return
  if (initiated) {
    reset(feedItemScrollAnim._value)
  }
  initiated = true
  scrollAnim = feedItemScrollAnim
  resetAnim = new Animated.Value(0)
  const scrollAnimNoNeg = scrollAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1]
  })
  // const scrollAnimRebased = Animated.subtract(scrollAnim, scrollAnim._value)
  const addedAnims = Animated.add(
    scrollAnimNoNeg,
    resetAnim
  )
  const clamped = Animated
    .diffClamp(
      addedAnims,
      0,
      STATUS_BAR_HEIGHT)

  // now we have to recreate the diffClamped value
  // because of https://github.com/facebook/react-native/pull/12620
  scrollAnim.addListener(({ value }) => {
    const diff = value - scrollValue
    scrollValue = value
    clampedScrollValue = Math.min(
      Math.max(clampedScrollValue + diff, 0),
      STATUS_BAR_HEIGHT
    )
    if (diff > 0) {
      scrollListeners.forEach((listener) => {
        listener.onStatusBarUpBegin()
      })
    } else {
      scrollListeners.forEach((listener) => {
        listener.onStatusBarDownBegin()
      })
    }
  })

  clampedAnim = clamped.interpolate({
    inputRange: [0, STATUS_BAR_HEIGHT],
    outputRange: [0, -STATUS_BAR_HEIGHT],
    extrapolate: 'clamp'
  })

  // clampedAnim.addListener(event => {
  //   console.log(`ClampedAnim: ${event.value}`)
  //   console.log(`ScrollAnim: ${scrollAnim.__getValue()}`)
  // })

  return clampedAnim
}

export function onScrollEnd (scrollOffset) {
  // console.log('Scroll ended!')
  const toValue = scrollValue > STATUS_BAR_HEIGHT &&
    clampedScrollValue > (STATUS_BAR_HEIGHT) / 2
    ? resetValue + STATUS_BAR_HEIGHT
    : resetValue - STATUS_BAR_HEIGHT

  // console.log('Scroll ended! Need to animate ' + toValue)
  Animated.timing(resetAnim, {
    toValue,
    duration: 200,
    useNativeDriver: true
  }).start()

  if (scrollOffset - prevScrollOffset > 20) {
    scrollListeners.forEach((listener) => {
      listener.onStatusBarUp()
    })
  } else if (scrollOffset - prevScrollOffset < -20) {
    scrollListeners.forEach((listener) => {
      listener.onStatusBarDown()
    })
  }
  prevScrollOffset = scrollOffset
}

export function getScrollValueAnimated () {
  return scrollAnim
}

export function getAnimatedValue () {
  return clampedAnim
}

// export function getAnimatedValueNormalised () {
//   return clampedAnimNormalised
// }

export function addScrollListener (listener) {
  scrollListeners.push(listener)
}
