import React from 'react'
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import AnimatedEllipsis from 'react-native-animated-ellipsis'
import Svg, {Polygon, Polyline, Rect, Path, Line} from 'react-native-svg'
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

    this.detailsHeight = new Animated.Value(0)

    this.state = {
      // bgColorValue: 0,
      // prevBgColor: undefined,
      detailsVisible: false
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

  componentDidUpdate (prevProps, prevState) {
    if (prevState.detailsVisible !== this.state.detailsVisible) {
      this.expandAnimation()
    }
  }

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
        inputRange: [0, 0.9, 1, 2],
        outputRange: [1, 1, 0, 0]
      }, {
        inputRange: [0, 1, 1.9, 2],
        outputRange: [0, 1, 1, 0]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [0, 0, 1]
      }
    ]

    const transformRanges = [
      {
        inputRange: [0, 1, 2],
        outputRange: [0, -20, -20]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [30, 0, -20]
      }, {
        inputRange: [0, 1, 2],
        outputRange: [30, 30, 0]
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
      this.renderStatusBar(item, opacityAnims[i], titleTransformAnims[i], panTransformAnim, prevItem ? i === 1 : i === 0)
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
        hslString(feedColor, 'desaturated') :
        hslString('rizzleSaved'))
    // return hslString('rizzleChrome')
  }

  getForegroundColor (item) {
    return this.props.displayMode == 'saved' ?
      hslString('rizzleText') :
      hslString('white')
  }

  getBorderBottomColor (item) {
    const feedColor = item ? item.feed_color : null
    return this.props.displayMode == 'saved' ?
      hslString('rizzleSaved') :
      (feedColor ?
        // hslString(feedColor, 'desaturated') :
        hslString(feedColor) :
        hslString('rizzleSaved'))
  }

  getHamburgerColor (item) {
    const feedColor = item ? item.feed_color : null
    return this.props.displayMode == 'saved' ?
      this.getForegroundColor() :
      (this.props.isFiltered ?
        hslString(feedColor, 'darker') :
        'white')
  }

  expandAnimation () {
    const springConfig = {
      speed: 20,
      bounciness: 8,
      toValue: this.state.detailsVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }
    Animated.spring(
      this.detailsHeight,
      springConfig
    ).start()
    // Animated.spring(
    //   this.detailsOpacity,
    //   {
    //     ...springConfig,
    //     toValue: this.state.detailsVisible ? 1 : 0
    //   }
    // ).start()
  }

  renderTopBar (item, opacityAnim) {
    const topBarStyles = {
      ...this.getStyles().topBar,
      backgroundColor: this.getBackgroundColor(item),
      opacity: opacityAnim
    }
    return <Animated.View style={topBarStyles} key={id()} />
  }

  renderStatusBar (item, opacityAnim, transformAnim, panTransformAnim, isVisible) {
    const isMessage = this.props.toolbar.message
    const textHolderStyles = {
      ...this.getStyles().textHolder,
      backgroundColor: this.getBackgroundColor(item),
      // borderBottomColor: this.getBorderBottomColor(item),
      // borderBottomWidth: 2,
      opacity: opacityAnim
    }
    const areDetailsVisible = this.state && this.state.detailsVisible || false

    return (
      <View>
        <Animated.View
          key={id()}
          pointerEvents={isVisible && this.state.detailsVisible
            ? 'auto'
            : 'none'}
          style={{
            ...textHolderStyles,
            backgroundColor: 'red',
            flexDirection: 'column',
            height: 600,
            overflow: 'hidden',
            paddingTop: 80,
            position: 'absolute',
            shadowOffset: {
              width: 0,
              height: 1
            },
            shadowRadius: 1,
            shadowOpacity: 0.1,
            shadowColor: 'rgba(0, 0, 0, 1)',
            top: -600,
            transform: [{
              translateY: this.detailsHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 600]
              })
            }]
          }}
        >
        </Animated.View>
        <Animated.View
          key={id()}
          pointerEvents={isVisible ? 'auto' : 'none'}
          style={{
            ...textHolderStyles,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: 321,
            overflow: 'hidden',
            paddingTop: 80,
            position: 'absolute',
            top: isIphoneX() ? -240 : -260,
            shadowOffset: {
              width: 0,
              height: 1
            },
            shadowRadius: 1,
            shadowOpacity: 0.1,
            shadowColor: 'rgba(0, 0, 0, 1)',
            transform: [{
              translateY: Animated.add(Animated.diffClamp(
                Animated.add(getAnimatedValue(), panTransformAnim),
                -STATUS_BAR_HEIGHT,
                0
              ), this.detailsHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 260]
              }))
            }]
          }}
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              zIndex: 5,
              left: 10,
              marginTop: 3,
              width: 28,
              height: 28,
              borderRadius: 14
            }}
            onPress={() => this.props.navigation.navigate('Feeds')}
          >
            <Svg
              height='22'
              width='28'>
              <Line
                fill='none'
                stroke={this.getHamburgerColor(item)}
                strokeLinecap='round'
                strokeWidth='2'
                x1='2'
                x2='24'
                y1='1'
                y2='1'
              />
              <Line
                fill='none'
                stroke={this.getHamburgerColor(item)}
                strokeLinecap='round'
                strokeWidth='2'
                x1='2'
                x2='24'
                y1='8'
                y2='8'
              />
              <Line
                fill='none'
                stroke={this.getHamburgerColor(item)}
                strokeLinecap='round'
                strokeWidth='2'
                x1='2'
                x2='24'
                y1='15'
                y2='15'
              />
            </Svg>
          </TouchableOpacity>
          <Text style={{
              ...this.getStyles().feedActions,
              fontFamily: isMessage ? 'IBMPlexMono-Italic' : 'IBMPlexMono',
              // opacity: getAnimatedValueNormalised(),
              height: 36,
              backgroundColor: this.getBorderBottomColor(item),
              color: 'white',
              marginLeft: Dimensions.get('window').width * 0.5 - 80,
              marginRight: Dimensions.get('window').width * 0.5 - 80,
              paddingBottom: 20,
              marginBottom: 30,
              borderRadius: 10
            }}
          >12 Unread</Text>
          <TouchableOpacity
            onPress={() => {
              this.props.markAllRead(item.feed_id)
              console.log('MARK ALL READ!')
          }}>
            <Text style={{
                ...this.getStyles().feedActions,
                fontFamily: isMessage ? 'IBMPlexMono-Italic' : 'IBMPlexMono',
                // opacity: getAnimatedValueNormalised(),
                height: 36,
                color: this.getBorderBottomColor(item),
                paddingBottom: 40,
                textDecorationLine: 'underline'
              }}
            >Mark all read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.props.unsubscribe(item.feed_id)
              console.log('UNSUBSCRIBE!')
            }}>
            <Text style={{
                ...this.getStyles().feedActions,
                fontFamily: isMessage ? 'IBMPlexMono-Italic' : 'IBMPlexMono',
                // opacity: getAnimatedValueNormalised(),
                height: 36,
                color: this.getBorderBottomColor(item),
                paddingBottom: 60,
                textDecorationLine: 'underline'
              }}
            >Unsubscribe</Text>
          </TouchableOpacity>
          <TouchableWithoutFeedback
            key={`inner-{id()}`}
            onPress={() => {
              console.log('BUTTON PRESSED!')
              this.setState({
                detailsVisible: !areDetailsVisible
              })
            }}
            style={{
              backgroundColor: 'transparent',
              width: Dimensions.get('window').width - 35,
              overflow: 'hidden',
              height: 36,
            }}>
            <Animated.Text
              numberOfLines={1}
              ellipsizeMode='tail'
              style={{
                ...this.getStyles().feedName,
                fontFamily: isMessage ? 'IBMPlexMono-Italic' : 'IBMPlexMono',
                // opacity: getAnimatedValueNormalised(),
                height: 36,
                width: Dimensions.get('window').width - 72,
                marginLeft: 36,
                marginRight: 36,
                // marginLeft: 35,
                transform: [{
                  translateY: transformAnim
                }],
                // color: this.getBorderBottomColor(item)
                color: this.getForegroundColor()
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
          </TouchableWithoutFeedback>
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 10,
              marginTop: 0,
              width: 28,
              height: 38,
              // borderRadius: 14,
              // backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}
            onPress={this.props.toggleViewButtons}
          >
            <Text style={{
              fontFamily: 'IBMPlexMono-Bold',
              color: 'white',
              paddingLeft: 6,
              paddingTop: 3
            }}>A<Text style={{ color: 'rgba(0,0,0,0.8)', fontSize: 22 }}>Z</Text></Text>
          </TouchableOpacity>
        </Animated.View>
    </View>)
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
        // overflow: 'hidden',
        backgroundColor: 'transparent',
        // shadowColor: '#000000',
        // shadowRadius: 1,
        // shadowOpacity: 0.1,
        // shadowOffset: {
        //   height: 1,
        //   width: 0
        // }
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
      },
      feedActions: {
        flex: 1,
        color: hslString('rizzleFG'),
        fontSize: 20,
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

export const getTopBarHeight = () => STATUS_BAR_HEIGHT +
  (isIphoneX() ? 40 : 20)

export default TopBar
