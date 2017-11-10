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
  getAnimatedValueNormalised
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
    return (
      <Animated.View style={{
        ...styles.base,
        opacity: getAnimatedValueNormalised()
      }}>
        <TouchableOpacity
          style={{
            ...styles.button,
            paddingLeft: 3
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
              stroke='#ffffff'
              strokeWidth='3'
              strokeLineJoin='round'
              fill={item && item.isSaved ? '#ffffff' : 'none'}
            />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.button,
            width: 'auto',
            paddingHorizontal: 28
          }}
          onPress={this.onDisplayPress}
        >
          <Text style={styles.buttonText}>
            {this.props.index + 1} / {this.props.items.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.button,
            paddingLeft: 3
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
}

const styles = {
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
    backgroundColor: '#4d0d42',
    opacity: 0.95,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  buttonSVG: {
    paddingLeft: 3
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontFamily: 'BodoniSvtyTwoOSITCTT-Book',
    fontSize: 20,
    marginTop: -6
  }
}

export default Buttons
