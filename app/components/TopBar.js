import React, { Fragment } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import AnimatedEllipsis from 'react-native-animated-ellipsis'
import Svg, {Circle, Polygon, Polyline, Rect, Path, Line} from 'react-native-svg'
import {
  getAnimatedValue,
  getPanValue,
  addScrollListener
} from '../utils/animationHandlers'

import { id, isIphoneX } from '../utils'
import { hslString } from '../utils/colors'

export const STATUS_BAR_HEIGHT = 49

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
    return /*this.props.toolbar.message ||*/ feedName || ''
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
    const { panAnim, panAnimDivisor } = getPanValue()

    const opacityRanges = [
      {
        inputRange: [0, panAnimDivisor * 0.9, panAnimDivisor, panAnimDivisor * 2],
        outputRange: [1, 1, 0, 0]
      }, {
        inputRange: [0, panAnimDivisor, panAnimDivisor * 1.9, panAnimDivisor * 2],
        outputRange: [0, 1, 1, 0]
      }, {
        inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
        outputRange: [0, 0, 1]
      }
    ]

    const transformRanges = [
      {
        inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
        outputRange: [0, -20, -20]
      }, {
        inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
        outputRange: [30, 0, -20]
      }, {
        inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
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
        inputRange: [0, panAnimDivisor, panAnimDivisor * 2],
        outputRange: [STATUS_BAR_HEIGHT, 0, STATUS_BAR_HEIGHT]
      }) :
      panAnim.interpolate({
        inputRange: [0, panAnimDivisor],
        outputRange: [0, STATUS_BAR_HEIGHT]
      })

    const views = items.map((item, i) => (<View key={i}>
        {this.renderTopBar(item, opacityAnims[i])}
        {this.renderStatusBar(item, opacityAnims[i], titleTransformAnims[i], panTransformAnim, prevItem ? i === 1 : i === 0)}
      </View>)
    )

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
      'white'
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
    return this.props.displayMode == 'saved' ?
      this.getForegroundColor() :
      (this.props.isFiltered ?
        'rgba(0, 0, 0, 0.6)' :
        'rgba(255, 255, 255, 0.6)')
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
      opacity: opacityAnim
    }
    const areDetailsVisible = this.state && this.state.detailsVisible || false

    const clampedAnimatedValue = Animated.diffClamp(
      Animated.add(getAnimatedValue(), panTransformAnim),
      -STATUS_BAR_HEIGHT,
      0
    )

    return (
      <View>
        <Animated.View
          key={id()}
          pointerEvents={isVisible && this.state.detailsVisible
            ? 'auto'
            : 'none'}
          style={{
            ...textHolderStyles,
            // backgroundColor: 'red',
            flexDirection: 'column',
            height: 600,
            overflow: 'hidden',
            paddingTop: 80,
            position: 'absolute',
            // shadowOffset: {
            //   width: 0,
            //   height: 1
            // },
            // shadowRadius: 1,
            // shadowOpacity: 0.1,
            // shadowColor: 'rgba(0, 0, 0, 1)',
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
            height: 281 + STATUS_BAR_HEIGHT,
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
              translateY: Animated.add(clampedAnimatedValue, this.detailsHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 260]
              }))
            }]
          }}
        >
          <ViewButtonToggle
            buttonColor={this.getHamburgerColor(item)}
            isSyncing={this.props.toolbar.message}
            onPress={this.props.toggleViewButtons}
            opacityAnim={clampedAnimatedValue.interpolate({
              inputRange: [-STATUS_BAR_HEIGHT / 2, 0],
              outputRange: [0, 1]
            })}
          />
          <FeedDetails
            bgColor={this.getBorderBottomColor(item)}
            feedActionStyles={this.getStyles().feedActions}
            onPressMarkAllRead={() => {
              this.props.markAllRead(item.feed_id)
              console.log('MARK ALL READ!')
            }}
            onPressUnsubscribe={() => {
              this.props.unsubscribe(item.feed_id)
              console.log('UNSUBSCRIBE!')
            }}
          />
          <TouchableWithoutFeedback
            key={`inner-{id()}`}
            onPress={() => {
              console.log('BUTTON PRESSED!')
              // this.setState({
              //   detailsVisible: !areDetailsVisible
              // })
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
                fontSize: 20,
                fontFamily: 'IBMPlexSansCond-Bold',
                height: 36,
                width: Dimensions.get('window').width - 72,
                marginLeft: 36,
                marginRight: 36,
                paddingBottom: 15,
                transform: [{
                  translateY: transformAnim
                }],
                // color: this.getBorderBottomColor(item)
                color: this.getForegroundColor(),
                opacity: clampedAnimatedValue.interpolate({
                  inputRange: [-STATUS_BAR_HEIGHT / 2, 0],
                  outputRange: [0, 1]
                })
              }}
            >
              {this.getMessage(item)}
            </Animated.Text>
          </TouchableWithoutFeedback>
          <FeedsHamburger
            onPress={() => this.props.navigation.navigate('Feeds')}
            opacityAnim={clampedAnimatedValue.interpolate({
              inputRange: [-STATUS_BAR_HEIGHT / 2, 0],
              outputRange: [0, 1]
            })}
            hamburgerColor={this.getHamburgerColor(item)} />
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
        fontSize: 20,
        fontFamily: 'IBMPlexMono',
        textAlign: 'center',
        padding: 10
      },
      feedActions: {
        flex: 1,
        color: hslString('rizzleFG'),
        fontSize: 20,
        // fontFamily: 'AvenirNext-Regular',
        fontFamily: 'IBMPlexMono',
        fontFamily: 'IBMPlexMono',
        height: 36,
        textAlign: 'center',
        padding: 10
      }
    }
  }
}

