import React from 'react'
import {
  Animated,
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
          <Text style={{
            ...this.getStyles().buttonText,
            color: saveStrokeColour
          }}>A-Z</Text>
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
          <Text style={{
            ...this.getStyles().buttonText,
            ...this.getStyles().smallText,
            color: saveStrokeColour
          }}>A-Z</Text>
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
          <Svg
            height='56'
            width='56'
            style={{
              transform: [{
                translateX: 8
              },
              {
                translateY: 14
              }]
            }}>
            <Path
              d='M0.5463856,14.8257151 L9.28657345,10.9473761 C11.4036417,7.04700903 14.2125552,4.23809546 17.7133142,2.52063542 C21.2140731,0.803175389 24.952614,0.171289301 28.928937,0.624977161 C29.2413278,4.87808002 28.523773,8.53095226 26.7762726,11.5835939 C25.0287722,14.6362355 22.2198586,17.4451491 18.3495319,20.0103346 L14.0891071,28.3684366 L12.0212829,22.8502948 L9.8182432,24.0975727 L4.73976736,19.0190969 L5.83633186,16.6653438 L0.5463856,14.8257151 Z M6.44060191,22.3026021 L6.65367018,24.2196375 L1.6052423,27.1379617 L4.54274845,22.1087158 L6.44060191,22.3026021 Z M19.009005,9.92845381 C20.0421593,10.9616081 21.7172334,10.9616081 22.7503877,9.92845381 C23.783542,8.8952995 23.783542,7.22022541 22.7503877,6.1870711 C21.7172334,5.1539168 20.0421593,5.1539168 19.009005,6.1870711 C17.9758507,7.22022541 17.9758507,8.8952995 19.009005,9.92845381 Z'
              fill='none'
              stroke={saveStrokeColour}
              strokeLinecap='round'
              strokeWidth='1'
            />
          </Svg>
        </RizzleButton>
      </Animated.View>
    )
  }

  getStyles() {
    const backgroundColor = this.props.displayMode == 'saved' ? hslString('rizzleBGAlt') : hslString('rizzleBG')
    return {
      base: {
        position: 'absolute',
        top: 74,
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
