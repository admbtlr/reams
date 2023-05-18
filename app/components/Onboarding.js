import React from 'react'
import {ActionSheetIOS, Animated, Dimensions, Linking, Text, View} from 'react-native'
import {WebView} from 'react-native-webview'
import { openLink } from '../utils/open-link'
import { hslString } from '../utils/colors'
import TextButton from './TextButton'
import { useDispatch, useSelector } from 'react-redux'
import { HIDE_ALL_BUTTONS, HIDE_LOADING_ANIMATION } from '../store/ui/types'
import { TOGGLE_ONBOARDING } from '../store/config/types'

export const pages = [{
    heading: 'Reams',
    subhead: 'Deeply Superficial Reading',
    body: 'Reams is for people who love to read. It‘s all about the immersive pleasures of text and image.'
  },
  {
    body: 'Reams uses <strong>infernally complex logic</strong>, a <strong>sprinkling of AI</strong> and a <strong>whole lot of attention to typrographic detail</strong> to turn your reading into a stunning, immersive experience.'
  },
  {
    body: 'New articles flow through your <strong>feed</strong>. Want to keep one of them? Save it to your <strong>library</strong>.</p><p>You can also save articles to your library from Safari with the <strong>Reams share extension</strong>, which also lets you add new sites to your feed.</p>'
  },
  {
    body: `Let's set up the share extension now. When you press the button below, you\'ll see the share sheet. Scroll to the right and tap <strong>More</strong>:</p>
    <img src="webview/img/enable-share-1.jpg" style="width: 890px;">
    <p>Tap <strong>Edit</strong>:</p>
    <img src="webview/img/enable-share-2.jpg">
    <p>Turn on the switch next to <strong>Reams</strong>:</p>
    <img src="webview/img/enable-share-3.jpg">
    <p>Then tap <strong>Done</strong>, then <strong>Done</strong> again.`
  },
  {
    body: 'Now you\'re ready to use Reams. Tap the button below to get started.'
  }
]

export default function Onboarding ({index, navigation}) {
  const dispatch = useDispatch()
  const isDarkMode = useSelector(state => state.ui.isDarkMode)

  const hideAllButtons = () => dispatch({ type: HIDE_ALL_BUTTONS })
  const hideLoadingAnimation = () => dispatch({ type: HIDE_LOADING_ANIMATION })
  const endOnboarding = () => dispatch({ type: TOGGLE_ONBOARDING, isOnboarding: false })

  hideAllButtons()
  hideLoadingAnimation()

  const endOnboardingAndResetNav = () => {
    endOnboarding()
    navigation.reset({
      index: 0,
      routes: [{name: 'Account'}]})
  }

  const openShareSheet = () => {
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: 'https://reams.app',
      message: 'Reams is for people who love to read. It‘s all about the immersive pleasures of text and image.',
      title: 'Reams'
    },
    (error) => {
      console.error(error)
    },
    (success, method) => {
    }
  )

  }

  let server = ''
  if (__DEV__) {
    server = 'http://localhost:8888/'
  }

  // const bodies = [`<div class="everything"><h1>Reams</h1>
  //   <p class="subhead">Deeply Superficial RSS</p>
  //   <div class="content">
  //   <p>Reams is for people who love to read. It’s all about the immersive pleasures of text and image.</p>
  //   <p>(<a href="https://aboutfeeds.com/">What’s RSS?</a>)</p></div></div>`,
  //   `<div class="everything"><div class="content"><p>Each story is algorithmically art-directed for you. If something looks interesting, go ahead and read it. If it looks <em>really</em> interesting, save it for&nbsp;later.</p></div></div>`,
  //   `<div class="everything"><div class="content"><p>You can subscribe to sites from the built-in library. Or you can use the Reams Share Extension for Safari – which also lets you save <em>any</em> web page to read in Reams.</p>
  //   </div></div>`
  // ]

  const makePage = (index) => `
<div class="everything">
  ${pages[index].heading ? `<h1>${pages[index].heading}</h1>` : ''}
  ${pages[index].subhead ? `<p class="subhead">${pages[index].subhead}</p>` : ''}
  <div class="content">
    <p>${pages[index].body}</p>
  </div>
</div>`

  const swipeArrow = index < (pages.length - 1) ?
    `<div class="swipe">swipe &gt;&gt;&gt;</div>` :
    ''

  const headingFont = [
    'IBMPlexSans-Bold',
    'IBMPlexSansCondensed-Bold',
    'PlayfairDisplay-Bold',
    'IBMPlexSans-Bold',
    'IBMPlexSansCondensed-Bold',
  ][index]
  const bodyFontClass = [
    'bodyFontSerif1',
    'bodyFontSerif2',
    'bodyFontSans1',
    'bodyFontSerif1',
    'bodyFontSerif2',
  ][index]

  const backgroundColor = [
    'rizzleBG',
    'logo2',
    'logo1',
    'rizzleBG',
    'logo2',
    'logo1'
  ][index]

  const html = `<html class="onboarding onboarding-${index} font-size-3 ${isDarkMode ? 'dark-background' : ''}">
    <head>
      <link rel="stylesheet" type="text/css" href="${server}webview/css/output.css">
      <link rel="stylesheet" type="text/css" href="${server}webview/css/fonts.css">
    </head>
    <body class="${bodyFontClass}">
      <!--div class="bg1"></div>
      <div class="bg2"></div-->
      <article>
        ${makePage(index)}
      </article>
      ${swipeArrow}
    </body>
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
      { index >= (pages.length - 2) &&
        <View style={{
          bottom: 60,
          right: index === pages.length - 1 ? "5%" : 'auto',
          position: 'absolute',
          alignSelf: index === pages.length - 1 ? 'flex-start' : 'center'
        }}>
          <TextButton
            text={index === pages.length - 1 ? "Get started with Reams" : "Open share sheet"}
            onPress={index === pages.length - 1 ? endOnboardingAndResetNav : openShareSheet}
            buttonStyle={{
            }}
            testID='super-simple-set-up-button'
          />
        </View>
      }
    </Animated.View>
  )
}
