import React from 'react'
import {Animated, Dimensions, Text, View, WebView} from 'react-native'
import moment from 'moment'

const fontStyles = {
  headerFontSerif1: {
    fontFamily: 'BioRhyme-Regular',
    fontWeight: '300'
  },
  headerFontSerif2: {
    fontFamily: 'BioRhyme-ExtraBold'
  },
  headerFontSerif3: {
    fontFamily: 'Arvo-Bold'
  },
  headerFontSerif4: {
    fontFamily: 'Arvo'
  },
  headerFontSans1: {
    fontFamily: 'AvenirNextCondensed-Bold'
  },
  headerFontSans2: {
    fontFamily: 'AvenirNextCondensed-Medium'
  },
  headerFontSans3: {
    fontFamily: 'Montserrat-Bold'
  },
  headerFontSans4: {
    fontFamily: 'IBMPlexSans-Bold'
  },
  headerFontSans5: {
    fontFamily: 'Montserrat-Light'
  },
  headerFontSans6: {
    fontFamily: 'IBMPlexSans-Light'
  },
  headerFontSans7: {
    fontFamily: 'HelveticaNeue-BoldItalic'
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
  }

  render () {
    let {styles, title, date} = this.props
    let position = {
      height: 'auto',
      width: 'auto',
      maxWidth: this.screenWidth
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
    let webViewStyle = {
      ...fontStyles[this.props.font],
      color: styles.color.hex,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      textAlign: styles.textAlign,
      paddingTop: 5 + styles.fontSize - styles.lineHeight // I don't know why, but otherwise it cuts off the top of the first line
      // borderColor: styles.color.hex,
      // borderBottomWidth: 4
    }
    const viewStyle = {
      ...position
    }
    const innerViewStyle = {
      marginLeft: 0,
      marginRight:  0,
      padding: 28,
      backgroundColor: styles.bg ?  'rgba(0,0,0,0.7)' : 'transparent',
      height: 'auto',
      opacity
    }
    let textStyle = {
      ...webViewStyle,
      ...viewStyle
    }

    let dateStyle = {
      alignSelf: 'flex-start',
      color: styles.color.hex,
      backgroundColor: 'transparent',
      fontSize: 14,
      fontFamily: 'IBMPlexMono',
      lineHeight: 18,
      textAlign: styles.textAlign,
      marginLeft: 0,
      marginRight:  0,
      padding: 0,
      marginLeft: 14,
      marginRight: 14
    }

    let shadowStyle = this.props.styles.hasShadow ? {
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: shadow, height: shadow }
    } : {}

    textStyle = {
      ...textStyle,
      ...shadowStyle
    }
    dateStyle = {
      ...dateStyle,
      ...shadowStyle
    }

    const invertedTitleStyle = {
      backgroundColor: styles.color.hex,
      color: 'white'
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

    // return (
    //   <Animated.View style={viewStyle}>
    //     <WebView
    //       style={webViewStyle}
    //       scalesPageToFit={false}
    //       scrollEnabled={false}
    //       style={{
    //         alignItems: 'center',
    //         justifyContent: 'center',
    //         height: 'auto',
    //         backgroundColor: 'transparent'
    //       }}
    //       source={{
    //         html: html,
    //         baseUrl: 'web/'}}
    //     />
    //   </Animated.View>
    // )

    const justifiers = {
      'top': 'flex-start',
      'middle': 'center',
      'bottom': 'flex-end'
    }

    // TODO: move these calculations into createItemStyles()
    const words = title.split(' ')
    let common = uncommon = 0
    words.forEach(word => {
      if (commonWords.find(cw => cw === word.toLowerCase())) {
        common++
      } else {
        uncommon++
      }
    })
    const commonWordRatio = common / uncommon
    if (commonWordRatio > 0.4) {
      title = words.map((word, index) => {
        if (commonWords.find(cw => cw === word.toLowerCase())) {
          return (<Animated.Text key={index} style={{
            ...fontStyles[this.props.bodyFont],
            ...invertedTitleStyle
          }}>{word} </Animated.Text>)
        } else {
          return (<Animated.Text key={index} style={invertedTitleStyle}>{word} </Animated.Text>)
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

    return (
      <View style={{
        width: this.screenWidth,
        height: this.screenHeight - 180,
        position: 'absolute',
        top: 90,
        left: 0,
        flexDirection: 'column',
        justifyContent: justifiers[styles.valign],
      }}>
        <Animated.View style={innerViewStyle}>
          <Animated.Text style={textStyle}>
            <Animated.Text>{title}{"\n"}</Animated.Text>
            <Animated.Text style={dateStyle}>{moment(date * 1000).format('dddd MMM Do, h:mm a')}</Animated.Text>
          </Animated.Text>
        </Animated.View>
      </View>
    )
  }
}

export default ItemTitle
