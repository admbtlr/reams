import React from 'react'
import {
  ActionSheetIOS,
  Animated,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Polygon, Polyline, Rect, Path, Line} from 'react-native-svg'

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
  }

  // calculateNewTranslateY () {
  //   let newTranslateY = 0
  //   if (typeof this.props.toolbar.scrollOffset === 'number' &&
  //     this.props.toolbar.scrollOffset <= 0) {
  //     return this.props.toolbar.scrollOffset
  //   }
  //
  //   if (typeof this.props.toolbar.scrollDiff === 'number') {
  //     newTranslateY = this.translateY - this.props.toolbar.scrollDiff
  //   }
  //   if (newTranslateY > 0) {
  //     newTranslateY = 0
  //   } if (newTranslateY < 0 - STATUS_BAR_HEIGHT) {
  //     newTranslateY = 0 - STATUS_BAR_HEIGHT
  //   }
  //   return newTranslateY
  // }
  //
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

  render () {
    // this.translateY = this.calculateNewTranslateY()
    const item = this.props.items[this.props.index]
    const saveStrokeColour = this.props.displayMode && this.props.displayMode == 'unread' ? '#f6be3c' : '#ffffff'
    return (
      <Animated.View style={{
        ...this.getStyles().base,
        opacity: getAnimatedValueNormalised()
      }}>
        <TouchableOpacity
          style={{
            ...this.getStyles().button,
            paddingLeft: 3,
            transform: [{
              translateY: getAnimatedValueNormalised().interpolate({
                inputRange: [0, 0.33, 1],
                outputRange: [100, 0, 0]
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
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...this.getStyles().button,
            width: 'auto',
            paddingHorizontal: 28,
            transform: [{
              translateY: getAnimatedValueNormalised().interpolate({
                inputRange: [0, 0.33, 0.66, 1],
                outputRange: [100, 100, 0, 0]
              })
            }]
          }}
          onPress={this.onDisplayPress}
        >
          <Text style={this.getStyles().buttonText}>
            {this.props.index + 1} / {this.props.items.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...this.getStyles().button,
            paddingLeft: 3,
            transform: [{
              translateY: getAnimatedValueNormalised().interpolate({
                inputRange: [0, 0.66, 1],
                outputRange: [100, 100, 0]
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
              }]
            }}>
            <Polyline
              fill='none'
              points='17,10 25,2 33,10'
              stroke='#ffffff'
              strokeLinecap='round'
              strokeWidth='3'
            />
            <Line
              fill='none'
              stroke='#ffffff'
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
              stroke='#ffffff'
              strokeLinecap='round'
              strokeWidth='3'
            />
          </Svg>
        </TouchableOpacity>
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
      button: {
        backgroundColor: this.props.displayMode && this.props.displayMode == 'saved' ? '#5f4d2f' : '#51485f',
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
        fontSize: 16,
      }
    }
  }
}


export default Buttons
