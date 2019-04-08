import React from 'react'
import {Animated, Dimensions, Text, View, WebView} from 'react-native'
import {BlurView} from 'react-native-blur'
import MeasureText from 'react-native-measure-text'
import moment from 'moment'
import quote from 'headline-quotes'

import {hslString} from '../utils/colors'
import {isIphoneX} from '../utils'
import {getTopBarHeight} from './TopBar'

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
      fontFamily: 'IBMPlexSansCond-Bold'
    },
    boldItalic: {
      fontFamily: 'IBMPlexSansCond-BoldItalic'
    },
    regular: {
      fontFamily: 'IBMPlexSansCond-ExtraLight'
    },
    regularItalic: {
      fontFamily: 'IBMPlexSansCond-ExtraLightItalic'
    }
  },
  headerFontSans2: {
    bold: {
      fontFamily: 'Montserrat-Bold'
    },
    boldItalic: {
      fontFamily: 'Montserrat-BoldItalic'
    },
    regular: {
      fontFamily: 'Montserrat-Light'
    },
    regularItalic: {
      fontFamily: 'Montserrat-LightItalic'
    }
  },
  headerFontSans3: {
    bold: {
      fontFamily: 'Futura-CondensedExtraBold'
    },
    boldItalic: {
      fontFamily: 'Futura-CondensedExtraBold'
    },
    regular: {
      fontFamily: 'Futura-Medium'
    },
    regularItalic: {
      fontFamily: 'Futura-MediumItalic'
    }
  }
}

const paddingUnit = 28

const textColor = 'black'
const textColorDarkBackground = 'hsl(0, 0%, 70%)'

