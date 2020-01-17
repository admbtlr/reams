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
import Svg, {Circle, G, Polygon, Polyline, Rect, Path, Line} from 'react-native-svg'
import {
  getAnimatedValue,
  getPanValue,
  addScrollListener
} from '../utils/animationHandlers'
import FeedIconContainer from '../containers/FeedIcon'
import FeedExpandedContainer from '../containers/FeedExpanded'
import { getCachedFeedIconPath, id, isIphoneX } from '../utils'
import { hslString } from '../utils/colors'
import Reactotron from 'reactotron-react-native'

export const STATUS_BAR_HEIGHT = 70

class TopBar extends React.Component {
  static whyDidYouRender = true

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
    this.onDisplayPress = this.onDisplayPress.bind(this)

    addScrollListener(this)
  }

  onStatusBarDown () {
    this.props.showItemButtons()
  }

  onStatusBarUp () {
    this.props.hideAllButtons()
  }

  onStatusBarReset () {
    this.props.showItemButtons()
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = (
      (this.props.prevItem && nextProps.prevItem ?
        this.props.prevItem._id !== nextProps.prevItem._id :
        true) ||
      (this.props.currentItem && nextProps.currentItem ?
        this.props.currentItem._id !== nextProps.currentItem._id :
        true) ||
      (this.props.nextItem && nextProps.nextItem ?
        this.props.nextItem._id !== nextProps.nextItem._id :
        true) ||
      // this is terrible, since panAnim exists outside of state and props
      // but when SwipeableViews updates, it refreshed panAnim, and the TopBar
      // needs to refresh when this happens
      getPanValue().panAnim !== this.panAnim ||
      getAnimatedValue() !== this.scrollAnim
    )
    return shouldUpdate
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.detailsVisible !== this.state.detailsVisible) {
      this.expandAnimation()
    }
  }

  getMessage (item) {
    const feedName = item
      ? item.feed_title
      : 'Rizzle'
    return feedName || ''
  }

  render () {
    const { prevItem, currentItem, nextItem, index, numItems } = this.props
    const { panAnim, panAnimDivisor } = getPanValue()
    this.panAnim = panAnim
    this.scrollAnim = getAnimatedValue()

    console.log('RENDERING TOPBAR')
    Reactotron.log('RENDERING TOPBAR')


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

    const topBarOpacityRanges = [
      {
        inputRange: [0, panAnimDivisor * 0.1, panAnimDivisor, panAnimDivisor * 2],
        outputRange: [1, 0, 0, 0]
      }, {
        inputRange: [0, panAnimDivisor * 0.9, panAnimDivisor, panAnimDivisor * 1.1, panAnimDivisor * 2],
        outputRange: [0, 0, 1, 0, 0]
      }, {
        inputRange: [0, panAnimDivisor * 1.9, panAnimDivisor * 2],
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
    const topBarOpacityAnims = items.map((item, i) => panAnim ?
        panAnim.interpolate(topBarOpacityRanges[i]) :
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

    const views = items.map((item, i) => (<View key={item ? item._id : i}>
        {this.renderTopBar(item, opacityAnims[i])}
        {this.renderStatusBar(item,
          opacityAnims[i],
          titleTransformAnims[i],
          panTransformAnim,
          prevItem ? i === 1 : i === 0,
          index,
          numItems)}
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
      (this.props.isDarkBackground ?
        'hsl(0, 0%, 80%)' :
        hslString('rizzleText')) :
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
      'rgba(255, 255, 255, 0.6)'
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

  onDisplayPress () {
    const { displayMode, isOnboarding, setDisplayMode, showModal } = this.props
    const modalText = displayMode == 'saved' ?
      [
        {
          text: 'You are now in unread mode',
          style: ['title']
        },
        {
          text: 'This is where you can see all the unread stories in your feed',
          style: []
        }
      ] :
      [
        {
          text: 'You are now in saved mode',
          style: ['title']
        },
        {
          text: 'This is where you can see all the stories you’ve saved, either from your feed or using the Rizzle share extension',
          style: []
        }
      ]
    isOnboarding || setDisplayMode(displayMode === 'unread' ? 'saved' : 'unread')
    showModal({
      modalText,
      modalHideCancel: true,
      modalName: 'modal_switch_view',
      modalShow: true,
      modalHideable: true,
      modalOnOk: () => {
        const x = 'y'
        console.log('Gone')
      }
    })
  }

  renderTopBar (item, opacityAnim) {
    const topBarStyles = {
      ...this.getStyles().topBar,
      backgroundColor: this.getBackgroundColor(item),
      opacity: opacityAnim
    }
    return <Animated.View style={topBarStyles} />
  }

  renderStatusBar (item, opacityAnim, transformAnim, panTransformAnim, isVisible, index, numItems) {
    const isMessage = this.props.toolbar.message
    const textHolderStyles = {
      ...this.getStyles().textHolder,
      backgroundColor: this.getBackgroundColor(item),
      opacity: opacityAnim
    }
    const areDetailsVisible = this.state && this.state.detailsVisible || false

    const clampedAnimatedValue = Animated.diffClamp(
      Animated.add(this.scrollAnim, panTransformAnim),
      -STATUS_BAR_HEIGHT,
      0
    )

    return (
      <View>
        {/*<Animated.View
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
        </Animated.View>*/}
        <Animated.View
          key={item ? item._id : id()}
          pointerEvents={isVisible ? 'auto' : 'none'}
          style={{
            ...textHolderStyles,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            // height: 281 + STATUS_BAR_HEIGHT,
            overflow: 'hidden',
            // paddingTop: 80,
            position: 'absolute',
            // top: isIphoneX() ? -240 : -260,
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
          { this.props.isOnboarding || <ViewButtonToggle
            backgroundColor={this.getBackgroundColor(item)}
            buttonColor={this.getHamburgerColor(item)}
            isSyncing={this.props.toolbar.message}
            displayMode={this.props.displayMode}
            onPress={this.onDisplayPress}
            opacityAnim={clampedAnimatedValue.interpolate({
              inputRange: [-STATUS_BAR_HEIGHT / 2, 0],
              outputRange: [0, 1]
            })}
            style={{ width: 48 }}
          /> }
          {/*<FeedDetails
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
          />*/}
          <View style={{
            top: 0,
            flex: 1,
            marginLeft: 90,
            marginRight: 90
          }}>
            <TouchableOpacity
              key={`inner-{id()}`}
              onPress={() => {
                console.log('BUTTON PRESSED!')
                const { feed, navigation } = this.props
                // this.imageView.measure(this.measured)
                navigation.push('ModalWithGesture', {
                  childView: <FeedExpandedContainer
                      feedId={item.feed_id}
                      close={() => navigation.goBack(null)}
                      navigation={navigation}
                    />
                })
                // this.setState({
                //   detailsVisible: !areDetailsVisible
                // })
              }}
              style={{
                backgroundColor: 'transparent',
                height: 70,
              }}>
              <Animated.View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 64,
                // width: Dimensions.get('window').width - 84,
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                opacity: clampedAnimatedValue.interpolate({
                  inputRange: [-STATUS_BAR_HEIGHT / 2, 0],
                  outputRange: [0, 1]
                }),
                transform: [{
                  translateY: transformAnim || 0
                }]
              }}>
                { item && item.hasCachedFeedIcon &&
                  <View style={{marginTop: 9}}>
                    <FeedIconContainer
                      id={item.feed_id}
                      dimensions={item.feedIconDimensions}
                      bgColor={this.getBackgroundColor(item)}
                    />
                  </View>
                }
                <View style={{
                  flexDirection: 'column',
                  marginTop: -10
                }}>
                  <Text
                    style={{
                      ...this.getStyles().feedName,
                      fontSize: 14,
                      fontFamily: this.props.feedFilter ?
                        'IBMPlexSansCond-Bold' :
                        'IBMPlexSansCond',
                      color: this.getForegroundColor(),
                      textAlign: item && item.hasCachedFeedIcon ?
                        'left' : 'center'
                    }}
                  >{ index + 1 } / { numItems } {this.props.displayMode === 'saved' ?
                    'Saved from' :
                    this.props.feedFilter ?
                      'Filtered for' :
                      'Published in'}</Text>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode='tail'
                    style={{
                      ...this.getStyles().feedName,

                      fontSize: 18,
                      lineHeight: 22,
                      fontFamily: this.props.feedFilter ?
                        'IBMPlexSansCond-Bold' :
                        'IBMPlexSansCond-Bold',
                      // color: this.getBorderBottomColor(item)
                      color: this.getForegroundColor(),
                      // height: 36,
                      // paddingBottom: 15,
                      textAlign: item && item.hasCachedFeedIcon ?
                        'left' : 'center',
                      textDecorationLine: 'underline'
                    }}
                  >
                    {this.getMessage(item)}
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
          { this.props.isOnboarding ||
            <FeedsHamburger
              onPress={() => this.props.navigation.navigate('Feeds')}
              opacityAnim={clampedAnimatedValue.interpolate({
                inputRange: [-STATUS_BAR_HEIGHT / 2, 0],
                outputRange: [0, 1]
              })}
              hamburgerColor={this.getHamburgerColor(item)} />
          }
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
        height: isIphoneX() ? 44 : 22,
        width: '100%'
      },
      textHolder: {
        // flex: 1,
        position: 'absolute',
        top: isIphoneX() ? 44 : 22,
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
        // flex: 1,
        color: hslString('rizzleFG'),
        fontSize: 20,
        fontFamily: 'IBMPlexMono',
        textAlign: 'center',
        marginLeft: 5
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
      bottom: 15,
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


const ViewButtonToggle = ({ displayMode, onPress, backgroundColor, buttonColor, opacityAnim, isSyncing }) => {
  const savedIcon = <Svg width="32px" height="32px" viewBox="0 0 32 32">
      <G strokeWidth="1"  stroke='none' fill="none" fillRule="evenodd">
        <G transform="translate(-1.000000, -3.000000)">
          <G transform="translate(1.000000, 3.000000)">
            <Path fill={buttonColor} d="M2,6 L2,27 C2,28.65 3.4,30 5.11111111,30 L26.8888889,30 C28.6071081,30 30,28.6568542 30,27 L30,6 M0,5 C0,5.00566956 0,4.33900289 0,3 C0,0.991495663 0.444444444,4.4408921e-15 3,4.4408921e-15 L29,4.4408921e-15 C31.5555556,4.4408921e-15 32,1 32,3 L32,5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <Rect stroke={backgroundColor} fill='white' transform="translate(16.000000, 17.500000) rotate(120.000000) translate(-16.000000, -17.500000) " x="7.5" y="15.5" width="17" height="4" />
            <Rect stroke={backgroundColor} fill='white' x="7.5" y="15.5" width="17" height="4" />
            <Rect stroke={backgroundColor} fill='white' transform="translate(16.000000, 17.500000) rotate(60.000000) translate(-16.000000, -17.500000) " x="7.5" y="15.5" width="17" height="4" />
          </G>
        </G>
      </G>
    </Svg>
  const unreadIcon = <Svg width="30px" height="26px" viewBox="0 0 30 26">
    <G stroke="none" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <G transform="translate(-2.000000, -8.000000)" stroke={buttonColor} strokeWidth="2">
        <G transform="translate(3.000000, 3.000000)">
          <Path d="M0,22 L0,27 C0,28.65 1.4,30 3.11111111,30 L24.8888889,30 C26.6071081,30 28,28.6568542 28,27 L28,22 M3,24 L25,24 M3,27 L25,27 M3,18 L25,18 M3,21 L25,21 M3,12 L25,12 M3,15 L25,15 M3,6 L25,6 M3,9 L25,9" />
        </G>
      </G>
    </G>
  </Svg>
  return (
    <Animated.View style={{
      position: 'absolute',
      left: 20,
      bottom: 7,
      width: 32,
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
        { displayMode === 'unread' ? savedIcon : unreadIcon}
      </TouchableOpacity>
    </Animated.View>
  )
}


export const getTopBarHeight = () => STATUS_BAR_HEIGHT +
  (isIphoneX() ? 40 : 20)

export default TopBar
