import React from 'react'
import {
  Dimensions,
  Image,
  InteractionManager,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StatusBarAnimation,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'
import { TapGestureHandler, State } from 'react-native-gesture-handler'
import Svg, {Circle, Polygon, Polyline, Rect, Path, Line} from 'react-native-svg'
import { blendColor, hslString, hslToHslString } from '../utils/colors'
import FeedCoverImage from './FeedCoverImage'
import FeedLikedMuted from './FeedLikedMuted'
import FeedUnreadCounter from './FeedUnreadCounter'
import FeedIconContainer from '../containers/FeedIcon'
import FeedExpandedContainer from '../containers/FeedExpanded'

const { width, height } = Dimensions.get("window")

const {
  and,
  block,
  call,
  cond,
  debug,
  eq,
  event,
  interpolate,
  neq,
  or,
  set,
  startClock,
  stopClock,
  timing,
  Clock,
  Extrapolate,
  Value
} = Animated

class FeedContracted extends React.PureComponent {

  constructor (props) {
    super(props)
    this.props = props

    const dim = Dimensions.get('window')
    this.screenWidth = dim.width
    this.margin = this.screenWidth * 0.05
    this.cardWidth = this.screenWidth < 500 ?
      this.screenWidth - this.margin * 2 :
      (this.screenWidth - this.margin * 3) / 2
    this.screenHeight = dim.height

    this.cardHeight = this.screenWidth < 500 ?
      this.cardWidth / 2 :
      this.cardWidth

    this.currentX = this.props.xCoord || 0
    this.currentY = this.props.yCoord || 0

    this.initialiseAnimations()
  }

  initialiseAnimations () {
    this.gestureState = new Value(-1)
    const clock = new Clock()
    this.onStateChange = event([{
      nativeEvent: {
        state: this.gestureState,
      },
    }])

    const runScaleTimer = (clock, gestureState) => {
      const state = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0),
        frameTime: new Value(0),
      }

      const config = {
        duration: 150,
        toValue: new Value(-1),
        easing: Easing.inOut(Easing.ease),
      }

      return block([
        cond(and(eq(gestureState, State.BEGAN), neq(config.toValue, 1)), [
          set(state.finished, 0),
          set(state.time, 0),
          set(state.frameTime, 0),
          set(config.toValue, 1),
          debug('Gesture state began, startClock', startClock(clock))
        ]),
        cond(and(eq(gestureState, State.FAILED), neq(config.toValue, 0)), [
          set(state.finished, 0),
          set(state.time, 0),
          set(state.frameTime, 0),
          set(config.toValue, 0),
          debug('Gesture state failed, startClock', startClock(clock))
        ]),
        cond(and(eq(gestureState, State.END), neq(config.toValue, 0)), [
          set(state.finished, 0),
          set(state.time, 0),
          set(state.frameTime, 0),
          set(config.toValue, 0),
          debug('Gesture state ended, startClock', startClock(clock))
        ]),
        timing(clock, state, config),
        cond(state.finished, [
          debug('Animation finished, stopClock', stopClock(clock)),
        ]),
        cond(and(eq(gestureState, State.END), state.finished), [
          debug('Animation finished, gesture state ended, call this.hide', call([], this.onPress))
        ]),
        interpolate(state.position, {
          inputRange: [0, 1],
          outputRange: [1, 0.95],
          extrapolate: Extrapolate.CLAMP,
        })
      ])
    }
    this._scale = runScaleTimer(clock, this.gestureState)
  }


  onPress = (e) => {
    const { feed, navigation } = this.props
    // this.imageView.measure(this.measured)
    navigation.push('Modal', {
      childView: <FeedExpandedContainer feed={feed} close={navigation.goBack()} />
    })
  }

  render = () => {
    const { feed, index, activeFeedId } = this.props
    const {
      _id,
      coverImageDimensions,
      coverImagePath,
      iconDimensions,
      numUnread,
      numRead,
      readingTime,
      readingRate
    } = feed
    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'left'
    }

    // console.log("Rendering " + title)

    const bold = {
      fontFamily: 'IBMPlexMono-Bold',
      color: hslString(feed.color, 'desaturated')
    }
    const italic = {
      fontFamily: 'IBMPlexMono-LightItalic'
    }

    const shadowStyle = {
      shadowColor: 'black',
      shadowRadius: 5,
      shadowOpacity: 0.2,
      shadowOffset: {
        width: -5,
        height: 5
      }
    }

    return (
      <TapGestureHandler
        onHandlerStateChange={this.onStateChange}
      >
        <Animated.View
          style={{
            flex: 1,
            height: this.cardHeight,
            width: this.cardWidth,
            marginBottom: this.margin,
            marginRight: (index % 2 === 0 && this.screenWidth > 500) ?
              this.margin :
              0,
            overflow: 'visible',
            transform: [
              {
                scaleX: this._scale,
                scaleY: this._scale
              }
            ]
          }}
        >
          <View
            style={{
              height: this.cardHeight,
              width: this.cardWidth,
              borderRadius: 16,
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              backgroundColor: hslString(feed.color, 'desaturated'),
              position: 'relative',
              overflow: 'visible',
              ...shadowStyle
          }}>
            <View
              ref={c => this.imageView = c}
              style={{
                height: '100%',
                width: '100%',
                borderRadius: 16,
                overflow: 'hidden'
            }}>
              <FeedCoverImage
                feed={feed}
                width={this.screenWidth}
                height={this.screenHeight * 0.5}
                setCachedCoverImage={this.props.setCachedCoverImage} />
            </View>
            <View style={{
              // borderTopLeftRadius: 19,
              // borderTopRightRadius: 19,
              // height: cardWidth / 2,
              width: '100%',
              height: '100%',
              borderRadius: 16,
              // paddingTop: this.margin * .5,
              paddingLeft: this.margin * 0.5,
              paddingRight: this.margin * 0.5,
              paddingBottom: this.margin * 0.5,
              position: 'absolute',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              // justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }}>
              <FeedLikedMuted feed={feed} />
              <View style={{
                paddingLeft: 4,
                paddingRight: 40,
                paddingBottom: 2,
                flexDirection: 'row'
              }}>
                <Text style={{
                  ...textStyles,
                  flexWrap: 'wrap',
                  fontFamily: 'IBMPlexSansCond-Bold',
                  fontSize: 24
                }}>{feed.title}</Text>
              </View>
              <View style={{
                paddingLeft: 4,
                paddingRight: 4,
                paddingBottom: 2
              }}>
                <Text style={{
                  ...textStyles,
                  fontFamily: 'IBMPlexMono-Light',
                  fontSize: 16
                }}>{numUnread} unread</Text>
              </View>
            </View>
          </View>
          <View
            style={{
              height: this.cardHeight,
              width: this.cardWidth,
              borderRadius: 16,
              position: 'absolute',
              left: 0,
              top: 0,
              backgroundColor: 'transparent',
              overflow: 'hidden',
              pointerEvents: 'none'
          }}>
            <View style={{
              backgroundColor: hslString(feed.color),
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
                feed={feed}
                iconDimensions={iconDimensions}
              />
            </View>
          </View>
        </Animated.View>
      </TapGestureHandler>
    )
  }
}

export default FeedContracted
