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
        opacity: 0.97,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 5
        }
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
          ...(this.props.style.transform || []),
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
