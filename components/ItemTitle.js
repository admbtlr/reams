import { ItemType } from '../store/items/types'
import React from 'react'
import {Animated, Dimensions, Easing, Platform, Text, View, WebView} from 'react-native'
import rnTextSize from 'react-native-text-size'
import moment from 'moment'
import quote from 'headline-quotes'

import {deepEqual, diff} from '../utils'
import { getMargin, getSmallestDimension } from '../utils/dimensions'
import { fontSizeMultiplier } from '../utils/dimensions'
import { isIpad } from '../utils/dimensions'
import {getTopBarHeight} from './TopBar'
import * as Sentry from '@sentry/react-native'
import CategoryToggles from './CategoryToggles'
import { Bar } from './Bar'

const entities = require('entities')

const fontStyles = {
  headerFontSerif1: {
    bold: {
      fontFamily: 'PlayfairDisplay-Bold'
    },
    boldItalic: {
      fontFamily: 'PlayfairDisplay-BoldItalic'
    },
    regular: {
      fontFamily: 'PlayfairDisplay-Regular'
    },
    regularItalic: {
      fontFamily: 'PlayfairDisplay-Italic'
    }
  },
  headerFontSerif2: {
    bold: {
      fontFamily: 'IBMPlexSerif-Bold'
    },
    boldItalic: {
      fontFamily: 'IBMPlexSerif-BoldItalic'
    },
    regular: {
      fontFamily: 'IBMPlexSerif-Light'
    },
    regularItalic: {
      fontFamily: 'IBMPlexSerif-LightItalic'
    }
  },
  headerFontSerif3: {
    bold: {
      fontFamily: 'PlayfairDisplay-Black'
    },
    boldItalic: {
      fontFamily: 'PlayfairDisplay-BlackItalic'
    },
    regular: {
      fontFamily: 'PlayfairDisplay-Regular'
    },
    regularItalic: {
      fontFamily: 'PlayfairDisplay-Italic'
    }
  },
  headerFontSerif4: {
    bold: {
      fontFamily: 'Reforma1969-Negra'
    },
    boldItalic: {
      fontFamily: 'Reforma1969-NegraItalica'
    },
    regular: {
      fontFamily: 'Reforma1969-Blanca'
    },
    regularItalic: {
      fontFamily: 'Reforma1969-BlancaItalica'
    }
  },
  // headerFontSans1: {
  //   verticalOffset: 0.1,
  //   bold: {
  //     fontFamily: 'AvenirNextCondensed-Bold'
  //   },
  //   boldItalic: {
  //     fontFamily: 'AvenirNextCondensed-BoldItalic'
  //   },
  //   regular: {
  //     fontFamily: 'AvenirNextCondensed-Medium'
  //   },
  //   regularItalic: {
  //     fontFamily: 'AvenirNextCondensed-MediumItalic'
  //   }
  // },
  headerFontSans1: {
    bold: {
      fontFamily: 'AvenirNextCondensed-Bold'
    },
    boldItalic: {
      fontFamily: 'AvenirNextCondensed-BoldItalic'
    },
    regular: {
      fontFamily: 'AvenirNext-Medium'
    },
    regularItalic: {
      fontFamily: 'AvenirNext-MediumItalic'
    }
  },
  headerFontSans2: {
    bold: {
      fontFamily: 'Poppins-ExtraBold'
    },
    boldItalic: {
      fontFamily: 'Poppins-ExtraBoldItalic'
    },
    regular: {
      fontFamily: 'Poppins-Regular'
    },
    regularItalic: {
      fontFamily: 'Poppins-Italic'
    }
  },
  headerFontSans3: {
    bold: {
      fontFamily: 'Montserrat-Bold'
    },
    boldItalic: {
      fontFamily: 'Montserrat-BoldItalic'
    },
    regular: {
      fontFamily: 'Montserrat-Regular'
    },
    regularItalic: {
      fontFamily: 'Montserrat-Italic'
    }
  },
  headerFontSans4: {
    bold: {
      fontFamily: 'Reforma2018-Negra'
    },
    boldItalic: {
      fontFamily: 'Reforma2018-NegraItalica'
    },
    regular: {
      fontFamily: 'Reforma2018-Blanca'
    },
    regularItalic: {
      fontFamily: 'Reforma2018-BlancaItalica'
    }
  }
}

const textColor = 'hsl(0, 0%, 20%)'
const textColorDarkMode = 'hsl(0, 0%, 70%)'

class ItemTitle extends React.Component {
  // static whyDidYouRender = true
  constructor (props) {
    super(props)
    this.props = props
  }

  getRenderedTitle (title) {
    let rendered = title
      .replace(/<i>/ig, '|||Text style={italic}||||')
      .replace(/<em>/ig, '|||Text style={italic}||||')
      .replace(/<\/i>/ig, '|||/Text||||')
      .replace(/<\/em>/ig, '|||/Text||||')
      .replace(/<b>/ig, '|||Text style={bold}||||')
      .replace(/<\/b>/ig, '|||/Text||||')
      .replace('|||', '<')
      .replace('||||', '>')
      .replace(' and ', ' & ')
      .replace(' And ', ' & ')
      .replace(' AND ', ' & ')
    return this.fixWidowIfNecessary(rendered)
  }

