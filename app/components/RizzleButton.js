import React from 'react'
import {
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import {hslString} from '../utils/colors'


class RizzleButton extends React.Component {
  isScaling = false

  constructor (props) {
    super(props)
    this.props = props

    // this.onPressIn = this.onPressIn.bind(this)
    // this.onPressOut = this.onPressOut.bind(this)
    this.onPress = this.onPress.bind(this)
    // this.toggleValue = 0
    // this.toggleAnimatedValue = new Animated.Value(0)
    // this.scaleAnimatedValue = new Animated.Value(1)
  }

  getBackgroundColor () {
    return this.props.backgroundColor || hslString('rizzleSaved')
  }

  getStyles () {
    const borderColor = this.props.borderColor || hslString('rizzleSaved')
    const borderWidth = /*this.props.borderWidth ||*/ 0
    return {
        width: this.props.style && this.props.style.width ?
          this.props.style.width :
          50,
        height: 50,
        borderRadius: 25,
        // borderColor: borderColor,
        // borderWidth,
        justifyContent: 'center',
        flexDirection: 'column',
    }
  }

  onPress () {
    if (this.props.isToggle) {
      this.toggleState = !this.toggleState
      this.doToggleAnimation()
    }
    ReactNativeHapticFeedback.trigger("impactLight", {})
    this.props.onPress && this.props.onPress(this.toggleState)
  }

  // onPressIn(...args) {
  //   const that = this
  //   this.isScaling = true
  //   Animated.timing(this.scaleAnimatedValue, {
  //     toValue: 1.3,
  //     duration: 200,
  //     useNativeDriver: true
  //   }).start(({finished}) => {
  //     if (finished) {
  //       that.isScaling = false
  //       ReactNativeHapticFeedback.trigger("impactLight", {})
  //       Animated.spring(that.scaleAnimatedValue, {
  //         toValue: 1,
  //         speed: 40,
  //         bounciness: 25,
  //         useNativeDriver: true
  //       }).start(() => {
  //       })
  //       that.props.onPress && that.props.onPress()
  //       that.props.startToggleAnimation && that.props.startToggleAnimation()
  //     }
  //   })
  // }

  // onPressOut(...args) {
  //   if (this.isScaling) {
  //     Animated.timing(this.scaleAnimatedValue).stop()
  //     this.isScaling = false
  //     Animated.spring(this.scaleAnimatedValue, {
  //       toValue: 1,
  //       speed: 40,
  //       bounciness: 25,
  //       useNativeDriver: true
  //     }).start()
  //   }
  // }

  getTogglableInnerView () {
    const {
      iconOff,
      iconOn,
      initialToggleState
    } = this.props
    this.toggleState = this.toggleState || initialToggleState
    this.toggleAnim = this.toggleAnim || new Animated.Value(initialToggleState ? 1 : 0)
    const style = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: 50,
      height: 50,
      transform: [{
        rotate: this.toggleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg']
        })
      }]
    }
    const onStyle = {
      ...style,
      opacity: this.toggleAnim
    }
    const offStyle = {
      ...style,
      opacity: this.toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0]
      })
    }
    return (
      <React.Fragment>
        <Animated.View
          style={offStyle}
        >
          { iconOff }
        </Animated.View>
        <Animated.View
          style={onStyle}
        >
          { iconOn }
        </Animated.View>
      </React.Fragment>
    )
  }

  doToggleAnimation () {
    Animated.timing(this.toggleAnim, {
      toValue: this.toggleState ? 1 : 0,
      // delay: 250,
      duration: 300,
      useNativeDriver: true
    }).start()
  }

  render () {
    let newProps = Object.assign({}, this.props)
    const {
      children,
      isToggle,
      style,
      text
    } = this.props
    delete newProps.style

    return (
      <Animated.View style={{
        ...style,
        width: text && text.length > 0 ? 'auto' :
          style && style.width ?
            style.width :
            60,
        height: 60,
        paddingTop: 5,
        paddingLeft: 5,
        paddingBottom: 5,
        paddingRight: 5,
        transform: [
          ...(style.transform || []),
          // { scale: this.scaleAnimatedValue },
        ]
      }}>
        <TouchableOpacity
          hitSlop={{
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
          }}
          onPressOut={this.onPress}
          style={{
            borderRadius: 25,
            opacity: 0.95,
            backgroundColor: this.getBackgroundColor(),
            shadowColor: 'black',
            shadowOpacity: 0.1,
            shadowRadius: 5,
            shadowOffset: {
              width: 0,
              height: 5
            },
          }}
        >
          <View style={{
              ...this.getStyles(),
              paddingHorizontal: style.paddingHorizontal || 0
            }}
            { ...newProps }
          >
            {isToggle ? this.getTogglableInnerView() : children}
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
}

export default RizzleButton
