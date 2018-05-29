import React from 'react'
import {
  Animated,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import AnimatedEllipsis from 'react-native-animated-ellipsis'
import {
  getAnimatedValue,
  getAnimatedValueNormalised,
  addScrollListener
} from '../utils/animationHandlers'

import {isIphoneX} from '../utils'
import {hslString} from '../utils/colors'

export const STATUS_BAR_HEIGHT = 40

class TopBar extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    this.onStatusBarDown = this.onStatusBarDown.bind(this)
    this.onStatusBarUp = this.onStatusBarUp.bind(this)

    addScrollListener(this)
  }

  onStatusBarDown () {
    this.props.showItemButtons()
  }

  onStatusBarUp () {
    this.props.hideAllButtons()
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextProps.currentItem !== this.props.currentItem ||
  //     nextProps.toolbar.message !== this.props.toolbar.message
  // }

  getMessage (props = this.props) {
    const feedName = props.currentItem
      ? props.currentItem.feed_title
      : 'Rizzle'
    return props.toolbar.message || feedName || ''
  }

  render () {
    const { toolbar, toggleViewButtons } = this.props
    // const backgroundColor = this.props.displayMode == 'saved' ? hslString('rizzleBGAlt') : hslString('rizzleFG')
    const backgroundColor = this.props.displayMode == 'saved' ?
      hslString('rizzleBGAlt') :
      hslString('rizzleBG')
    // const borderBottomColor = this.props.displayMode == 'saved' ? hslString('rizzleHighlight') : hslString('rizzleBG')
    let topBarStyles = {
      ...this.getStyles().topBar,
      backgroundColor
    }
    const isMessage = toolbar.message
    let textHolderStyles = {
      ...this.getStyles().textHolder,
      backgroundColor,
      // borderBottomColor
    }
    return (
      <View style={this.getStyles().base}>
        <View style={topBarStyles} />
        <Animated.View style={{
          ...textHolderStyles,
          transform: [{
            translateY: getAnimatedValue()
          }]
        }}>
          <Animated.Text
            numberOfLines={1}
            style={{
              ...this.getStyles().feedName,
              fontFamily: isMessage ? 'IBMPlexMono-Italic' : 'IBMPlexMono',
              opacity: getAnimatedValueNormalised(),
              marginLeft: 35
            }}
          >
            {this.getMessage()}
            {isMessage &&
              <AnimatedEllipsis style={{
                color: 'white',
                fontSize: 16,
                letterSpacing: -5
              }}/>
            }
          </Animated.Text>
          <TouchableOpacity
            style={{
              marginRight: 7,
              marginTop: 3,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
            onPress={toggleViewButtons}
          >
            <Text style={{
              fontFamily: 'IBMPlexMono',
              color: 'white',
              paddingLeft: 6,
              paddingTop: 3
            }}>z<Text style={{ color: 'black' }}>z</Text></Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  getStyles() {
    return {
      base: {
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 10
      },
      topBar: {
        flex: 1,
        height: isIphoneX() ? 40 : 20
      },
      textHolder: {
        flex: 1,
        flexDirection: 'row',
        height: STATUS_BAR_HEIGHT,
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 1
        },
        shadowRadius: 1,
        shadowOpacity: 0.3
      },
      feedName: {
        flex: 1,
        color: hslString('rizzleFG'),
        fontSize: 16,
        // fontFamily: 'AvenirNext-Regular',
        fontFamily: 'IBMPlexMono',
        // fontWeight: '700',
        // fontVariant: ['small-caps'],
        textAlign: 'center',
        padding: 10
      }
    }
  }
}


export default TopBar
