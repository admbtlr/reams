import React from 'react'
import {Animated, Dimensions, Text, View, WebView} from 'react-native'
import moment from 'moment'

const fontStyles = {
  headerFontSerif1: {
    verticalOffset: 0.375,
    bold: {
      fontFamily: 'Eczar-ExtraBold',
      multiplier: 0.57
    },
    regular: {
      fontFamily: 'Eczar-Regular',
      multiplier: 0.51
    }
  },
  headerFontSerif2: {
    bold: {
      fontFamily: 'Arvo-Bold',
      multiplier: 0.58
    },
    regular: {
      fontFamily: 'Arvo',
      multiplier: 0.56
    }
  },
  headerFontSans1: {
    verticalOffset: 0.15,
    bold: {
      fontFamily: 'AvenirNextCondensed-Bold',
      multiplier: 0.46
    },
    regular: {
      fontFamily: 'AvenirNextCondensed-Medium',
      multiplier: 0.42
    }
  },
  headerFontSans2: {
    verticalOffset: -0.1,
    bold: {
      fontFamily: 'Montserrat-Bold',
      multiplier: 0.57
    },
    regular: {
      fontFamily: 'Montserrat-Light',
      multiplier: 0.55
    }
  },
  headerFontSans3: {
    bold: {
      fontFamily: 'IBMPlexSans-Bold',
      multiplier: 0.54
    },
    regular: {
      fontFamily: 'IBMPlexSans-Light',
      multiplier: 0.51
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

const commonWords = [
  'the',
  'of',
  'and',
  'to',
  'a',
  'in',
  'for',
  'is',
  'on',
  'that',
  'by',
  'this',
  'with',
  'i',
  'you',
  'it',
  'not',
  'or',
  'be',
  'are',
  'from',
  'at',
  'as',
  'your',
  'all',
  'have',
  'more',
  'an',
  'was',
  'we',
  'will',
  'home',
  'can',
  'us',
  'about',
  'if',
  'my',
  'has',
  'but',
  'our',
  'one',
  'other',
  'do',
  'no',
  'they',
  'he',
  'up',
  'may',
  'what',
  'which',
  'their',
  'out',
  'use',
  'any',
  'there',
  'see',
  'only',
  'so',
  'his',
  'when',
  'here',
  'who',
  'also',
  'now',
  'get',
  'am',
  'been',
  'would',
  'how',
  'were',
  'me',
  'some',
  'these',
  'its',
  'like',
  'than',
  'had',
  'into',
  'them',
  'should',
  'her',
  'such',
  'after',
  'then'
]


class ItemTitle extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    const window = Dimensions.get('window')
    this.screenWidth = window.width
    this.screenHeight = window.height

    this.verticalPadding = 90
  }

  calculateMaxFontSize (title, font, isBold, totalPadding) {
    const maxLength = title.split(' ').reduce((length, word) => {
      if (word.length > length)
        length = word.length
      return length
    }, 0)
    const multiplier = fontStyles[this.props.font][isBold ? 'bold' : 'regular'].multiplier
    const width = this.screenWidth - totalPadding

    // multiply by 0.9 to give us a buffer
    return Math.floor(width / maxLength / (multiplier * 0.9))
  }

  adjustFontSize (height) {
    const maxHeight = this.screenHeight - this.verticalPadding * 2
    if (height > maxHeight) {
      // const fontSize = this.props.styles.fontSize
      // const oversizeFactor = height / maxHeight
      // const newFontSize = Math.round(fontSize / oversizeFactor * 0.9)
      console.log(this.props.title + ' - NEW FONT SIZE: ' + this.fontSize + ' > ' + Math.floor(this.fontSize * 0.9))
      this.props.updateFontSize(this.props.item, Math.floor(this.fontSize * 0.9))
    } else {
      // tell it that the max font we calculated is just fine thank you
      this.props.updateFontSize(this.props.item, Math.floor(this.fontSize))
    }
  }

  componentDidMount () {
    // if (this.innerView) {
    //   this.innerView._component.measure((ox, oy, width, height) => {
    //     console.log(height)
    //     if (height > this.screenHeight - verticalPadding * 2) {
    //       console.log('Too high!')
    //     }
    //   })
    // }
  }

  render () {
    let {styles, title, date, imageLoaded} = this.props
    let position = {
      height: 'auto',
      width: 'auto',
      maxWidth: this.screenWidth
    }
    // TODO: make the $step value dynamic, somehow?
    const fullWidthStyle = {
      width: this.screenWidth - 56
    }
    // console.log(styles)
    const opacity = this.props.scrollOffset.interpolate({
      inputRange: [-100, 0, 100],
      outputRange: [0, 1, 0]
    })
    const shadow = this.props.scrollOffset.interpolate({
      inputRange: [-100, -20, 0, 40, 200],
      outputRange: [0, 1, 1, 1, 0]
    })

    if (!styles.fontResized) {
      const totalPadding = styles.bg ? 56 : 28
      const maxFontSize = this.calculateMaxFontSize(title, this.props.font, styles.isBold, totalPadding)
      this.fontSize = Math.random() > 0.5 ? maxFontSize : styles.fontSize
    } else {
      this.fontSize = styles.fontSize
    }

    const verticalOffset = fontStyles[this.props.font].verticalOffset ?
      fontStyles[this.props.font].verticalOffset * this.fontSize :
      0
    let fontStyle = {
      fontFamily: fontStyles[this.props.font][styles.isBold ? 'bold' : 'regular'].fontFamily,
      color: styles.isMonochrome ? (imageLoaded ? 'white' : 'black') : styles.color.hex,
      fontSize: this.fontSize,
      lineHeight: this.fontSize,
      textAlign: styles.textAlign,
      letterSpacing: -1,
      paddingTop: verticalOffset,
      // paddingTop: 28 // I don't know why, but otherwise it cuts off the top of the first line
      // borderColor: styles.color.hex,
      // borderBottomWidth: 4
    }
    console.log(fontStyles[this.props.font][styles.isBold ? 'bold' : 'regular'])
    const viewStyle = {
      ...position
    }
    const innerViewStyle = {
      marginLeft: styles.bg ? 28 : 0,
      marginRight:  styles.bg ? 28 : 0,
      padding: 14,
      backgroundColor: styles.bg ?  'white' : 'transparent',
      height: 'auto',
      opacity
    }
    let textStyle = {
      ...fontStyle,
      // ...viewStyle
    }

    let dateStyle = {
      alignSelf: 'flex-start',
      color: styles.isMonochrome ? '#000000' : styles.color.hex,
      backgroundColor: 'transparent',
      fontSize: 14,
      fontFamily: 'IBMPlexMono',
      lineHeight: 18,
      textAlign: 'right',
      marginLeft: 14,
      marginRight:  0,
      padding: 0
    }

    let shadowStyle = styles.hasShadow && !styles.bg ? {
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
      color: 'white',
      paddingTop: verticalOffset || 6
    }

    const invertedTitleWrapperStyle = {
      backgroundColor: styles.isMonochrome || styles.color.hex === '#ffffff' ? '#000000' : styles.color.hex
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

    const words = title.split(' ')
    let wordStyles = null

    // TODO: move these calculations into createItemStyles() (probably)
    let common = uncommon = 0
    words.forEach(word => {
      if (commonWords.find(cw => cw === word.toLowerCase())) {
        common++
      } else {
        uncommon++
      }
    })
    const commonWordRatio = common / uncommon
    if (commonWordRatio > 0.4 && common > 3) {
      // create a parallel array of objects that we can convert into jsx below
      // (make objects first because whether we use Text or Animated.Text depends on whether to invert)
      // (because shadow)
      wordStyles = []
      words.forEach((word, index) => {
        if (commonWords.find(cw => cw === word.toLowerCase())) {
          wordStyles[index] = {
            fontFamily: fontStyles[this.props.font]['regular'].fontFamily,
            height: this.fontSize
          }
        } else {
          wordStyles[index] = {
            fontFamily: fontStyles[this.props.font]['bold'].fontFamily,
            height: this.fontSize
          }
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
      return wordStyles || styles.invertBG
    }

    if (shouldSplitIntoWords()) {
      title = words.map((word, index) => {
        if (styles.invertBG) {
          return (<View key={index} style={{
            ...invertedTitleWrapperStyle
          }}><Text style={{
            ...fontStyle,
            ...(wordStyles && wordStyles[index]),
            ...invertedTitleStyle,
            height: this.fontSize
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



    return (
      <View style={{
        width: this.screenWidth,
        height: this.screenHeight,
        position: 'absolute',
        paddingTop: this.verticalPadding,
        paddingBottom: this.verticalPadding,
        top: 0,
        left: 0,
        flexDirection: 'column',
        justifyContent: justifiers[styles.valign],
        // backgroundColor: 'rgba(0,0,0,0.2)'
      }}>
        <Animated.View
          style={{
            ...innerViewStyle,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: aligners[styles.textAlign],
          }}
          onLayout={(event) => {
            this.adjustFontSize(event.nativeEvent.layout.height)
          }}
          ref={(view) => { this.innerView = view }}
        >
          {typeof(title) === 'object' && title}
          {typeof(title) === 'string' &&
            <Animated.Text style={{
              // ...fullWidthStyle,
              ...fontStyle,
              ...shadowStyle
            }}>
              <Animated.Text>{title}</Animated.Text>
            </Animated.Text>
          }
        </Animated.View>
        {dateView}
      </View>
    )
  }
}

export default ItemTitle
