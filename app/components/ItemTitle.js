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
  headerFontSans1: {
    verticalOffset: 0.1,
    bold: {
      fontFamily: 'AvenirNextCondensed-Bold'
    },
    boldItalic: {
      fontFamily: 'AvenirNextCondensed-BoldItalic'
    },
    regular: {
      fontFamily: 'AvenirNextCondensed-Medium'
    },
    regularItalic: {
      fontFamily: 'AvenirNextCondensed-MediumItalic'
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
      fontFamily: 'IBMPlexSans-Bold'
    },
    boldItalic: {
      fontFamily: 'IBMPlexSans-Bold'
    },
    regular: {
      fontFamily: 'IBMPlexSans-Light'
    },
    regularItalic: {
      fontFamily: 'IBMPlexSans-Light'
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

    this.verticalMargin = props.coverImageStyles.isInline ?
      0 :
      this.screenHeight * -0.1

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
    let i = 70
    while (i > 30) {
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
          size: 70 - i
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
    const {styles} = this.props
    const lineHeight = fontSize ? fontSize * styles.lineHeightAsMultiplier : styles.lineHeight
    return lineHeight > 60 ?
      Math.round(lineHeight / 4) :
      Math.round(lineHeight / 2)
  }

  // NB returns an object, {paddingTop, paddingBottom}
  getOuterVerticalPadding () {
    let paddingTop, paddingBottom
    const {coverImageStyles, styles} = this.props
    const verticalPadding = 85
    paddingTop = isIphoneX() ?
      verticalPadding * 1.25 + this.screenHeight * 0.1 :
      verticalPadding + this.screenHeight * 0.1
    paddingBottom = verticalPadding + this.screenHeight * 0.1

    if (coverImageStyles.isInline) {
      paddingTop = Math.round(styles.lineHeight / 2)
      paddingBottom = 0
    }
    return {
      paddingTop,
      paddingBottom
    }
  }

  getInnerHorizontalPadding (fontSize) {
    const {styles, coverImageStyles, textAlign} = this.props
    const relativePadding = this.getInnerVerticalPadding(fontSize || styles.fontSize)
    if (coverImageStyles.isInline) {
      return 8 // where did this number come from?
    } else if (styles.bg || styles.textAlign === 'center' && styles.valign === 'middle') {
      return relativePadding
    } else {
      return 0
    }
  }

  getInnerHorizontalMargin () {
    return this.props.coverImageStyles.isInline ? 8 : 16 // allow space for date
  }

  getInnerWidth (fontSize) {
    return Math.min(this.screenWidth, this.screenHeight) -
      this.getInnerHorizontalPadding(fontSize) * 2 -
      this.getInnerHorizontalMargin(fontSize) * 2
  }

  async componentDidUpdate () {
    const {styles, coverImageStyles, textAlign} = this.props

    if (styles.fontResized) return

    // first get max font size
    const maxFontSize = await this.getMaxFontSize()
    console.log(`MAX FONT SIZE (${this.displayTitle}): ${maxFontSize}`)

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

      console.log(this.displayTitle)
      console.log(values)
      const maxHeight = this.screenHeight / 1.5
      // now go through them and find the first one that
      // (a) is less than 66% screen height
      values = values.filter(v => v.height < maxHeight)
      const maxViable = values[0].size
      let optimal
      console.log(`MAX VIABLE FONT SIZE (${this.displayTitle}): ${maxViable}`)

      // (b) jumps down a line
      const initialNumLines = values[0].numLines
      let downALine = values.find((v, i) => {
        return values[i - 1] &&
          v.numLines < values[i - 1].numLines &&
          v.numLines < 7
      })
      optimal = downALine ? downALine.size : maxViable

      // (c) if we go down to 4 lines, is the fontSize < 42?
      let fourLines = values.find(v => v.numLines === 4)
      if (fourLines && fourLines.size && fourLines.size > optimal && fourLines.size < 42) {
        optimal = fourLines.size
      }

      // was maxViable actually four lines or less?
      if (values[0].numLines <= 4) optimal = maxViable

      // this avoids shrinking the font size too much
      if (maxViable / optimal > 2) optimal = maxViable

      if (maxViable < 42) optimal = maxViable

      // this is a bit sketchy...
      if (styles.invertBG) optimal = Math.round(optimal * 0.9)

      // TODO - need to account for interbolding, which need to move to createItemStyles

      // TODO letter spacing...
      // at fontsize 50, letterspacing of n means fontsize-2n
      // "This value specifies the number of points by which to adjust kern-pair characters"
      // https://developer.apple.com/documentation/uikit/nskernattributename

      // often out by 1...
      optimal--

      console.log(`OPTIMAL FONT SIZE (${this.displayTitle}): ${optimal}`)
      this.props.updateFontSize(this.props.item, optimal)
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
    let {styles, title, date, hasCoverImage, coverImageStyles, isVisible} = this.props

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

    const color = styles.isMonochrome ?
      (hasCoverImage && !styles.bg ?
        'white' :
        'black') :
      hslString(styles.color)

    const invertBGPadding = 5
    const paddingTop = styles.invertBG ? (verticalOffset + invertBGPadding) : verticalOffset
    const paddingBottom = styles.invertBG ? invertBGPadding : 0
    const paddingLeft = styles.invertBG ? invertBGPadding : 0

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
    if (coverImageStyles.isInline) border = {}

    const innerPadding = this.getInnerVerticalPadding()

    // if center aligned and not full width, add left margin
    const defaultHorizontalMargin = this.getInnerHorizontalMargin()
    const widthPercentage = styles.widthPercentage || 100
    const width = (this.screenWidth - defaultHorizontalMargin * 2) * widthPercentage / 100
    const horizontalMargin = (this.screenWidth - width) / 2

    const horizontalPadding = this.getInnerHorizontalPadding()

    const innerViewStyle = {
      // horizontalMargin: styles.bg ? 28 + horizontalMargin : horizontalMargin,
      // marginRight:  styles.bg ? 28  + horizontalMargin : horizontalMargin,
      marginLeft: horizontalMargin,
      marginRight:  horizontalMargin,
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      paddingBottom: styles.bg || styles.textAlign === 'center' || styles.borderWidth || coverImageStyles.isInline ? innerPadding : styles.lineHeight,
      paddingTop: innerPadding,
      backgroundColor: styles.bg ?  'rgba(255,255,255,0.9)' : 'transparent',
      height: 'auto',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      width,
      ...border,
      borderColor: color,
      opacity: coverImageStyles.isInline ? opacity : 1
    }
    const overlayColour = hasCoverImage && !styles.invertBGPadding && !styles.bg && coverImageStyles.resizeMode === 'cover' ?
      (styles.isMonochrome || coverImageStyles.isBW || coverImageStyles.isMultiply ?
        'rgba(0,0,0,0.2)' :
        'rgba(0,0,0,0.3)') :
      'transparent'
    const outerPadding = this.getOuterVerticalPadding()
    const outerViewStyle = {
      width: this.screenWidth,
      height: coverImageStyles.isInline ? 'auto' : this.screenHeight * 1.2,
      // position: 'absolute',
      paddingTop: coverImageStyles.isInline ? 0 : outerPadding.paddingTop,
      paddingBottom: outerPadding.paddingBottom,
      marginTop: this.verticalMargin,
      marginBottom: this.verticalMargin,
      top: 0,
      left: 0,
      flexDirection: 'column',
      backgroundColor: coverImageStyles.isInline ?
        hslString(coverImageStyles.color) :
        overlayColour,
      opacity: coverImageStyles.isInline ? 1 : opacity
    }
    let textStyle = {
      ...fontStyle,
      // ...viewStyle
    }

    let dateStyle = {
      color,
      backgroundColor: 'transparent',
      fontSize: 12,
      fontFamily: 'IBMPlexMono',
      lineHeight: 18,
      textAlign: 'center',
      marginLeft: 0,
      marginRight:  0,
      marginBottom: 18,
      padding: 0,
      width: this.screenWidth,
      // top: -10 // magic number!
    }

    if (!coverImageStyles.isInline) {
      dateStyle.position = 'absolute'
      dateStyle.top = this.screenHeight * (styles.valign !== 'top' ? 0.2 : 0.7) // heuristic
    }

    if (!coverImageStyles.isInline && styles.valign !== 'middle') {
      dateStyle.transform = [
        {translateY: 100},
        {translateX: (this.screenWidth / 2) - 6},
        {rotateZ: '90deg'}
      ]
    }

    let shadowStyle = styles.hasShadow && !styles.bg && !coverImageStyles.isInline ? {
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: shadow, height: shadow }
    } : {}

    textStyle = {
      ...fontStyle,
      ...shadowStyle
    }
    dateStyle = {
      ...dateStyle,
      ...shadowStyle
    }

    const invertedTitleStyle = {
      color: styles.isMonochrome ? 'black' : 'white',
      paddingLeft: 2,
      paddingRight: 2
    }

    const invertedTitleWrapperStyle = {
      backgroundColor: styles.isMonochrome ? 'white' : color
    }

    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    const justifiers = {
      'top': 'flex-start',
      'middle': 'center',
      'bottom': 'flex-end'
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
        return {
          fontFamily,
          height: styles.fontSize
        }
      })
    } else {
      if (this.props.styles.isUpperCase) {
        this.renderedTitle = this.getRenderedTitle(this.decodedTitle.toLocaleUpperCase())
      }
      if (this.props.styles.isVertical) {
        this.renderedTitle = this.getRenderedTitle(this.decodedTitle.replace(/ /g, '\n'))
      }
    }

    // TODO this is feedwrangler... fix it
    if (typeof date === 'number') date = date * 1000
    const dateView = <Animated.Text style={dateStyle}>{moment(date).format('dddd MMM Do, h:mm a')}</Animated.Text>

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
            height: styles.fontSize + paddingTop + paddingBottom
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

    const excerptColor = styles.isMonochrome ?
      (hasCoverImage && !styles.bg ?
        'white' :
        'black') :
      hslString(styles.color)
    // const excerptColor = styles.bg ?
    //   (styles.isMonochrome ? 'black' : hslString(styles.color)) :
    //   (hasCoverImage ? 'white' : 'black')
    // const excerptLineHeight = styles.lineHeight > 60 ?
    //   Math.round(styles.lineHeight / 3) :
    //     (styles.lineHeight > 36 ?
    //     Math.round(styles.lineHeight / 2) :
    //     Math.round(styles.lineHeight / 1.5))
    const excerptLineHeight = Math.min(this.screenHeight, this.screenWidth) / 18
    const excerptView = (<Animated.View style={{
        ...innerViewStyle,
        paddingTop: !coverImageStyles.isInline && (styles.borderWidth || styles.bg) ? excerptLineHeight / 2 : 0,
        paddingBottom: (styles.borderWidth || styles.bg) ? excerptLineHeight / 2 : this.getInnerVerticalPadding(),
        borderTopWidth: 0,
        opacity: excerptOpacity,
        marginTop: styles.bg && !styles.borderWidth ? 1 : 0
      }}>
        <Animated.Text style={{
          justifyContent: aligners[styles.textAlign],
          flex: 1,
          ...fontStyle,
          ...shadowStyle,
          // textShadowColor: 'rgba(0,0,0,0.4)',
          // textShadowRadius: 20,
          color: excerptColor,
          fontFamily: this.getFontFamily(coverImageStyles.isInline || styles.bg ? 'regular' : 'bold'),
          fontSize: Math.round(excerptLineHeight / 1.4),
          lineHeight: excerptLineHeight,
          letterSpacing: 0,
        }}>{this.widowFix(this.props.excerpt)}</Animated.Text>
      </Animated.View>)

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
        {dateView}
      </Animated.View>
    )
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
            inputRange: [-50, 0, 200],
            outputRange: [1, 1, 0]
          }), this.fadeInAnim),
        excerptOpacity: Animated.add(this.props.scrollOffset.interpolate({
            inputRange: [-50, 0, 400],
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
          inputRange: [-50, 0, 100],
          outputRange: [0, 1, 0]
        }), this.fadeInAnim),
      excerptOpacity: Animated.add(this.props.scrollOffset.interpolate({
          inputRange: [-50, 0, 100],
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
