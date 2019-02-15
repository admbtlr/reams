import React from 'react'
import {
  Animated,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import {hslString} from '../utils/colors'

class RizzleButton extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.onPressIn = this.onPressIn.bind(this)
    this.onPressOut = this.onPressOut.bind(this)
    this.toggleValue = 0
    this.toggleAnimatedValue = new Animated.Value(0)
    this.scaleAnimatedValue = new Animated.Value(1)
  }

  getStyles () {
    const backgroundColor = this.props.backgroundColor || hslString('rizzleSaved')
    const borderColor = this.props.borderColor || hslString('rizzleSaved')
    return {
        backgroundColor,
        width: this.props.style && this.props.style.width ?
          this.props.style.width :
          56,
        height: 56,
        borderRadius: 28,
        borderColor: borderColor,
        borderWidth: 2,
        justifyContent: 'center',
        flexDirection: 'column',
        opacity: 0.8
    }
  }

  onPressIn(...args) {
    Animated.spring(this.scaleAnimatedValue, {
      toValue: 1.3,
      speed: 20,
      bounciness: 0,
      useNativeDriver: true
    }).start()
  }

  onPressOut(...args) {
    Animated.spring(this.scaleAnimatedValue, {
      toValue: 1,
      speed: 40,
      bounciness: 15,
      useNativeDriver: true
    }).start()
    this.props.startToggleAnimation && this.props.startToggleAnimation()
    this.props.onPress()
  }

  render () {
    let newProps = Object.assign({}, this.props)
    delete newProps.style
    return (
      <Animated.View style={{
        ...this.props.style,
        paddingHorizontal: 0,
        opacity: this.scaleAnimatedValue.interpolate({
          inputRange: [1, 1.2],
          outputRange: [1, 0.8]
        }),
        transform: [
          ...this.props.style.transform,
          { scale: this.scaleAnimatedValue },
        ]
      }}>
        <TouchableWithoutFeedback
          onPressIn={this.onPressIn}
          onPressOut={this.onPressOut}
        >
          <View style={{
              ...this.getStyles(),
              paddingHorizontal: this.props.style.paddingHorizontal || 0
            }}
            { ...newProps }
          >
            {this.props.children}
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    )
  }
}

export default RizzleButton
