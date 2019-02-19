import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StatusBar,
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
import TextButton from './TextButton'
import XButton from './XButton'

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
      borderRadiusAnim: new Animated.Value(16),
      scaleAnim: new Animated.Value(1),
      normalisedAnimatedValue: new Animated.Value(0),
      blockDrag: false,
      isExpanded: false
    }
    this.mode = 'list' // list || screen

    this.currentY = this.props.yCoord || 0

    this.panResponder = this.createPanResponder(this.props.growMe)

    this.onPress = this.onPress.bind(this)
    this.onRelease = this.onRelease.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.measured = this.measured.bind(this)
  }

  createPanResponder (shouldCreatePanResponder) {
    if (shouldCreatePanResponder) {
      console.log("Time to block drags")
      return PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
        onPanResponderGrant: (evt, gestureState) => {
          // The gesture has started. Show visual feedback so the user knows
          // what is happening!
          console.log('We\'re moving!')

          // gestureState.d{x,y} will be set to zero now
        },
        onPanResponderMove: (evt, gestureState) => {
          // The most recent move distance is gestureState.move{X,Y}
          // The accumulated gesture distance since becoming responder is
          // gestureState.d{x,y}
          console.log(gestureState.d)
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
      return PanResponder.create({
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
      duration: 300,
      useNative: true
    }).start()
  }

  scaleUp = () => {
    Animated.spring(this.state.scaleAnim, {
      toValue: 1,
      duration: 300,
      useNative: true
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
      this.scaleUp()
      return
    }
    if (!this.state.isExpanded) {
      this.scaleUp()
      this.imageView.measure(this.measured)
      this.props.disableScroll(true)
    }
  }

  measured = (x, y, width, height, px, py) => {
    this.currentY = py
    this.props.selectFeed(this, py)
    // this.grow()
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

  grow = () => {
    Animated.spring(this.state.translateXAnim, {
      toValue: 0 - this.margin,
      duration: 1000,
      useNative: true
    }).start()
    Animated.spring(this.state.scaleAnim, {
      toValue: 1,
      duration: 1000,
      useNative: true
    }).start()
    Animated.spring(this.state.translateYAnim, {
      toValue: 0 - this.currentY,
      duration: 1000,
      useNative: true
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
    this.createPanResponder(true)
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
      toValue: 16,
      duration: 1000
    }).start()
    Animated.spring(this.state.normalisedAnimatedValue, {
      toValue: 0,
      duration: 1000
    }).start(() => {
      this.props.selectFeed(null, null)
      StatusBar.setHidden(false)
    })
    this.state.isExpanded = false
  }

  componentDidMount = () => {
    if (this.props.growMe) {
      StatusBar.setHidden(true)
      this.grow()
    }
  }

  // shouldComponentUpdate = (nextProps, nextState) => {
  //   if (!this.props.navigation.isFocused() || !nextProps.navigation.isFocused()) {
  //     return false
  //   }
  // }

  render = () => {
    // console.log('Render feed ' +
    //   this.props.feedTitle + ' ' +
    //   (this.state.isExpanded ? 'expanded!' : 'contracted'))

    const {
      coverImageDimensions,
      coverImagePath,
      feedTitle,
      feedColor,
      feedDescription,
      feedId,
      feedOriginalId,
      numUnread,
      numRead,
      readingTime,
      readingRate
    } = this.props
    const { isExpanded } = this.state
    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'center'
    }

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

    const shouldSetResponder = e => !this.state.isExpanded

//        {...this._panResponder.panhandlers}
    const shadowStyle = this.props.growMe ? {} :
      {
        shadowColor: 'black',
        shadowRadius: 10,
        shadowOpacity: 0.3,
        shadowOffset: {
          width: 0,
          height: 5
        }
      }

    return (
      <Animated.View
        style={{
            flex: 1,
            height: this.cardWidth * 0.5,
            marginBottom: this.margin,
            overflow: 'visible',
            transform: [
              { translateY: this.state.translateYAnim },
              { translateX: this.state.translateXAnim },
              { scaleX: this.state.scaleAnim },
              { scaleY: this.state.scaleAnim }
            ],
            ...this.props.extraStyle,
          }}
        ref={c => this.outerView = c}
      >
        <Animated.View
          { ...this.panResponder.panhandlers }
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
            position: 'relative',
            overflow: 'visible',
            ...shadowStyle
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
              opacity: this.state.normalisedAnimatedValue,
              width: '100%'
            }}>
              <XButton
                isLight={true}
                onPress={() => this.shrink()}
                style={{ top: 40 }}
              />
            </Animated.View>
            <Text style={{
              ...textStyles,
              flex: 4,
              flexWrap: 'wrap',
              fontFamily: 'IBMPlexSansCond-Bold',
              fontSize: 20
            }}>{feedTitle}</Text>
            <FeedUnreadCounter
              numberUnread={numUnread}
              feedColor={feedColor}
              normalisedAnimatedValue={this.state.normalisedAnimatedValue}
              style={{
                flex: 5
              }}
            />
          </Animated.View>
        </Animated.View>
        { this.props.growMe &&
          <Animated.View style={{
            backgroundColor: '#F2ECD9',
            height: this.state.detailsHeightAnim,
            opacity: this.state.normalisedAnimatedValue,
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
                fontSize: 24,
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
                    onPress={() => {
                      console.log('Pressed Go to items ' + feedId)
                      this.props.clearReadItems()
                      this.props.filterItems(feedId)
                      this.props.navigation.navigate('Items')
                    }}
                    text="Go to items" />
                  <TextButton
                    buttonStyle={{
                      minWidth: this.screenWidth / 2 - this.margin * 1.5,
                      marginBottom: this.margin
                    }}
                    onPress={() => {
                      this.props.markAllRead(feedId, feedOriginalId, Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000))
                      this.shrink()
                    }}
                    text="Remove older" />
                  <TextButton
                    buttonStyle={{
                      minWidth: this.screenWidth / 2 - this.margin * 1.5,
                      marginRight: this.margin
                    }}
                    onPress={() => {
                      this.props.markAllRead(feedId, feedOriginalId)
                      this.shrink()
                    }}
                    text="Remove all" />
                  <TextButton
                    buttonStyle={{
                      minWidth: this.screenWidth / 2 - this.margin * 1.5
                    }}
                    onPress={() => {
                      this.props.unsubscribe(feedId)
                      this.shrink()
                    }}
                    text="Unsubscribe" />
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        }
      </Animated.View>
    )
  }
}

export default Feed