  getLongestWord () {
    return this.displayTitle.split(/[ \-—]/).reduce((longest, word) => {
      if (word.length > longest.length) return word
      return longest
    }, '')
  }

  getInnerVerticalPadding (fontSize) {
    if (this.props.showCoverImage && this.props.styles.bg) {
      return this.getInnerHorizontalMargin()
    }
    const {styles} = this.props
    const lineHeight = fontSize ? fontSize * styles.lineHeightAsMultiplier : styles.lineHeight
    return lineHeight > 60 ?
      Math.round(lineHeight / 4) :
      Math.round(lineHeight / 2)
  }

  getInnerHorizontalPadding (fontSize) {
    const { showCoverImage, isCoverInline, styles } = this.props
    if (showCoverImage && !isCoverInline && styles.bg) {
      return getMargin() / 2
    } else {
      return 0
    }
  }

  getInnerHorizontalMargin () {
    if (this.props.styles.bg) {
      return getMargin() / 2
    }
    return !this.props.showCoverImage ?
      0 :
      (this.props.isCoverInline ?
        getMargin() / 2 :
        getMargin()) // allow space for date
  }

  getInnerWidth (fontSize, isItalic) {
    return this.screenWidth * this.getWidthPercentage() / 100 -
      getMargin() * 2 -
      (this.props.styles.bg ? getMargin() : 0) -
      // this.getInnerHorizontalPadding(fontSize) * 2 -
      // this.getInnerHorizontalMargin(fontSize) * 2 -
      (isItalic ? fontSize * 0.1 : 0)
  }

  async componentDidMount () {
    this.componentDidUpdate()
  }

