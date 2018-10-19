import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import TouchableScale from 'react-native-touchable-scale'
import {Transition} from 'react-navigation-fluid-transitions'
import {Surface} from 'gl-react-native'
const {Image: GLImage} = require('gl-react-image')
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
import { blendColor, hslString } from '../utils/colors'
import FeedCoverImage from './FeedCoverImage'
import FeedUnreadCounter from './FeedUnreadCounter'

const DRAG_THRESHOLD = 10

class Feed extends React.PureComponent {

  constructor (props) {
    super(props)
    this.props = props

    const dim = Dimensions.get('window')
    this.screenWidth = dim.width
    this.margin = this.screenWidth * 0.05
    this.cardWidth = this.screenWidth - this.margin * 2
    this.screenHeight = dim.height

    this.state = {
      translateXAnim: new Animated.Value(0),
      translateYAnim: new Animated.Value(0),
      imageHeightAnim: new Animated.Value(this.cardWidth / 2),
      detailsHeightAnim: new Animated.Value(0),
      widthAnim: new Animated.Value(this.cardWidth),
      transformXAnim: new Animated.Value(0),
      borderRadiusAnim: new Animated.Value(20),
      scaleAnim: new Animated.Value(1),
      normalisedAnimatedValue: new Animated.Value(0),
      blockDrag: false,
      isExpanded: false
    }
    this.mode = 'list' // list || screen

    this.currentY = 0

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
    })

    this.onPress = this.onPress.bind(this)
    this.onRelease = this.onRelease.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.measured = this.measured.bind(this)
  }

  createPanResponder (shouldCreatePanResponder) {
    if (shouldCreatePanResponder) {
      console.log("Time to block drags")
      this._panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

        onPanResponderMove: (evt, gestureState) => {
          // The most recent move distance is gestureState.move{X,Y}

          // The accumulated gesture distance since becoming responder is
          // gestureState.d{x,y}
          if (gestureState.d.y < 0) return
          if (gestureState.d.y < 100) {
            this.state.translateYAnim.setValue(gestureState.d.y / 10)
            this.state.detailsHeightAnim.setValue(this.screenHeight / gestureState.d.y)
            this.state.widthAnim.setValue(this.cardWidth +
              (this.screenWidth - this.cardWidth) * (gestureState.d.y / 100))
          }
        },
        onPanResponderTerminationRequest: (evt, gestureState) => true,
        onPanResponderRelease: (evt, gestureState) => {
          // The user has released all touches while this view is the
          // responder. This typically means a gesture has succeeded
        },
        onPanResponderTerminate: (evt, gestureState) => {
          // Another component has become the responder, so this gesture
          // should be cancelled
        },
        onShouldBlockNativeResponder: (evt, gestureState) => {
          // Returns whether this component should block native components from becoming the JS
          // responder. Returns true by default. Is currently only supported on android.
          return true;
        },
      })
    } else {
      this._panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => false,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
        onMoveShouldSetPanResponder: (evt, gestureState) => false,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
      })
    }
  }

  scaleDown = () => {
    Animated.spring(this.state.scaleAnim, {
      toValue: 0.95,
      duration: 300
    }).start()
  }

  scaleUp = () => {
    Animated.spring(this.state.scaleAnim, {
      toValue: 1,
      duration: 300
    }).start()
  }

  onPress = (e) => {
    console.log('Pressed')
    if (!this.state.isExpanded) {
      this.scaleDown()
      this.touchDownYCoord = e.nativeEvent.pageY
    }
  }

  onRelease = () => {
    console.log('Released')
    if (this.isDragging) {
      this.isDragging = false
      return
    }
    if (!this.state.isExpanded) {
      // this.createPanResponder(true)
      this.scaleUp()
      this.imageView.measure(this.measured)
      this.props.disableScroll(true)
    }
  }

  onDrag = (e) => {
    console.log('Dragged')
    const dY = Math.abs(e.nativeEvent.pageY - this.touchDownYCoord)
    if (!this.state.isExpanded && dY > DRAG_THRESHOLD) {
      this.isDragging = true
      this.props.disableScroll(false)
      this.scaleUp()
    }
  }

  measured = (x, y, width, height, px, py) => {
    this.currentY = py
    this.grow()
  }

  grow = () => {
    Animated.spring(this.state.translateXAnim, {
      toValue: 0 - this.margin,
      duration: 1000
    }).start()
    Animated.spring(this.state.scaleAnim, {
      toValue: 1,
      duration: 1000
    }).start()
    Animated.spring(this.state.translateYAnim, {
      toValue: 0 - this.currentY,
      duration: 1000
    }).start()
    Animated.spring(this.state.imageHeightAnim, {
      toValue: this.screenHeight / 2,
      duration: 1000
    }).start()
    Animated.spring(this.state.detailsHeightAnim, {
      toValue: this.screenHeight / 2,
      duration: 1000
    }).start()
    Animated.spring(this.state.widthAnim, {
      toValue: this.screenWidth,
      duration: 1000
    }).start()
    Animated.spring(this.state.borderRadiusAnim, {
      toValue: 0,
      duration: 1000
    }).start()
    Animated.spring(this.state.normalisedAnimatedValue, {
      toValue: 1,
      duration: 1000
    }).start()
    this.state.isExpanded = true
    this.props.disableScroll(true)
  }

  shrink = () => {
    this.props.disableScroll(false)
    Animated.spring(this.state.translateXAnim, {
      toValue: 0,
      duration: 1000
    }).start()
    Animated.spring(this.state.translateYAnim, {
      toValue: 0,
      duration: 1000
    }).start()
    Animated.spring(this.state.imageHeightAnim, {
      toValue: this.cardWidth / 2,
      duration: 1000
    }).start()
    Animated.spring(this.state.detailsHeightAnim, {
      toValue: 0,
      duration: 1000
    }).start()
    Animated.spring(this.state.widthAnim, {
      toValue: this.cardWidth,
      duration: 1000
    }).start()
    Animated.spring(this.state.borderRadiusAnim, {
      toValue: 20,
      duration: 1000
    }).start()
    Animated.spring(this.state.normalisedAnimatedValue, {
      toValue: 0,
      duration: 1000
    }).start()
    this.state.isExpanded = false
  }

  render = () => {
    console.log(`Render ${this.props.feedTitle}`)
    const {
      coverImageDimensions,
      coverImagePath,
      feedTitle,
      feedColor,
      feedId,
      numFeedItems
    } = this.props
    console.log('Render feed: ' + feedTitle)
    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'center'
    }

    const shouldSetResponder = e => true

