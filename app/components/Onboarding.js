import React from 'react'
import {Animated, Dimensions, Linking, Text, View} from 'react-native'
import {WebView} from 'react-native-webview'
import { openLink } from '../utils/open-link'
import { hslString } from '../utils/colors'


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
    this.props.endOnboarding()
    this.props.navigation.reset({
      index: 0,
      routes: [{name: 'Account'}]})
  }

  render () {
    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    const { index } = this.props

    const bodies = [`<div class="everything"><h1>Reams</h1>
      <p class="subhead">Deeply Superficial RSS</p>
      <div class="content">
      <p>Reams is for people who love to read. It’s all about the immersive pleasures of text and image.</p>
      <p>(<a href="https://aboutfeeds.com/">What’s RSS?</a>)</p></div></div>`,
      `<div class="everything"><div class="content"><p>Each story is algorithmically art-directed for you. If something looks interesting, go ahead and read it. If it looks <em>really</em> interesting, save it for&nbsp;later.</p></div></div>`,
      `<div class="everything"><div class="content"><p>You can subscribe to sites from the built-in library. Or you can use the Reams Share Extension for Safari – which also lets you save <em>any</em> web page to read in Reams.</p>
      </div></div>`
    ]

    const swipeArrow = index !== 2 ?
      `<div class="swipe">swipe &gt;&gt;&gt;</div>` :
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

    const backgroundColor = [
      'rizzleBG',
      'logo2',
      'logo1'
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

    const openLinksExternallyProp = /*__DEV__ ? {} :*/ {
      onShouldStartLoadWithRequest: (e) => {
        if (e.navigationType === 'click') {
          openLink(e.url)
          return false
        } else {
          return true
        }
      }
    }

    return (
      <Animated.View
        style={{
          backgroundColor: hslString(backgroundColor),
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
            bottom: 60,
            left: "5%",
            position: 'absolute',
            alignSelf: 'flex-start'
          }}>
            <TextButton
              text="Get started with Reams"
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
