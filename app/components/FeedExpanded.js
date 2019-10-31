import React from 'react'
import {
  Dimensions,
  Image,
  InteractionManager,
  ScrollView,
  StatusBar,
  StatusBarAnimation,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, {Circle, Polygon, Polyline, Rect, Path, Line} from 'react-native-svg'
import Animated, { Easing } from 'react-native-reanimated'
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler'
import { blendColor, hslString } from '../utils/colors'
import FeedCoverImage from './FeedCoverImage'
import FeedIconContainer from '../containers/FeedIcon'
import TextButton from './TextButton'
import XButton from './XButton'

const DRAG_THRESHOLD = 10

const {
  add,
  and,
  block,
  call,
  clockRunning,
  cond,
  debug,
  divide,
  eq,
  event,
  greaterThan,
  interpolate,
  multiply,
  neq,
  or,
  set,
  spring,
  startClock,
  stopClock,
  sub,
  timing,
  Clock,
  Extrapolate,
  Value
} = Animated

class FeedExpanded extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    const dim = Dimensions.get('window')
    this.screenWidth = dim.width
    this.margin = this.screenWidth * 0.03
    this.cardWidth = this.screenWidth < 500 ?
      this.screenWidth - this.margin * 2 :
      (this.screenWidth - this.margin * 3) / 2
    this.screenHeight = dim.height

    this.cardHeight = this.screenWidth < 500 ?
      this.cardWidth / 2 :
      this.cardWidth

    this.state = {
      expandAnim: new Animated.Value(0),
      translateYAnim: new Animated.Value(0),
      opacityAnimatedValue: new Animated.Value(1),
      isExpanded: false,
      blockDrag: false
    }

    this.currentX = this.props.xCoord || 0
    this.currentY = this.props.yCoord || 0

    this.closeButtonGestureState = new Value(-1)
    this.onCloseButtonPress = event([{
      nativeEvent: {
        state: this.closeButtonGestureState,
      }
    }])
    this.panY = new Value(0)
    this.panGestureState = new Value(-1)
    this.onPanGestureEvent = event([{
      nativeEvent: {
        translationY: this.panY,
        state: this.panGestureState
      }
    }])

    this.deselectFeed = this.deselectFeed.bind(this)
    this.setFeedExpanded = this.setFeedExpanded.bind(this)
  }

  initialiseAnimations () {
    const clock = new Clock()

    transY = cond(
      eq(this.panGestureState, State.ACTIVE),
      this.panY
    )

    const runAnimation = (clock, feedGestureState, closeButtonGestureState) => {
      const state = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(this.isExpanded ? 1 : 0),
        time: new Value(0),
        frameTime: new Value(0)
      }

      const config = {
        toValue: new Value(0),
        damping: 20,
        mass: 1,
        stiffness: 180,
        overshootClamping: false,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
        isExpanded: false
      }
      return block([
        cond(and(eq(state.position, 1), eq(closeButtonGestureState, State.END), eq(clockRunning(clock), 0)), [
          set(state.finished, 0),
          set(state.time, 0),
          set(state.position, 1),
          set(config.toValue, 0),
          startClock(clock),
          call([state.position], this.showStatusBar)
        ]),
        cond(and(eq(state.position, 0), eq(feedGestureState, State.END), eq(clockRunning(clock), 0)), [
          set(state.finished, 0),
          set(state.time, 0),
          set(state.position, 0),
          set(config.toValue, 1),
          startClock(clock),
          call([state.position], this.hideStatusBar)
        ]),
        cond(and(greaterThan(transY, 200), eq(clockRunning(clock), 0)), [
          set(state.finished, 0),
          set(state.time, 0),
          set(state.position, sub(1, divide(transY, this.screenHeight))),
          set(config.toValue, 0),
          startClock(clock),
          call([state.position], this.showStatusBar)
        ]),
        cond(state.finished, [
          debug('state finished, stopping clock, position = ', state.position),
          stopClock(clock)
        ]),
        cond(and(state.finished, eq(state.position, 1)), [
          call([state.position], this.setFeedExpanded)
        ]),
        spring(clock, state, config),
        // call([state.position], this.showHideStatusBar),
        call([state.position, state.finished], this.deselectFeed),
        state.position
      ])
    }
    this.expandAnim = sub(
      runAnimation(clock, this.props.gestureState, this.closeButtonGestureState),
      divide(transY, this.screenHeight)
    )
  }

  hideStatusBar () {
    StatusBar.setHidden(true, 'slide')
  }

  showStatusBar () {
    StatusBar.setHidden(false, 'slide')
  }

  showHideStatusBar (position) {
    if (position >= 1) {
      StatusBar.setHidden(true, 'slide')
    } else if (position <= 0) {
      StatusBar.setHidden(false, 'slide')
    }
  }

  setFeedExpanded () {
    this.isExpanded = true
  }

  deselectFeed ([position, finished]) {
    if (position <= 0 && finished > 0) {
      if (this.isExpanded) {
        this.props.deselectFeed()
        this.isExpanded = false
      } else {
        this.isExpanded = true
      }
    }
  }

  render () {
    const {
      coverImageDimensions,
      coverImagePath,
      favicon,
      feedTitle,
      feedColor,
      feedDescription,
      feedIconDimensions,
      feedId,
      feedIsLiked,
      feedIsMuted,
      feedOriginalId,
      numUnread,
      numRead,
      readingTime,
      readingRate
    } = this.props
    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'left'
    }

    if (this.props.yCoord !== this.currentY) {
      this.currentX = this.props.xCoord
      this.currentY = this.props.yCoord
    }

    this.initialiseAnimations()

    console.log("Rendering FeedExpanded for " + feedTitle)

    const bold = {
      fontFamily: 'IBMPlexMono-Bold',
      color: hslString(feedColor, 'desaturated')
    }
    const italic = {
      fontFamily: 'IBMPlexMono-LightItalic'
    }
    const readingTimeMins = Math.floor(readingTime / 60)
    const readingTimeHours = Math.floor(readingTimeMins / 60)
    const readingTimeString = (readingTimeHours > 0 ?
      (readingTimeHours + ' hour' + (readingTimeHours === 1 ? ' ' : 's ')) : '') +
      (readingTimeMins > 0 ?
        (readingTimeHours > 0 ? readingTimeMins % 60 : readingTimeMins) + ' minute' + (readingTimeMins === 1 ? '' : 's') :
        readingTime + ' seconds')
    const avgReadingTime = Math.round(readingTime / numRead)
    const feedStats = (
      <Text style={{
        color: '#666666',
        fontFamily: 'IBMPlexMono-Light',
        fontSize: 16,
        // marginTop: this.margin * 2,
        marginBottom: this.margin
      }}>You’ve read
        <Text style={bold}> {numRead} </Text>
        {numRead === 1 ? 'story' : 'stories'} from
        <Text style={italic}> {feedTitle}</Text>
        {numRead > 0 &&
          <Text> over the course of
            <Text style={bold}> {readingTimeString}</Text>.
            It takes you an average of
            <Text style={bold}> {avgReadingTime} seconds </Text>
            to read each story
          </Text>
        }.
        </Text>)

    const buttonStyle = {
      backgroundColor: hslString(feedColor, 'desaturated'),
      padding: this.margin*.5,
      color: 'white',
      // flex: 1,
      borderRadius: 8,
      // marginRight: this.margin,
      marginTop: this.margin,
      width: this.screenWidth / 2 - this.margin * 1.5
    }
    const buttonTextStyle = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      fontSize: 16,
      textAlign: 'center'
    }

    // just don't show favicons
    // TODO: delete them completely?
    const showFavicon = false

    const likeIcon = <Svg
        height='32'
        width='32'>
        <Path
          d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
          strokeWidth={2}
          stroke={ feedIsLiked ? 'white' : hslString('rizzleText') }
          fill={ feedIsLiked ? 'white' : 'none' }
        />
      </Svg>

    const muteIcon = <Svg
        height='32'
        width='32'>
        <Path
          d='M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6'
          strokeWidth={2}
          stroke={ feedIsMuted ? 'white' : hslString('rizzleText') }
          fill={ feedIsMuted ? 'white' : 'none' }
        />
      </Svg>

    const discardAllIcon = <Svg
        height='32'
        width='24'
        fill='none'
        stroke={hslString('rizzleText')}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'>
        <Polyline
          points='3 6 5 6 21 6' />
        <Path
          d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
        <Line
          x1='10'
          y1='11'
          x2='10'
          y2='17' />
        <Line
          x1='14'
          y1='11'
          x2='14'
          y2='17' />
      </Svg>

    const unsubscribeIcon = <Svg
        width='32'
        height='32'
        fill='none'
        stroke={hslString('rizzleText')}
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'>
        <Line x1='18' y1='6' x2='6' y2='18' />
        <Line x1='6' y1='6' x2='18' y2='18' />
      </Svg>

    const readIcon = <Svg
        height='32'
        width='32'>
        <Path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          strokeWidth={2}
          stroke={hslString('rizzleText')}
          fill="none"
        />
        <Circle
          cx="12"
          cy="12"
          r="3"
          strokeWidth={2}
          stroke={hslString('rizzleText')}
          fill='none'
        />
      </Svg>


    return (
      <Animated.View
        style={{
          flex: 1,
          height: this.cardHeight,
          width: this.cardWidth,
          marginBottom: this.margin,
          marginRight: (this.props.index % 2 === 0 && this.screenWidth > 500) ?
            this.margin :
            0,
          overflow: 'visible',
          transform: [
            { translateY: interpolate(this.expandAnim, {
                inputRange: [0, 1],
                outputRange: [0, 0 - this.currentY]
              })
            },
            { translateX: interpolate(this.expandAnim, {
                inputRange: [0, 1],
                outputRange: [0, 0 - this.currentX]
              })
            },
            // { scaleX: this.state.scaleAnim },
            // { scaleY: this.state.scaleAnim }
          ],
          opacity: interpolate(this.expandAnim, {
            inputRange: [0, 0.01, 1],
            outputRange: [0, 1, 1]
          }),
          ...this.props.extraStyle
        }}
        ref={c => this.outerView = c}
      >
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={this.onPanGestureEvent}
          onHandlerStateChange={this.onPanGestureEvent}
        >
          <Animated.View
            style={{
              height: interpolate(this.expandAnim, {
                inputRange: [0, 1],
                outputRange: [this.cardHeight, this.screenHeight / 2],
              }),
              width: interpolate(this.expandAnim, {
                inputRange: [0, 1],
                outputRange: [this.cardWidth, this.screenWidth],
              }),
              borderRadius: 16,
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              backgroundColor: hslString(feedColor, 'desaturated'),
              position: 'relative',
              overflow: 'visible'
            }}>
              <View
                ref={c => this.imageView = c}
                style={{
                  height: '100%',
                  width: '100%'
                }}>
                <Animated.View style={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden'
                }}>
                  <FeedCoverImage
                    feedColor={this.props.feedColor}
                    feedId={this.props.feedId}
                    coverImageId={this.props.coverImageId}
                    cachedCoverImageId={this.props.cachedCoverImageId}
                    coverImageDimensions={this.props.coverImageDimensions}
                    setCachedCoverImage={this.props.setCachedCoverImage}
                    width={this.screenWidth}
                    height={this.screenHeight * 0.5} />
                </Animated.View>
              </View>
            <Animated.View style={{
              width: '100%',
              height: '100%',
              borderRadius: 16,
              paddingLeft: this.margin,
              paddingRight: this.margin,
              position: 'absolute',
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }}>
              <Animated.View style={{
                height: this.cardHeight,
                paddingLeft: this.margin,
                paddingRight: this.margin,
                paddingBottom: this.margin,
                position: 'absolute',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                transform: [
                  {
                    translateY: interpolate(this.expandAnim, {
                      inputRange: [0, 1],
                      outputRange: [0, this.screenHeight * 0.5 - this.cardHeight - this.margin],
                    })
                  }
                ],
              }}>
                <View style={{
                  paddingLeft: 10,
                  paddingRight: 10
                }}>
                  <Animated.Text style={{
                    ...textStyles,
                    flexWrap: 'wrap',
                    fontFamily: 'IBMPlexSansCond-Bold',
                    fontSize: add(24, multiply(this.expandAnim, 8))
                  }}>{feedTitle}</Animated.Text>
                </View>
                <View style={{
                  paddingBottom: 5,
                  paddingLeft: 10,
                  paddingRight: 10
                }}>
                  <Text style={{
                    ...textStyles,
                    fontFamily: 'IBMPlexMono-Light',
                    fontSize: 16
                  }}>{numUnread} unread</Text>
                  </View>
              </Animated.View>
            </Animated.View>
            <View
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                left: 0,
                bottom: 20,
                backgroundColor: 'transparent',
                overflow: 'hidden',
                pointerEvents: 'none'
            }}>
              <View style={{
                backgroundColor: hslString(feedColor),
                position: 'absolute',
                bottom: -65,
                right: -65,
                zIndex: 5,
                width: 130,
                height: 130,
                transform: [{
                  rotateZ: '45deg'
                }]
              }} />
              <View style={{
                position: 'absolute',
                bottom: 10,
                right: 5,
                zIndex: 10
              }}>
                <FeedIconContainer
                  id={feedId}
                  dimensions={feedIconDimensions}
                  bgColor={feedColor}
                />
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
        <TapGestureHandler
          onHandlerStateChange={this.onCloseButtonPress}
        >
          <Animated.View style={{
            opacity: this.expandAnim,
            position: 'absolute',
            top: 10,
            right: 0
          }}>
            <XButton isLight={true} style={{ top: 48 }}/>
          </Animated.View>
        </TapGestureHandler>
          <Animated.View style={{
            backgroundColor: '#F2ECD9',
            // 20px to cover the round corners of the image
            height: interpolate(this.expandAnim, {
              inputRange: [0, 0.8, 1],
              outputRange: [0, this.screenHeight / 4, this.screenHeight / 2 + 20]
            }),
            marginTop: -20,
            opacity: interpolate(this.expandAnim, {
              inputRange: [0, 0.2, 1],
              outputRange: [0, 1, 1]
            }),
            width: this.screenWidth
          }}>
            <ScrollView
              contentContainerStyle={{
                flex: 1,
                justifyContent: 'space-between',
                padding: this.margin
              }}>
              <Text style={{
                color: '#666666',
                fontFamily: 'IBMPlexSans-Bold',
                fontSize: 20,
                textAlign: 'center'
              }}>{ feedDescription || 'This is where the feed description will go, eventually, when we have them' }</Text>
              <View style={{
                height: 1,
                backgroundColor: hslString('rizzleText'),
                opacity: 0.2,
                marginBottom: this.margin
              }} />
              { feedStats }
              <View style={{
                alignItems: 'flex-end'
              }}>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  <TextButton
                    buttonStyle={{
                      minWidth: this.screenWidth / 2 - this.margin * 1.5,
                      marginRight: this.margin,
                      marginBottom: this.margin
                    }}
                    icon={discardAllIcon}
                    onPress={() => {
                      this.props.markAllRead(feedId, feedOriginalId, Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000))
                    }}
                    text="Discard old" />
                  <TextButton
                    buttonStyle={{
                      minWidth: this.screenWidth / 2 - this.margin * 1.5,
                      marginBottom: this.margin
                    }}
                    icon={discardAllIcon}
                    onPress={() => {
                      this.props.markAllRead(feedId, feedOriginalId)
                    }}
                    text="Discard all" />
                  <TextButton
                    buttonStyle={{
                      minWidth: this.screenWidth / 2 - this.margin * 1.5,
                      marginRight: this.margin,
                      marginBottom: this.margin
                    }}
                    icon={unsubscribeIcon}
                    onPress={() => {
                      this.props.unsubscribe(feedId)
                    }}
                    text="Unsubscribe" />
                  <TextButton
                    buttonStyle={{
                      minWidth: this.screenWidth / 2 - this.margin * 1.5,
                      marginBottom: this.margin
                    }}
                    icon={readIcon}
                    onPress={() => {
                      console.log('Pressed Go to items ' + feedId)
                      this.props.clearReadItems()
                      this.props.filterItems(feedId)
                      this.props.navigation.navigate('Items')
                      StatusBar.setHidden(false)
                    }}
                    text="Read items" />
                  <TextButton
                    buttonStyle={{
                      minWidth: this.screenWidth / 2 - this.margin * 1.5,
                      marginRight: this.margin
                    }}
                    icon={muteIcon}
                    isInverted={feedIsMuted}
                    onPress={() => {
                      console.log('Mute')
                      this.props.toggleMute(feedId)
                    }}
                    text="Mute" />
                  <TextButton
                    buttonStyle={{
                      minWidth: this.screenWidth / 2 - this.margin * 1.5
                    }}
                    icon={likeIcon}
                    isInverted={feedIsLiked}
                    onPress={() => {
                      console.log('Like')
                      this.props.toggleLike(feedId)
                    }}
                    text="Like" />
                </View>
              </View>
            </ScrollView>
          </Animated.View>
      </Animated.View>
    )
  }
}

export default FeedExpanded
