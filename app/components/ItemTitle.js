import React from 'react'
import {Animated, Dimensions, Text, View, WebView} from 'react-native'
import {BlurView} from 'react-native-blur'
import MeasureText from 'react-native-measure-text-with-fontfamily'
import moment from 'moment'
import quote from 'headline-quotes'

import {hslString} from '../utils/colors'
import {isIphoneX} from '../utils'

const entities = require('entities')

const fontStyles = {
  headerFontSerif1: {
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
  headerFontSerif2: {
    bold: {
      fontFamily: 'Arvo-Bold'
    },
    boldItalic: {
      fontFamily: 'Arvo-BoldItalic'
    },
    regular: {
      fontFamily: 'Arvo'
    },
    regularItalic: {
      fontFamily: 'Arvo-Italic'
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
      .replace(/<\/i>/ig, '|||/Text||||')
      .replace(/<b>/ig, '|||Text style={bold}||||')
      .replace(/<\/b>/ig, '|||/Text||||')
      .replace('|||', '<')
      .replace('||||', '>')
      .replace('and ', '& ')
      .replace('And ', '& ')
      .replace('AND ', '& ')
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

    return Promise.all(sizes.map((size) => MeasureText.measureSizes({
        texts: [styles.isUpperCase ? longestWord.toLocaleUpperCase() : longestWord],
        fontSize: size,
        fontFamily: this.getFontFamily(),
        width: 1000
    }))).then((values) => {
      values = values.map((v, i) => {
        return {
          width: v[0].width,
          size: absMax - i
        }
      })
      for (var i = 0; i < values.length; i++) {
        if (values[i].width < that.getInnerWidth(values[i].size)) {
          return values[i].size
        }
      }
      return null
    })

  }

  getInnerVerticalPadding (fontSize) {
    if (this.props.styles.bg) {
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
    if (this.props.styles.bg) {
      return this.getInnerHorizontalMargin()
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
    return this.props.coverImageStyles.isInline || !this.props.showCoverImage ?
      this.screenWidth * 0.025 :
      this.screenWidth * 0.05 // allow space for date
  }

  getInnerWidth (fontSize) {
    return Math.min(this.screenWidth, this.screenHeight) -
      this.getInnerHorizontalPadding(fontSize) * 2 -
      this.getInnerHorizontalMargin(fontSize) * 2
  }

  getOuterVerticalMargin () {
    return (!this.props.showCoverImage || this.props.coverImageStyles.isInline) ?
      0 :
      // this.screenHeight * -0.1 (why is this here?)
      0
  }

  async componentDidMount () {
    this.componentDidUpdate()
  }

  async componentDidUpdate () {
    const {styles, coverImageStyles, textAlign} = this.props

    // if (styles.fontResized) return

    // first get max font size
    const maxFontSize = await this.getMaxFontSize()
    // console.log(`MAX FONT SIZE (${this.displayTitle}): ${maxFontSize}`)

    let sizes = []
    let i = maxFontSize
    while (i > 20) {
      sizes.push(i--)
    }

    Promise.all(sizes.map((size) => MeasureText.measureSizes({
        texts: [styles.isUpperCase ? this.displayTitle.toLocaleUpperCase() : this.displayTitle],
        width: this.getInnerWidth(size),
        fontSize: size,
        fontFamily: this.getFontFamily()
    }))).then((values) => {
      values = values.map((v, i) => {
        const size = maxFontSize - i
        return {
          height: v[0].height,
          size,
          numLines: Math.floor(v[0].height / size)
        }
      })

      // console.log(this.displayTitle)
      // console.log(values)
      const maxHeight = this.screenHeight / 1.5
      // now go through them and find the first one that
      // (a) is less than 66% screen height
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

  getFontFamily (fontType) {
    return this.getFontObject(fontType).fontFamily
  }

  getFontObject (fontType) {
    const {font, styles} = this.props

    if (fontType) {

    } else if (styles.isBold && styles.isItalic) {
      fontType = 'boldItalic'
    } else if (styles.isBold) {
      fontType = 'bold'
    } else if (styles.isItalic) {
      fontType = 'regularItalic'
    } else {
      fontType = 'regular'
    }

    return fontStyles[font][fontType]
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps !== this.props || nextState !== this.state
  // }

  render () {
    let {styles, title, date, showCoverImage, coverImageStyles, isVisible} = this.props

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

    if (isVisible) {
      Animated.stagger(500, [
        Animated.timing(this.fadeInAnim, {
          toValue,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(this.fadeInAnim2, {
          toValue,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start()
    }

    const verticalOffset = this.getFontObject().verticalOffset ?
      this.getFontObject().verticalOffset * styles.fontSize :
      0

    let color = styles.isMonochrome ?
      (showCoverImage && !styles.bg ?
        'white' :
        'black') :
      (styles.isTone ?
        (this.props.item.styles.isCoverImageColorDarker ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)') :
      hslString(styles.color))
    if (coverImageStyles.isInline) color = 'black'

    const invertBGPadding = 5
    let paddingTop = styles.invertBG ? (verticalOffset + invertBGPadding) : verticalOffset
    const paddingBottom = styles.invertBG ? 2 : 0
    const paddingLeft = styles.invertBG ? invertBGPadding : 0

    // https://github.com/facebook/react-native/issues/7687
    // (9 is a heuristic value)
    const extraPadding = styles.fontSize / 9
    paddingTop += extraPadding
    const marginTop = 0 - extraPadding

    let fontStyle = {
      fontFamily: this.getFontFamily(),
      color,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      textAlign: styles.textAlign,
      letterSpacing: this.getLetterSpacing(),
      paddingTop,
      paddingBottom,
      paddingLeft,
      marginTop
      // marginBottom: this.props.styles.isUpperCase ? styles.fontSize * -0.3 : 0
    }
    const viewStyle = {
      ...position
    }

    const borderWidth = styles.invertBG ? 0 : styles.borderWidth
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

    const innerPadding = this.getInnerVerticalPadding()

    // if center aligned and not full width, add left margin
    const defaultHorizontalMargin = this.getInnerHorizontalMargin()
    const widthPercentage = styles.widthPercentage || 100
    const width = (this.screenWidth - defaultHorizontalMargin * 2) * widthPercentage / 100
    const horizontalMargin = this.screenWidth * 0.05

    const horizontalPadding = this.getInnerHorizontalPadding()

    const innerViewStyle = {
      // horizontalMargin: styles.bg ? 28 + horizontalMargin : horizontalMargin,
      // marginRight:  styles.bg ? 28  + horizontalMargin : horizontalMargin,
      marginLeft: horizontalMargin,
      marginRight:  horizontalMargin,
      marginBottom: this.getInnerVerticalPadding(styles.fontSize),
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      paddingBottom: styles.bg || styles.textAlign === 'center' || styles.borderWidth || coverImageStyles.isInline ? innerPadding : styles.lineHeight,
      paddingTop: innerPadding + borderWidth,
      backgroundColor: showCoverImage && styles.bg ?  'rgba(255,255,255,0.95)' : 'transparent',
      height: 'auto',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      width,
      ...border,
      borderColor: color,
      opacity: coverImageStyles.isInline ? opacity : 1
    }
    const overlayColour = this.getOverlayColor()
    const outerPadding = this.getOuterVerticalPadding()
    const coverImageColorPalette = coverImageStyles.isCoverImageColorDarker ?
      'darker' :
      (coverImageStyles.isCoverImageColorLighter ?
        'lighter' :
        '')
    const outerViewStyle = {
      width: this.screenWidth,
      height: !showCoverImage || coverImageStyles.isInline ? 'auto' : this.screenHeight * 1.2,
      // height: 'auto',
      // position: 'absolute',
      // paddingTop: coverImageStyles.isInline ? 0 : outerPadding.paddingTop,
      paddingTop: coverImageStyles.isInline ? 0 : 100,
      // paddingTop: 100,
      paddingBottom: outerPadding.paddingBottom,
      marginTop: this.getOuterVerticalMargin(),
      marginBottom: this.getOuterVerticalMargin(),
      top: 0,
      left: 0,
      flexDirection: 'column',
      backgroundColor: !showCoverImage || coverImageStyles.isInline ?
        // hslString(coverImageStyles.color, coverImageColorPalette) :
        // 'white' :
        hslString('bodyBGLight') :
        overlayColour,
      // opacity: coverImageStyles.isInline ? 1 : opacity
    }
    let textStyle = {
      ...fontStyle,
      // ...viewStyle
    }

    let shadowStyle = styles.hasShadow && !styles.bg && !coverImageStyles.isInline ? {
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: shadow, height: shadow }
    } : {}

    textStyle = {
      ...fontStyle,
      ...shadowStyle
    }

    const invertedTitleStyle = {
      color: styles.isMonochrome ? 'black' : 'white',
      paddingLeft: 2,
      paddingRight: 2
    }

    const invertedTitleWrapperStyle = {
      backgroundColor: showCoverImage ?
        (styles.isMonochrome ? 'white' : color) :
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
    const aligners = {
      'left': 'flex-start',
      'center': 'center'
    }

    const words = this.displayTitle.split(' ')
    let wordStyles = null
    if (styles.interBolded) {
      wordStyles = styles.interBolded.map(isBold => {
        const fontFamily = this.getFontFamily(isBold ? 'bold' :
          (styles.isItalic ? 'regularItalic' : 'regular'))
        const fontSize = isBold ? styles.fontSize : styles.fontSize // / 1.333
        return {
          fontFamily,
          fontSize,
          height: fontSize
        }
      })
    } else {
      if (this.props.styles.isUpperCase) {
        // check for small caps in font
        this.renderedTitle = this.getRenderedTitle(this.decodedTitle.toLocaleUpperCase())
      }
      if (this.props.styles.isVertical) {
        this.renderedTitle = this.getRenderedTitle(this.decodedTitle.replace(/ /g, '\n'))
      }
    }

    const shouldSplitIntoWords = () => {
      return styles.interBolded || styles.invertBG
    }

    if (shouldSplitIntoWords()) {
      this.renderedTitle = words.map((word, index) => {
        if (styles.invertBG) {
          return (<View key={index} style={{
            ...invertedTitleWrapperStyle
          }}><Text style={{
            ...fontStyle,
            ...(wordStyles && wordStyles[index]),
            ...invertedTitleStyle,
            height: styles.lineHeight + paddingTop + paddingBottom
          }}>{word} </Text>
          </View>)
        } else {
          return (<Animated.Text key={index} style={{
            ...fontStyle,
            ...(wordStyles && wordStyles[index]),
            ...shadowStyle,
            height: this.fontSize
          }}>{word} </Animated.Text>)
        }
      })
    }

    let excerptShadowStyle
    let excerptColor
    if (styles.isMonochrome || styles.invertBG) {
      excerptColor = showCoverImage && !styles.bg ?
        // 'white' :
        'black' :
        'black'
    } else if (showCoverImage && styles.isExcerptTone) {
      excerptColor = this.props.item.styles.isCoverImageColorDarker ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
    } else {
      excerptColor = hslString(styles.color)
    }

    let excerptBg = {}
    if (!coverImageStyles.isInline) {
      excerptBg = styles.excerptInvertBG ? {
        backgroundColor: excerptColor,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 8,
        paddingBottom: 8
      }: {}
      excerptColor = styles.excerptInvertBG ?
        (excerptColor === 'white' ? 'black' : 'white') :
        excerptColor
      excerptShadowStyle = styles.excerptInvertBG ? {
        textShadowColor: 'transparent'
      }: {}
    }

    // const excerptColor = styles.bg ?
    //   (styles.isMonochrome ? 'black' : hslString(styles.color)) :
    //   (showCoverImage ? 'white' : 'black')
    // const excerptLineHeight = styles.lineHeight > 60 ?
    //   Math.round(styles.lineHeight / 3) :
    //     (styles.lineHeight > 36 ?
    //     Math.round(styles.lineHeight / 2) :
    //     Math.round(styles.lineHeight / 1.5))
    const excerptLineHeight = coverImageStyles.isInline ?
      Math.min(this.screenHeight, this.screenWidth) / 18 :
      Math.min(this.screenHeight, this.screenWidth) / 18
    const excerptView = (<Animated.View style={{
        ...innerViewStyle,
        paddingTop: !coverImageStyles.isInline && (styles.borderWidth || styles.bg) ? excerptLineHeight / 2 : 0,
        paddingBottom: (styles.borderWidth || styles.bg) ? excerptLineHeight / 2 : this.getInnerVerticalPadding(),
        ...excerptBg,
        borderTopWidth: 0,
        opacity: excerptOpacity,
        marginTop: styles.bg && !styles.borderWidth ? 1 : 0
      }}>
        <Animated.Text style={{
          justifyContent: aligners[styles.textAlign],
          flex: 1,
          ...fontStyle,
          ...shadowStyle,
          ...excerptShadowStyle,
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
            'bold'),
          fontSize: Math.round(excerptLineHeight / 1.4),
          lineHeight: excerptLineHeight,
          letterSpacing: 0,
        }}>{this.widowFix(this.props.excerpt)}</Animated.Text>
      </Animated.View>)

    let dateStyle = {
      color: hslString(this.props.item.feed_color),
      backgroundColor: 'transparent',
      fontSize: 16,
      fontFamily: 'IBMPlexMono',
      lineHeight: 24,
      textAlign: styles.textAlign,
      paddingLeft: horizontalMargin,
      paddingRight: horizontalMargin,
      marginBottom: 18,
      padding: 0,
      width: this.screenWidth,
      // ...shadowStyle
    }

    if (showCoverImage && !coverImageStyles.isInline) {
      dateStyle.position = 'absolute'
      dateStyle.top = this.screenHeight * (styles.valign !== 'top' ? 0.2 : 0.7) // heuristic
    }

    if (showCoverImage && !coverImageStyles.isInline && styles.valign !== 'middle') {
      dateStyle.transform = [
        {translateY: 100},
        {translateX: (this.screenWidth / 2) - 6},
        {rotateZ: '90deg'}
      ]
    }

    // TODO this is feedwrangler... fix it
    if (typeof date === 'number') date = date * 1000
    const dateView = <Animated.Text style={dateStyle}>{moment(date).format('dddd MMM Do, h:mm a')}</Animated.Text>

    return (
      <Animated.View style={{
        ...outerViewStyle,
        justifyContent: justifiers[styles.valign]
      }}>
        <Animated.View
          style={{
            ...innerViewStyle,
            justifyContent: aligners[styles.textAlign]
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
              marginBottom: this.props.styles.isUpperCase ? styles.fontSize * -0.3 : 0
            }}>
              <Animated.Text>{this.renderedTitle}</Animated.Text>
            </Animated.Text>
          }
        </Animated.View>
        { this.props.item.excerpt &&
          !this.props.item.excerpt.includes('ellip') &&
          !this.props.item.excerpt.includes('…') &&
          excerptView }
        { dateView }
        {!showCoverImage && <View style={{
          marginTop: 24,
          marginLeft: horizontalMargin,
          marginRight: horizontalMargin,
          width: 83,
          height: 16,
          backgroundColor: hslString(this.props.item.feed_color)
        }} />}
      </Animated.View>
    )
  }

  getOverlayColor () {
    const { showCoverImage, item, styles, coverImageStyles } = this.props
    if (!showCoverImage ||
      styles.invertBGPadding ||
      styles.bg ||
      coverImageStyles.resizeMode === 'contain' ||
      (item.styles.isCoverImageColorDarker && coverImageStyles.isMultiply)) {
      return 'transparent'
    } else if (item.styles.isMainColorDarker && !styles.isMonochrome) {
      return 'rgba(255,255,255,0.4)'
    } else if (styles.isMonochrome ||
      coverImageStyles.isBW ||
      coverImageStyles.isMultiply ||
      coverImageStyles.isScreen) {
      return 'rgba(0,0,0,0.2)'
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
