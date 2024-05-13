import {Animated} from 'react-native'
import { getStatusBarHeight } from './dimensions'

export default class ScrollManager {

  constructor () {
    this.scrollListeners = []
    this.scrollValue = 0

    this.clampedAnim = new Animated.Value(0)
    this.clampedScrollValue = 0

    this.prevScrollOffset = 0
  }

  setScrollAnim (scrollAnim) {
    this.scrollAnim = scrollAnim
    this.createClampedScrollAnim()
  }

  getClampedScrollAnim () {
    return this.clampedAnim
  }

  getScrollAnim () {
    return this.scrollAnim
  }

  createClampedScrollAnim () {
    this.resetAnim = new Animated.Value(0)
    const scrollAnimNoNeg = this.scrollAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 0, 1]
    })
    // const scrollAnimRebased = Animated.subtract(scrollAnim, scrollAnim._value)
    const addedAnims = Animated.add(
      scrollAnimNoNeg,
      this.resetAnim
    )
    const clamped = Animated
      .diffClamp(
        addedAnims,
        0,
        getStatusBarHeight())

    // now we have to recreate the diffClamped value
    // because of https://github.com/facebook/react-native/pull/12620
    this.scrollAnim.addListener(({ value }) => {
      const diff = value - this.scrollValue
      this.scrollValue = value
      this.clampedScrollValue = Math.min(
        Math.max(this.clampedScrollValue + diff, 0),
        getStatusBarHeight()
      )
      if (diff > 0) {
        this.scrollListeners.forEach((listener) => {
          listener.onStatusBarUpBegin()
        })
      } else {
        this.scrollListeners.forEach((listener) => {
          listener.onStatusBarDownBegin()
        })
      }
    })

    this.clampedAnim = clamped.interpolate({
      inputRange: [0, getStatusBarHeight()],
      outputRange: [0, -getStatusBarHeight()],
      extrapolate: 'clamp'
    })

    // clampedAnim.addListener(event => {
    //   console.log(`ClampedAnim: ${event.value}`)
    //   console.log(`ScrollAnim: ${scrollAnim.__getValue()}`)
    // })
  }

  onScrollEnd (scrollOffset) {
    // console.log('Scroll ended!')
    const toValue = this.scrollValue > getStatusBarHeight() &&
      this.clampedScrollValue > (getStatusBarHeight()) / 2
      ? getStatusBarHeight()
      : -getStatusBarHeight()

    console.log('Scroll ended! Need to animate ' + toValue)
    Animated.timing(this.resetAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true
    }).start()

    if (scrollOffset - this.prevScrollOffset > 20) {
      this.scrollListeners.forEach((listener) => {
        listener.onStatusBarUp()
      })
    } else if (scrollOffset - this.prevScrollOffset < -20) {
      this.scrollListeners.forEach((listener) => {
        listener.onStatusBarDown()
      })
    }
    this.prevScrollOffset = scrollOffset
  }

  setScrollListener (listener) {
    this.scrollListeners = [listener]
  }
}
