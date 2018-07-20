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
  getPanValue,
  addScrollListener
} from '../utils/animationHandlers'

import { id, isIphoneX } from '../utils'
import { hslString } from '../utils/colors'

export const STATUS_BAR_HEIGHT = 40

class TopBar extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    this.state = {
      bgColorValue: 0,
      prevBgColor: undefined
    }

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

  getMessage (item) {
    const feedName = item
      ? item.feed_title
      : 'Rizzle'
    return this.props.toolbar.message || feedName || ''
  }

  render () {
    const { prevItem, currentItem, nextItem } = this.props
    const {
      prevOpacityAnim,
      currentOpacityAnim,
      nextOpacityAnim,
      prevTransformAnim,
      currentTransformAnim,
      NextTransformAnim
    } = this.state
    const panAnim = getPanValue()

    const opacityRanges = [
      {
        inputRange: [0, 1, 2],
        outputRange: [1, 1, 1]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [0, 1, 1]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [0, 0, 1]
      }
    ]

    const transformRanges = [
      {
        inputRange: [0, 1, 2],
        outputRange: [0, -40, -40]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [40, 0, -40]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [40, 40, 0]
      }
    ]

    const items = prevItem ?
      [prevItem, currentItem, nextItem] :
      [currentItem, nextItem]
    const opacityAnims = items.map((item, i) => panAnim ?
        panAnim.interpolate(opacityRanges[i]) :
        1)
    const titleTransformAnims = items.map((item, i) => panAnim ?
        panAnim.interpolate(transformRanges[i]) :
        0)

    const panTransformAnim = prevItem ?
      panAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [STATUS_BAR_HEIGHT, 0, STATUS_BAR_HEIGHT]
      }) :
      panAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, STATUS_BAR_HEIGHT]
      })

    const views = items.map((item, i) => [
      this.renderTopBar(item, opacityAnims[i]),
      this.renderStatusBar(item, opacityAnims[i], titleTransformAnims[i], panTransformAnim)
    ])

    return (
      <View style={this.getStyles().base}>
        {views}
      </View>
    )
  }

  getBackgroundColor (item) {
    const feedColor = item ? item.feed_color : null
    return this.props.displayMode == 'saved' ?
      hslString('rizzleBG') :
      (feedColor ?
        hslString(feedColor, 'desaturatedDarker') :
        hslString('rizzleBG'))
  }

  renderTopBar (item, opacityAnim) {
    const topBarStyles = {
      ...this.getStyles().topBar,
      backgroundColor: this.getBackgroundColor(item),
      opacity: opacityAnim
    }
    return <Animated.View style={topBarStyles} key={id()} />
  }

  renderStatusBar (item, opacityAnim, transformAnim, panTransformAnim) {
    const isMessage = this.props.toolbar.message
    const textHolderStyles = {
      ...this.getStyles().textHolder,
      backgroundColor: this.getBackgroundColor(item),
      opacity: opacityAnim
    }
    return (
      <Animated.View key={id()} style={{
      ...textHolderStyles,
      overflow: 'hidden',
      shadowOffset: {
        width: 0,
        height: getAnimatedValueNormalised().interpolate({
          inputRange: [0 ,1],
          outputRange: [1, 0]
        })
      },
      // shadowColor: getAnimatedValueNormalised().interpolate({
      //   inputRange: [0 ,1],
      //   outputRange: ['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)']
      // }),
      transform: [{
        translateY: Animated.diffClamp(
          Animated.add(getAnimatedValue(), panTransformAnim),
          -STATUS_BAR_HEIGHT,
          0)
      }]
    }}>
      <Animated.Text
        numberOfLines={1}
        style={{
          ...this.getStyles().feedName,
          fontFamily: isMessage ? 'IBMPlexMono-Italic' : 'IBMPlexMono',
          // opacity: getAnimatedValueNormalised(),
          marginLeft: 35,
          transform: [{
            translateY: transformAnim
          }]
        }}
      >
        {this.getMessage(item)}
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
        onPress={this.props.toggleViewButtons}
      >
        <Text style={{
          fontFamily: 'IBMPlexMono',
          color: 'white',
          paddingLeft: 6,
          paddingTop: 3
        }}>z<Text style={{ color: 'black' }}>z</Text></Text>
      </TouchableOpacity>
    </Animated.View>)
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
        // flex: 1,
        position: 'absolute',
        top: 0,
        height: isIphoneX() ? 40 : 20,
        width: '100%'
      },
      textHolder: {
        // flex: 1,
        position: 'absolute',
        top: isIphoneX() ? 40 : 20,
        width: '100%',
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
