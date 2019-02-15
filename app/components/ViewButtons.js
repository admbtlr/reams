import React from 'react'
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Polygon, Polyline, Rect, Path, Line} from 'react-native-svg'
import RizzleButton from './RizzleButton'
import {
  getAnimatedValueNormalised,
  getAnimatedValue
} from '../utils/animationHandlers'
import {hslString} from '../utils/colors'


class ViewButtons extends React.Component {
  state = {
    visibleAnimIncreaseFont: new Animated.Value(100),
    visibleAnimDecreaseFont: new Animated.Value(100),
    visibleAnimDarkBg: new Animated.Value(100),
  }

  constructor (props) {
    super(props)
    this.props = props
  }

  componentDidUpdate (prevProps) {
    const springConfig =         {
      speed: 20,
      bounciness: 12,
      toValue: this.props.visible ? 0 : 70,
      duration: 200,
      useNativeDriver: true
    }
    if (prevProps.visible !== this.props.visible) {
      Animated.stagger(50, [
        Animated.spring(
          this.state.visibleAnimIncreaseFont,
          springConfig
        ),
        Animated.spring(
          this.state.visibleAnimDecreaseFont,
          springConfig
        ),
        Animated.spring(
          this.state.visibleAnimDarkBg,
          springConfig
        )
      ]).start()
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
            marginBottom: 14,
            transform: [{
              translateX: this.state.visibleAnimIncreaseFont
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
            marginBottom: 14,
            transform: [{
              translateX: this.state.visibleAnimDecreaseFont
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
              translateX: this.state.visibleAnimDarkBg
            }]
          }}
          onPress={this.props.toggleDarkBackground}
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
    const backgroundColor = this.props.displayMode == 'saved' ? hslString('rizzleBGAlt') : hslString('rizzleBG')
    return {
      base: {
        position: 'absolute',
        top: 100,
        right: 10,
        width: '100%',
        zIndex: 10,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'flex-end'
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
