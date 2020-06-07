import React from 'react'
import {Animated, Dimensions, Easing, Linking, View} from 'react-native'
import {WebView} from 'react-native-webview'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import CoverImage from './CoverImage'
import ItemTitleContainer from '../containers/ItemTitle'
import {deepEqual, deviceCanHandleAnimations, diff, getCachedCoverImagePath} from '../utils/'
import { hslString } from '../utils/colors'
import log from '../utils/log'

const calculateHeight = `
  (document.body && document.body.scrollHeight) &&
    window.ReactNativeWebView.postMessage(getHeight())
`

const INITIAL_WEBVIEW_HEIGHT = 1000

class FeedItem extends React.Component {
  // static whyDidYouRender = true
  constructor(props) {
    super(props)
    this.props = props
    // if (__DEV__) {
    //   this.props.item.styles = createItemStyles(this.props.item)
    // }

    this.scrollAnim = new Animated.Value(0)

    this.state = {
      webViewHeight: INITIAL_WEBVIEW_HEIGHT
    }

    this.initAnimatedValues(false)

    this.removeBlackHeading = this.removeBlackHeading.bind(this)
    this.updateWebViewHeight = this.updateWebViewHeight.bind(this)
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this)
    this.openLink = this.openLink.bind(this)

    this.screenDimensions = Dimensions.get('window')
    this.hasWebViewResized = false
  }

  initAnimatedValues (isMounted) {
    const { panAnim } = this.props
    const anims = [0, 0, 0, 0, 0, 0].map((a, i) => {
      const inputRange = [0, 0.3, 0.7, 1, 1.3 - i * 0.05, 1.7 + i * 0.05, 2]
      const outputRange = [0, 0.3, 0.7, 1, 1.3, 1.7, 2]
      // console.log(inputRange)
      // console.log(outputRange)
      return panAnim.interpolate({
        inputRange,
        outputRange
      })
    })
    if (isMounted) {
      this.anims = anims
      // weird little hack to ensure a re-render
      // (when I put the anims into state I got ugly errors)
      this.setState({
        animsUpdated: Date.now()
      })
    } else {
      this.anims = anims
    }
  }

  addAnimation (style, anim) {
    const width = Dimensions.get('window').width * 0.05
    return {
      ...style,
      left: width,
      opacity: anim.interpolate({
        inputRange: [0, 1, 1.05, 1.1, 2],
        outputRange: [1, 1, 1, 0, 0]
      }),
      transform: [{
        translateX: anim.interpolate({
          inputRange: [0, 1.01, 1.1, 2],
          outputRange: [-width, -width, width * 4, width * 4]
        })
      }]
    }
  }
  
  componentDidMount () {
    const {
      isVisible,
      item,
      setScrollAnim,
    } = this.props
    if (isVisible) {
      setScrollAnim(this.scrollAnim)
      // scrollHandlerAttached(item._id)
      item.scrollRatio > 0 && this.scrollToOffset()
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.isAnimating) return true
    const { item } = this.props
    let changes
    let isDiff = !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState)
    if (isDiff) {
      changes = diff(this.props, nextProps, diff(this.state, nextState))
    }

    // various special cases
    if (changes && changes.item && Object.keys(changes.item).length === 0) {
      delete changes.item
    }
    if (changes && Object.keys(changes).length === 0) {
      isDiff == false
    } else if (changes && Object.keys(changes).length === 1) {
      switch (Object.keys(changes)[0]) {
        case 'isVisible':
          isDiff = false
          // this is a bit sneaky...
          if (nextProps.isVisible) {
            this.props.setScrollAnim(this.scrollAnim)
          }
          break

        case 'fontSize':
          if (this.webView) {
            isDiff = false
            this.webView.injectJavaScript(`setFontSize(${nextProps.fontSize})`)
          }
          break

        case 'isDarkMode':
          if (this.webView) {
            isDiff = false
            this.webView.injectJavaScript(`toggleDarkMode(${nextProps.isDarkMode})`)
          }
          break

        case 'index':

        case 'item':
          if (Object.keys(changes.item).length === 1) {
            switch (Object.keys(changes.item)[0]) {
              case 'scrollRatio':
              case 'readingTime':
              case 'readAt':
                isDiff = false
                break
            }
          }
          break

        case 'panAnim':
          console.log('panAnim changed!')
      }
    }
    return isDiff
  }

  componentDidUpdate (prevProps) {
    const { isVisible, item, setScrollAnim } = this.props
    if (this.props.renderDate !== prevProps.renderDate) {
      this.initAnimatedValues(true)
    }
    if (isVisible && !prevProps.isVisible) {
      setScrollAnim(this.scrollAnim)
      item.scrollRatio > 0 && this.scrollToOffset()
    }
  }

  scrollToOffset () {
    const that = this
    const item = that.props.item
    setTimeout(() => {
      if (!that.scrollView || !that.hasWebViewResized) return
      if (!item.scrollRatio || typeof item.scrollRatio !== 'object') return
      const scrollRatio = item.scrollRatio[item.showMercuryContent ? 'mercury' : 'html']
      if (!scrollRatio) return
      that.scrollView._component.scrollTo({
        x: 0,
        y: scrollRatio * that.state.webViewHeight,
        animated: true
      })
    }, 2000)
  }

  isCoverImagePortrait () {
    const {imageDimensions} = this.props.item
    return imageDimensions && imageDimensions.height > imageDimensions.width
  }

  isInflated () {
    const inflated = typeof this.props.item.content_html !== 'undefined'
    return inflated
  }

  render () {
    if (!this.isInflated()) {
      return <View style={{
        width: this.screenDimensions.width,
        height: this.screenDimensions.height }} />
    }

    const {
      isVisible,
      item,
      showMercuryContent 
    } = this.props
    let {
      title,
      author,
      banner_image,
      content_html,
      content_mercury,
      faceCentreNormalised,
      feed_color,
      hasCoverImage,
      imageDimensions,
      showCoverImage,
      styles,
      created_at,
      excerpt,
      savedAt
    } = this.props.item
    // if (isVisible) {
    //   console.log(`-------- RENDER: ${title} ---------`)
    //   this.panAnimListener = panAnim.addListener(v => {
    //     console.log(title + ' ' + v.value)
    //   })
    // } else {
    //   if (this.panAnimListener) this.panAnimListener.removeListener()
    // }
    // let bodyHtml = { __html: body }
    const { webViewHeight } = this.state

    let articleClasses = [
      ...Object.values(styles.fontClasses),
      'itemArticle',
      styles.color,
      styles.dropCapFamily === 'header' ? 'dropCapFamilyHeader' : '',
      styles.dropCapIsMonochrome ? 'dropCapIsMonochrome' : '',
      `dropCapSize${styles.dropCapSize}`,
      styles.dropCapIsDrop ? 'dropCapIsDrop' : '',
      styles.dropCapIsBold ? 'dropCapIsBold' : '',
      styles.dropCapIsStroke ? 'dropCapIsStroke' : ''].join(' ')

    const visibleClass = isVisible
      ? 'visible'
      : ''
    const scrollingClass = this.scrollAnim === 0
      ? ''
      : 'scrolling'
    const blockquoteClass = styles.hasColorBlockquoteBG ? 'hasColorBlockquoteBG' : ''

    const minHeight = webViewHeight === INITIAL_WEBVIEW_HEIGHT ? 0 : webViewHeight
    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    if (!showCoverImage || this.isCoverImagePortrait()) {
      styles.coverImage.isInline = false
      styles.isCoverInline = false
    }

    // not sure how this can happen...
    content_html = content_html || ''

    let body = showMercuryContent ? content_mercury : content_html
    body = body || ''
    body = this.stripInlineStyles(body)
    body = this.stripEmptyTags(body)
    body = this.stripUTags(body)

    // hide the image in the body to avoid repetition
    let data = ''
    if (styles.coverImage.isInline) {
      data = banner_image
    }

    const feedColor = item.feed_color ?
      hslString(feed_color, this.props.isDarkMode ? 'darkmode' : '') :
      hslString('logo1')

    const html = `<html class="font-size-${this.props.fontSize} ${this.props.isDarkMode ? 'dark-background' : ''}">
  <head>
    <style>
:root {
  --feed-color: ${feedColor};
  --font-path-prefix: ${ server === '' ? '../' : server };
}
    </style>
    <link rel="stylesheet" type="text/css" href="${server}webview/css/output.css">
    <link rel="stylesheet" type="text/css" href="${server}webview/css/fonts.css">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  </head>
  <body class="${visibleClass} ${scrollingClass} ${blockquoteClass} ${this.props.displayMode}" data-cover="${data}">
    <article
      class="${articleClasses}"
      style="min-height: ${minHeight}px; width: 100vw;">
      ${body}
    </article>
  </body>
  <script src="${server}webview/js/feed-item.js"></script>
</html>`

    const that = this

    const openLinksExternallyProp = /*__DEV__ ? {} :*/ {
      onShouldStartLoadWithRequest: (e) => {
        if (e.navigationType === 'click') {
          // Linking.openURL(e.url)
          that.openLink(e.url)
          return false
        } else {
          return true
        }
      }
    }

    const coverImage = <CoverImage
            styles={styles.coverImage}
            scrollAnim={this.scrollAnim}
            imagePath={!!hasCoverImage && getCachedCoverImagePath(item)}
            imageDimensions={!!hasCoverImage && imageDimensions}
            faceCentreNormalised={faceCentreNormalised}
            feedTitle={item.feed_title}
          />

    const injectedJavaScript = `
      window.setTimeout(() => {
        if (document.body && document.body.scrollHeight) {
          const height = Math.ceil(document.querySelector('article').getBoundingClientRect().height)
          window.ReactNativeWebView.postMessage('resize:' + height);
        }  
      }, 500)
      true;`

    return (
      <View
        ref={(ref) => { this.view = ref }}
        style={{
          backgroundColor: hslString('bodyBG'),
          flex: 1,
          overflow: 'hidden'
        }}
      >
        { showCoverImage && !styles.isCoverInline && coverImage }
        <Animated.ScrollView
          onScroll={Animated.event(
              [{ nativeEvent: {
                contentOffset: { y: this.scrollAnim }
              }}],
              {
                useNativeDriver: true,
                // listener: event => {
                //   console.log(event.nativeEvent.contentOffset.y)
                //   this.passScrollPositionToWebView(event.nativeEvent.contentOffset.y)
                // }
              }
            )}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
          onScrollEndDrag={this.onScrollEndDrag}
          ref={(ref) => { this.scrollView = ref }}
          scrollEventThrottle={1}
          style={{flex: 1}}
        >
          { showCoverImage && styles.isCoverInline && coverImage }
          <ItemTitleContainer
            anims={this.anims}
            addAnimation={this.addAnimation}
            item={item}
            isVisible={isVisible}
            title={title}
            excerpt={item.excerpt}
            date={savedAt || created_at}
            scrollOffset={this.scrollAnim}
            font={styles.fontClasses.heading}
            bodyFont={styles.fontClasses.body}
            hasCoverImage={hasCoverImage}
            showCoverImage={showCoverImage}
            coverImageStyles={styles.coverImage}
            layoutListener={(bottomY) => this.setWebViewStartY(bottomY)}
          />
          <Animated.View style={webViewHeight !== INITIAL_WEBVIEW_HEIGHT && // avoid https://sentry.io/organizations/adam-butler/issues/1608223243/
            (styles.coverImage.isInline || !showCoverImage) ? 
              this.addAnimation({}, this.anims[5]) :
              {}}>
            <WebView
              allowsFullscreenVideo={true}
              decelerationRate='normal'
              injectedJavaScript={ injectedJavaScript }
              mixedContentMode='compatibility'
              onMessage={(event) => {
                const msg = decodeURIComponent(decodeURIComponent(event.nativeEvent.data))
                if (msg.substring(0, 6) === 'image:') {
                  that.props.showImageViewer(msg.substring(6))
                } else if (msg.substring(0, 5) === 'link:') {
                  const url = msg.substring(5)
                  // console.log('OPEN LINK: ' + url)
                  if (!__DEV__) {
                    Linking.openURL(url)
                  }
                } else if (msg.substring(0,7) === 'resize:') {
                  that.updateWebViewHeight(parseInt(msg.substring(7)))
                }
              }}
              onNavigationStateChange={this.onNavigationStateChange}
              {...openLinksExternallyProp}
              originWhitelist={['*']}
              ref={(ref) => { this.webView = ref }}
              scalesPageToFit={false}
              scrollEnabled={false}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: webViewHeight,
                backgroundColor: this.props.isDarkMode ? 'black' : hslString('rizzleBg')
              }}
              source={{
                html: html,
                baseUrl: 'web/'}}
            />
          </Animated.View>
        </Animated.ScrollView>
      </View>
    )
  }

  setWebViewStartY (y) {
    // this is causing the `CALayerInvalidGeometry` bug
    // https://sentry.io/organizations/adam-butler/issues/1608223243
    // so don't call setState for now until I figure it out
    // (to do with the animation that is set of the Animated.View that holds the WebView)
    if (y < this.screenDimensions.height) {
      // this.setState({
      //   webViewHeight: Math.round(this.screenDimensions.height - y)
      // })
    }
  }

  passScrollPositionToWebView (position) {
    // console.log(position)
  }

  launchImageViewer (url) {
    this.props.showImageViewer(url)
  }

  async openLink (url) {
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'close',
          preferredBarTintColor: 'white',
          preferredControlTintColor: hslString(this.props.item.feed_color),
          readerMode: false,
          // Android Properties
          showTitle: true,
          toolbarColor: '#6200EE',
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_bottom',
            startExit: 'slide_out_bottom',
            endEnter: 'slide_in_bottom',
            endExit: 'slide_out_bottom',
          },
        })
      }
    } catch (error) {
      log('openLink', error)
    }
  }

  // nasty workaround to figure out scrollEnd
  // https://medium.com/appandflow/react-native-collapsible-navbar-e51a049b560a
  onScrollEndDrag = (e) => {
    const that = this
    const offset = e.nativeEvent.contentOffset.y
    this.scrollEndTimer = setTimeout(() => {
      that.onMomentumScrollEnd.apply(that, [offset])
    }, 250)
  }

  onMomentumScrollBegin = (e) => {
    clearTimeout(this.scrollEndTimer)
  }

  onMomentumScrollEnd = (scrollOffset) => {
    scrollOffset = typeof scrollOffset === 'number' ?
      scrollOffset :
      scrollOffset.nativeEvent.contentOffset.y
    this.props.setScrollOffset(this.props.item, scrollOffset, this.state.webViewHeight)
    this.props.onScrollEnd(scrollOffset)
  }

  // called when HTML was loaded and injected JS executed
  onNavigationStateChange (event) {
    // this means we're loading an image
    if (event.url.startsWith('react-js-navigation')) return
    const calculatedHeight = parseInt(event.jsEvaluationValue)
    if (calculatedHeight) {
      this.updateWebViewHeight(calculatedHeight)
    }
  }

  updateWebViewHeight (height) {
    if (!this.pendingWebViewHeight || height !== this.pendingWebViewHeight) {
      this.pendingWebViewHeight = height
    }

    if (Math.abs(height - this.state.webViewHeight) < height * 0.1) {
      return
    }
    // console.log('Trying to set webview height: ' + this.pendingWebViewHeight)

    const that = this
    if (this.pendingWebViewHeight !== this.state.webViewHeight) {
      // debounce
      if (!this.pendingWebViewHeightId) {
        this.pendingWebViewHeightId = setTimeout(() => {
          that.setState({
            ...that.state,
            webViewHeight: that.pendingWebViewHeight
          })
          that.scrollToOffset()
          that.pendingWebViewHeightId = null
          that.hasWebViewResized = true
        }, 500)
      }
    }
  }

  removeBlackHeading () {
    if (this.props.item.styles.title.color === 'black') {
      this.props.item.styles.title.color = 'white'
    }
  }

  stripInlineStyles (html) {
    if (!html) return html
    const pattern = new RegExp(/style=".*?"/, 'g')
    return html.replace(pattern, '')
  }

  stripEmptyTags (html) {
    const pattern = new RegExp(/<[^\/<]+?>\s*?<\/.+?>/, 'g')
    return html ? html.replace(pattern, '') : html
  }

  stripUTags (html) {
    const pattern = new RegExp(/<\/?u>/, 'g')
    return html.replace(pattern, '')
  }

  // openLinksExternally (e) {
  //   let el = e.target
  //   // TODO don't rely on this
  //   while (el.tagName !== 'ARTICLE') {
  //     if (el.tagName === 'A') {
  //       e.stopPropagation()
  //       e.preventDefault()
  //       let url = el.getAttribute('href')
  //       window.open(url, '_system')
  //       break
  //     }
  //     el = el.parentElement
  //   }
  // }

  // getOverlayInlineStyles () {
  //   let baseStyle = 'height: 100vh;'
  //   let extras = ''

  // calculateElementWidth = (titleEl) => {
  //   let titleWidth = titleEl.getBoundingClientRect().width

  //   // TODO calculate padding/margin + padding of parent
  //   titleWidth += 28

  //   return titleWidth
  // }


}

export default FeedItem
