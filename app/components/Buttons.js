import React from 'react'
import {
  ActionSheetIOS,
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

class Buttons extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
    // this.translateY = STATUS_BAR_HEIGHT

    this.showShareActionSheet = this.showShareActionSheet.bind(this)
    this.onSavePress = this.onSavePress.bind(this)
    this.onDisplayPress = this.onDisplayPress.bind(this)
    this.onMercuryPress = this.onMercuryPress.bind(this)
  }

  showShareActionSheet () {
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: this.props.items[this.props.index].url,
      message: this.props.items[this.props.index].title
    },
    (error) => {
      console.error(error)
    },
    (success, method) => {
    })
  }

  onSavePress () {
    const item = this.props.items[this.props.index]
    this.props.toggleSaved(item)
  }

  onDisplayPress () {
    this.props.toggleDisplay()
  }

  onMercuryPress () {
    const item = this.props.items[this.props.index]
    this.props.toggleMercury(item)
  }

  render () {
    // this.translateY = this.calculateNewTranslateY()
    const item = this.props.items[this.props.index]
    const saveStrokeColour = false && this.props.displayMode && this.props.displayMode == 'unread' ? '#f6be3c' : '#ffffff'
    return (
      <Animated.View
        pointerEvents: 'box-none'
        style={{
          ...this.getStyles().base,
          opacity: getAnimatedValueNormalised()
        }}>
        <RizzleButton
          style={{
            width: 'auto',
            paddingHorizontal: 28,
            transform: [{
              translateY: getAnimatedValueNormalised().interpolate({
                inputRange: [0, 0.2, 0.25, 1],
                outputRange: [70, -10, 0, 0]
              })
            }]
          }}
          onPress={this.onDisplayPress}
        >
          <Text style={{
            ...this.getStyles().buttonText,
            color: saveStrokeColour
          }}>
            {this.props.index + 1} / {this.props.items.length}
          </Text>
          { !!this.props.decoratedCount &&
            this.props.items.length !== this.props.decoratedCount &&
            <Text style={{
              ...this.getStyles().buttonText,
              ...this.getStyles().smallText,
              color: saveStrokeColour
            }}>
              Cached: {this.props.decoratedCount}
            </Text>
          }
        </RizzleButton>
        <RizzleButton
          style={{
            paddingLeft: 3,
            transform: [{
              translateY: getAnimatedValueNormalised().interpolate({
                inputRange: [0, 0.25, 0.45, 0.5, 1],
                outputRange: [70, 70, -10, 0, 0]
              })
            }]
          }}
          onPress={this.onSavePress}
        >
          <Svg
            height='50'
            width='50'
            style={{
              transform: [{
                scale: 0.5
              }]
            }}>
            <Polygon
              points='25,3.553 30.695,18.321 46.5,19.173 34.214,29.152 38.287,44.447 25,35.848 11.712,44.447 15.786,29.152 3.5,19.173 19.305,18.321'
              stroke={saveStrokeColour}
              strokeWidth='3'
              strokeLineJoin='round'
              fill={item && item.isSaved ? saveStrokeColour : 'none'}
            />
          </Svg>
        </RizzleButton>
        <RizzleButton
          style={{
            paddingLeft: 3,
            transform: [{
              translateY: getAnimatedValueNormalised().interpolate({
                inputRange: [0, 0.5, 0.7, 0.75, 1],
                outputRange: [70, 70, -10, 0, 0]
              })
            }]
          }}
          onPress={this.showShareActionSheet}
          >
          <Svg
            height='50'
            width='50'
            style={{
              transform: [{
                scale: 0.5
              }, {
                translateY: -2
              }]
            }}>
            <Polyline
              fill='none'
              points='17,10 25,2 33,10'
              stroke={saveStrokeColour}
              strokeLinecap='round'
              strokeWidth='3'
            />
            <Line
              fill='none'
              stroke={saveStrokeColour}
              strokeLinecap='round'
              strokeWidth='3'
              x1='25'
              x2='25'
              y1='32'
              y2='2.333'
            />
            <Rect
              fill='none'
              height='50'
              width='50'
            />
            <Path
              d='M17,17H8v32h34V17h-9'
              fill='none'
              stroke={saveStrokeColour}
              strokeLinecap='round'
              strokeWidth='3'
            />
          </Svg>
        </RizzleButton>
        <RizzleButton
          style={{
            paddingLeft: 3,
            transform: [{
              translateY: getAnimatedValueNormalised().interpolate({
                inputRange: [0, 0.75, 0.95, 1],
                outputRange: [70, 70, -10, 0]
              })
            }]
          }}
          onPress={this.onMercuryPress}
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
              fill={item && item.showMercuryContent ? saveStrokeColour : 'none'}
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
    return {
      base: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        zIndex: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 14
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
        fontSize: 16,
      },
      smallText: {
        fontSize: 8
      }
    }
  }
}

export default Buttons
