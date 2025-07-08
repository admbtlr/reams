import React from 'react'
import { Animated, Text, View, TextStyle, ViewStyle } from 'react-native'
import { getMargin } from '@/utils/dimensions'

interface ExcerptProps {
  color: string
  fontSize: number
  lineHeight: number
  excerpt?: string
  item: any
  styles: any
  showCoverImage?: boolean
  isCoverInline?: boolean
  isDarkMode?: boolean
  isVisible?: boolean
  screenWidth: number
  screenHeight: number
  isFullBleed: boolean
  excerptAnimation?: any
  scrollOffset: Animated.Value
  addAnimation?: (style: any, anim: any, isVisible: boolean) => any
  anims?: any
  justifiers: { [key: string]: string }
  aligners: { [key: string]: string }
  fontFamily: string
}

const Excerpt: React.FC<ExcerptProps> = ({
  color,
  excerpt,
  fontSize,
  lineHeight,
  item,
  styles,
  showCoverImage,
  isCoverInline,
  isDarkMode,
  isVisible,
  screenWidth,
  screenHeight,
  isFullBleed,
  excerptAnimation,
  scrollOffset,
  addAnimation,
  anims,
  justifiers,
  aligners,
  fontFamily
}) => {
  if (!excerpt || !item || !styles) return null

  const getForegroundColor = (): string => {
    if (!item?.styles?.title?.color) return '#333333'
    return item.styles.title.color
  }

  // Background styling
  let excerptBg: ViewStyle = {}
  let excerptShadowStyle: TextStyle = {}

  if (showCoverImage && !isCoverInline) {
    excerptBg = (styles.excerptInvertBG/* || styles.bg*/) ? {
      backgroundColor: styles.bg ?
        'rgba(255,255,255,0.95)' :
        getForegroundColor(),
      paddingLeft: getMargin() / 2,
      paddingRight: getMargin() / 2,
      paddingTop: getMargin() / 2,
      paddingBottom: getMargin() / 2,
      marginBottom: lineHeight
    } : {}

    excerptShadowStyle = styles.excerptInvertBG ? {
      textShadowColor: 'transparent'
    } : {}
  }

  const fixPadding: ViewStyle = styles.invertBG ? { paddingLeft: 0 } : {}

  // Inner view style for the excerpt container
  let innerViewStyle: ViewStyle = {
    borderWidth: 0,
    paddingTop: !isCoverInline && (styles.borderWidth || styles.bg) ?
      getMargin() / 2 : 0,
    paddingBottom: !showCoverImage ? getMargin() :
      (styles.borderWidth || styles.bg) ?
        getMargin() / 2 : getMargin(),
    ...excerptBg,
    paddingLeft: isFullBleed && (styles.excerptInvertBG/* || styles.bg*/) ? getMargin() / 2 : 0,
    marginTop: styles.bg && !styles.borderWidth ? 1 : 0,
    width: 'auto',
    alignSelf: {
      'left': 'flex-start',
      'center': 'center',
      'right': 'flex-end'
    }[styles.excerptHorizontalAlign] || 'flex-start',
    marginLeft: getMargin(),
    marginRight: getMargin(),
    transform: []
  }

  // if (anims && addAnimation) {
  //   innerViewStyle = addAnimation(innerViewStyle, excerptAnimation, !!isVisible)

  //   if (!isCoverInline) {
  //     innerViewStyle.transform = innerViewStyle.transform || []
  //     innerViewStyle.transform.push({
  //       translateY: scrollOffset.interpolate({
  //         inputRange: [-1, 0, 1],
  //         outputRange: [-0.5, 0, 0]
  //       })
  //     })
  //   }
  // }

  const fontStyle: TextStyle = {
    justifyContent: aligners[styles.textAlign] || 'flex-start',
    ...fixPadding,
    marginLeft: -3,
    marginTop: 0,
    paddingTop: 0,
    color,
    fontFamily: fontFamily,
    fontSize,
    lineHeight,
    letterSpacing: 0,
    ...excerptShadowStyle
  }

  return (
    <View style={{
      flex: 0,
      flexDirection: 'row',
      justifyContent: showCoverImage ? justifiers[styles.valign] || 'flex-start' : 'flex-start',
      alignItems: styles.textAlign === 'center' ? 'center' : 'flex-start',
    }}>
      <Animated.View style={innerViewStyle}>
        <Animated.Text
          maxFontSizeMultiplier={1.2}
          style={fontStyle}
        >
          {excerpt}
        </Animated.Text>
      </Animated.View>
    </View>
  )
}

export default Excerpt