class ItemTitle extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    const window = Dimensions.get('window')
    this.screenWidth = window.width
    this.screenHeight = window.height

    this.fadeInAnim = new Animated.Value(-1)
    this.fadeInAnim2 = new Animated.Value(-1)
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

  async getMaxFontSize () {
    let { styles } = this.props
    const that = this
    let maxSize
    const longestWord = this.getLongestWord()
    let sizes = []
    const absMax = 100
    let i = absMax
    while (i > 20) {
      sizes.push(i--)
    }

    return Promise.all(sizes.map((size) => MeasureText.widths({
        texts: [styles.isUpperCase ? longestWord.toLocaleUpperCase() : longestWord],
        fontSize: size,
        fontFamily: this.getFontFamily(),
        width: 1000
    }))).then((values) => {
      values = values.map((v, i) => {
        return {
          width: v[0],
          size: absMax - i
        }
      })
      for (var i = 0; i < values.length; i++) {
        if (values[i].width < that.getInnerWidth(values[i].size, styles.isItalic)) {
          return values[i].size
        }
      }
      return null
    }).then(maxSize => maxSize > 50 ? 50 : maxSize)

  }

  getInnerVerticalPadding (fontSize) {
    if (this.props.styles.showCoverImage && this.props.styles.bg) {
      return this.getInnerHorizontalMargin()
    }
    const {styles} = this.props
    const lineHeight = fontSize ? fontSize * styles.lineHeightAsMultiplier : styles.lineHeight
    return lineHeight > 60 ?
      Math.round(lineHeight / 4) :
      Math.round(lineHeight / 2)
  }

  // NB returns an object, {paddingTop, paddingBottom}
  getOuterVerticalPadding () {
    let paddingTop, paddingBottom
    const {showCoverImage, coverImageStyles, styles} = this.props
    const verticalPadding = 85
    paddingTop = isIphoneX() ?
      verticalPadding * 1.25 + this.screenHeight * 0.1 :
      verticalPadding + this.screenHeight * 0.1
    paddingBottom = verticalPadding + this.screenHeight * 0.1

    if (!showCoverImage) {
      paddingBottom = 0
    } else if (coverImageStyles.isInline) {
      paddingTop = Math.round(styles.lineHeight / 2)
      paddingBottom = 0
    }
    return {
      paddingTop,
      paddingBottom
    }
  }

  getInnerHorizontalPadding (fontSize) {
    if (!this.props.showCoverImage) {
      return 0
      // return this.screenWidth * 0.05
    }
    if (this.props.styles.bg) {
      return this.screenWidth * 0.025
    }
    const {styles} = this.props
    const relativePadding = this.getInnerVerticalPadding(fontSize || styles.fontSize)
    if (styles.bg || styles.textAlign === 'center' && styles.valign === 'middle') {
      return relativePadding
    } else {
      return 0
    }
  }

  getInnerHorizontalMargin () {
    if (this.props.styles.bg) {
      return this.screenWidth * 0.025
    }
    return !this.props.showCoverImage ?
      0 :
      (this.props.coverImageStyles.isInline ?
        this.screenWidth * 0.025 :
        this.screenWidth * 0.05) // allow space for date
  }

  getInnerWidth (fontSize, isItalic) {
    return Math.min(this.screenWidth, this.screenHeight) -
      this.getInnerHorizontalPadding(fontSize) * 2 -
      this.getInnerHorizontalMargin(fontSize) * 2 -
      (isItalic ? fontSize * 0.1 : 0)
  }

  async componentDidMount () {
    this.componentDidUpdate()
  }

  async componentDidUpdate () {
    const {styles, coverImageStyles, textAlign} = this.props

    if (styles.fontResized) return

    // first get max font size
    const maxFontSize = await this.getMaxFontSize()
    // console.log(`MAX FONT SIZE (${this.displayTitle}): ${maxFontSize}`)

    let sizes = []
    let i = maxFontSize
    while (i > 20) {
      sizes.push(i--)
    }

    Promise.all(sizes.map((size) => MeasureText.heights({
        texts: [styles.isUpperCase ? this.displayTitle.toLocaleUpperCase() : this.displayTitle],
        width: this.getInnerWidth(size, styles.isItalic),
        fontSize: size,
        fontFamily: this.getFontFamily()
    }))).then((values) => {
      values = values.map((v, i) => {
        const size = maxFontSize - i
        return {
          height: v[0],
          size,
          numLines: Math.floor(v[0] / size)
        }
      })

      // console.log(this.displayTitle)
      // console.log(values)
      const maxHeight = this.screenHeight / 2
      // now go through them and find the first one that
      // (a) is less than 50% screen height
      values = values.filter(v => v.height < maxHeight)
      const maxViable = values[0]
      let optimal
      // console.log(`MAX VIABLE FONT SIZE (${this.displayTitle}): ${maxViable}`)

      // (b) jumps down a line
      const initialNumLines = values[0].numLines
      let downALine = values.find((v, i) => {
        return values[i - 1] &&
          v.numLines < values[i - 1].numLines /*&&
          v.numLines < 7*/
      })
      optimal = downALine || maxViable

      // (c) if we go down to 4 lines, is the fontSize > 42?
      let fourLines = values.find(v => v.numLines === 4)
      if (fourLines && fourLines.size && fourLines.size > optimal && fourLines.size > 42) {
        optimal = fourLines
      }

      // was maxViable actually four lines or less?
      if (values[0].numLines <= 4) optimal = maxViable

      // this avoids shrinking the font size too much
      if (maxViable / optimal > 2) optimal = maxViable

      if (maxViable < 42) optimal = maxViable

      // this is a bit sketchy...
      if (styles.invertBG) optimal.size = Math.round(optimal.size * 0.9)

      // TODO - need to account for interbolding, which need to move to createItemStyles

      // TODO letter spacing...
      // at fontsize 50, letterspacing of n means fontsize-2n
      // "This value specifies the number of points by which to adjust kern-pair characters"
      // https://developer.apple.com/documentation/uikit/nskernattributename

      // often out by 1...
      optimal.size--

      // console.log(`OPTIMAL FONT SIZE (${this.displayTitle}): ${optimal}`)
      this.props.updateFontSize(this.props.item, optimal.size)
      this.titleHeight = optimal.height
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
    const {font, styles, item} = this.props
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

  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps !== this.props || nextState !== this.state
  // }

  render () {
    let {styles, title, date, showCoverImage, coverImageStyles, isVisible} = this.props

    // just so we can render something before it's been calculated
    const fontSize = styles.fontSize || 16
    let lineHeight = Math.floor(fontSize * styles.lineHeightAsMultiplier)
    if (lineHeight < fontSize) lineHeight = fontSize

    // this means the item hasn't been inflated from Firebase yet
    if (!styles) return null

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

    const {opacity, excerptOpacity, shadow} = this.getOpacityValues()
    const toValue = coverImageStyles.isVisible ? 1 : 0

    if (isVisible && showCoverImage) {
      Animated.stagger(250, [
        Animated.timing(this.fadeInAnim, {
          toValue,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(this.fadeInAnim2, {
          toValue,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start()
    } else if (showCoverImage) {
      Animated.timing(this.fadeInAnim2, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }

    const coverImageColorPalette = coverImageStyles.isCoverImageColorDarker ?
      'lighter' :
      (coverImageStyles.isCoverImageColorLighter ?
        'darker' :
        '')

    let color = styles.isMonochrome ?
      ((showCoverImage && !styles.bg) ?
        'white' :
        'black') :
      (styles.isTone ?
        (this.props.item.styles.isCoverImageColorDarker ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)') :
        hslString(this.props.item.feed_color, 'desaturated'))
    if (coverImageStyles.isInline || coverImageStyles.resizeMode === 'contain') color = hslString(this.props.item.feed_color, 'desaturated')
    if (!showCoverImage) color = this.props.isDarkBackground ? 'hsl(0, 0%, 70%)' : 'black'

    const invertBGPadding = 3
    let paddingTop = this.shouldSplitIntoWords() ? invertBGPadding : 0
    const paddingBottom = this.shouldSplitIntoWords() ? invertBGPadding : 0
    let paddingLeft = showCoverImage && styles.invertBG ? invertBGPadding : 0
    if (styles.isItalic) {
      paddingLeft += fontSize * 0.1
    }

    // https://github.com/facebook/react-native/issues/7687
    // (9 is a heuristic value)
    const extraPadding = fontSize / 9
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
      marginTop,
      overflow: 'visible'
    }
    const viewStyle = {
      ...position
    }

    // const borderWidth = styles.invertBG ? 0 : styles.borderWidth
    const borderWidth = 0
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
    if (!showCoverImage || coverImageStyles.isInline) border = {}

    const innerPadding = this.getInnerVerticalPadding(fontSize)

    // if center aligned and not full width, add left margin
    const defaultHorizontalMargin = this.getInnerHorizontalMargin()
    const widthPercentage = styles.widthPercentage || 100
    this.horizontalMargin = (showCoverImage && this.props.coverImageStyles.isInline) ?
        this.screenWidth * 0.025 :
        this.screenWidth * 0.05
    const width = (this.screenWidth - this.horizontalMargin * 2) * widthPercentage / 100

    const horizontalPadding = this.getInnerHorizontalPadding(fontSize)

    const innerViewStyle = {
      // horizontalMargin: styles.bg ? 28 + horizontalMargin : horizontalMargin,
      // marginRight:  styles.bg ? 28  + horizontalMargin : horizontalMargin,
      marginLeft: this.horizontalMargin, //defaultHorizontalMargin,
      marginRight:  this.horizontalMargin, //defaultHorizontalMargin,
      marginBottom: 0,
      marginTop: this.horizontalMargin,
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      paddingBottom: (!showCoverImage || coverImageStyles.isInline) ?
        this.screenWidth * 0.05 :
        ((styles.bg || styles.textAlign === 'center' || styles.borderWidth || coverImageStyles.isInline) ?
          innerPadding :
          lineHeight),
      paddingTop: innerPadding + borderWidth,
      backgroundColor: showCoverImage && styles.bg ?  'rgba(255,255,255,0.95)' : 'transparent',
      height: 'auto',
      overflow: 'visible',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      width,
      ...border,
      borderColor: color,
      // opacity: coverImageStyles.isInline ? opacity : 1
    }
    const overlayColour = this.getOverlayColor()
    const outerPadding = this.getOuterVerticalPadding()
    const outerViewStyle = {
      width: this.screenWidth,
      height: !showCoverImage || coverImageStyles.isInline ? 'auto' : this.screenHeight/* * 1.2*/,
      // height: 'auto',
      // position: 'absolute',
      // paddingTop: coverImageStyles.isInline ? 0 : outerPadding.paddingTop,
      paddingTop: coverImageStyles.isInline ? 0 : getTopBarHeight(),
      // paddingTop: 100,
      paddingBottom: coverImageStyles.isInline || !showCoverImage ? 0 : 100,
      marginTop: (!this.props.showCoverImage) ? 0 : 0,
      marginBottom: 0,
      top: 0,
      left: 0,
      flexDirection: 'column',
      backgroundColor: !showCoverImage || coverImageStyles.isInline ?
        // hslString(coverImageStyles.color, coverImageColorPalette) :
        // 'white' :
        (this.props.isDarkBackground ? hslString('bodyBGDark') : hslString('bodyBGLight')) :
        overlayColour,
      opacity: (coverImageStyles.isInline || !showCoverImage) ? 1 : opacity
    }
    let textStyle = {
      ...fontStyle,
      // ...viewStyle
    }


    // TODO: if I decide that images with contain need shadow, change createItemStyles:86
    let shadowStyle = showCoverImage && styles.hasShadow ? {
      textShadowColor: 'rgba(0,0,0,0.1)',
      // textShadowOffset: { width: shadow, height: shadow }
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 10
    } : {}

    textStyle = {
      ...fontStyle,
      ...shadowStyle
    }

    const invertedTitleStyle = {
      color: showCoverImage ?
        (styles.isMonochrome ? 'black' : 'white') :
        color,
      paddingLeft: 2,
      paddingRight: 2
    }

    const invertedTitleWrapperStyle = {
      backgroundColor: showCoverImage ?
        (styles.isMonochrome ? 'white' : hslString(this.props.item.feed_color, 'desaturated')) :
        'transparent'
    }

    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    const justifiers = {
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
      if (this.props.showCoverImage && this.props.styles.isVertical) {
        this.renderedTitle = this.getRenderedTitle(this.decodedTitle.replace(/ /g, '\n'))
      }
    }

    if (this.shouldSplitIntoWords()) {
      this.renderedTitle = words.map((word, index) => {
        if (styles.invertBG) {
          return (<View key={index} style={{
            ...invertedTitleWrapperStyle
          }}><Text style={{
            ...fontStyle,
            ...(wordStyles && wordStyles[index]),
            ...invertedTitleStyle,
            height: lineHeight + paddingTop + paddingBottom
          }}>{word} </Text>
          </View>)
        } else {
          return (<Animated.Text key={index} style={{
            ...fontStyle,
            ...(wordStyles && wordStyles[index]),
            ...shadowStyle
          }}>{word} </Animated.Text>)
        }
      })
    }

    const barView = this.renderBar()
    const excerptView = this.renderExcerpt(innerViewStyle, fontStyle, shadowStyle, barView)
    const dateView = this.renderDate()
    const authorView = this.renderAuthor()

    return (
      <Animated.View style={{
        ...outerViewStyle,
        justifyContent: showCoverImage ? justifiers[styles.valign] : 'flex-start',
        alignItems: styles.textAlign == 'center' ? 'center' : 'flex-start'
      }}>
        <Animated.View
          style={{
            ...innerViewStyle,
            justifyContent: this.aligners[styles.textAlign]
          }}
          // onLayout={(event) => {
          //   this.adjustFontSize(event.nativeEvent.layout.height)
          // }}
          ref={(view) => { this.innerView = view }}
        >
          {typeof(this.renderedTitle) === 'object' && this.renderedTitle}
          {typeof(this.renderedTitle) === 'string' &&
            <Animated.Text style={{
              ...fontStyle,
              ...shadowStyle,
              marginBottom: this.props.styles.isUpperCase ? fontSize * -0.3 : 0
            }}>
              <Animated.Text>{this.renderedTitle}</Animated.Text>
            </Animated.Text>
          }
        </Animated.View>
        { this.props.item.excerpt &&
          !this.props.item.excerpt.includes('ellip') &&
          !this.props.item.excerpt.includes('…') &&
          excerptView }
        { authorView }
        { dateView }
        {(!showCoverImage && this.itemStartsWithImage()) ||
          (showCoverImage && styles.excerptInvertBG) ||
          (showCoverImage && coverImageStyles.resizeMode === 'contain') ||
          barView
        }
      </Animated.View>
    )
  }

  shouldSplitIntoWords () {
    return this.props.styles.interBolded || this.props.styles.invertBG
  }

  renderBar () {
    return <View style={{
      marginLeft: this.horizontalMargin,
      marginRight: this.horizontalMargin,
      marginTop: this.props.showCoverImage ?
        this.horizontalMargin * 4 :
        0,
      width: 66,
      height: 16,
      backgroundColor: hslString(this.props.item.feed_color, 'desaturated')
    }} />
  }

  // barView gets passed in here because we need to include it in the excerptView
  // when using an coverImage with contain, for the flex layout
  renderExcerpt (innerViewStyle, fontStyle, shadowStyle, barView) {
    const { coverImageStyles, showCoverImage, item, styles } = this.props
    const { excerptOpacity } = this.getOpacityValues()
    let excerptShadowStyle
    let excerptColor
    if (!showCoverImage || coverImageStyles.isInline || coverImageStyles.isContain) {
      excerptColor = this.props.isDarkBackground ? textColorDarkBackground : textColor
    // } else if (styles.invertBG) {
    //   excerptColor = 'black'
    } else if (showCoverImage && styles.isExcerptTone) {
      excerptColor = styles.isCoverImageColorDarker ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
    } else {
      excerptColor = 'white'
    }

    let excerptBg = {}
    if (showCoverImage && !coverImageStyles.isInline) {
      excerptBg = (styles.excerptInvertBG || styles.bg) ? {
        backgroundColor: styles.bg ?
          'rgba(255,255,255,0.95)' :
          hslString(item.feed_color, 'desaturated'),
        paddingLeft: this.screenWidth * 0.025,
        paddingRight: this.screenWidth * 0.025,
        paddingTop: this.screenWidth * 0.025,
        paddingBottom: this.screenWidth * 0.025,
        marginBottom: this.screenWidth * 0.025
      } : {}
      excerptColor = styles.excerptInvertBG || coverImageStyles.isContain ?
        'white' :
        excerptColor
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
    let excerptLineHeight = Math.min(this.screenHeight, this.screenWidth) / 16
    if (excerptLineHeight > 32) excerptLineHeight = 32

    const fixPadding = styles.invertBG ?
      { paddingLeft: 0 } :
      {}

    return (
      <View>
        <Animated.View style={{
          ...innerViewStyle,
          paddingTop: !coverImageStyles.isInline && (styles.borderWidth || styles.bg) ? excerptLineHeight / 2 : 0,
          paddingBottom: !showCoverImage ?
            this.screenWidth * 0.1 :
            ((styles.borderWidth || styles.bg) ?
              excerptLineHeight / 2 :
              this.getInnerVerticalPadding(fontStyle.fontSize)),
          ...excerptBg,
          borderTopWidth: 0,
          // opacity: excerptOpacity,
          marginTop: styles.bg && !styles.borderWidth ? 1 : 0,
          width: (!showCoverImage || styles.excerptFullWidth) ?
            'auto' :
            this.screenWidth * 0.666,
          alignSelf: {
            'left': 'flex-start',
            'center': 'center',
            'right': 'flex-end'
          }[styles.excerptHorizontalAlign]
        }}>
          <Animated.Text style={{
            justifyContent: this.aligners[styles.textAlign],
            flex: 1,
            ...fontStyle,
            // ...shadowStyle,
            ...excerptShadowStyle,
            ...fixPadding,
            marginTop: 0,
            paddingTop: 0,
            // textShadowColor: 'rgba(0,0,0,0.4)',
            // textShadowRadius: 20,
            color: excerptColor,
            fontFamily: this.getFontFamily(coverImageStyles.isInline ||
              coverImageStyles.resizeMode === 'contain' ||
              excerptBg.backgroundColor ||
              !showCoverImage ?
              'regular' :
              'bold', 'excerpt'),
            fontSize: Math.round(excerptLineHeight / 1.4),
            lineHeight: excerptLineHeight,
            letterSpacing: 0
          }}>{this.widowFix(this.props.excerpt)}</Animated.Text>
        </Animated.View>
        { showCoverImage &&
          !styles.excerptInvertBG &&
          coverImageStyles.resizeMode === 'contain' &&
          barView }
      </View>)
  }

  renderAuthor () {
    const { coverImageStyles, date, item, showCoverImage, styles } = this.props
    let authorStyle = {
      color: showCoverImage &&
        !coverImageStyles.isInline ? 'white' :
          (this.props.isDarkBackground ? textColorDarkBackground : textColor),
      backgroundColor: 'transparent',
      fontSize: 18,
      fontFamily: this.getFontFamily('regular', 'author'),
      lineHeight: 24,
      textAlign: styles.textAlign,
      paddingLeft: this.horizontalMargin,
      paddingRight: this.horizontalMargin,
      // marginBottom: (!showCoverImage || coverImageStyles.isInline) ?
      //   this.screenWidth * 0.1 : 18,
      padding: 0,
      width: this.screenWidth,
      // ...shadowStyle
    }
    if (item.author) {
      return <Animated.Text style={authorStyle}>{this.props.item.author}</Animated.Text>
    } else {
      return null
    }
  }

  renderDate () {
    const { coverImageStyles, date, item, showCoverImage, styles } = this.props
    let dateStyle = {
      color: showCoverImage &&
        !coverImageStyles.isInline &&
        !coverImageStyles.isScreen ? 'white' : hslString(item.feed_color, 'desaturated'),
      backgroundColor: 'transparent',
      fontSize: showCoverImage ? 14 : 14,
      fontFamily: 'IBMPlexMono-Light',
      lineHeight: 24,
      textAlign: showCoverImage ? 'center' : styles.textAlign,
      paddingLeft: this.horizontalMargin,
      paddingRight: this.horizontalMargin,
      marginBottom: (!showCoverImage || coverImageStyles.isInline) ?
        this.screenWidth * 0.1 : 18,
      padding: 0,
      width: this.screenWidth,
      // ...shadowStyle
    }

    if (showCoverImage && !coverImageStyles.isInline) {
      dateStyle.position = 'absolute'
      dateStyle.top = this.screenHeight * (styles.valign !== 'top' ? 0.1 : 0.5) // heuristic
    }

    if (showCoverImage && !coverImageStyles.isInline && styles.valign !== 'middle') {
      dateStyle.transform = [
        {translateY: 150},
        {translateX: (this.screenWidth / 2) - 10},
        {rotateZ: '90deg'}
      ]
      dateStyle.top = this.screenHeight * (styles.valign !== 'top' ? 0.15 : 0.5) // heuristic
    }

    // TODO this is feedwrangler... fix it
    const theDate = (typeof date === 'number') ? date * 1000 : date
    let showYear = (moment(theDate).year() !== moment().year())
    const formattedDate = moment(theDate)
      .format('Do MMM' + (showYear ? ' YYYY' : '') + ', h:mm a')

    return dateView = <Animated.Text style={dateStyle}>{formattedDate}</Animated.Text>
  }

  itemStartsWithImage () {
    const item = this.props.item
    const html = item.showMercuryContent ? item.content_mercury : item.content_html
    const stripped = html.replace(/<(p|div|span|a).*?>/g, '').trim()
    return stripped.startsWith('<img') ||
      stripped.startsWith('<figure') ||
      stripped.startsWith('<iframe')
  }

  getOverlayColor () {
    const { showCoverImage, item, styles, coverImageStyles } = this.props
    if (!showCoverImage ||
      // styles.invertBG ||
      // styles.bg ||
      // (coverImageStyles.resizeMode === 'contain' && coverImageStyles.isMultiply) ||
      // (coverImageStyles.resizeMode === 'contain' && coverImageStyles.isScreen))
      coverImageStyles.resizeMode === 'contain') {
      return 'transparent'
    } else if (coverImageStyles.resizeMode === 'contain' && !coverImageStyles.isMultiply) {
      return 'rgba(255,255,255,0.2)'
    } else if (coverImageStyles.isBW ||
      coverImageStyles.isMultiply ||
      coverImageStyles.isScreen) {
      return 'rgba(0,0,0,0.3)'
    } else {
      return 'rgba(0,0,0,0.4)'
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

  getOpacityValues () {
    if (this.props.coverImageStyles.isInline) {
      return {
        opacity: Animated.add(this.props.scrollOffset.interpolate({
            inputRange: [-50, 100, 300],
            outputRange: [1, 1, 0]
          }), this.fadeInAnim),
        excerptOpacity: Animated.add(this.props.scrollOffset.interpolate({
            inputRange: [-50, 300, 500],
            outputRange: [1, 1, 0]
          }), this.fadeInAnim2),
        shadow: this.props.scrollOffset.interpolate({
            inputRange: [-100, -20, 0, 40, 400],
            outputRange: [1, 1, 1, 1, 0]
          })
      }
    }
    return {
      opacity: Animated.add(this.props.scrollOffset.interpolate({
          inputRange: [-50, -25, 0, 100, 200],
          outputRange: [0, 1, 1, 1, 0]
        }), this.fadeInAnim),
      excerptOpacity: Animated.add(this.props.scrollOffset.interpolate({
          inputRange: [-25, 0, 100],
          outputRange: [0, 1, 0]
        }), this.fadeInAnim2),
      shadow: this.props.scrollOffset.interpolate({
          inputRange: [-100, -20, 0, 40, 200],
          outputRange: [0, 1, 1, 1, 0]
        })
    }
  }

}

export default ItemTitle
