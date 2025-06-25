import React from 'react'
import { Animated, TextStyle } from 'react-native'
import { getMargin } from '@/utils/dimensions'

const entities = require('entities')

interface AuthorProps {
  color: string
  fontSize: number
  lineHeight: number
  item: any
  styles: any
  showCoverImage?: boolean
  isCoverInline?: boolean
  isDarkMode?: boolean
  isVisible?: boolean
  screenWidth: number
  authorAnimation?: any
  scrollOffset: Animated.Value
  addAnimation?: (style: any, anim: any, isVisible: boolean) => any
  anims?: any
  fontFamily: string
}

const Author: React.FC<AuthorProps> = ({
  color,
  fontSize,
  lineHeight,
  item,
  styles,
  showCoverImage,
  isCoverInline,
  isDarkMode,
  isVisible,
  screenWidth,
  authorAnimation,
  scrollOffset,
  addAnimation,
  anims,
  fontFamily
}) => {
  if (!item?.author) return null

  let authorStyle: TextStyle = {
    color,
    backgroundColor: 'transparent',
    fontSize,
    fontFamily: fontFamily,
    lineHeight,
    textAlign: styles?.textAlign || 'left',
    marginLeft: getMargin() - 3,
    paddingRight: getMargin(),
    marginBottom: getMargin() / 2,
    width: screenWidth
  }

  if (anims && addAnimation) {
    authorStyle = addAnimation(authorStyle, authorAnimation, !!isVisible)
    if (!isCoverInline) {
      authorStyle.transform = authorStyle.transform || []
      authorStyle.transform.push({
        translateY: scrollOffset.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-0.25, 0, 0]
        })
      })
    }
  }

  return (
    <Animated.Text
      maxFontSizeMultiplier={1.2}
      style={authorStyle}
    >
      {entities.decodeHTML(item.author).trim()}
    </Animated.Text>
  )
}

export default Author
