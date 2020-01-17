import React from 'react'
import {
  Animated,
  TouchableOpacity,
  View
} from 'react-native'
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import {hslString} from '../utils/colors'


class RizzleButton extends React.Component {
  isScaling = false

  constructor (props) {
    super(props)
    this.props = props

    this.onPressIn = this.onPressIn.bind(this)
    this.onPressOut = this.onPressOut.bind(this)
    this.onPress = this.onPress.bind(this)
    this.toggleValue = 0
    this.toggleAnimatedValue = new Animated.Value(0)
    this.scaleAnimatedValue = new Animated.Value(1)
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
        borderWidth,
        justifyContent: 'center',
        flexDirection: 'column',
    }
  }

  onPress () {
    this.props.onPress && this.props.onPress()
    this.props.startToggleAnimation && this.props.startToggleAnimation()
  }

  onPressIn(...args) {
    const that = this
    this.isScaling = true
    Animated.timing(this.scaleAnimatedValue, {
      toValue: 1.3,
      duration: 200,
      useNativeDriver: true
    }).start(({finished}) => {
      if (finished) {
        that.isScaling = false
        ReactNativeHapticFeedback.trigger("impactLight", {})
        Animated.spring(that.scaleAnimatedValue, {
          toValue: 1,
          speed: 40,
          bounciness: 25,
          useNativeDriver: true
        }).start(() => {
        })
        that.props.onPress && that.props.onPress()
        that.props.startToggleAnimation && that.props.startToggleAnimation()
      }
    })
  }

  onPressOut(...args) {
    if (this.isScaling) {
      Animated.timing(this.scaleAnimatedValue).stop()
      this.isScaling = false
      Animated.spring(this.scaleAnimatedValue, {
        toValue: 1,
        speed: 40,
        bounciness: 25,
        useNativeDriver: true
      }).start()
    }
  }

  render () {
    let newProps = Object.assign({}, this.props)
    const {onPress} = this.props
    delete newProps.style
    return (
      <Animated.View style={{
        ...this.props.style,
        width: this.props.style && this.props.style.width ?
          this.props.style.width :
          50,
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 0,
        // opacity: this.scaleAnimatedValue.interpolate({
        //   inputRange: [1, 1.2],
        //   outputRange: [1, 0.8]
        // }),
        opacity: 0.9,
        backgroundColor: this.getBackgroundColor(),
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 5
        },
        transform: [
          ...(this.props.style.transform || []),
          { scale: this.scaleAnimatedValue },
        ]
      }}>
        <TouchableOpacity
          onPress={this.onPress}
        >
          <View style={{
              ...this.getStyles(),
              paddingHorizontal: this.props.style.paddingHorizontal || 0
            }}
            { ...newProps }
          >
            {this.props.children}
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
}

export default RizzleButton
