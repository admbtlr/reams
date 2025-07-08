import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Animated, Dimensions, Platform, Text, View, TextStyle, ViewStyle } from 'react-native'
import rnTextSize from 'react-native-text-size'
import quote from 'headline-quotes'
import * as Sentry from '@sentry/react-native'
import { getMargin, fontSizeMultiplier, getSmallestDimension } from '@/utils/dimensions'
import { SET_TITLE_FONT_SIZE } from '@/store/items/types'
import { useDispatch } from 'react-redux'
import log from '@/utils/log'

const entities = require('entities')

interface TitleProps {
  title?: string
  item: any
  styles: any
  font?: string
  showCoverImage?: boolean
  isCoverInline?: boolean
  isDarkMode?: boolean
  isVisible?: boolean
  screenWidth: number
  screenHeight: number
  isFullBleed: boolean
  titleAnimation?: any
  scrollOffset: Animated.Value
  addAnimation?: (style: any, anim: any, isVisible: boolean) => any
  anims?: any
  justifiers: { [key: string]: string }
  aligners: { [key: string]: string }
  fontFamily: string
  getFontFamily: (weight?: string | null | undefined, variant?: string | null | undefined) => string
}

interface MeasureResult {
  width: number
  height: number
  lineCount: number
}

const textColor = '#333333'
const textColorDarkMode = '#E5E5E7'

