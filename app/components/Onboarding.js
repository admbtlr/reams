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
    this.props.endOnboarding()
    this.props.navigation.navigate('Account')
  }

  render () {
    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    const bodies = [`<h1>This is Rizzle</h1>
      <hr />
      <p>Rizzle is a feed of the latest content from your favourite websites.</p>
      <p>You subscribe to the sites you love from within Safari, and then every time they publish a new story, it shows up in your <b>Rizzle</b> feed.</p>
      <p>Then you read the story, and move on to the next one. That’s it.</p>`,
      `<h1>Like Tinder, but for Content</h1>
      <hr />
      <p><b>Rizzle</b> art directs each story for you. If something looks interesting, scroll down to read it. If it looks <em>really</em> interesting, you can save it for later.</p>
      <p>Once you swipe past an story, you’re basically saying “I’m done with that”: unless you save it, the next time <b>Rizzle</b> refreshes its feeds, that story will disappear for ever.</p>`,
      // `<h1>Buttons!</h1>
      // <hr />
      // <p>When you're flipping through your articles, there are four buttons at the bottom of the screen.</p>
      // <p>The button on the left shows you how many articles are currently in your feed, and how many you have already read (or swiped past).</p>
      // <p>Tapping it will switch to saved mode: this is how you can access all the articles you’ve saved, either from within <b>Rizzle</b> or by using the share extension (more on that in a minute).</p>`,
      // `<h1>The middle buttons</h1>
      // <hr />
      // <p>The button with the <b>Rizzle</b> on it lets you save an article; tapping it will put a copy of the article into your saved area.</p>
      // <p>The next button lets you share an article. It works like every other share button you know.</p>`,
      // `<h1 style="font-size: 1.6rem !important;">The mysterious fourth button</h1>
      // <hr />
      // <p>Sometimes sites will only make article extracts available in their feed. The button on the right switches between the extract in the feed and the whole article, in all its glory.</p>
      // <p>In blogs that use link posts, it will switch between the commentary posted to the blog and the text of the linked article.</p>`,
      // `<h1>Even more buttons!</h1>
      // <hr />
      // <p>Tapping on the eye at the top left displays three more buttons, which allow you to change the font size, and to switch between light and dark views.</p>
      // <p>Tapping on the ellipsis at the top right will take you to the list of all the feeds you’ve subscribed to.`,
      // `<h1 style="font-size: 1.6rem !important;">The Rizzle share extension</h1>
      // <hr />
      // <p>The easiest way to add sites to your Rizzle feed is via the Rizzle share extension in Safari.</p>
      // <p>Go to a site that sparks joy (or is at least useful). Tap on the share button at the bottom to show all your share extensions:</p>
      // <img src="${server}webview/img/share.png" style="width: 156px;">
      // <p>The first time you do this, you will need to activate the <b>Rizzle</b> extension.</p>`,
      // `<h1 style="font-size: 1.6rem !important;">Activating the Rizzle share extension</h1>
      // <hr />
      // <p>Click on the <i>More</i> button in the middle row:</p>
      // <img src="${server}webview/img/more.png" style="width: 183px;">
      // <p>Then hit <i>Edit</i> at the top right. Find <i><b>Rizzle</b></i> in the list, toggle it on, and hit the + button to add it to you favourites. Tap <i>Done</i> then tap <i>Done</i> again. Now you can select <i><b>Rizzle</b></i>.</p>`,
      // `<h1>Using the Rizzle Share Extension</h1>
      // <hr />
      // <p>The share extension consists of two buttons. The top button searches for a feed from the site that you're on, and lets you subscribe to it in <b>Rizzle</b>.</p>
      // <p>Unfortunately not all sites offer feeds, but <b>Rizzle</b> will do its best to find one for you.</p>`,
      // `<h1>The Bottom Button</h1>
      // <hr />
      // <p>The bottom button saves the page you’re currently looking at, rather than subscribing to the site.</p>
      // <p>Use this if there’s an article that you want to store in <b>Rizzle</b> to read later, or if you find that the <b>Rizzle</b> reading experience is better than what the site itself offers.</p>`,
      // `<h1>Back to Rizzle</h1>
      // <hr />
      // <p>When you return to <b>Rizzle</b>, it will ask you to confirm that you want to subscribe to the site. Once you confirm, <b>Rizzle</b> will load new articles from all the sites that you have subscribed to.</p>`,
      `<h1 style="font-size: 1.6rem !important;">Shut Up and Show Me the Stories</h1>
      <hr />
      <p>Before you start, you’ll need an account. You can use 3rd party RSS services (just <a href="https://www.feedwrangler.net">FeedWrangler</a> for now), or you can create a <b>Rizzle</b> account.`
    ]

    const swipeArrow = this.props.index < 2 ?
      `<div class="swipe"><em>(Swipe to continue)</em></div>` :
      ''

    const bgColorIndex = Math.floor(Math.random() * Object.keys(desaturated).length)
    const fgColorIndex = (bgColorIndex + 5 + Math.round(Math.random() * 3)) % Object.keys(desaturated).length
    const bgColor = desaturated[Object.keys(desaturated)[bgColorIndex]]
    const fgColor = colors[Object.keys(colors)[fgColorIndex]]
    const headingFontIndex = Math.floor(Math.random() * 16)
    const headingFont = [
      'PlayfairDisplay-Bold',
      'PlayfairDisplay-Regular',
      'PlayfairDisplay-BoldItalic',
      'PlayfairDisplay-Italic',
      'IBMPlexSerif-Bold',
      'IBMPlexSerif-BoldItalic',
      'IBMPlexSerif-Light',
      'IBMPlexSerif-LightItalic',
      'IBMPlexSansCond-Bold',
      'IBMPlexSansCond-BoldItalic',
      'IBMPlexSansCond-ExtraLight',
      'IBMPlexSansCond-ExtraLightItalic',
      'Montserrat-Bold',
      'Montserrat-BoldItalic',
      'Montserrat-Light',
      'Montserrat-LightItalic'
    ][headingFontIndex]
    const bodyFontIndex = headingFontIndex < 8 ?
      Math.floor(Math.random() * 2) :
      Math.floor(Math.random() * 3) + 2
    const bodyFontClass  = [
      'bodyFontSans1',
      'bodyFontSans2',
      'bodyFontSerif1',
      'bodyFontSerif2',
      'bodyFontSerif3'
    ][bodyFontIndex]


    const html = `<html class="onboarding font-size-3">
      <head>
        <link rel="stylesheet" type="text/css" href="${server}webview/css/output.css">
        <style type="text/css">
body {
  background-color: ${bgColor};
}

h1 {
  color: ${fgColor} !important;
  font-family: ${headingFont} !important;
}

:root {
  --logo-position: ${Math.round(Math.random() * 500) - 500} ${Math.round(Math.random() * 400) - 20};
}
        </style>
      </head>
      <body class="${bodyFontClass}" style="background-color: ${bgColor}">
        <div class="logo"></div>
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
      <Animated.View style={{
        backgroundColor: bgColor,
        flex: 1,
        overflow: 'hidden',
        width: Dimensions.get('window').width
      }}>
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
        { this.props.index === 2 &&
          <TextButton
            text="Set up an account"
            buttonStyle={{ marginBottom: 0 }}
            onPress={this.endOnboarding}
            buttonStyle={{
              bottom: 80,
              position: 'absolute',
              width: 300,
              alignSelf: 'center'
            }}
          />
        }
      </Animated.View>
    )
  }

}

export default Onboarding
