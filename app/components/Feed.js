import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  InteractionManager,
  PanResponder,
  ScrollView,
  StatusBar,
  StatusBarAnimation,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {Surface} from 'gl-react-native'
import GLImage from 'gl-react-image'
const RNFS = require('react-native-fs')
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
    this.cardWidth = this.screenWidth < 500 ?
      this.screenWidth - this.margin * 2 :
      (this.screenWidth - this.margin * 3) / 2
    this.screenHeight = dim.height

    this.cardHeight = this.screenWidth < 500 ?
      this.cardWidth / 2 :
      this.cardWidth

    this.state = {
      expandAnim: new Animated.Value(0),
      // translateXAnim: new Animated.Value(0),
      translateYAnim: new Animated.Value(0),
      // imageHeightAnim: new Animated.Value(this.cardHeight),
      // detailsHeightAnim: new Animated.Value(0),
      // widthAnim: new Animated.Value(this.cardWidth),
      // transformXAnim: new Animated.Value(0),
      // borderRadiusAnim: new Animated.Value(16),
      scaleAnim: new Animated.Value(1),
      // normalisedAnimatedValue: new Animated.Value(0),
      opacityAnimatedValue: new Animated.Value(1),
      isExpanded: false,
      blockDrag: false
    }
    this.mode = 'list' // list || screen

    this.currentX = this.props.xCoord || 0
    this.currentY = this.props.yCoord || 0

    this.panResponder = this.createPanResponder(this.props.growMe)

    this.onPress = this.onPress.bind(this)
    this.onRelease = this.onRelease.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.measured = this.measured.bind(this)
  }

  createPanResponder (shouldCreatePanResponder) {
    // if (shouldCreatePanResponder) {
    //   console.log("Time to block drags")
    //   return PanResponder.create({
    //     onStartShouldSetPanResponder: (evt, gestureState) => true,
    //     onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    //     onMoveShouldSetPanResponder: (evt, gestureState) => true,
    //     onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    //     onPanResponderGrant: (evt, gestureState) => {
    //       // The gesture has started. Show visual feedback so the user knows
    //       // what is happening!
    //       console.log('We\'re moving!')

    //       // gestureState.d{x,y} will be set to zero now
    //     },
    //     onPanResponderMove: (evt, gestureState) => {
    //       // The most recent move distance is gestureState.move{X,Y}
    //       // The accumulated gesture distance since becoming responder is
    //       // gestureState.d{x,y}
    //       console.log(gestureState.d)
    //       if (gestureState.d.y < 0) return
    //       if (gestureState.d.y < 100) {
    //         this.state.translateYAnim.setValue(gestureState.d.y / 10)
    //         this.state.detailsHeightAnim.setValue(this.screenHeight / gestureState.d.y)
    //         this.state.widthAnim.setValue(this.cardWidth +
    //           (this.screenWidth - this.cardWidth) * (gestureState.d.y / 100))
    //       }
    //     },
    //     onPanResponderTerminationRequest: (evt, gestureState) => true,
    //     onPanResponderRelease: (evt, gestureState) => {
    //       // The user has released all touches while this view is the
    //       // responder. This typically means a gesture has succeeded
    //     },
    //     onPanResponderTerminate: (evt, gestureState) => {
    //       // Another component has become the responder, so this gesture
    //       // should be cancelled
    //     },
    //     onShouldBlockNativeResponder: (evt, gestureState) => {
    //       // Returns whether this component should block native components from becoming the JS
    //       // responder. Returns true by default. Is currently only supported on android.
    //       return true;
    //     },
    //   })
    // } else {
      return PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => false,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
        onMoveShouldSetPanResponder: (evt, gestureState) => false,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
      })
    // }
  }

  scaleDown = () => {
    Animated.spring(this.state.scaleAnim, {
      toValue: 0.95,
      duration: 300,
      useNative: true
    }).start()
  }

  scaleUp = () => {
    InteractionManager.runAfterInteractions().then(_ => {
      Animated.spring(this.state.scaleAnim, {
        toValue: 1,
        duration: 300,
        useNative: true
      }).start()
    })
  }

  onPress = (e) => {
    console.log('Pressed')
    this.touchDownYCoord = e.nativeEvent.pageY
    this.touchDownXCoord = e.nativeEvent.pageX
    if (!this.props.isSelected && !this.state.isExpanded) {
      this.interactionHandle = InteractionManager.createInteractionHandle()
      this.scaleDown()
    }
  }

  onRelease = () => {
    console.log('Released')
    if (this.isDragging) {
      this.isDragging = false
    }
    if (!this.props.isSelected && !this.state.isExpanded) {
      this.scaleUp()
      this.imageView.measure(this.measured)
      // this.props.disableScroll(true)
    }
  }

  measured = (x, y, width, height, px, py) => {
    // at the moment when it's measured, the feed is scaled by 0.95
    const ratio = this.cardWidth / width
    const widthDiff = width * ratio - width
    const heightDiff = height * ratio - height
    this.currentX = px - widthDiff / 2
    this.currentY = py - heightDiff / 2
    this.props.selectFeed(this, this.currentX, this.currentY)
    this.setState({
      ...this.state,
      isSelected: true
    })
  }

  onDrag = (e) => {
    const dY = Math.abs(e.nativeEvent.pageY - this.touchDownYCoord)
    console.log('Dragged: '+dY)
    if (!this.props.growMe && dY > DRAG_THRESHOLD) {
      this.isDragging = true
      this.props.disableScroll(false)
      this.scaleUp()
      InteractionManager.clearInteractionHandle(this.interactionHandle)
    } else {
    }
  }

  grow = () => {
    // Animated.spring(this.state.translateXAnim, {
    //   toValue: 0 - this.currentX,
    //   duration: 1000,
    //   useNative: true
    // }).start()
    Animated.spring(this.state.scaleAnim, {
      toValue: 1,
      duration: 1000,
      useNative: true
    }).start()
    Animated.spring(this.state.expandAnim, {
      toValue: 1,
      duration: 1000,
      useNative: true
    }).start()
    Animated.spring(this.state.translateYAnim, {
      toValue: 0 - this.currentY,
      duration: 1000,
      useNative: true
    }).start()
    // Animated.spring(this.state.imageHeightAnim, {
    //   toValue: this.screenHeight / 2,
    //   duration: 1000,
    //   useNative: true
    // }).start()
    // Animated.spring(this.state.detailsHeightAnim, {
    //   toValue: this.screenHeight / 2 + 15, // 15px extra to cover image rounded corners
    //   duration: 1000,
    //   useNative: true
    // }).start()
    // Animated.spring(this.state.widthAnim, {
    //   toValue: this.screenWidth,
    //   duration: 1000,
    //   useNative: true
    // }).start()
    // Animated.spring(this.state.borderRadiusAnim, {
    //   toValue: 0,
    //   duration: 1000
    // }).start()
    // Animated.spring(this.state.normalisedAnimatedValue, {
    //   toValue: 1,
    //   duration: 1000,
    //   useNative: true
    // }).start()
    this.props.disableScroll(true)
    this.state.isExpanded = true
    this.createPanResponder(true)
  }

  shrink = () => {
    // Animated.spring(this.state.translateXAnim, {
    //   toValue: 0,
    //   duration: 300
    // }).start()
    Animated.spring(this.state.expandAnim, {
      toValue: 0,
      duration: 1000,
      useNative: true
    }).start()
    Animated.spring(this.state.translateYAnim, {
      toValue: 0,
      duration: 300
    }).start()
    // Animated.spring(this.state.imageHeightAnim, {
    //   toValue: this.cardHeight,
    //   duration: 1000
    // }).start()
    // Animated.spring(this.state.detailsHeightAnim, {
    //   toValue: 0,
    //   duration: 1000
    // }).start()
    // Animated.spring(this.state.widthAnim, {
    //   toValue: this.cardWidth,
    //   duration: 1000
    // }).start()
    // Animated.spring(this.state.borderRadiusAnim, {
    //   toValue: 16,
    //   duration: 1000
    // }).start()
    // Animated.spring(this.state.normalisedAnimatedValue, {
    //   toValue: 0,
    //   duration: 1000
    // }).start()
    StatusBar.setHidden(false, 'slide')
    setTimeout(() => {
      this.props.selectFeed(null, null)
      this.state.isExpanded = false
    }, 400)
  }

  fadeOut = () => {
    Animated.timing(this.state.opacityAnimatedValue, {
      toValue: 0,
      delay: 200,
      duration: 200,
      useNative: true
    }).start()
  }

  fadeIn = () => {
    Animated.timing(this.state.opacityAnimatedValue, {
      toValue: 1,
      duration: 200,
      useNative: true
    }).start()
  }

  componentDidMount = () => {
    if (this.props.growMe) {
      StatusBar.setHidden(true, 'slide')
      this.grow()
    }
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.isSelected !== prevProps.isSelected) {
      if (this.props.isSelected) {
        this.fadeOut()
      } else {
        this.fadeIn()
      }
    }
    if (this.props.growMe && !prevProps.growMe) {
      if (this.props.yCoord !== this.currentY) {
        this.currentX = this.props.xCoord
        this.currentY = this.props.yCoord
      }
      StatusBar.setHidden(true, 'slide')
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
    //   (this.state.isSelected ? 'expanded!' : 'contracted'))

    const {
      coverImageDimensions,
      coverImagePath,
      favicon,
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
    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'center'
    }

    console.log("Rendering " + feedTitle)

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

    const shouldSetResponder = e => true //!this.state.isExpanded

    const isExpandableFeedElement = () => !!this.props.yCoord

//        {...this._panResponder.panhandlers}
    const shadowStyle = isExpandableFeedElement() ? {} :
      {
        shadowColor: 'black',
        shadowRadius: 10,
        shadowOpacity: 0.3,
        shadowOffset: {
          width: 0,
          height: 5
        }
      }

    // just don't show favicons
    // TODO: delete them completely?
    const showFavicon = false

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
            { translateY: this.state.translateYAnim },
            { translateX: this.state.expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0 - this.currentX]
            }) },
            { scaleX: this.state.scaleAnim },
            { scaleY: this.state.scaleAnim }
          ],
          opacity: this.state.opacityAnimatedValue,
          ...this.props.extraStyle
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
            height: this.state.expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [this.cardHeight, this.screenHeight / 2]
            }),
            width: this.state.expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [this.cardWidth, this.screenWidth]
            }),
            borderRadius: 16,
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
            // borderTopLeftRadius: 19,
            // borderTopRightRadius: 19,
            // height: cardWidth / 2,
            width: '100%',
            height: '100%',
            borderRadius: 16,
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
              opacity: this.state.expandAnim,
              width: '100%'
            }}>
              <XButton
                isLight={true}
                onPress={() => this.shrink()}
                style={{ top: 40 }}
              />
            </Animated.View>
            { showFavicon &&
              <Surface
                width={36}
                height={36}
                backgroundColor='#000'
                style={{
                  position: 'absolute',
                  left: 5,
                  top: 5,
                  width: 36,
                  height: 36
                }}
              >
                <ContrastSaturationBrightness
                  saturation={0}
                  contrast={1}
                  brightness={1}
                >
                  <GLImage
                    center={[0.5, 0]}
                    resizeMode='cover'
                    source={{
                      uri: `file://${RNFS.DocumentDirectoryPath}/feed-icons/${feedId}.png`,
                      width: 36,
                      height: 36
                    }}
                    imageSize={{
                      width: 36,
                      height: 36
                    }}
                  />
                </ContrastSaturationBrightness>
              </Surface>
            }
            <Text style={{
              ...textStyles,
              flex: 4,
              flexWrap: 'wrap',
              fontFamily: 'IBMPlexSansCond-Bold',
              fontSize: 24
            }}>{feedTitle}</Text>
            <FeedUnreadCounter
              numberUnread={numUnread}
              feedColor={feedColor}
              normalisedAnimatedValue={this.state.expandAnim}
              style={{
                flex: 5
              }}
            />
            <Text style={{
              ...textStyles,
              position: 'absolute',
              bottom: 10,
              right: 10,
              fontSize: 14
            }}>{readingRate}</Text>
          </Animated.View>
        </Animated.View>
        { this.props.growMe &&
          <Animated.View style={{
            backgroundColor: '#F2ECD9',
            // 15px to cover the round corners of the image
            height: this.state.expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, this.screenHeight / 2 + 15]
            }),
            marginTop: -15,
            opacity: this.state.expandAnim,
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
                      StatusBar.setHidden(false)
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
