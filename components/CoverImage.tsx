import React, { useEffect, useState } from 'react'
import { Animated, Dimensions, View, StyleSheet, useWindowDimensions, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import {
  Canvas,
  Blend,
  Image as SkiaImage,
  useImage,
  ImageShader,
  Rect,
  Group,
  Paint,
  BackdropFilter,
  ColorMatrix,
  Blur
} from "@shopify/react-native-skia"
import { getStatusBarHeight } from '../utils/dimensions'
import { hslString } from '../utils/colors'
import { G } from 'react-native-svg'
import { BW } from '../utils/color-filters'

interface CoverImageProps {
  styles: {
    isMultiply: boolean
    isScreen: boolean
    isBW: boolean
    isInline: boolean
    resizeMode: string
    color: string
    isCoverImageDarker: boolean
    isCoverImageLighter: boolean
    align: string
  }
  imagePath: string
  imageDimensions: {
    width: number
    height: number
  }
  orientation: string
  scrollAnim?: Animated.Value
  faceCentreNormalised?: {
    x: number
    y: number
  }
}

const CoverImage: React.FC<CoverImageProps> = (props) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const blurRadius = 10
  const blendMode = props.styles.isMultiply
    ? 'blendMultiply'
    : (props.styles.isScreen
      ? 'blendScreen'
      : 'none')

  const saturation = props.styles.isBW ? 0 : 1
  const contrast = 1
  const brightness = props.styles.isMultiply ? 1.3 : 1

  const getColor = () => {
    const { color, isCoverImageDarker, isCoverImageLighter } = props.styles
    let palette = ''
    if (isCoverImageLighter) palette = 'lighter'
    if (isCoverImageDarker) palette = 'darker'
    return hslString(color, palette)
  }

  const getImageSizeRatio = () => {
    const widthRatio = props.imageDimensions.width / screenWidth
    const heightRatio = props.imageDimensions.height / screenHeight
    return Math.min(widthRatio, heightRatio)
  }

  const getCenterArray = (align: string) => {
    const values: { [key: string]: [number, number] } = {
      'center': [0.5, 0],
      'left': [0, 0],
      'right': [1, 0],
    }
    return values[align]
  }

  const {
    isBW,
    isInline,
    resizeMode,
    isMultiply,
    isScreen,
    color
  } = props.styles

  const {
    faceCentreNormalised,
    imageDimensions
  } = props

  const isReallyInline = props.orientation === 'landscape' ? false : isInline

  const absolute = {
    position: 'absolute',
    top: '0%',
    height: isReallyInline ? '100%' : '120%',
    left: isReallyInline ? '0%' : '-10%',
    width: isReallyInline ? '100%' : '120%'
  }
  const inline = {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    marginTop: getStatusBarHeight(),
    top: -1,
    marginBottom: -1
  }

  if (imageDimensions.width === 0 || imageDimensions.height === 0 || !imageDimensions.width || !imageDimensions.height) {
    return <View style={inline} />
  }

  const position = isReallyInline ? inline : absolute
  const scrollAnim = props.scrollAnim || new Animated.Value(0)
  const imageHeight = screenWidth / imageDimensions.width * imageDimensions.height
  const scale = isReallyInline ?
    scrollAnim.interpolate({
      inputRange: [-imageHeight, 0, 1],
      outputRange: [2, 1, 1]
    }) :
    scrollAnim.interpolate({
      inputRange: [-100, 0, screenHeight],
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
    inputRange: [0, screenHeight * 0.75, screenHeight],
    outputRange: [1, 1, 0]
  })
  const blurOpacity = scrollAnim.interpolate({
    inputRange: [-100, -50, 0, 200],
    outputRange: [0, 0.8, 1, 0]
  })
  let style = {
    ...position,
    backgroundColor: isMultiply || isScreen ? getColor() : hslString('bodyBG'),
    opacity,
    transform: isReallyInline ?
      [{ translateY }, { scale }] :
      [{ scale }, { translateY }]
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

  const finalSaturation = isBW ? 0 : getImageSizeRatio() < .75 ? 1.2 : 1
  const finalBrightness = isMultiply ? 1.3 : isScreen ? 1 : getImageSizeRatio() < 1 ? 1.2 : 1

  if (props.imagePath && props.imageDimensions.width > 0 && props.imageDimensions.height > 0) {
    const center = getCenterArray(props.styles.align)

    const inlineImageHeight = screenWidth / props.imageDimensions.width *
      props.imageDimensions.height *
      (isReallyInline ? 1 : 1.2)
    const imageWidth = screenHeight / props.imageDimensions.height *
      props.imageDimensions.width *
      (isReallyInline ? 1 : 1.2)

    let imageOffset = faceCentreNormalised ?
      faceCentreNormalised.x * imageWidth - screenWidth / 2 :
      imageWidth / 2 - screenWidth / 2
    if (imageOffset > imageWidth - screenWidth * 1.2) {
      imageOffset = imageWidth - screenWidth * 1.2
    } else if (imageOffset < screenWidth * 0.2) {
      imageOffset = screenWidth * 0.2
    }

    const image = useImage(props.imagePath)
    const skiaImage = (
      <Rect x={0} y={0} width={screenWidth * 1.2} height={screenHeight * 1.2}>
        <ImageShader
          fit='cover'
          image={image}
          rect={{
            x: isReallyInline || resizeMode === 'contain' ? 0 : -imageOffset,
            y: 0,
            height: isReallyInline || resizeMode === 'contain' ? inlineImageHeight : screenHeight,
            width: isReallyInline || resizeMode === 'contain' ? screenWidth : imageWidth
          }}
        />
      </Rect>
    )

    const adjusted = isBW ? (
      <Group>
        { skiaImage}
        <BackdropFilter
          filter={<ColorMatrix matrix={BW} />} />
      </Group>
    ) : skiaImage

    const finalImage = (isMultiply || isScreen) ? (
      <Group>
        { adjusted }
        <Rect 
          x={0} 
          y={0} 
          width={screenWidth * 1.2} 
          height={screenHeight} 
          color={getColor()} 
          blendMode={isMultiply ? 'multiply' : 'screen'}
        />
      </Group>
    ) : adjusted

    return (
      <Animated.View
        style={style}
      >
        <Canvas style={{ 
          flex: 1,
          backgroundColor: 'red',
        }}>
          { finalImage}
          { !isReallyInline && getImageSizeRatio() < .5 && 
            <Blur blur={4} />
          }
        </Canvas>
      </Animated.View>
    )
  }
  return <Animated.View />
}

export default CoverImage