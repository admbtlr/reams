import React from 'react'
import {Animated, Linking, View, WebView} from 'react-native'

class Onboarding extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.props.hideAllButtons()
    this.props.hideLoadingAnimation()
  }

  componentWillMount () {
    if (this.props.index > 8) {
      this.props.showItemButtons()
      if (this.props.index > 12) {
        this.props.showViewButtons()
      }
    } else {
      this.props.hideAllButtons()
    }
  }

  render () {
    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    const bodies = [`<h1>This is Rizzle</h1>
      <p>Rizzle is a feed of the latest content from your favourite websites.</p>
      <p>You subscribe to the sites you love from within Safari, and then every time one of them publishes a new article, it shows up in your Rizzle feed.</p>`,
      `<h1>Getting Started</h1>
      <p>Go to a site in Safari. Try a news site like <a href=“http://www.theguardian.com”>The Guardian</a> or <a href=“http://www.nytimes.com”>The New York Times</a>, or a blog like <a href=“[https://daringfireball.net]”>Daring Fireball</a> or <a href=“[https://www.ribbonfarm.com/]”>Ribbon Farm</a>.</p>
      <p>Once you’re on the site, you need to launch the Rizzle share extension.</p>`,
      `<h1>Launching the Rizzle share extension</h1>
      <p>Click on the share button at the bottom to show all your share extensions:</p>
      <img src="${server}webview/img/share.png" style="width: 156px;">
      <p>The first time you do this, you will need to activate the Rizzle extension.</p>`,
      `<h1>Activating the Rizzle share extension</h1>
      <p>Click on the <i>More</i> button in the middle row:</p>
      <img src="${server}webview/img/more.png" style="width: 183px;">
      <p>Find <i>Save to Rizzle</i> in the list and toggle it on. Tap done, and now you can select <i>Save to Rizzle</i>.</p>`,
      `<h1>Using the Rizzle Share Extension</h1>
      <p>The share extension consists of two buttons. The top button searches for a feed from the site that you're on, and lets you subscribe to it in Rizzle.</p>
      <p>Unfortunately not all sites offer feeds, but Rizzle will do its best to find one for you.</p>`,
      `<h1>The Bottom Button</h1>
      <p>The bottom button saves the page you’re currently looking at, rather than subscribing to the site.</p>
      <p>Use this if there’s an article that you want to store in Rizzle to read later, or if you find that the Rizzle reading experience is better than what the site itself offers.</p>`,
      `<h1>Back to Rizzle</h1>
      <p>When you return to Rizzle, it will ask you to confirm that you want to subscribe to the site. Once you confirm, Rizzle will load new articles from all the sites that you have subscribed to.</p>`,
      `<h1>Like Tinder, but for Content</h1>
      <p>Rizzle art directs each article for you. If something looks interesting, scroll down to read it. If it looks <em>really</em> interesting, you can save it for later (we’ll explain how in a minute).</p>
      <p>Once you swipe past an article, you’re basically saying ”I’m done with that”; unless you save it, the next time Rizzle refreshes its feeds, that article will disappear.</p>`,
      `<h1>Buttons!</h1>
      <p>The button on the left shows you how many articles are currently in your feed, and how many you have already read (or swiped past).</p>
      <p>Tapping it will switch to saved mode: this is how you can access all the articles you’ve saved, either from within Rizzle or by using the share extension.</p>`,
      `<h1>The middle buttons</h1>
      <p>The button with the star on it lets you save an article; tapping it will put a copy of the article into your saved area.</p>
      <p>The next button lets you share an article.</p>`,
      `<h1>The mysterious fourth button</h1>
      <p>Sometimes sites will only make article synopses available in their feed. The button on the right switches between the text in the feed and the whole article. It uses <a href="https://www.postlight.com">Postlight</a>’s wonderful Mercury service.</p>
      <p>In blogs that use link posts, it will switch between the commentary posted to the blog and the text of the linked article.</p>`,
      `<h1>Even more buttons!</h1>
      <p>Tapping on the odd looking button in the top right displays three more buttons, which allow you to change the font size, and to switch between light and dark views.</p>`,
      `<h1>Congratulations</h1>
      <p>You are now a certified Rizzle Power User. This certification gives you the authority to subscribe, swipe and save your way across the web.</p>
      <p>Use your new–found powers wisely!</p>`
    ]

    const swipeArrow = this.props.index < 8 ?
      '<div class="swipe"><em>(Swipe to continue)</em></div>' :
      ''

    const html = `<html class="onboarding font-size-3">
      <head>
        <link rel="stylesheet" type="text/css" href="${server}webview/css/output.css">
      </head>
      <body>
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
        flex: 1,
        overflow: 'hidden',
      }}>
        <WebView
          decelerationRate='normal'
          onMessage={(event) => {
          }}
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
          {...openLinksExternallyProp}
        />
      </Animated.View>
    )
  }

}

export default Onboarding
