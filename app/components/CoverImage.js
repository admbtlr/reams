import React from 'react'
import {Animated, Dimensions, Image, View } from 'react-native'

import {Surface} from 'gl-react-native'
import { VibrancyView } from 'react-native-blur'

import Svg, {Text} from 'react-native-svg'
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
const {Image: GLImage} = require('gl-react-image')

import { blendColor, hslString } from '../utils/colors'

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
                    : 'none'

    this.saturation = 1 //Math.round(Math.random() * 0.8)
    this.contrast = 1.1
    this.brightness = 1

    // go for all out bw
    if (props.styles.isBW) {
      this.saturation = 0
      // this.contrast = 1.4
      // this.brightness = 1.4
    }

    this.flipColours = Math.random() > 0.5

    let index
    const options = 'RIZLErizle•'
    this.letters = [0, 0, 0, 0, 0, 0]
      .splice(0, Math.floor(Math.random() * 5) + 1).map((l) => {
        index = Math.floor(Math.random() * options.length)
        return {
          letter: options.substring(index, index + 1),
          rotation: Math.round(Math.random() * 12) * 30
        }
      })
  }

  render () {
    const absolute = {
      position: 'absolute',
      top: this.props.styles.resizeMode === 'contain' ? '-10%' : '0%',
      height: this.props.styles.resizeMode === 'contain' ? '120%' : '100%',
      left: '-10%',
      width: '120%'
    }
    const scrollOffset = this.props.scrollOffset || 0
    const scale = scrollOffset.interpolate({
      inputRange: [0, this.screenHeight],
      outputRange: [1, 0.85]
    })
    const translateY = scrollOffset.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -0.333]
    })
    const opacity = scrollOffset.interpolate({
      inputRange: [0, this.screenHeight * 0.75, this.screenHeight],
      outputRange: [1, 1, 0]
    })
    const blurOpacity = scrollOffset.interpolate({
      inputRange: [-100, -50, 0, 200],
      outputRange: [0, 0.8, 1, 0]
    })
    let style = {
      ...absolute,
      backgroundColor: 'white',
      opacity,
      transform: [
        {scale},
        {translateY}
      ]
    }
    const blurStyle = {
      ...absolute,
      opacity
    }

    if (this.props.imagePath &&
      this.props.imageDimensions.width > 0 &&
      this.props.imageDimensions.height > 0) {
      const center = this.getCenterArray(this.props.styles.align)
      const imageToosmall = this.props.imageDimensions.width < this.screenWidth ||
        this.props.imageDimensions.height < this.screenHeight
      const colorBlendingColor = blendColor(this.props.styles.color)

      const image = (
        <GLImage
          center={this.props.styles.resizeMode === 'cover' ? center : undefined}
          key='this.props.imageUrl'
          source={{
            uri: `file://${this.props.imagePath}`,
            width: this.props.imageDimensions.width * 1.2,
            height: this.props.imageDimensions.height * 1.2
         }}
          resizeMode={this.props.styles.resizeMode}
          imageSize={{
            width: this.props.imageDimensions.width * 1.2,
            height: this.props.imageDimensions.height * 1.2
          }}
        />
      )
      const blur = (
        <Animated.View
          style={{
            ...absolute,
            opacity: imageToosmall ? blurOpacity : 1
          }}
        >
          <VibrancyView
            style={absolute}
            blurType='light'
            blurAmount={30}
          />
        </Animated.View>
      )
      const csb = (
        <ContrastSaturationBrightness
          saturation={this.saturation}
          contrast={this.contrast}
          brightness={this.brightness}
        >
          {image}
        </ContrastSaturationBrightness>
      )
      const blended = (
        <ColorBlending
          color={colorBlendingColor}
          blendMode={this.blendMode}
        >
          {csb}
        </ColorBlending>
      )
      const surface = (
        <Surface
          width={this.screenWidth * 1.2}
          height={this.screenHeight * 1.2}
          backgroundColor='transparent'
        >
          { this.blendMode === 'none' ? csb : blended }
        </Surface>
      )
      // return (
      //   <Animated.View style={style}>
      //     { this.state.width && surface }
      //     { blur }
      //   </Animated.View>
      // )
      return (
        <Animated.View style={style}>
          { surface }
          { this.props.blur && imageToosmall && blur }
        </Animated.View>
      )
    } else {
      // const radius = this.screenWidth * 0.4
      const cx = this.screenWidth * 0.5
      const cy = this.screenHeight * 0.5
      const fill = this.flipColours ? 'white' : hslString(this.props.styles.color)
      style.backgroundColor = this.flipColours ? hslString(this.props.styles.color) : 'white'

      return (
        <Animated.View
          shouldRasterizeIOS
          style={style}
        >
          <Svg
            height={this.screenHeight * 1.2}
            width={this.screenWidth * 1.2}
          >
            {this.letters.map((l, i) =>
              (<Text
                x={cx - 40}
                y='0'
                fontSize='1400'
                fontFamily='AvenirNext-Heavy'
                fontWeight='bold'
                fill={fill}
                fillOpacity='0.4'
                originX={cx}
                originY={cy}
                rotate={l.rotation}
                textAnchor='middle'
                key={i}
              >{l.letter}</Text>)
            )}
          </Svg>
        </Animated.View>
      )
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
