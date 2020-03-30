import { ItemType } from '../store/items/types'
import React from 'react'
import {
  Animated,
  Image,
} from 'react-native'
import RizzleButton from './RizzleButton'
import {hslString} from '../utils/colors'


class ViewButtons extends React.Component {
  state = {
    visibleAnimIncreaseFont: new Animated.Value(-100),
    visibleAnimDecreaseFont: new Animated.Value(-100),
    visibleAnimDarkBg: new Animated.Value(-100),
    anim: new Animated.Value(1)
  }

  translateDistance = 80

  constructor (props) {
    super(props)
    this.props = props
  }

  componentDidUpdate (prevProps) {
    const springConfig =         {
      speed: 20,
      bounciness: 12,
      toValue: this.props.visible ? 0 : -1,
      duration: 200,
      useNativeDriver: true
    }
    if (prevProps.visible !== this.props.visible) {
      // Animated.stagger(50, [
      //   Animated.spring(
      //     this.state.animIncreaseFont,
      //     springConfig
      //   ),
      //   Animated.spring(
      //     this.state.animDecreaseFont,
      //     springConfig
      //   ),
      //   Animated.spring(
      //     this.state.animDarkBg,
      //     springConfig
      //   )
      // ]).start()
      Animated.timing(this.state.anim, {
        toValue: this.props.visible ? 0 : 1,
        duration: 460,
        useNativeDriver: true
      }).start()
    }
  }

  render () {
    const saveStrokeColour = '#ffffff'
    return (
      <Animated.View
        pointerEvents='box-none'
        style={{
        ...this.getStyles().base,
        }}>
        <RizzleButton
          style={{
            marginBottom: 28,
            transform: [{
              translateX: this.state.anim.interpolate({
                inputRange: [0, 0.25, 0.5, 1],
                outputRange: [0, this.translateDistance * 0.2, -this.translateDistance, -this.translateDistance]
              })
            }]
          }}
          onPress={this.props.increaseFontSize}
        >
          <Image
            source={require('../img/increase-font-size.png')}
            style={{
              position: 'relative',
              left: -2,
              width: 56,
              height: 56
            }}/>
        </RizzleButton>
        <RizzleButton
          style={{
            marginBottom: 28,
            transform: [{
              translateX: this.state.anim.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0, 0, this.translateDistance * 0.2, -this.translateDistance, -this.translateDistance]
              })
            }]
          }}
          onPress={this.props.decreaseFontSize}
          >
          <Image
            source={require('../img/decrease-font-size.png')}
            style={{
              position: 'relative',
              left: -2,
              width: 56,
              height: 56
            }}/>
        </RizzleButton>
        <RizzleButton
          style={{
            paddingLeft: 3,
            transform: [{
              translateX: this.state.anim.interpolate({
                inputRange: [0, 0.5, 0.75, 1],
                outputRange: [0, 0, this.translateDistance * 0.2, -this.translateDistance]
              })
            }]
          }}
          onPress={this.props.toggleDarkMode}
          >
          <Image
            source={require('../img/night-mode.png')}
            style={{
              position: 'relative',
              width: 56,
              height: 56,
              left: -2
            }}/>
        </RizzleButton>
      </Animated.View>
    )
  }

  getStyles() {
    const backgroundColor = this.props.displayMode == ItemType.saved ? hslString('rizzleBGAlt') : hslString('rizzleBG')
    return {
      base: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        width: '100%',
        zIndex: 10,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'flex-start'
      },
      button: {
        backgroundColor,
        opacity: 0.95,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        flexDirection: 'column',
        shadowOffset: {
          width: 0,
          height: 3
        },
        shadowRadius: 3,
        shadowOpacity: 0.3
      },
      buttonSVG: {
        paddingLeft: 3
      },
      buttonText: {
        color: 'white',
        textAlign: 'center',
        backgroundColor: 'transparent',
        // fontFamily: 'BodoniSvtyTwoOSITCTT-Book',
        fontFamily: 'IBMPlexMono',
        fontSize: 24,
        letterSpacing: -3
      },
      smallText: {
        fontSize: 12,
        letterSpacing: -1
      }
    }
  }
}

export default ViewButtons
