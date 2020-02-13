import React from 'react'
import {Animated, Dimensions, Linking, Text, View} from 'react-native'
import {WebView} from 'react-native-webview'

import TextButton from './TextButton'
const { colors, desaturated, ui } = require('../utils/colors.json')

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

    const bodies = [`<h1>Welcome to Rizzle!</h1>
      <p><strong>Rizzle is a better way to read the&nbsp;web.</strong></p>
      <p>You subscribe to the sites you love and trust. Every time one of those sites publishes a new story, it shows up&nbsp;here.</p>
      <p>No more searching, page reloading, or waiting for someone else to share what they’ve&nbsp;found.</p>`,
      `<h1>Built for Readers</h1>
      <p>Each story is algorithmically art-directed for you. If something looks interesting, go ahead and read it. If it looks <em>really</em> interesting, save it for&nbsp;later.</p>
      <p>Use the Rizzle share extension to subscribe to feeds directly from Safari or to save individual pages to read later.</p>
      <p>Ready to Rizzle? Just go ahead and...</p>`
    ]

    const swipeArrow = index === 0 ?
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

    const html = `<html class="onboarding font-size-3 ${this.props.isDarkBackground ? 'dark-background' : ''}">
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
          useWebKit={false}
        />
        { this.props.index === 1 &&
          <TextButton
            text="Do the super simple sign-up thing"
            buttonStyle={{ marginBottom: 0 }}
            onPress={this.endOnboarding}
            buttonStyle={{
              bottom: 30,
              position: 'absolute',
              alignSelf: 'center'
            }}
            testID='super-simple-set-up-button'
          />
        }
      </Animated.View>
    )
  }

}

export default Onboarding
