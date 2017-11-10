import React from 'react'
import {Animated, Dimensions, Text, View, WebView} from 'react-native'

const fontStyles = {
  headerFontSerif1: {
    fontFamily: 'AmericanTypewriter-Condensed',
    fontWeight: '300'
  },
  headerFontSerif2: {
    fontFamily: 'DamascusBold'
  },
  headerFontSerif3: {
    fontFamily: 'BodoniSvtyTwoITCTT-Bold'
  },
  headerFontSerif4: {
    fontFamily: 'BodoniSvtyTwoITCTT-Book'
  },
  headerFontSans1: {
    fontFamily: 'AvenirNextCondensed-Bold'
  },
  headerFontSans2: {
    fontFamily: 'AvenirNextCondensed-Medium'
  },
  headerFontSans3: {
    fontFamily: 'DINCondensed-Bold'
  },
  headerFontSans4: {
    fontFamily: 'Futura-CondensedMedium'
  },
  headerFontSans5: {
    fontFamily: 'Futura-CondensedExtraBold'
  },
  headerFontSans6: {
    fontFamily: 'HelveticaNeue-CondensedBold'
  },
  headerFontSans7: {
    fontFamily: 'HelveticaNeue-BoldItalic'
  }
}

class ItemTitle extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    const window = Dimensions.get('window')
    this.screenWidth = window.width
    this.screenHeight = window.height
  }

  render () {
    const {styles, title} = this.props
    const absolute = {
      position: 'absolute',
      top: 100,
      left: 0,
      height: this.screenHeight - 200,
      width: this.screenWidth - 28
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
      backgroundColor: 'transparent',
      color: styles.color.hex,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      textAlign: styles.textAlign,
      marginLeft: 14,
      marginRight: 14,
      paddingTop: 14
    }
    const viewStyle = {
      ...absolute,
      opacity
    }
    const textStyle = {
      ...webViewStyle,
      ...viewStyle
    }

    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    // if (styles.color.name !== 'black') {
    //   webViewStyle = {
    //     ...webViewStyle,
    //     textShadowColor: 'rgba(0,0,0,0.3)',
    //     textShadowOffset: { width: shadow, height: shadow }
    //   }
    // }

    const html = `<html>
      <head>
        <link rel="stylesheet" type="text/css" href="${server}webview/css/item-styles.css">
        <script src="${server}webview/js/feed-item.js"></script>
      </head>
      <body style="margin: 0; padding: 0;">
        <h1>${title}</h1>
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

    return (
      <Animated.Text style={textStyle}>{title}</Animated.Text>
    )
  }
}

export default ItemTitle
