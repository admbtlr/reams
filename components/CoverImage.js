import React from 'react'
import {Animated, Dimensions, Image, InteractionManager, View } from 'react-native'

import {Surface} from 'gl-react-native'
import { VibrancyView } from 'react-native-blur'

import Svg, {Text} from 'react-native-svg'
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
const {Image: GLImage} = require('gl-react-image')

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

  componentWillReceiveProps (nextProps) {
    if (nextProps.imageUrl && !this.state) {
      Image.getSize(nextProps.imageUrl, (imageWidth, imageHeight) => {
        let blur = false
        this.props.onImageLoaded()
        if (imageWidth < this.screenWidth || imageHeight < this.screenHeight) {
          blur = true
        }
        blur = true
        if (imageWidth !== 0 && imageHeight !== 0) {
          InteractionManager.runAfterInteractions(() => this.setState({imageWidth, imageHeight, blur}))
        }
      }, () => {})
    }
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
    if (this.props.imageUrl && this.state && this.state.imageWidth) {
      let blendColor = this.convertColorToBlendColor(this.props.styles.color)
      const center = this.getCenterArray(this.props.styles.align)
      const image = (
        <GLImage
          center={this.props.styles.resizeMode === 'cover' ? center : undefined}
          key='this.props.imageUrl'
          source={{
            uri: this.props.imageUrl,
            width: this.state.imageWidth * 1.2,
            height: this.state.imageHeight * 1.2
         }}
          resizeMode={this.props.styles.resizeMode}
          imageSize={{
            width: this.state.imageWidth * 1.2,
            height: this.state.imageHeight * 1.2
          }}
        />
      )
      const blur = (
        <Animated.View
          style={{
            ...absolute,
            opacity: this.props.blur ? blurOpacity : 1
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
          color={blendColor}
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
          { this.props.blur && this.state.blur && blur }
        </Animated.View>
      )
    } else {
      // const radius = this.screenWidth * 0.4
      const cx = this.screenWidth * 0.5
      const cy = this.screenHeight * 0.5
      const fill = this.flipColours ? 'white' : this.props.styles.color.hex
      style.backgroundColor = this.flipColours ? this.props.styles.color.hex : 'white'
      // style.backgroundColor = this.props.color.rgba.replace('0.4', '0.8')

      const colors = [
      {
        name: 'red1',
        hex: '#D66D75',
        rgba: 'rgba(214, 109, 117, 0.4)'
      },
      {
        name: 'red2',
        hex: '#C33764',
        rgba: 'rgba(195, 55, 100, 0.4)'
      },
      {
        name: 'orange1',
        hex: '#FF8235',
        rgba: 'rgba(255, 128, 0, 0.4)'
      },
      {
        name: 'orange2',
        hex: '#F7971E',
        rgba: 'rgba(247, 151, 30, 0.4)'
      },
      {
        name: 'yellow1',
        hex: '#FFD200',
        rgba: 'rgba(255, 210, 0, 0.4)'
      },
      {
        name: 'yellow2',
        hex: '#e8f651',
        rgba: 'rgba(232, 245, 80, 0.4)'
      },
      {
        name: 'green1',
        hex: '#30E8BF',
        rgba: 'rgba(48, 232, 191, 0.4)'
      },
      {
        name: 'blue1',
        hex: '#4568DC',
        rgba: 'rgba(69, 104, 220, 0.4)'
      },
      {
        name: 'blue2',
        hex: '#0b99d5',
        rgba: 'rgba(11, 153, 213, 0.4)'
      },
      {
        name: 'purple1',
        hex: '#B06AB3',
        rgba: 'rgba(176, 106, 179, 0.4)'
      },
      {
        name: 'purple2',
        hex: '#ef61c0',
        rgba: 'rgba(239, 97, 192, 0.4)'
      },
      {
        name: 'brown1',
        hex: '#E29587',
        rgba: 'rgba(226, 149, 135, 0.4)'
      }
    ]


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
                y='-830'
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

  convertColorToBlendColor (color) {
    const rgbaString = color.rgba
    let rgbArray = rgbaString.substring(5).split(',')
    rgbArray.splice(-1, 1)
    rgbArray = rgbArray.map((num) => num / 255)
    rgbArray.push(1)
    return rgbArray
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
