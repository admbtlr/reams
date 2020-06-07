import React from 'react'
import {Animated, Dimensions, Linking, Text, View} from 'react-native'
import {WebView} from 'react-native-webview'

import TextButton from './TextButton'

class Onboarding extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
    this.props.hideAllButtons()
    this.props.hideLoadingAnimation()

    this.endOnboarding = this.endOnboarding.bind(this)
  }

  // componentWillMount () {
  //   if (this.props.index > 2) {
  //     this.props.showItemButtons()
  //     if (this.props.index > 12) {
  //       this.props.showViewButtons()
  //     }
  //   } else {
  //     this.props.hideAllButtons()
  //   }
  // }

  endOnboarding () {
    this.props.navigation.navigate('Account')
    setTimeout(this.props.endOnboarding, 2000)
  }

  render () {
    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    const { index } = this.props

    const bodies = [`<h1>Welcome to Reams</h1>
      <p><strong>Reams is a better way to read the&nbsp;web.</strong></p>
      <p>You subscribe to the sites you love and trust. Every time one of those sites publishes a new story, it shows up&nbsp;here.</p>
      <p>It’s all about the immersive pleasures of text and image.</p>`,
      `<h1>Built for Readers</h1>
      <p>Each story is algorithmically art-directed for you. If something looks interesting, go ahead and read it. If it looks <em>really</em> interesting, save it for&nbsp;later.</p>`,
      `<h2>Read more about stuff you love</h2>
      <p>Subscribe to sites from the built-in library. Or use the Reams share extension to subscribe to sites directly from Safari, or to save individual pages to read later.</p>
      <p>Ready? Go ahead and...</p>`
    ]

    const swipeArrow = index !== 2 ?
      `<div class="swipe">👈 swipe 👈</div>` :
      ''

    const headingFont = [
      'IBMPlexSans-Bold',
      'IBMPlexSansCondensed-Bold',
      'PlayfairDisplay-Bold'
    ][index]
    const bodyFontClass = [
      'bodyFontSerif1',
      'bodyFontSerif2',
      'bodyFontSans1'
    ][index]

    const html = `<html class="onboarding onboarding-${this.props.index} font-size-3 ${this.props.isDarkMode ? 'dark-background' : ''}">
      <head>
        <link rel="stylesheet" type="text/css" href="${server}webview/css/output.css">
        <link rel="stylesheet" type="text/css" href="${server}webview/css/fonts.css">
      </head>
      <body class="${bodyFontClass}">
        <article>
          ${bodies[this.props.index]}
        </article>
        ${swipeArrow}
      </body>
      <!--script src="${server}webview/js/feed-item.js"></script-->
    </html>`

    const openLinksExternallyProp = __DEV__ ? {} : {
      onShouldStartLoadWithRequest: (e) => {
        if (e.navigationType === 'click') {
          Linking.openURL(e.url)
          return false
        } else {
          return true
        }
      }
    }

    return (
      <Animated.View
        style={{
          // backgroundColor: bgColor,
          flex: 1,
          overflow: 'hidden',
          width: Dimensions.get('window').width
        }}
        testID={`onboarding-${index}`}
      >
        <WebView
          decelerationRate='normal'
          onMessage={(event) => {
          }}
          {...openLinksExternallyProp}
          originWhitelist={['*']}
          scalesPageToFit={false}
          scrollEnabled={true}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
          }}
          source={{
            html: html,
            baseUrl: 'web/'}}
        />
        { this.props.index === 2 &&
          <View style={{
            bottom: 30,
            position: 'absolute',
            alignSelf: 'center'
          }}>
            <TextButton
              text="Do the super simple set-up thing"
              onPress={this.endOnboarding}
              buttonStyle={{
              }}
              testID='super-simple-set-up-button'
            />
          </View>
        }
      </Animated.View>
    )
  }

}

export default Onboarding