const Title: React.FC<TitleProps> = ({
  title,
  item,
  styles,
  font,
  showCoverImage,
  isCoverInline,
  isDarkMode,
  isVisible,
  screenWidth,
  screenHeight,
  isFullBleed,
  titleAnimation,
  scrollOffset,
  addAnimation,
  anims,
  justifiers,
  aligners,
  fontFamily,
  getFontFamily
}) => {
  const [optimalFontSize, setOptimalFontSize] = useState<number | null>(null)
  const innerViewRef = useRef(null)
  const outerViewRef = useRef(null)
  const dispatch = useDispatch()
  const updateFontSize = (fontSize: number) => {
    dispatch({
      type: SET_TITLE_FONT_SIZE,
      fontSize,
      item
    })
  }


  // Text processing pipeline
  const originalTitle = title
  const decodedTitle = quote(entities.decodeHTML(title || '').replace(/\n/g, ''))
  const displayTitle = decodedTitle.replace(/<.*>/g, '')

  const getLetterSpacing = useCallback(() => {
    return styles?.letterSpacing || 0
  }, [styles])

  const getForegroundColor = useCallback(() => {
    if (!item?.styles?.title?.color) return textColor
    return item.styles.title.color
  }, [item])

  const getWidthPercentage = useCallback(() => {
    return styles?.widthPercentage || 100
  }, [styles])

  const getInnerVerticalPadding = useCallback((fontSize: number) => {
    return Math.round(fontSize * 0.2)
  }, [])

  const getInnerHorizontalPadding = useCallback((fontSize: number) => {
    return Math.round(fontSize * 0.1)
  }, [])

  const getInnerHorizontalMargin = useCallback(() => {
    return getMargin()
  }, [])

  const shouldSplitIntoWords = useCallback(() => {
    return styles?.invertBG || styles?.interBolded || styles?.interStyled
  }, [styles])

  const getInnerWidth = useCallback((fontSize: number, isItalic: boolean) => {
    return screenWidth * getWidthPercentage() / 100 -
      getMargin() * 2 -
      (styles.bg ? getMargin() : 0) -
      // this.getInnerHorizontalPadding(fontSize) * 2 -
      // this.getInnerHorizontalMargin(fontSize) * 2 -
      (isItalic ? fontSize * 0.1 : 0)
  }, [screenWidth])

  const getLongestWord = useCallback(() => {
    const words = displayTitle.split(' ')
    return words.reduce((longest: string, word: string) =>
      word.length > longest.length ? word : longest, '')
  }, [displayTitle])

  const getRenderedTitle = useCallback((text: string) => {
    // Basic HTML to React conversion
    // This is simplified - original has more complex logic
    if (!text) return text

    return text.replace(/<i>(.*?)<\/i>/g, (match, content) => {
      return content // For now, just return content without styling
    }).replace(/<b>(.*?)<\/b>/g, (match, content) => {
      return content
    }).replace(/<em>(.*?)<\/em>/g, (match, content) => {
      return content
    })
  }, [])

  const measureSizes = useCallback(async (sizes: number[], maxFontSize: number) => {
    if (!displayTitle || !styles) return
    Promise.all(sizes.map(size => rnTextSize.measure({
      text: styles.isUpperCase ? displayTitle.toLocaleUpperCase() : displayTitle,
      width: getInnerWidth(size, styles.isItalic),
      fontSize: size,
      fontFamily,
      usePreciseWidth: true
    }))).then(values => {
      let options = values.map((v, i) => {
        const size = maxFontSize - i
        return {
          height: v.height,
          size,
          numLines: v.lineCount
        }
      })

      const maxHeight = screenHeight / (
        screenWidth / screenHeight < 0.5 ?
          1.8 : // iphone X etc.
          2 // iphone 8, SE etc.
      )
      const sensibleSize = 42 * fontSizeMultiplier()
      // now go through them and find the first one that
      // is less than 50% screen height
      options = options.filter(v => v.height < maxHeight)
      const maxViable = options[0]
      let optimal = maxViable
      // console.log(`MAX VIABLE FONT SIZE (${this.displayTitle}): ${maxViable}`)

      // (c) if we go down to 4 lines, is the fontSize > 42?
      let fourLines = options.find(v => v.numLines === 4)
      if (fourLines &&
        fourLines.size &&
        fourLines.size > optimal.size &&
        fourLines.size > sensibleSize) {
        optimal = fourLines
      }

      // was maxViable actually four lines or less?
      if (options[0] && options[0].numLines <= 4) optimal = maxViable

      // this avoids shrinking the font size too much
      if (maxViable.size / optimal.size > 2) optimal = maxViable

      if (maxViable.size < sensibleSize) optimal = maxViable

      // this is a bit sketchy...
      if (styles.invertBG) optimal.size = Math.round(optimal.size * 0.9)

      if (!optimal?.size) {
        Sentry.captureMessage(`Optimal is not an object for "${displayTitle}": ${JSON.stringify(optimal)}`)
      }

      // often out by 1...
      optimal.size--

      updateFontSize(optimal.size)
      setOptimalFontSize(optimal.size)
    })
  }, [displayTitle, styles, screenWidth, getWidthPercentage, item, updateFontSize])

  const getMaxFontSize = useCallback(async () => {
    // always measure to portrait, even if currently in landscape
    const widthAvailable = getSmallestDimension() * (getWidthPercentage() / 100) -
      // allow space for double margins on each side
      // just to be on the safe side
      getMargin() * (styles.hasBorder ? 6 : 4)

    // think this is probably a magic number?
    const limit = Math.round(widthAvailable / 6)
    let maxSize
    const longestWord = getLongestWord()
    let sizes = []
    let i = limit
    while (i > 20) {
      sizes.push(i--)
    }

    if (typeof rnTextSize === 'undefined') {
      return 32
    }

    return Promise.all(sizes.map((size) => rnTextSize.measure({
      text: styles.isUpperCase ? longestWord.toLocaleUpperCase() : longestWord,
      fontSize: size,
      fontFamily,
      width: 1000
    }))).then((values) => {
      let options = values.map((v, i) => {
        return {
          width: v.width,
          size: limit - i
        }
      })
      for (var i = 0; i < options.length; i++) {
        if (options[i].width < widthAvailable) {
          return options[i].size
        }
      }
      return null
    }).then(maxSize => {
      return (maxSize === null || maxSize > limit) ? limit : maxSize
    }).catch(e => {
      debugger
      console.log(e)
    })
  }, [displayTitle])

  useEffect(() => {
    const startMeasuring = async () => {
      // always measure in dev
      if (!__DEV__ && (styles?.fontResized || optimalFontSize)) return
      let maxFontSize = 32

      try {
        maxFontSize = await getMaxFontSize() || maxFontSize
      } catch (e) {
        log(e)
      }

      let sizes = []
      let i = maxFontSize
      while (i > 20) {
        sizes.push(i--)
      }

      try {
        await measureSizes(sizes, maxFontSize)
      } catch (e) {
        log(e)
      }
    }
    startMeasuring()
  }, [styles, optimalFontSize])

  if (!styles || !item || !originalTitle) return null

  const fontSize: number = optimalFontSize || styles.fontSize || 42
  let lineHeight: number = Math.floor(fontSize * (styles.lineHeightAsMultiplier || 1.2))
  if (lineHeight < fontSize) lineHeight = fontSize

  const renderedTitle: string = getRenderedTitle(decodedTitle)

  // Color calculations
  let color: string = styles.isMonochrome ?
    (((isFullBleed && !styles.bg) || (!isFullBleed && styles.bg)) ?
      'white' : textColor) :
    (styles.isTone ?
      (item.styles?.isCoverImageColorDarker ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)') :
      getForegroundColor())

  if (!showCoverImage || isCoverInline) {
    color = isDarkMode ? textColorDarkMode :
      (styles.bg ? 'white' : textColor)
  }

  // Padding calculations
  const invertBGPadding: number = 6
  let paddingTop: number = shouldSplitIntoWords() ? invertBGPadding : 0
  const paddingBottom: number = 0
  let paddingLeft: number = showCoverImage && styles.invertBG ? invertBGPadding : 0

  const extraPadding: number = Platform.OS === 'ios' ? Math.round(fontSize / 9) : 0
  paddingTop += extraPadding
  const marginTop: number = 0 - extraPadding

  // Font style
  const fontStyle: TextStyle = {
    fontFamily: fontFamily,
    color,
    fontSize,
    lineHeight,
    textAlign: styles.textAlign || 'left',
    letterSpacing: getLetterSpacing(),
    paddingTop,
    paddingBottom,
    paddingLeft,
    marginTop
  }

  // Border calculations
  const borderWidth: number = styles.hasBorder ? 5 : 0
  const borderTop = { borderTopWidth: borderWidth }
  const borderBottom = { borderBottomWidth: borderWidth }
  const borderAll = { borderWidth }

  let border: ViewStyle = styles.valign === 'top' ? borderBottom :
    (styles.valign === 'bottom' ? borderTop :
      (styles.textAlign === 'center' ? borderAll :
        { ...borderTop, ...borderBottom }))

  if (styles.hasBorder) {
    border = { borderWidth: 5, color: 'white' }
  }
  if (!showCoverImage || isCoverInline) border = {}

  // Inner view style
  const horizontalMargin: number = getMargin() * 0.8
  const widthPercentage: number = getWidthPercentage()
  const maxWidth: number = (screenWidth - horizontalMargin * 2) * widthPercentage / 100

  let innerViewStyle: ViewStyle = {
    marginLeft: getMargin(),
    marginRight: getMargin(),
    marginBottom: isFullBleed && (styles.bg || styles.hasBorder) ? getMargin() : 0,
    marginTop: getMargin() / 2,
    paddingLeft: isFullBleed && (styles.hasBorder || styles.bg) ? getMargin() / 2 : 0,
    paddingRight: isFullBleed && (styles.hasBorder || styles.bg) ? getMargin() / 2 : 0,
    paddingBottom: (!showCoverImage || isCoverInline) ? getMargin() / 2 :
      (styles.textAlign === 'center' || styles.borderWidth) ? getInnerVerticalPadding(fontSize) :
        styles.bg ? getMargin() : getMargin() / 2,
    paddingTop: styles.hasBorder || styles.bg ? getMargin() / 2 : getMargin() / 2,
    backgroundColor: showCoverImage && !isCoverInline && styles.bg ? 'rgba(255,255,255,0.95)' : 'transparent',
    overflow: 'visible',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    width: 'auto',
    maxWidth,
    borderColor: color,
    ...border,
    borderRadius: styles.bg ? getMargin() : 0
  }

  // if (anims && addAnimation) {
  //   innerViewStyle = addAnimation(innerViewStyle, titleAnimation, !!isVisible)
  //   if (!showCoverImage || !isCoverInline) {
  //     innerViewStyle.transform = innerViewStyle.transform || []
  //     innerViewStyle.transform.push({
  //       translateY: scrollOffset.interpolate({
  //         inputRange: [-1, 0, 1],
  //         outputRange: [-0.75, 0, 0]
  //       })
  //     })
  //   }
  // }

  // Shadow style
  const shadowStyle: TextStyle = showCoverImage && styles.hasShadow ? {
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10
  } : {}

  // Inverted title styles
  const invertedTitleStyle: TextStyle = {
    color: showCoverImage ?
      (styles.isMonochrome ? 'black' : 'white') : color,
    paddingLeft: 2,
    paddingRight: 2,
    marginTop: 1,
    top: font === 'headerFontSans1' ? 3 : 0
  }

  const invertedTitleWrapperStyle: ViewStyle = {
    backgroundColor: showCoverImage ?
      (styles.isMonochrome ? 'white' : getForegroundColor()) : 'transparent',
    marginBottom: (isFullBleed && styles.invertedBGMargin || 0) * 3,
    overflow: 'visible'
  }

  // Word rendering logic
  const words: string[] = displayTitle.split(' ')
  let wordStyles: TextStyle[] | null = null

  if (styles.interStyled && styles.interBolded) {
    wordStyles = styles.interBolded.map((isAlternateStyle: boolean) => {
      const wordFontFamily = getFontFamily(null, isAlternateStyle ? 'alternate' : null)
      return {
        fontFamily: wordFontFamily,
        fontSize,
        height: lineHeight * 1.2,
        lineHeight
      }
    })
  } else if (styles.interBolded) {
    wordStyles = styles.interBolded.map((isBold: boolean) => {
      const wordFontFamily = getFontFamily(isBold ? 'bold' :
        (styles.isItalic ? 'regularItalic' : 'regular'))
      return {
        fontFamily: wordFontFamily,
        fontSize,
        height: lineHeight * 1.2,
        lineHeight,
        overflow: 'visible'
      }
    })
  }

  let finalRenderedTitle: string | React.ReactElement[] = renderedTitle
  if (styles.isUpperCase) {
    finalRenderedTitle = getRenderedTitle(decodedTitle.toLocaleUpperCase())
  }

  // Split into words if needed
  if (shouldSplitIntoWords()) {
    finalRenderedTitle = words.map((word: string, index: number) => {
      if (styles.invertBG) {
        return (
          <View
            key={index}
            style={invertedTitleWrapperStyle}
          >
            <Text
              maxFontSizeMultiplier={1.2}
              style={{
                ...fontStyle,
                ...(wordStyles && wordStyles[index]),
                ...invertedTitleStyle,
                height: lineHeight + paddingTop + paddingBottom,
              }}
            >{word} </Text>
          </View>
        )
      } else {
        return (
          <Animated.Text
            maxFontSizeMultiplier={1.2}
            key={index}
            style={{
              ...fontStyle,
              ...(wordStyles && wordStyles[index]),
              ...shadowStyle
            }}
          >{word} </Animated.Text>
        )
      }
    })
  }

  return (
    <Animated.View
      style={{
        ...innerViewStyle,
        flex: showCoverImage && !isCoverInline ? 0 : 1,
        marginLeft: styles.invertBG ?
          horizontalMargin - (invertedTitleStyle.paddingLeft || 0) :
          horizontalMargin,
        justifyContent: aligners[styles.textAlign] || 'flex-start'
      }}
      ref={innerViewRef}
    >
      {typeof finalRenderedTitle === 'object' && finalRenderedTitle}
      {(typeof finalRenderedTitle === 'string' && originalTitle.length > 0) && (
        <Animated.Text style={{
          ...fontStyle,
          ...shadowStyle,
          marginBottom: 0,
          paddingTop: typeof fontStyle.paddingTop === 'number' ?
            fontStyle.paddingTop + 10 : 10,
          marginTop: -10
        }}>
          <Animated.Text>{finalRenderedTitle}</Animated.Text>
        </Animated.Text>
      )}
    </Animated.View>
  )
}

export default Title
