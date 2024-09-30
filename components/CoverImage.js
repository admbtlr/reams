import React from 'react'
import {Animated, Dimensions, Image, Platform, View } from 'react-native'
import { BlurView } from 'expo-blur'
import {
  Brightness,
  Contrast,
  Saturate,
  MultiplyBlendColor,
  ScreenBlendColor
} from 'react-native-image-filter-kit'

import { getStatusBarHeight } from '../utils/dimensions'
import { hslString } from '../utils/colors'

class CoverImage extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.blurRadius = 10

    const window = Dimensions.get('window')
    this.screenWidth = window.width
    this.screenHeight = window.height

    this.blendMode = props.styles.isMultiply
      ? 'blendMultiply'
      : (props.styles.isScreen
        ? 'blendScreen'
        : 'none')

    // go for all out bw
    if (props.styles.isBW) {
      this.saturation = 0
      // this.contrast = 1.4
      // this.brightness = 1.4
    }

    this.flipColours = Math.random() > 0.5
  }

  getColor () {
    const {color, isCoverImageDarker, isCoverImageLighter} = this.props.styles
    let palette = ''
    if (isCoverImageLighter) palette = 'lighter'
    if (isCoverImageDarker) palette = 'darker'
    return hslString(color, palette)
  }

  // if image too small, returns < 1
  getImageSizeRatio () {
    const widthRatio = this.props.imageDimensions.width / this.screenWidth
    const heightRatio = this.props.imageDimensions.height / this.screenHeight
    return Math.min(widthRatio, heightRatio)
  }

  shouldComponentUpdate (prevProps, prevState) {
    return prevProps.imagePath !== this.props.imagePath ||
      prevProps.orientation !== this.props.orientation ||
      (prevProps.imageDimensions ?
        prevProps.imageDimensions.width !== this.props.imageDimensions.width :
        false)
  }

  render () {
    const {isBW, isInline, resizeMode, isMultiply, isScreen, color} = this.props.styles
    const {
      faceCentreNormalised,
      imageDimensions
    } = this.props

    const window = Dimensions.get('window')
    this.screenWidth = window.width
    this.screenHeight = window.height

    // inline images become fullscreen in landscape
    const isReallyInline = this.props.orientation === 'landscape' ? false : isInline

    const absolute = {
      position: 'absolute',
      top: '0%',
      height: isReallyInline ? '100%' : '120%',
      left: isReallyInline ? '0%' : '-10%',
      width: isReallyInline ? '100%' : '120%'
    }
    const inline = {
      flex: 1,
      width: '100%',
      marginTop: getStatusBarHeight(),
      // weird bug with the top pixel row of images
      top: -1,
      marginBottom: -1
    }
    if (imageDimensions.width === 0 || imageDimensions.height === 0 || !imageDimensions.width || !imageDimensions.height) {
      // I should be fixing the root cause of this, but :shrug:
      // I think it happens when a visible item gets mercuried 
      // this is just a stopgap solution
      // log('Render Cover Image', {
      //   name: 'Render Cover Image error', 
      //   message: 'Some part of imageDimensions is zero or null: ' + JSON.stringify(imageDimensions)
      // })
      return <View style={inline} />
    }
    const position = isReallyInline ? inline : absolute
    const scrollAnim = this.props.scrollAnim || 0
    const imageHeight = this.screenWidth / imageDimensions.width * imageDimensions.height
    const scale = isReallyInline ?
      scrollAnim.interpolate({
        inputRange: [-imageHeight, 0, 1],
        outputRange: [2, 1, 1]
      }) :
      scrollAnim.interpolate({
        inputRange: [-100, 0, this.screenHeight],
        outputRange: [1.3, 1, 0.8]
      })
    const translateY = isReallyInline ?
      scrollAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-.5, 0, 0]
      }) :
      scrollAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 0, -0.333]
      })
    const opacity = scrollAnim.interpolate({
      inputRange: [0, this.screenHeight * 0.75, this.screenHeight],
      outputRange: [1, 1, 0]
    })
    const blurOpacity = scrollAnim.interpolate({
      inputRange: [-100, -50, 0, 200],
      outputRange: [0, 0.8, 1, 0]
    })
    let style = {
      ...position,
      backgroundColor: isMultiply || isScreen ? this.getColor() : hslString('bodyBG'),
      opacity,
      transform: isReallyInline ?
        [ { translateY }, { scale } ] :
        [ { scale }, { translateY } ]
    }

    if (resizeMode === 'contain') {
      style = {
        ...style,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }
    const blurStyle = {
      ...absolute,
      opacity
    }
    const borderStyle = {
      position: 'absolute',
      top: '0%',
      height: '100%',
      left: '0%',
      width: '100%',
      borderWidth: 50,
      borderColor: 'white'
    }

    const saturation = isBW ? 0 :
      this.getImageSizeRatio() < .75 ? 1.2 : 1
    const contrast = 1
    const brightness = isMultiply ?
      1.3 :
      isScreen ?
        1 :
        this.getImageSizeRatio() < 1 ? 1.2 : 1


    if (this.props.imagePath &&
      this.props.imageDimensions.width > 0 &&
      this.props.imageDimensions.height > 0) {
      const center = this.getCenterArray(this.props.styles.align)

      const inlineImageHeight = this.screenWidth / this.props.imageDimensions.width *
        this.props.imageDimensions.height *
        (isReallyInline ? 1 : 1.2)
      const imageWidth = this.screenHeight / this.props.imageDimensions.height *
        this.props.imageDimensions.width *
        (isReallyInline ? 1 : 1.2)

      let imageOffset = faceCentreNormalised ?
        faceCentreNormalised.x * imageWidth - this.screenWidth / 2 :
        imageWidth / 2
      if (imageOffset > imageWidth - this.screenWidth * 1.2) {
        imageOffset = imageWidth - this.screenWidth * 1.2
      } else if (imageOffset < this.screenWidth * 0.2) {
        imageOffset = this.screenWidth * 0.2
      }

      const image = (
          <Image
            source={{uri: this.props.imagePath}}
            style={{
              resizeMode: 'cover',
              // alignSelf: 'flex-end',
              height: isReallyInline || resizeMode === 'contain' ? inlineImageHeight : this.screenHeight,
              width: isReallyInline || resizeMode === 'contain' ? this.screenWidth : imageWidth,
              left:  isReallyInline || resizeMode === 'contain' ? 0 : -imageOffset
            }} />
      )

      const blur = (
        <Animated.View
          style={{
            ...position,
            opacity: 1
          }}
        >
          <BlurView
            style={absolute}
            tint='light'
            intensity={50}
          />
        </Animated.View>
      )

      let finalImage

      if (Platform.OS === 'ios') {
        const adjusted = <Brightness
          amount={brightness}
          image={
            <Saturate
              amount={saturation}
              image={
                <Contrast
                  amount={contrast}
                  image={image} />
              }
            />
          }
        />
        finalImage = isMultiply ?
          <MultiplyBlendColor
            dstImage={adjusted}
            srcColor={this.getColor()}
          /> :
          isScreen ?
            <ScreenBlendColor
              dstImage={adjusted}
              srcColor={this.getColor()}
            /> :
            adjusted
      } else {
        finalImage = image
      }

      return (
        <Animated.View
          style={style}
        >
          { finalImage }
          { !isReallyInline && this.getImageSizeRatio() < .5 && blur }
        </Animated.View>
      )
    } else {
      return <Animated.View />
    }
  }

  getCenterArray (align) {
    const values = {
      'center': [0.5, 0],
      'left': [0, 0],
      'right': [1, 0],
    }
    return values[align]
  }
}

export default CoverImage