const FeedDetails = ({ bgColor, feedActionStyles, onPressMarkAllRead, onPressUnsubscribe }) => (<Fragment>
    <Text style={{
        ...feedActionStyles,
        color: bgColor,
        color: 'white',
        marginLeft: Dimensions.get('window').width * 0.5 - 80,
        marginRight: Dimensions.get('window').width * 0.5 - 80,
        paddingBottom: 20,
        marginBottom: 30,
        borderRadius: 10
      }}
    >12 Unread</Text>
    <TouchableOpacity
      onPress={onPressMarkAllRead}>
      <Text style={{
        ...feedActionStyles,
          color: bgColor,
          paddingBottom: 40,
          textDecorationLine: 'underline'
        }}
      >Mark all read</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={onPressUnsubscribe}>
      <Text style={{
        ...feedActionStyles,
          color: bgColor,
          paddingBottom: 60,
          textDecorationLine: 'underline'
        }}
      >Unsubscribe</Text>
    </TouchableOpacity>
  </Fragment>)

const FeedsHamburger = ({ onPress, hamburgerColor, opacityAnim }) => (<Animated.View
    style={{
      position: 'absolute',
      zIndex: 5,
      right: 19,
      bottom: 7,
      opacity: opacityAnim
    }}
  >
    <TouchableOpacity
      style={{
        width: 30,
        height: 28,
        borderRadius: 14
      }}
      onPress={onPress}
    >
      <Svg
        height='22'
        width='30'>
        <Circle
          cx="4"
          cy="10"
          r="3"
          strokeWidth={2}
          stroke="none"
          fill={hamburgerColor}
        />
        <Circle
          cx="14"
          cy="10"
          r="3"
          strokeWidth={2}
          stroke="none"
          fill={hamburgerColor}
        />
        <Circle
          cx="24"
          cy="10"
          r="3"
          strokeWidth={2}
          stroke="none"
          fill={hamburgerColor}
        />
      </Svg>
    </TouchableOpacity>
  </Animated.View>)

const ViewButtonToggle = ({ onPress, buttonColor, opacityAnim, isSyncing }) => (<Animated.View style={{
    position: 'absolute',
    left: 20,
    bottom: -2,
    width: 28,
    height: 38,
    opacity: opacityAnim
  }}>
    <TouchableOpacity
      style={{
        // borderRadius: 14,
        // backgroundColor: 'rgba(0, 0, 0, 0.3)'
      }}
      onPress={onPress}
    >
      <Svg
        height='32'
        width='32'>
        <Path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          strokeWidth={2}
          stroke={buttonColor}
          fill="none"
        />
        <Circle
          cx="12"
          cy="12"
          r="3"
          strokeWidth={2}
          stroke={buttonColor}
          fill={isSyncing ? "white" : "none"}
        />
      </Svg>
    </TouchableOpacity>
  </Animated.View>)


export const getTopBarHeight = () => STATUS_BAR_HEIGHT +
  (isIphoneX() ? 40 : 20)

export default TopBar