  async getMaxFontSize () {
    let { styles } = this.props
    const that = this
    // always measure to portrait, even if currently in landscape
    const widthAvailable = getSmallestDimension() * (this.getWidthPercentage() / 100) -
      // allow space for margins
      getSmallestDimension() * 0.1
    
    // think this is probably a magic number?
    const limit = Math.round(widthAvailable / 8)
    let maxSize
    const longestWord = this.getLongestWord()
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
        fontFamily: this.getFontFamily(),
        width: 1000
    }))).then((values) => {
      values = values.map((v, i) => {
        return {
          width: v.width,
          size: limit - i
        }
      })
      for (var i = 0; i < values.length; i++) {
        if (values[i].width < widthAvailable) {
          return values[i].size
        }
      }
      return null
    }).then(maxSize => {
      return (maxSize > limit) ? limit : maxSize
    }).catch(e => {
        debugger
        console.log(e)
      })

  }

  // this is where we calculate the optimal font size
  async componentDidUpdate (prevProps) {
    const {styles} = this.props

    if (styles?.fontResized && (prevProps === undefined || prevProps.isPortrait === this.props.isPortrait)) return
    if (this.state && this.state.optimalFontSize) return
    if (typeof rnTextSize === 'undefined') return

    let maxFontSize = 32

    try {
      // first get max font size
      maxFontSize = await this.getMaxFontSize()
      // console.log(`MAX FONT SIZE (${this.displayTitle}): ${maxFontSize}`)
    } catch (e) {
      log(e)
    }

    let sizes = []
    let i = maxFontSize
    while (i > 20) {
      sizes.push(i--)
    }

    if (Platform.OS !== 'web') {
      try {
        await this.measureSizes(sizes, maxFontSize)
      } catch (e) {
        log(e)
      }
    }
  }

  async measureSizes (sizes, maxFontSize) {
    const {styles} = this.props
    Promise.all(sizes.map((size) => rnTextSize.measure({
      text: styles.isUpperCase ? this.displayTitle.toLocaleUpperCase() : this.displayTitle,
      width: this.getInnerWidth(size, styles.isItalic),
      fontSize: size,
      fontFamily: this.getFontFamily(),
      usePreciseWidth: true
    }))).then((values) => {
      values = values.map((v, i) => {
        const size = maxFontSize - i
        return {
          height: v.height,
          size,
          numLines: v.lineCount
        }
      })

      // console.log(this.displayTitle)
      // console.log(values)
      const maxHeight = this.screenHeight / (
        this.screenWidth / this.screenHeight < 0.5 ?
          1.8 : // iphone X etc.
          2 // iphone 8, SE etc.
      )
      const sensibleSize = 42 * fontSizeMultiplier()
      // now go through them and find the first one that
      // (a) is less than 50% screen height
      values = values.filter(v => v.height < maxHeight)
      const maxViable = values[0]
      let optimal = maxViable
      // console.log(`MAX VIABLE FONT SIZE (${this.displayTitle}): ${maxViable}`)

      // (b) jumps down a line
      // const initialNumLines = values[0].numLines
      // let downALine = values.find((v, i) => {
      //   return values[i - 1] &&
      //     v.numLines < values[i - 1].numLines /*&&
      //     v.numLines < 7*/
      // })
      // optimal = downALine || maxViable

      // (c) if we go down to 4 lines, is the fontSize > 42?
      let fourLines = values.find(v => v.numLines === 4)
      if (fourLines && 
        fourLines.size && 
        fourLines.size > optimal && 
        fourLines.size > sensibleSize) {
        optimal = fourLines
      }

      // was maxViable actually four lines or less?
      if (values[0] && values[0].numLines <= 4) optimal = maxViable

      // this avoids shrinking the font size too much
      if (maxViable / optimal > 2) optimal = maxViable

      if (maxViable < sensibleSize) optimal = maxViable

      // this is a bit sketchy...
      if (styles.invertBG) optimal.size = Math.round(optimal.size * 0.9)

      // TODO - need to account for interbolding, which need to move to createItemStyles

      // TODO letter spacing...
      // at fontsize 50, letterspacing of n means fontsize-2n
      // "This value specifies the number of points by which to adjust kern-pair characters"
      // https://developer.apple.com/documentation/uikit/nskernattributename

      if (!optimal?.size) {
        Sentry.captureMessage(`Optimal is not an object for "${this.displayTitle}": ${JSON.stringify(optimal)}`)
      }

      // often out by 1...
      optimal.size--

      // console.log(`OPTIMAL FONT SIZE (${this.displayTitle}): ${optimal}`)
      this.props.updateFontSize(this.props.item, optimal.size)
      this.titleHeight = optimal.height
      this.setState({ optimalFontSize: optimal.size })
    })
  }

  getLetterSpacing () {
    return 0
    const {styles} = this.props
    return styles.isVertical ?
            (this.getLongestWord().length < 6 ? 5 : 3) :
            (this.getLongestWord().length < 6 ? 3 : -1)
  }

  getFontFamily (fontType, fontVariant) {
    return this.getFontObject(fontType, fontVariant).fontFamily
  }

  getFontObject (fontType, fontVariant) {
    const {styles, item} = this.props
    const font = item?.styles?.fontClasses.heading
    let fontFamily = font

    switch (fontVariant) {
      case 'alternate':
        fontFamily = font.indexOf('Serif') !== -1 ?
          font.replace('Serif', 'Sans') :
          font.replace('Sans', 'Serif')
        break
      case 'excerpt':
        if (fontFamily === 'headerFontSans2') {
          fontFamily = 'headerFontSans1'
        } else if (fontFamily === 'headerFontSerif1') {
          fontFamily = 'headerFontSerif2'
        }
        break
      case 'author':
        if (fontFamily === 'headerFontSans2') {
          fontFamily = 'headerFontSans1'
        }
    }

    if (fontType) {

    } else if (styles.isBold && styles.isItalic) {
      fontType = 'boldItalic'
    } else if (styles.isBold || item.showCoverImage) {
      fontType = 'bold'
    } else if (styles.isItalic) {
      fontType = 'regularItalic'
    } else {
      fontType = 'regular'
    }

    return fontStyles[fontFamily][fontType]
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.isAnimating) return true
    if (this.props.item === undefined) return true
    if (nextState?.optimalFontSize !== this.state?.optimalFontSize) {
      return true
    }
    let changes
    let isDiff = !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState)
    // console.log('Should update? - '
    //   + this.props.item.title
    //   + (isDiff ? ' - YES' : ' - NO'))
    // if (isDiff) {
    changes = diff(this.props, nextProps, diff(this.state, nextState))
    // console.log(this.props.item._id + ' (' + this.props.item.title + ') will update:')
    // console.log(changes)
    if (changes.item.styles || 
      changes.isVisible || 
      changes.fontSize || 
      changes.isDarkMode || 
      changes.anims || 
      changes.isPortrait ||
      changes.color
    ) {
      isDiff = true
    }
    return isDiff
  }

  getWidthPercentage () {
    return this.screenWidth > 700 ? 80 : 100
  }

  getForegroundColor () {
    return this.props.color
  }

  // called by outerView to set the bottom y of the title
  onLayout (bottomY) {
    this.props.layoutListener && this.props.layoutListener(bottomY)
  }

  render () {
    let {
      backgroundColor,
      displayMode,
      isCoverInline,
      isPortrait, 
      isVisible,
      item,
      scrollOffset, 
      showCoverImage, 
      styles, 
    } = this.props

    const window = Dimensions.get('window')
    this.screenWidth = window.width
    this.screenHeight = window.height

    // this means the item hasn't been inflated from Firebase yet
    if (!styles || !item) return null

    const isFullBleed = showCoverImage && !isCoverInline

    // just so we can render something before it's been calculated
    const fontSize = this.state?.optimalFontSize || styles.fontSize || 42
    let lineHeight = Math.floor(fontSize * styles.lineHeightAsMultiplier)
    if (lineHeight < fontSize) lineHeight = fontSize

    // we need 3 different versions of the title
    // 1. originalTitle (Here&rquo;s a story about a <i>Thing</i>)
    // 2. displayTitle (Here’s a story about a Thing)
    // 3. renderedTitle (Here’s a story about a <Text style={italic}>Thing</Text>
    this.originalTitle = this.props.title
    this.decodedTitle = quote(entities.decodeHTML(this.props.title).replace(/\n/g, ''))
    this.displayTitle = this.decodedTitle.replace(/<.*>/g, '')
    this.renderedTitle = this.getRenderedTitle(this.decodedTitle)

    let position = {
      height: 'auto',
      width: 'auto',
      maxWidth: this.screenWidth
    }

    
    const {
      opacity,
      titleAnimation,
      categoriesAnimation,
      excerptAnimation,
      authorAnimation,
      dateAnimation,
      barAnimation
    } = this.props.anims ? this.getAnimationValues() : {}

    let color = styles.isMonochrome ?
      (((isFullBleed && !styles.bg) || (!isFullBleed && styles.bg)) ?
        'white' :
        textColor) :
      (styles.isTone ?
        (this.props.item.styles.isCoverImageColorDarker ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)') :
        this.getForegroundColor())
    if (!showCoverImage || isCoverInline) color = this.props.isDarkMode ? 
      textColorDarkMode : 
      this.props.styles.bg ? 'white' : textColor

    const invertBGPadding = 6
    let paddingTop = this.shouldSplitIntoWords() ? invertBGPadding : 0
    const paddingBottom = 0 //  this.shouldSplitIntoWords() ? invertBGPadding : 0
    let paddingLeft = showCoverImage && styles.invertBG ? invertBGPadding : 0
    // if (styles.isItalic) {
    //   paddingLeft += fontSize * 0.1
    // }

    // https://github.com/facebook/react-native/issues/7687
    // (9 is a heuristic value)
    const extraPadding = Math.round(fontSize / 9)
    paddingTop += extraPadding
    const marginTop = 0 - extraPadding

    let fontStyle = {
      fontFamily: this.getFontFamily(),
      color,
      fontSize,
      lineHeight,
      textAlign: styles.textAlign,
      letterSpacing: this.getLetterSpacing(),
      paddingTop,
      paddingBottom,
      paddingLeft,
      marginTop
    }
    const viewStyle = {
      ...position
    }

    // const borderWidth = styles.invertBG ? 0 : styles.borderWidth
    const borderWidth = styles.hasBorder ? 5 : 0
    const borderTop = { borderTopWidth: borderWidth }
    const borderBottom = { borderBottomWidth: borderWidth }
    const borderAll = { borderWidth }
    let border = styles.valign === 'top' ?
      borderBottom :
      (styles.valign === 'bottom' ? borderTop :
        (styles.textAlign === 'center' ?
          borderAll :
          {
            ...borderTop,
            ...borderBottom
          }
        ))
    if (styles.hasBorder) {
      border = {
        borderWidth: 5,
        color: 'white'
      }
    }
    if (!showCoverImage || isCoverInline) border = {}

    const innerPadding = this.getInnerVerticalPadding(fontSize)

    // if center aligned and not full width, add left margin
    const defaultHorizontalMargin = this.getInnerHorizontalMargin()
    const widthPercentage = this.getWidthPercentage()
    this.horizontalMargin = getMargin() * 0.8 // TODO: why 0.8?
    const maxWidth = (this.screenWidth - this.horizontalMargin * 2) * widthPercentage / 100

    const horizontalPadding = this.getInnerHorizontalPadding(fontSize)

    let innerViewStyle = {
      // horizontalMargin: styles.bg ? 28 + horizontalMargin : horizontalMargin,
      // marginRight:  styles.bg ? 28  + horizontalMargin : horizontalMargin,
      marginLeft: getMargin(), //defaultHorizontalMargin,
      marginRight:  getMargin(), //defaultHorizontalMargin,
      marginBottom: isFullBleed && (styles.bg || styles.hasBorder) ? getMargin() : 0,
      marginTop: getMargin() / 2,
      paddingLeft: isFullBleed && (styles.hasBorder || styles.bg) ? getMargin() / 2 : 0,
      paddingRight: isFullBleed && (styles.hasBorder || styles.bg) ? getMargin() / 2 : 0,
      paddingBottom: (!showCoverImage || isCoverInline) ?
          getMargin() / 2 :
        (styles.textAlign === 'center' || styles.borderWidth) ?
          innerPadding :
          styles.bg ? getMargin() : getMargin() / 2,
      paddingTop: styles.hasBorder || styles.bg ? getMargin() / 2 : getMargin() / 2,//innerPadding + borderWidth,
      backgroundColor: showCoverImage && !isCoverInline && styles.bg ?  'rgba(255,255,255,0.95)' : 'transparent',
      // height: 'auto',
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
    if (this.props.anims) {
      innerViewStyle = this.props.addAnimation(innerViewStyle, titleAnimation, isVisible)
      if (!showCoverImage || !isCoverInline) {
        innerViewStyle.transform.push({
          translateY: scrollOffset.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-0.75, 0, 0]
          })
        })  
      }
    }
    const overlayColour = this.getOverlayColor()
    const isIPad = isIpad()
    const outerViewStyle = {
      width: this.screenWidth,
      height: !isFullBleed ? 'auto' : 
        isPortrait || isIpad() ? this.screenHeight * 1.2 : this.screenHeight * 1.4,
      paddingTop: showCoverImage && isCoverInline ? 
        0 : 
        showCoverImage ? 
          getTopBarHeight() + this.screenHeight * 0.2 :
          getTopBarHeight(),
      paddingHorizontal: isPortrait ? 0 : 
        isIpad() ? getMargin() : getMargin() * 2, // make space for notch
      paddingBottom: isCoverInline || !showCoverImage ? 
        0 : 
        isPortrait || isIpad() ? 100 : 0, // looks weird, but means that landscape iPhone doesn't make space fot the buttons
      marginTop: 0,
      marginBottom: !showCoverImage || isCoverInline ? 0 : -this.screenHeight * 0.2,
      top: !showCoverImage || isCoverInline ? 0 : -this.screenHeight * 0.2,
      left: 0,
      flexDirection: 'column',
      backgroundColor: !showCoverImage || isCoverInline ?
        // hslString(item.styles?.coverImage?.color, coverImageColorPalette) :
        // 'white' :
        (styles.bg ? this.props.color || 'black' : 'transparent') :
        overlayColour,
      opacity: isCoverInline || !showCoverImage ?
        1 :
        opacity
    }

    // full screen cover + landscape = author and date go below the line

    let shadowStyle = showCoverImage && styles.hasShadow ? {
      textShadowColor: 'rgba(0,0,0,0.1)',
      // textShadowOffset: { width: shadow, height: shadow }
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 10
    } : {}

    const invertedTitleStyle = {
      color: showCoverImage ?
        (styles.isMonochrome ? 'black' : 'white') :
        color,
      paddingLeft: 2,
      paddingRight: 2,
      marginTop: 1,
      top: this.props.font === 'headerFontSans1' ? 3 : 0
    }

    const invertedTitleWrapperStyle = {
      backgroundColor: showCoverImage ?
        (styles.isMonochrome ? 'white' : this.getForegroundColor()) :
        'transparent',
      marginBottom: (isFullBleed && styles.invertedBGMargin || 0) * 3
    }

    this.justifiers = {
      'top': 'flex-start',
      'middle': 'center',
      'bottom': 'flex-end',
      'top-bottom': 'space-between'
    }
    this.aligners = {
      'left': 'flex-start',
      'center': 'center'
    }

    const words = this.displayTitle.split(' ')
    let wordStyles = null
    if (styles.interStyled) {
      wordStyles = styles.interBolded.map(isAlternateStyle => {
        const fontFamily = this.getFontFamily(null, isAlternateStyle ?
          'alternate' :
          null)
        return {
          fontFamily,
          fontSize,
          // a nasty hack to handle letters getting cut off
          height: lineHeight * 1.2,
          lineHeight
        }
      })
    } else if (styles.interBolded) {
      wordStyles = styles.interBolded.map(isBold => {
        const fontFamily = this.getFontFamily(isBold ? 'bold' :
          (styles.isItalic ? 'regularItalic' : 'regular'))
        return {
          fontFamily,
          fontSize,
          height: lineHeight * 1.2,
          lineHeight
        }
      })
    } else {
      if (this.props.styles.isUpperCase) {
        // check for small caps in font
        this.renderedTitle = this.getRenderedTitle(this.decodedTitle.toLocaleUpperCase())
      }
      // if (this.props.showCoverImage && this.props.styles.isVertical) {
      //   this.renderedTitle = this.getRenderedTitle(this.decodedTitle.replace(/ /g, '\n'))
      // }
    }

    if (this.shouldSplitIntoWords()) {
      this.renderedTitle = words.map((word, index) => {
        if (styles.invertBG) {
          return (
            <View
              key={index}
              overflow="visible"
              style={{
                ...invertedTitleWrapperStyle
              }}
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
          </View>)
        } else {
          return (
            <Animated.Text
              maxFontSizeMultiplier={1.2}
              key={index}
              style={{
                ...fontStyle,
                ...(wordStyles && wordStyles[index]),
                ...shadowStyle,
                // not sure why I set this extra height, gonna try removing it 24/01/2024
                // height: lineHeight * 1.3
              }}
            >{word} </Animated.Text>)
        }
      })
    }

    const shouldShowExcerpt = () => this.props.item.excerpt !== null &&
      this.props.item.excerpt !== undefined &&
      this.props.item.excerpt.length > 0 &&
      !this.props.item.excerpt.includes('ellip') &&
      !this.props.item.excerpt.includes('…')

    const isAuthorDateBelowFold = showCoverImage && !isPortrait && isCoverInline

    const barView = this.renderBar(barAnimation)
    const excerptView = this.props.excerpt
      ? this.renderExcerpt(innerViewStyle, fontStyle, shadowStyle, barView, excerptAnimation)
      : null
    const dateView = this.renderDate(dateAnimation)
    const authorView = this.renderAuthor(authorAnimation)

      return (
        <Animated.View 
          onLayout={event => this.onLayout(event.nativeEvent.layout.height +
            event.nativeEvent.layout.y)}
          pointerEvents='box-none'
          ref={(view) => { this.outerView = view }}
          style={{
            ...outerViewStyle,
            justifyContent: showCoverImage ? this.justifiers[styles.valign] : 'flex-start',
            alignItems: styles.textAlign == 'center' ? 'center' : 'flex-start',
            flex: showCoverImage && !isCoverInline ? 0 : 1
          }}
        >
          <Animated.View
            style={{
              ...innerViewStyle,
              flex: showCoverImage && !isCoverInline ? 0 : 1,
              marginLeft: styles.invertBG ? this.horizontalMargin - invertedTitleStyle.paddingLeft : this.horizontalMargin,
              justifyContent: this.aligners[styles.textAlign],
              // height: 'auto',
            }}
            ref={(view) => { this.innerView = view }}
          >
            {typeof(this.renderedTitle) === 'object' && this.renderedTitle}
            {(typeof(this.renderedTitle) === 'string' && this.originalTitle.length > 0) &&
              <Animated.Text style={{
                ...fontStyle,
                ...shadowStyle,
                marginBottom: 0, //this.props.styles.isUpperCase ? fontSize * -0.3 : 0,
                // ensure top of apostrophes, quotes and i dots are not cut off
                paddingTop: typeof fontStyle.padding === 'number' ? 
                  fontStyle.paddingTop + 10 : 10,
                marginTop: -10
              }}>
                <Animated.Text>{this.renderedTitle}</Animated.Text>
              </Animated.Text>
            }
          </Animated.View>
          { shouldShowExcerpt() &&
            excerptView }
          <View style={{ 
            flex: 0,
            marginTop: shouldShowExcerpt() ? 0 : getMargin()
          }}>
            { authorView }
            { dateView }
          </View>
          { this.props.displayMode === ItemType.saved && 
          <Animated.View style={{
            ...this.props.addAnimation({
              transform: [{
                translateY: scrollOffset.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [0, 0, 0]
                })
              }]
            }, categoriesAnimation, this.props.isVisible),
            marginBottom: getMargin(),
            marginLeft: this.horizontalMargin,
          }}>
            <CategoryToggles 
              isWhite={isFullBleed || styles.bg}
              item={item} /> 
          </Animated.View>
          }
          {(!showCoverImage && this.itemStartsWithImage()) ||
            (showCoverImage &&
              this.props.item.excerpt !== null &&
              this.props.item.excerpt !== undefined &&
              this.props.item.excerpt.length > 0 &&
              styles.excerptInvertBG) ||
            (showCoverImage && item.styles?.coverImage?.resizeMode === 'contain') ||
            (showCoverImage && !this.props.isPortrait) ||
            (!isFullBleed && styles.bg) ||
            barView
          }
        </Animated.View>
      )  
  }

  shouldSplitIntoWords () {
    return this.originalTitle.length > 0 &&
      (this.props.styles.interBolded || this.props.styles.invertBG)
  }

  renderBar (anim) {
    let style = this.props.anims ? this.props.addAnimation({}, anim, this.props.isVisible) : {}
    return <Animated.View style={{
      ...style,
      marginLeft: this.props.styles.textAlign === 'center' ? 0 : this.horizontalMargin
    }}>
      <Bar item={this.props.item} />
    </Animated.View>
  }

  getExcerptFontSize () {
    return Math.round(this.getExcerptLineHeight() / 1.4)
  }

  getExcerptLineHeight () {
    let excerptLineHeight = Math.round(Math.min(this.screenHeight, this.screenWidth) / 16)
    if (excerptLineHeight > 32) excerptLineHeight = 32
    return excerptLineHeight// * fontSizeMultiplier()
  }

  getExcerptColor () {
    const { showCoverImage, isCoverInline, item, styles } = this.props
    let excerptColor
    if (!styles.bg && (!showCoverImage || isCoverInline || item.styles?.coverImage?.isContain)) {
      excerptColor = this.props.isDarkMode ? textColorDarkMode : textColor
    // } else if (styles.invertBG) {
    //   excerptColor = 'black'
    } else if (showCoverImage && styles.isExcerptTone) {
      excerptColor = styles.isCoverImageColorDarker ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
    } else {
      excerptColor = 'white'
    }
    return excerptColor
  }

  // barView gets passed in here because we need to include it in the excerptView
  // when using an coverImage with contain, for the flex layout
  renderExcerpt (innerViewStyle, fontStyle, shadowStyle, barView, anim) {
    const { excerpt, isCoverInline, item, scrollOffset, showCoverImage, styles } = this.props
    let excerptShadowStyle
    let excerptColor = this.getExcerptColor()
    const isFullBleed = showCoverImage && !isCoverInline

    let excerptBg = {}
    if (showCoverImage && !isCoverInline) {
      excerptBg = (styles.excerptInvertBG || styles.bg) ? {
        backgroundColor: styles.bg ?
          'rgba(255,255,255,0.95)' :
          this.getForegroundColor(),
        paddingLeft: getMargin() / 2,
        paddingRight: getMargin() / 2,
        paddingTop: getMargin() / 2,
        paddingBottom: getMargin() / 2,
        marginBottom: this.getExcerptLineHeight()
      } : {}
      excerptColor = styles.excerptInvertBG || item.styles?.coverImage?.isContain ?
        'white' :
        this.getExcerptColor()
      excerptShadowStyle = styles.excerptInvertBG ? {
        textShadowColor: 'transparent'
      }: {}
      if (styles.bg) excerptColor = 'black'
    }

    // const excerptColor = styles.bg ?
    //   (styles.isMonochrome ? 'black' : hslString(styles.color)) :
    //   (showCoverImage ? 'white' : 'black')
    // const excerptLineHeight = styles.lineHeight > 60 ?
    //   Math.round(styles.lineHeight / 3) :
    //     (styles.lineHeight > 36 ?
    //     Math.round(styles.lineHeight / 2) :
    //     Math.round(styles.lineHeight / 1.5))

    const fixPadding = styles.invertBG ?
      { paddingLeft: 0 } :
      {}

    const excerptFontSize = this.getExcerptFontSize()
    const excerptLineHeight = excerptFontSize * 1.4

    let style = {
      ...innerViewStyle,
      transform: [], // this is to erase the transform from the innerViewStyle
      borderWidth: 0,
      paddingTop: !isCoverInline &&
        (styles.borderWidth || styles.bg) ?
          excerptLineHeight / 2 :
          0,
      paddingBottom: !showCoverImage ?
          excerptLineHeight :
        (styles.borderWidth || styles.bg) ?
          excerptLineHeight / 2 :
          excerptLineHeight,
      ...excerptBg,
      paddingLeft: isFullBleed && (styles.excerptInvertBG || styles.bg) ? getMargin() / 2 : 0,
      // borderTopWidth: styles.borderWidth,
      // opacity: anim,
      marginTop: styles.bg && !styles.borderWidth ? 1 : 0,
      width: (excerpt.length > 70) && (!showCoverImage || styles.excerptFullWidth || excerpt.length > 100) ?
        'auto' : 'auto',
        // this.screenWidth * 0.666,
      alignSelf: {
        'left': 'flex-start',
        'center': 'center',
        'right': 'flex-end'
      }[styles.excerptHorizontalAlign],
    }
    style = this.props.addAnimation(style, anim, this.props.isVisible)

    if (!isCoverInline) {
      style.transform.push({
        translateY: scrollOffset.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-0.5, 0, 0]
        })
      })  
    }

    const borderBar = <Animated.View style={{
      width: this.screenWidth * 0.666,
      height: 1,
      backgroundColor: this.getExcerptColor(),
      alignSelf: 'center',
      marginBottom: excerptLineHeight * 0.5
    }} />

    return (
      <View style={{ 
        flex: 0,
        flexDirection: 'row',
        justifyContent: showCoverImage ? this.justifiers[styles.valign] : 'flex-start',
        alignItems: styles.textAlign == 'center' ? 'center' : 'flex-start',
      }}>
        <Animated.View style={style}>
          <Animated.Text
            maxFontSizeMultiplier={1.2}
            style={{
              justifyContent: this.aligners[styles.textAlign],
              // flex: 1,
              ...fontStyle,
              // ...shadowStyle,
              ...excerptShadowStyle,
              ...fixPadding,
              // again, why the -3?
              marginLeft: -3,
              marginTop: 0,
              paddingTop: 0,
              // textShadowColor: 'rgba(0,0,0,0.4)',
              // textShadowRadius: 20,
              color: excerptColor,
              fontFamily: this.getFontFamily(isCoverInline ||
                item.styles?.coverImage?.resizeMode === 'contain' ||
                excerptBg.backgroundColor ||
                !showCoverImage ?
                'regular' :
                'boldItalic', 'excerpt'),
              fontSize: excerptFontSize,
              lineHeight: Math.round(this.getExcerptFontSize() * 1.4),
              letterSpacing: 0
          }}>{this.props.excerpt}</Animated.Text>
        </Animated.View>
        { showCoverImage &&
          !styles.excerptInvertBG &&
          item.styles?.coverImage?.resizeMode === 'contain' &&
          barView }
      </View>)
  }

  // for the author, date, tags
  getMetaColor () {
    const { isCoverInline, isDarkMode, showCoverImage, styles } = this.props
    return styles.bg || (showCoverImage && !isCoverInline) ?
      'white' :
      isDarkMode ?
        textColorDarkMode :
        this.getForegroundColor()
  }

  renderAuthor (anim) {
    const { isCoverInline, item, scrollOffset, showCoverImage, styles } = this.props
    let authorStyle = {
      color: this.getMetaColor(),
      backgroundColor: 'transparent',
      fontSize: this.getExcerptFontSize(),
      fontFamily: this.getFontFamily('bold', 'author'),
      lineHeight: this.getExcerptFontSize() * 1.1,
      textAlign: styles.textAlign,
      // no idea why I need this -3
      marginLeft: getMargin() - 3,
      paddingRight: getMargin(),
      marginBottom: getMargin() / 2,
      // padding: 0,
      width: this.screenWidth
    }
    if (this.props.anims) {
      authorStyle = this.props.addAnimation(authorStyle, anim, this.props.isVisible)
      if (!isCoverInline) {
        authorStyle.transform.push({
          translateY: scrollOffset.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-0.25, 0, 0]
          })
        })  
      }
    }
    if (item.author) {
      return (
        <Animated.Text
          maxFontSizeMultiplier={1.2}
          style={authorStyle}
        >{entities.decodeHTML(this.props.item.author).trim()}</Animated.Text>
      )
    } else {
      return null
    }
  }

  renderDate (anim) {
    const { item, date, isCoverInline, scrollOffset, showCoverImage, styles } = this.props
    const isFullBleed = showCoverImage && !isCoverInline
    let dateStyle = {
      color: this.getMetaColor(),
      backgroundColor: 'transparent',
      fontSize: this.getExcerptFontSize() * 0.8,
      fontFamily: this.getFontFamily('regular', 'author'),
      lineHeight: this.getExcerptFontSize(),
      textAlign: styles.textAlign,
      // again, no idea why I need the -3
      paddingLeft: getMargin() - 3,
      paddingRight: this.horizontalMargin,
      marginTop: -getMargin() / 4,
      marginBottom: getMargin() * 2,
      padding: 0,
      width: this.screenWidth,
      // ...shadowStyle
    }

    // if (showCoverImage && !item.styles?.coverImage?.isInline) {
    //   dateStyle.position = 'absolute'
    //   dateStyle.top = this.screenHeight * (hasNotchOrIsland() ? 0.11 : 0.08) // heuristic
    // }

    // if (showCoverImage && !item.styles?.coverImage?.isInline && styles.valign !== 'middle') {
    //   dateStyle.transform = [
    //     {translateY: 150},
    //     {translateX: (this.screenWidth / 2) - 20},
    //     {rotateZ: '90deg'}
    //   ]
    //   dateStyle.top = this.screenHeight * (styles.valign !== 'top' ? 0.15 : 0.5) // heuristic
    // }
    if (this.props.anims) {
      dateStyle = this.props.addAnimation(dateStyle, anim, this.props.isVisible)
      if (!isCoverInline) {
        dateStyle.transform.push({
          translateY: scrollOffset.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-0.25, 0, 0]
          })
        })  
      }
    }

    // TODO this is feedwrangler... fix it
    const theDate = (typeof date === 'number') ? date : date
    const momentDate = moment(theDate)
    let showYear = (momentDate.year() !== moment().year())
    const showTime = Date.now() - theDate < 1000 * 60 * 60 * 24 * 30
    const formattedDate = momentDate
      .format('MMM. D' + (showYear ? ' YYYY' : ''))
    const formattedTime = momentDate.format('h:mma')
    const showToday = momentDate.dayOfYear() === moment().dayOfYear() &&
      (momentDate.year() === moment().year())
    return (
      <Animated.Text
        maxFontSizeMultiplier={1.2}
        style={dateStyle}
      >{`${(showToday ? 'Today' : formattedDate)}${ showTime ? `, ${formattedTime}`: ''}`}</Animated.Text>
    )
  }

  itemStartsWithImage () {
    const item = this.props.item
    // weird problem with content_html being undefined...
    const html = item.showMercuryContent ? item.content_mercury : (item.content_html || '')
    const stripped = html.replace(/<(p|div|span|a).*?>/g, '').trim()
    return stripped.startsWith('<img') ||
      stripped.startsWith('Image<img') || // NYTimes oddity
      stripped.startsWith('<figure') ||
      stripped.startsWith('<iframe')
  }

  getOverlayColor () {
    const { showCoverImage, item, styles } = this.props
    if (!showCoverImage ||
      // styles.invertBG ||
      // styles.bg ||
      // (item.styles?.coverImage?.resizeMode === 'contain' && item.styles?.coverImage?.isMultiply) ||
      // (item.styles?.coverImage?.resizeMode === 'contain' && item.styles?.coverImage?.isScreen))
      item.styles?.coverImage?.resizeMode === 'contain') {
      return 'transparent'
    } else if (item.styles?.coverImage?.resizeMode === 'contain' && !item.styles?.coverImage?.isMultiply) {
      return 'rgba(255,255,255,0.2)'
    } else if (!styles.isMonochrome) {
      return 'rgba(240, 240, 240, 0.6)'
    } else if (item.styles?.coverImage?.isBW ||
      item.styles?.coverImage?.isMultiply ||
      item.styles?.coverImage?.isScreen) {
      return 'rgba(0,0,0,0.4)'
    } else if (item.styles.title.bg) {
      return 'rgba(0,0,0,0.4)'
    } else {
      return 'rgba(0,0,0,0.6)'
    }
  }

  fixWidowIfNecessary (text) {
    return this.needsWidowFix(text) ? this.widowFix(text) : text
  }

  needsWidowFix (text) {
    const words = text.split(' ')
    return words.length > 7 &&
      words[words.length - 1].length < 5 &&
      words[words.length - 2].length < 5
  }

  widowFix (text) {
    return text && text.replace(/\s([^\s<]+)\s*$/,'\u00A0$1')
  }

  getAnimationValues () {
    const { anims, isCoverInline, scrollOffset, showCoverImage } = this.props
    if (!showCoverImage || isCoverInline) {
      return {
        opacity: Animated.add(scrollOffset.interpolate({
            inputRange: [-50, 0, 500],
            outputRange: [1, 1, 0]
          }), anims[0].interpolate({
            inputRange: [0, 1.2, 1.8, 2],
            outputRange: [1, 1, 0, 0]
          })),
        titleAnimation: anims[1],
        excerptAnimation: anims[2],
        authorAnimation: anims[3],
        dateAnimation: anims[3], 
        categoriesAnimation: anims[4],
        barAnimation: anims[5],
        shadow: scrollOffset.interpolate({
            inputRange: [-100, -20, 0, 40, 400],
            outputRange: [1, 1, 1, 1, 0]
          })
      }
    }
    return {
      opacity: Animated.add(scrollOffset.interpolate({
          inputRange: [-50, -10, 0, 100, 200],
          outputRange: [0, 1, 1, 1, 0]
        }), anims[0].interpolate({
          inputRange: [0, 1, 1.3, 2],
          outputRange: [1, 1, 0, 0]
        })),
      titleAnimation: anims[1],
      excerptAnimation: anims[2],
      authorAnimation: anims[3],
      dateAnimation: anims[3],
      categoriesAnimation: anims[4],
      barAnimation: anims[5],
      shadow: scrollOffset.interpolate({
          inputRange: [-100, -20, 0, 40, 200],
          outputRange: [0, 1, 1, 1, 0]
        })
    }
  }

}

export default ItemTitle