//        {...this._panResponder.panhandlers}

    return (
      <Animated.View
        style={{
            flex: 1,
            marginBottom: this.margin,
            transform: [
              { translateY: this.state.translateYAnim },
              { translateX: this.state.translateXAnim },
              { scaleX: this.state.scaleAnim },
              { scaleY: this.state.scaleAnim }
            ] }}
        ref={c => this.outerView = c}
      >
        <Animated.View
          onStartShouldSetResponder={shouldSetResponder}
          onResponderGrant={this.onPress}
          onResponderMove={this.onDrag}
          onResponderRelease={this.onRelease}
          style={{
            height: this.state.imageHeightAnim,
            width: this.state.widthAnim,
            borderRadius: this.state.borderRadiusAnim,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            backgroundColor: hslString(feedColor, 'desaturated'),
            // overflow: 'hidden',
            position: 'relative',
            shadowColor: 'black',
            shadowRadius: 10,
            shadowOpacity: 0.3,
            // shadowOffset: {
            //   width: 10,
            //   height: 10
            // },
            overflow: 'visible'
          }}>
            <View
              ref={c => this.imageView = c}
              style={{
                height: '100%',
                width: '100%',
                borderRadius: 20,
                overflow: 'hidden'
              }}>
              <FeedCoverImage
                feedColor={this.props.feedColor}
                coverImagePath={this.props.coverImagePath}
                coverImageDimensions={this.props.coverImageDimensions}
                width={this.screenWidth}
                height={this.screenHeight * 0.5} />
            </View>
          <Animated.View style={{
            // borderTopLeftRadius: 19,
            // borderTopRightRadius: 19,
            // height: cardWidth / 2,
            width: '100%',
            height: '100%',
            borderRadius: this.state.borderRadiusAnim,
            // paddingTop: this.margin * .5,
            paddingLeft: this.margin,
            paddingRight: this.margin,
            position: 'absolute',
            flex: 1,
            flexDirection: 'column',
            // justifyContent: 'center',
            alignItems: 'center',
            // justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}>
            <Animated.View style={{
              flex: 1,
              height: 1,
              width: '100%'
            }} />
            <Text style={{
              ...textStyles,
              flex: 4,
              flexWrap: 'wrap',
              fontFamily: 'IBMPlexSansCond-Bold',
              fontSize: 20
            }}>{feedTitle}</Text>
            <FeedUnreadCounter
              numFeedItems={numFeedItems}
              feedColor={feedColor}
              normalisedAnimatedValue={this.state.normalisedAnimatedValue}
              style={{
                flex: 5
              }}
            />
          </Animated.View>
        </Animated.View>
        <Animated.View style={{
          height: this.state.detailsHeightAnim,
          backgroundColor: 'white'
        }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Items')}>
            <View style={{ padding: 20 }}>
              <Text>Go to items</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.shrink()}>
            <View style={{ padding: 20 }}>
              <Text>Shrink me</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    )
  }
}

export default Feed
