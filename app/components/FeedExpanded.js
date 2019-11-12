import React, { Fragment } from 'react'
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
import Animated from 'react-native-reanimated'
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler'
import { blendColor, hslString } from '../utils/colors'
import FeedCoverImage from './FeedCoverImage'
import FeedIconCorner from './FeedIconCorner'
import FeedDetails from './FeedDetails'
import FeedLikedMuted from './FeedLikedMuted'
import XButton from './XButton'

const DRAG_THRESHOLD = 10

const {
  Value, cond, greaterThan, sub, greaterOrEq, round, add, divide, call, eq, clockRunning, abs
} = Animated
const { width: wWidth, height: wHeight } = Dimensions.get("window")

class FeedExpanded extends React.Component {

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
      close,
      feed,
      position
    } = this.props
    const { iconDimensions } = feed

    // just don't show favicons
    // TODO: delete them completely?
    const showFavicon = false

    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'left'
    }

    // animation stuff
    // https://github.com/wcandillon/can-it-be-done-in-react-native/blob/master/season2/apple-appoftheday/components/AppModal.tsx
    // const width = createValue(position.width)
    // const height = createValue(position.height)
    // const x = createValue(position.x)
    // const y = createValue(position.y)
    // const scale = createValue(1)
    // const borderRadius = createValue(16)
    // const fontSize = createValue(24)
    // const opacity = createValue(0)
    // const textOpacity = cond(greaterThan(width.value, add(position.width, divide(sub(wWidth, position.width), 2))), 1, 0)
    // const translationY = new Value(0)
    // const shouldClose = greaterOrEq(round(translationY), 100)
    // const positionStyles = {
    //   position: 'absolute',
    //   width: width.value,
    //   height: height.value,
    //   left: x.value,
    //   top: y.value
    // }


    return (
      <Fragment>
        <Animated.View
          style={{
            borderRadius: borderRadius.value,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            backgroundColor: hslString(feed.color, 'desaturated'),
            // position: 'relative',
            overflow: 'hidden',
            ...positionStyles
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
                feed={feed}
                width={this.screenWidth}
                height={this.screenHeight * 0.5} />
            </Animated.View>
          </View>
          <Animated.View style={{
            width: '100%',
            height: '100%',
            borderRadius: 16,
            paddingLeft: this.margin * 0.5,
            paddingRight: this.margin * 0.5,
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
          }}>
            <Animated.View style={{
              width: '100%',
              height: height.value,
              paddingLeft: this.margin * 0.5,
              paddingRight: this.margin * 0.5,
              paddingBottom: this.margin * 0.5,
              position: 'absolute',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
            }}>
              <Animated.View style={{
                position: 'absolute',
                top: 0,
                right: -19,
                opacity: abs(sub(opacity.value, 1))
              }}>
                <FeedLikedMuted feed={feed} />
              </Animated.View>
              <View style={{
                paddingLeft: 4,
                paddingRight: 4,
                paddingBottom: 2
              }}>
                <Animated.Text style={{
                  ...textStyles,
                  flexWrap: 'wrap',
                  fontFamily: 'IBMPlexSansCond-Bold',
                  fontSize: fontSize.value
                }}>{feed.title}</Animated.Text>
              </View>
              <View style={{
                paddingBottom: 5,
                paddingLeft: 4,
                paddingRight: 10
              }}>
                <Text style={{
                  ...textStyles,
                  fontFamily: 'IBMPlexMono-Light',
                  fontSize: 16
                }}>{feed.numUnread} unread</Text>
              </View>
            </Animated.View>
          </Animated.View>
          <FeedIconCorner
            feed={feed}
            iconDimensions={iconDimensions}
            extraStyle={{
              bottom: 0
            }}
          />
        </Animated.View>
        <TapGestureHandler
          onHandlerStateChange={this.onCloseButtonPress}
        >
          <Animated.View style={{
            // opacity: this.expandAnim,
            position: 'absolute',
            top: 10,
            right: 0
          }}>
            <XButton isLight={true} style={{ top: 48 }}/>
          </Animated.View>
        </TapGestureHandler>
        <Animated.View style={{
          backgroundColor: '#F2ECD9',
          opacity: textOpacity,
          ...positionStyles,
          transform: [{
            translateY: height.value
          }]
          // 20px to cover the round corners of the image
          // height: interpolate(this.expandAnim, {
          //   inputRange: [0, 0.8, 1],
          //   outputRange: [0, this.screenHeight / 4, this.screenHeight / 2 + 20]
          // }),
          // marginTop: -20,
          // opacity: interpolate(this.expandAnim, {
          //   inputRange: [0, 0.2, 1],
          //   outputRange: [0, 1, 1]
          // }),
          // width: this.screenWidth
        }}>
          <FeedDetails
            feed={feed}
          />
        </Animated.View>
      </Fragment>
    )
  }
}

export default FeedExpanded
