import {Animated} from 'react-native'
import {STATUS_BAR_HEIGHT} from '../components/TopBar.js'
// import {
//   updateClampedScrollAnim,
//   updateClampedScrollAnimNormalised
// } from '../redux/actions/animations.js'

let scrollListeners = []
let scrollHandlerChangeListeners = []

let panListeners = []

let panValueAnimated
let scrollAnim = new Animated.Value(0)
let _diff = 0
let _lastScrollPos = 0
let _visible = true

let clampedAnim = new Animated.Value(0)
let clampedAnimNormalised = new Animated.Value(1)
// let clampedAnimValue = 0

let resetAnimation = new Animated.Value(0)

export function onScrollStart (e) {
  scrollListeners.forEach((listener) => listener('start', e))
}

export function onScrollEnd (e) {
  let toValue
  console.log('Scroll ended! ' + _diff)
  if (Math.abs(_diff) < STATUS_BAR_HEIGHT) {
    console.log('animation needed!')
    if (_visible) {
      if (0 > _diff > -STATUS_BAR_HEIGHT / 2) {
        toValue = -STATUS_BAR_HEIGHT
      } else if (_diff < -STATUS_BAR_HEIGHT / 2) {
        toValue = 0
      }
    } else {
      if (0 < _diff < STATUS_BAR_HEIGHT / 2) {
        toValue = -STATUS_BAR_HEIGHT
      } else if (_diff > STATUS_BAR_HEIGHT / 2) {
        toValue = 0
      }
    }
    // const toValue =
    Animated.timing(resetAnimation, {
      toValue,
      duration: 350,
      useNativeDriver: true
    }).start(() => {
      _diff = 0
      _visible = !_visible
    })
  } else {
    _visible = _diff > 0
    resetAnimation.setValue(0)
  }
  _diff = 0
}

export function registerScrollListener (listener) {
  scrollListeners.push(listener)
}

export function registerScrollHandlerChangeListener (listener) {
  scrollHandlerChangeListeners.push(listener)
}

export function onPanStart (e) {
  panListeners.forEach((listener) => listener('start', e))
}

export function onPanEnd (e) {
  panListeners.forEach((listener) => listener('end', e))
}

export function registerPanListener (listener) {
  panListeners.push(listener)
}

export function panHandler (value) {
  panValueAnimated = value
}

export function getPanValueAnimated () {
  return panValueAnimated
}

export function scrollHandler (value) {
  scrollAnim.removeAllListeners()
  _lastScrollPos = 0
  _diff = 0
  resetAnimation.setValue(0)
  scrollAnim = value
  scrollHandlerChangeListeners.forEach((f) => {
    f(scrollAnim)
  })
  const clamped = Animated
    .diffClamp(
      // Animated.add(
      //   scrollAnim.interpolate({
      //     inputRange: [0, 1],
      //     outputRange: [0, 1],
      //     extrapolateLeft: 'clamp'
      //   }),
      //   resetAnimation),
      scrollAnim,
      0, STATUS_BAR_HEIGHT)

  clampedAnim = clamped.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1],
    extrapolateLeft: 'clamp'
  })
  clampedAnimNormalised = clamped.interpolate({
    inputRange: [0, STATUS_BAR_HEIGHT],
    outputRange: [1, 0],
    extrapolateLeft: 'clamp'
  })
  scrollAnim.addListener(({value}) => {
    _diff += value - _lastScrollPos
    _lastScrollPos = value
  })
  // updateClampedScrollAnim(clampedAnim)
  // updateClampedScrollAnimNormalised(clampedAnimNormalised)
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
