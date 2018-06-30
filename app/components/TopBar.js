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

    this.state = {
      bgColorValue: 0,
      prevBgColor: undefined
    }
    this.isAnimating = false

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

  componentDidUpdate (prevProps, prevState) {
    const { currentItem } = this.props
    const { prevItem } = prevProps
    if (!this.isAnimating &&
      prevItem &&
      prevItem.feed_color !== currentItem.feed_color &&
      this.state.prevBgColor !== (prevItem.feed_color || hslString('rizzleBG'))) {
      this.state.bgColorValue = new Animated.Value(0)
      this.state.prevBgColor = prevItem.feed_color || hslString('rizzleBG')
    }
  }

  render () {
    const { currentItem, toolbar, toggleViewButtons } = this.props
    const feedColor = currentItem ? currentItem.feed_color : null

    let backgroundColor = this.props.displayMode == 'saved' ?
      hslString('rizzleBG') :
      hslString(feedColor || 'rizzleBG')

    if (this.state.prevBgColor) {
      let that = this
      backgroundColor = this.state.bgColorValue.interpolate({
        inputRange: [0, 1],
        outputRange: [this.state.prevBgColor, backgroundColor]
      })
      Animated.timing(
        this.state.bgColorValue,
        {
          toValue: 1,
          duration: 1000
        }
      ).start(() => {
        that.isAnimating = false
      })
      this.isAnimating = true
    }

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
        <Animated.View style={topBarStyles} />
        <Animated.View style={{
          ...textHolderStyles,
          shadowOffset: {
            width: 0,
            height: getAnimatedValueNormalised()
          },
          // shadowColor: getAnimatedValueNormalised().interpolate({
          //   inputRange: [0 ,1],
          //   outputRange: ['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)']
          // }),
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
        shadowRadius: 1,
        shadowOpacity: 0.3,
        zIndex: -1
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
