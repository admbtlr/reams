import React from 'react'
import {Animated, Dimensions, Text, View, WebView} from 'react-native'
import {BlurView} from 'react-native-blur'
import MeasureText from 'react-native-measure-text-with-fontfamily'
import moment from 'moment'

import {hslString} from '../utils/colors'
import {isIphoneX} from '../utils'

const fontStyles = {
  headerFontSerif1: {
    bold: {
      fontFamily: 'IBMPlexSerif-Bold',
      multiplier: 0.7,
      multiplierUpperCase: 0.85
    },
    boldItalic: {
      fontFamily: 'IBMPlexSerif-BoldItalic',
      multiplier: 0.7,
      multiplierUpperCase: 0.75
    },
    regular: {
      fontFamily: 'IBMPlexSerif-Light',
      multiplier: 0.7,
      multiplierUpperCase: 0.75
    },
    regularItalic: {
      fontFamily: 'IBMPlexSerif-LightItalic',
      multiplier: 0.6,
      multiplierUpperCase: 0.72
    }
  },
  headerFontSerif2: {
    bold: {
      fontFamily: 'Arvo-Bold',
      multiplier: 0.7,
      multiplierUpperCase: 0.9
    },
    boldItalic: {
      fontFamily: 'Arvo-BoldItalic',
      multiplier: 0.75,
      multiplierUpperCase: 0.9
    },
    regular: {
      fontFamily: 'Arvo',
      multiplier: 0.75,
      multiplierUpperCase: 0.9
    },
    regularItalic: {
      fontFamily: 'Arvo-Italic',
      multiplier: 0.72,
      multiplierUpperCase: 0.9
    }
  },
  headerFontSerif3: {
    bold: {
      fontFamily: 'PlayfairDisplay-Black',
      multiplier: 0.53,
      multiplierUpperCase: 0.8
    },
    boldItalic: {
      fontFamily: 'PlayfairDisplay-BlackItalic',
      multiplier: 0.68,
      multiplierUpperCase: 0.82
    },
    regular: {
      fontFamily: 'PlayfairDisplay-Regular',
      multiplier: 0.65,
      multiplierUpperCase: 0.75
    },
    regularItalic: {
      fontFamily: 'PlayfairDisplay-Italic',
      multiplier: 0.6,
      multiplierUpperCase: 0.75
    }
  },
  headerFontSans1: {
    verticalOffset: 0.1,
    bold: {
      fontFamily: 'AvenirNextCondensed-Bold',
      multiplier: 0.55,
      multiplierUpperCase: 0.55
    },
    boldItalic: {
      fontFamily: 'AvenirNextCondensed-BoldItalic',
      multiplier: 0.55,
      multiplierUpperCase: 0.55
    },
    regular: {
      fontFamily: 'AvenirNextCondensed-Medium',
      multiplier: 0.42,
      multiplierUpperCase: 0.42
    },
    regularItalic: {
      fontFamily: 'AvenirNextCondensed-MediumItalic',
      multiplier: 0.42,
      multiplierUpperCase: 0.42
    }
  },
  headerFontSans2: {
    bold: {
      fontFamily: 'Montserrat-Bold',
      multiplier: 0.75,
      multiplierUpperCase: 0.75
    },
    boldItalic: {
      fontFamily: 'Montserrat-BoldItalic',
      multiplier: 0.75,
      multiplierUpperCase: 0.75
    },
    regular: {
      fontFamily: 'Montserrat-Light',
      multiplier: 0.6,
      multiplierUpperCase: 0.6
    },
    regularItalic: {
      fontFamily: 'Montserrat-LightItalic',
      multiplier: 0.6,
      multiplierUpperCase: 0.6
    }
  },
  headerFontSans3: {
    bold: {
      fontFamily: 'IBMPlexSans-Bold',
      multiplier: 0.58,
      multiplierUpperCase: 0.58
    },
    boldItalic: {
      fontFamily: 'IBMPlexSans-BoldItalic',
      multiplier: 0.58,
      multiplierUpperCase: 0.58
    },
    regular: {
      fontFamily: 'IBMPlexSans-Light',
      multiplier: 0.55,
      multiplierUpperCase: 0.55
    },
    regularItalic: {
      fontFamily: 'IBMPlexSans-LightItalic',
      multiplier: 0.55,
      multiplierUpperCase: 0.55
    }
  },
  bodyFontSans1: {
    fontFamily: 'GillSans-LightItalic'
  },
  bodyFontSans2: {
    fontFamily: 'Avenir-LightOblique'
  },
  bodyFontSerif1: {
    fontFamily: 'Cochin'
  },
  bodyFontSerif2: {
    fontFamily: 'IowanOldStyle-Roman'
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

    // this.fadeInAnim = props.coverImageStyles.isInline ? new Animated.Value(-1) :  new Animated.Value(0)
    // this.fadeInAnim2 = props.coverImageStyles.isInline ? new Animated.Value(-1) :  new Animated.Value(0)
    this.fadeInAnim = new Animated.Value(-1)
    this.fadeInAnim2 = new Animated.Value(-1)
  }

  // calculateMaxFontSize (title, font, isBold, isUpperCase, totalPadding) {
  //   const maxLength = this.getLongestWord(title).length
  //   const mult = isUpperCase ? 'multiplierUpperCase' : 'multiplier'
  //   const multiplier = this.getFontObject()[mult]
  //   const width = this.screenWidth - totalPadding
  //   // do something here with letter spacing
  //   const letterSpacing = this.getLetterSpacing()

  //   // console.log(`MAX FONT SIZE (${title}) (${this.getFontFamily()}): ${multiplier} :: ${Math.floor(width / maxLength / (multiplier * 1.2 + letterSpacing / 50))}`)




  //   // multiply by 1.2 to give us a buffer
  //   return Math.floor(width / maxLength / (multiplier + letterSpacing / 50))
  // }

  // adjustFontSize (height) {
  //   const {fontSize, fontResized} = this.props.styles
  //   const maxHeight = this.screenHeight - this.paddingTop - this.paddingBottom
  //   if (height > maxHeight) {
  //     // const fontSize = this.props.styles.fontSize
  //     // const oversizeFactor = height / maxHeight
  //     // const newFontSize = Math.round(fontSize / oversizeFactor * 0.9)
  //     // console.log(this.props.title + ' - NEW FONT SIZE: ' + styles.fontSize + ' > ' + Math.floor(styles.fontSize * 0.9))
  //     this.props.updateFontSize(this.props.item, Math.floor(fontSize * 0.9))
  //   } else if (!fontResized) {
  //     // tell it that the max font we calculated is just fine thank you
  //     this.props.updateFontSize(this.props.item, Math.floor(fontSize))
  //   }
  // }

  getLongestWord (title) {
    return title.split(' ').reduce((longest, word) => {
      if (word.length > longest.length) return word
      return longest
    }, '')
  }

  async getMaxFontSize () {
    const { title, styles } = this.props
    const that = this
    let maxSize
    const longestWord = this.getLongestWord(title)
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
    const lineHeight = fontSize ? fontSize * 1.1 : styles.lineHeight
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
    const {styles, coverImageStyles, textAlign,  title} = this.props
    const lineHeight = fontSize ? fontSize * 1.1 : styles.lineHeight
    const relativePadding = this.getInnerVerticalPadding(fontSize || styles.fontSize)
    return coverImageStyles.isInline ? 8 :
      styles.bg || styles.textAlign === 'center' ? (16 + relativePadding) : 16
  }

  getInnerWidth (fontSize) {
    return Math.min(this.screenWidth, this.screenHeight) - this.getInnerHorizontalPadding(fontSize) * 2
  }

  async componentWillMount () {
    const {styles, coverImageStyles, textAlign,  title} = this.props

    // first get max font size
    const maxFontSize = await this.getMaxFontSize()
    console.log(`MAX FONT SIZE (${title}): ${maxFontSize}`)

    let sizes = []
    let i = maxFontSize
    while (i > 20) {
      sizes.push(i--)
    }

    Promise.all(sizes.map((size) => MeasureText.measureSizes({
        texts: [styles.isUpperCase ? title.toLocaleUpperCase() : title],
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

      console.log(title)
      console.log(values)
      const maxHeight = this.screenHeight / 2
      // now go through them and find the first one that
      // (a) is less than 50% screen height
      values = values.filter(v => v.height < maxHeight)
      const maxViable = values[0].size
      console.log(`MAX VIABLE FONT SIZE (${title}): ${maxViable}`)
      // (b) jumps down a line
      const initialNumLines = values[0].numLines
      let optimal = values.find(v => v.numLines < initialNumLines).size

      // this avoids shrinking the font size too much
      if (maxViable / optimal > 1.5) optimal = maxViable

      if (maxViable < 35) optimal = maxViable

      // this is a bit sketchy...
      if (styles.invertBG) optimal = Math.round(optimal * 0.9)

      // TODO - need to account for interbolding, which need to move to createItemStyles

      // TODO letter spacing...
      // at fontsize 50, letterspacing of n means fontsize-2n
      // "This value specifies the number of points by which to adjust kern-pair characters"
      // https://developer.apple.com/documentation/uikit/nskernattributename

      // often out by 1...
      optimal--

      console.log(`OPTIMAL FONT SIZE (${this.props.title}): ${optimal}`)
      this.props.updateFontSize(this.props.item, optimal)
    })

    // const metrics = MeasureText.measureSizes({
    //     texts: [this.props.title],
    //     width: this.screenWidth - totalPadding,
    //     fontSize: 50,
    //     fontFamily: this.getFontFamily()
    // })
    // console.log(metrics)
  }

  // componentWillMount () {
  //   const {title, styles, coverImageStyles} = this.props
  //   // if (styles.fontResized) return

  //   // account for landscape mode
  //   let fontSize = Math.floor(Math.min(this.screenWidth, this.screenHeight) / styles.fontSizeAsWidthDivisor)
  //   if (styles.maximiseFont) {
  //     const totalPadding = styles.bg ? 56 :
  //       coverImageStyles.isInline ? 16: 28
  //     fontSize = this.calculateMaxFontSize(title, this.props.font, styles.isBold, styles.isUpperCase, totalPadding)
  //   }
  //   this.props.updateFontSize(this.props.item, fontSize)
  // }

  getLetterSpacing () {
    return 0
    const {styles, title} = this.props
    return styles.isVertical ?
            (this.getLongestWord(title).length < 6 ? 5 : 3) :
            (this.getLongestWord(title).length < 6 ? 3 : -1)
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

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps !== this.props || nextState !== this.state
  }

  render () {
    let {styles, title, date, hasCoverImage, coverImageStyles, isVisible} = this.props
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
    const defaultHorizontalMargin = coverImageStyles.isInline ? 8 : 16 // allow space for date
    const widthPercentage = styles.widthPercentage || 100
    const width = (this.screenWidth - defaultHorizontalMargin * 2) * widthPercentage / 100
    const horizontalMargin = (this.screenWidth - width) / 2

    const hasLeftPadding = styles.bg || styles.textAlign === 'center' &&
      styles.valign === 'middle' &&
      !coverImageStyles.isInline

    const innerViewStyle = {
      // horizontalMargin: styles.bg ? 28 + horizontalMargin : horizontalMargin,
      // marginRight:  styles.bg ? 28  + horizontalMargin : horizontalMargin,
      marginLeft: horizontalMargin,
      marginRight:  horizontalMargin,
      paddingLeft: hasLeftPadding ? innerPadding : 0,
      paddingRight: hasLeftPadding ? innerPadding : 0,
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
    const overlayColour = hasCoverImage && !styles.invertBGPadding && !styles.bg ?
      (styles.isMonochrome || coverImageStyles.isBW || coverImageStyles.isMultiply ?
        'rgba(0,0,0,0.1)' :
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
      position: 'absolute',
      top: this.screenHeight * (styles.valign === 'bottom' ? 0.2 : 0.7), // heuristic
      color,
      backgroundColor: 'transparent',
      fontSize: 12,
      fontFamily: 'IBMPlexMono',
      lineHeight: 18,
      textAlign: 'center',
      marginLeft: 0,
      marginRight:  0,
      padding: 0,
      width: this.screenWidth,
      transform: [
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

    const html = `<html>
      <head>
        <link rel="stylesheet" type="text/css" href="${server}webview/css/item-styles.css">
        <script src="${server}webview/js/feed-item.js"></script>
      </head>
      <body style="margin: 0; padding: 0;">
        <h1>${title.replace(' ', '\n')}</h1>
      </body>
    </html>`

    const justifiers = {
      'top': 'flex-start',
      'middle': 'center',
      'bottom': 'flex-end'
    }
    const aligners = {
      'left': 'flex-start',
      'center': 'center'
    }

    title = title.replace(/\n/g, '')
    // TODO: actually replace italics?
    title = title.replace(/<.*?>/g, '')

    const words = title.split(' ')
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
        title = title.toLocaleUpperCase()
      }
      if (this.props.styles.isVertical) {
        title = title.trim().replace(/ /g, '\n')
      }
    }

    const dateView = <Animated.Text style={dateStyle}>{moment(date * 1000).format('dddd MMM Do, h:mm a')}</Animated.Text>

    const shouldSplitIntoWords = () => {
      return styles.interBolded || styles.invertBG
    }

    if (shouldSplitIntoWords()) {
      title = words.map((word, index) => {
        if (styles.invertBG) {
          return (<View key={index} style={{
            ...invertedTitleWrapperStyle,
            position: 'relative',
            left: 0 - index // this is to fill in occasional 1px gaps between words
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
    const excerptLineHeight = styles.lineHeight > 60 ?
      Math.round(styles.lineHeight / 3) :
        (styles.lineHeight > 36 ?
        Math.round(styles.lineHeight / 2) :
        Math.round(styles.lineHeight / 1.5))
    const excerptView = (<Animated.View style={{
        ...innerViewStyle,
        paddingTop: !coverImageStyles.isInline && (styles.borderWidth || styles.bg) ? excerptLineHeight : 0,
        paddingBottom: excerptLineHeight,
        borderTopWidth: 0,
        opacity: excerptOpacity,
        marginTop: styles.bg && !styles.borderWidth ? 1 : 0
      }}>
        <Animated.Text style={{
          justifyContent: aligners[styles.textAlign],
          flex: 1,
          ...fontStyle,
          ...shadowStyle,
          textShadowColor: 'rgba(0,0,0,0.4)',
          textShadowRadius: 20,
          color: excerptColor,
          fontFamily: this.getFontFamily('regular'),
          fontSize: Math.round(excerptLineHeight / 1.4),
          lineHeight: excerptLineHeight,
          letterSpacing: 0,
        }}>{this.props.excerpt}</Animated.Text>
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
          {typeof(title) === 'object' && title}
          {typeof(title) === 'string' &&
            <Animated.Text style={{
              ...fontStyle,
              ...shadowStyle,
              marginBottom: this.props.styles.isUpperCase ? styles.fontSize * -0.3 : 0
            }}>
              <Animated.Text>{title}</Animated.Text>
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

  getOpacityValues () {
    // if (this.props.coverImageStyles.isInline) {
    //   return {
    //     opacity: 1,
    //     excerptOpacity: 1,
    //     shadow: 1
    //   }
    // }
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
