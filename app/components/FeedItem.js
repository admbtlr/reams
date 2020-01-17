import React from 'react'
import {Animated, Dimensions, InteractionManager, Linking, ScrollView, View} from 'react-native'
import {WebView} from 'react-native-webview'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import CoverImage from './CoverImage'
import ItemTitleContainer from '../containers/ItemTitle'
import {deepEqual, diff, getCachedCoverImagePath} from '../utils/'
import {createItemStyles} from '../utils/createItemStyles'
import {onScrollEnd, scrollHandler} from '../utils/animationHandlers'
import { hslString } from '../utils/colors'
import log from '../utils/log'

const calculateHeight = `
  (document.body && document.body.scrollHeight) &&
    window.ReactNativeWebView.postMessage(getHeight())
`

class FeedItem extends React.Component {
  // static whyDidYouRender = true
  constructor(props) {
    super(props)
    this.props = props
    // if (__DEV__) {
    //   this.props.item.styles = createItemStyles(this.props.item)
    // }

    this.scrollOffset = new Animated.Value(0)

    this.state = {
      webViewHeight: 0,
      scaleAnim: new Animated.Value(1)
    }

    this.removeBlackHeading = this.removeBlackHeading.bind(this)
    this.updateWebViewHeight = this.updateWebViewHeight.bind(this)
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this)
    this.openLink = this.openLink.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.setFadeInFunction = this.setFadeInFunction.bind(this)

    this.screenDimensions = Dimensions.get('window')

    // use this to that we can call startTimer() from SwipeableViews
    // (not great, but OK)
    this.view = React.createRef()
  }

  startTimer () {
    this.titleFadeIn && this.titleFadeIn()
  }

  componentDidMount () {
    this.props.setTimerFunction(this.startTimer)
    if (this.props.isVisible && this.props.item.scrollRatio > 0) {
      this.scrollToOffset()
    }
  }

  setFadeInFunction (fadeInFunction) {
    this.titleFadeIn = fadeInFunction
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.isAnimating) return true
    let changes
    let isDiff = !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState)
    // console.log('Should update? - '
      // + this.props.item.title
      // + (isDiff ? ' - YES' : ' - NO'))
    if (isDiff) {
      changes = diff(this.props, nextProps, diff(this.state, nextState))
      // console.log(this.props.item._id + ' (' + this.props.item.title + ') will update:')
      // console.log(changes)
    }

    // various special cases
    // (this is horrible, but setTimerFunction is always a change, so filter it out
    // before testing for the special cases)
    if (changes && changes.item && Object.keys(changes.item).length === 0) {
      delete changes.item
    }
    if (changes && changes.setTimerFunction) {
      delete changes.setTimerFunction
    }
    if (changes && Object.keys(changes).length === 0) {
      isDiff == false
    } else if (changes && Object.keys(changes).length === 1) {
      switch (Object.keys(changes).filter(k => k !== 'setTimerFunction')[0]) {
        case 'isVisible':
          isDiff = false
          // this is a bit sneaky...
          if (nextProps.isVisible) {
            scrollHandler(this.scrollOffset)
            // and let the world (i.e. the topbar and buttons) know that the scroll handler has changed
            this.props.scrollHandlerAttached(this.props.item._id)
          }
          // so is this (startTimer() doesn't always get set correctly)
          nextProps.setTimerFunction && nextProps.setTimerFunction(this.startTimer)
          break

        case 'fontSize':
          if (this.webView) {
            isDiff = false
            this.webView.injectJavaScript(`setFontSize(${nextProps.fontSize})`)
          }
          break

        case 'isDarkBackground':
          if (this.webView) {
            isDiff = false
            this.webView.injectJavaScript(`toggleDarkBackground(${nextProps.isDarkBackground})`)
          }
          break

        case 'scaleAnim':
        case 'index':
        case 'setTimerFunction':
          isDiff = false
          break

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
      }
    }
    return isDiff
  }

  componentDidUpdate (prevProps, prevState) {
    const { isVisible, item, scrollHandlerAttached } = this.props
    if (isVisible && !prevProps.isVisible) {
      scrollHandler(this.scrollOffset)
      scrollHandlerAttached(item._id)
      item.scrollRatio > 0 && this.scrollToOffset()
    }
  }

  scrollToOffset () {
    const that = this
    const item = that.props.item
    setTimeout(() => {
      if (!that.scrollView) return
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

    // if (/*__DEV__ ||*/ !this.props.item.styles) {
    //   this.props.item.styles = createItemStyles(this.props.item)
    // }
    let {
      feed_title,
      url,
      title,
      author,
      banner_image,
      content_html,
      content_mercury,
      faceCentreNormalised,
      hasCoverImage,
      imageDimensions,
      showCoverImage,
      styles,
      created_at,
      excerpt,
      savedAt
    } = this.props.item
    console.log(`-------- RENDER: ${title} ---------`)
    // let bodyHtml = { __html: body }
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

    let coverImageClasses = ''
    let coverClasses = ''
    const visibleClass = this.props.isVisible
      ? 'visible'
      : ''
    const scrollingClass = this.scrollOffset === 0
      ? ''
      : 'scrolling'
    const blockquoteClass = styles.hasColorBlockquoteBG ? 'hasColorBlockquoteBG' : ''

    const height = this.screenDimensions.height
    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    if (!showCoverImage || this.isCoverImagePortrait()) {
      styles.coverImage.isInline = false
      styles.isCoverInline = false
    }

    const authorHeading = !!author ? `<h2 class="author">${author}</h2>` : ''
    const excerptPara = !!excerpt ? `<p class="excerpt">${excerpt}</p>` : ''

    // not sure how this can happen...
    content_html = content_html || ''

    let body = this.props.showMercuryContent ? content_mercury : content_html
    body = body || ''
    body = this.stripInlineStyles(body)
    body = this.stripEmptyTags(body)
    body = this.stripUTags(body)

    // hide the image in the body to avoid repetition
    let data = ''
    if (styles.coverImage.isInline) {
      data = banner_image
    }

    const html = `<html class="font-size-${this.props.fontSize} ${this.props.isDarkBackground ? 'dark-background' : ''}">
  <head>
    <style>
:root {
  --feed-color: ${hslString(this.props.item.feed_color, this.props.isDarkBackground ? 'darkmode' : '')};
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
      style="min-height: ${height}px; width: 100vw;">
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
            scrollOffset={this.scrollOffset}
            imagePath={!!hasCoverImage && getCachedCoverImagePath(this.props.item)}
            imageDimensions={!!hasCoverImage && imageDimensions}
            faceCentreNormalised={faceCentreNormalised}
            feedTitle={this.props.item.feed_title}
          />

    return (
      <Animated.View
        ref={(ref) => { this.view = ref }}
        style={{
          backgroundColor: hslString('bodyBG'),
          flex: 1,
          overflow: 'hidden',
          transform: [
            { scaleX: this.state.scaleAnim },
            { scaleY: this.state.scaleAnim }
          ]
        }}
      >
        { showCoverImage && !styles.isCoverInline && coverImage }
        <Animated.ScrollView
          onScroll={Animated.event(
              [{ nativeEvent: {
                contentOffset: { y: this.scrollOffset }
              }}],
              {
                useNativeDriver: true,
                listener: event => {
                  this.passScrollPositionToWebView(event.nativeEvent.contentOffset.y)
                }
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
            item={this.props.item}
            isVisible={this.props.isVisible}
            title={title}
            excerpt={this.props.item.excerpt}
            date={savedAt || created_at}
            scrollOffset={this.scrollOffset}
            font={styles.fontClasses.heading}
            bodyFont={styles.fontClasses.body}
            hasCoverImage={hasCoverImage}
            showCoverImage={showCoverImage}
            coverImageStyles={styles.coverImage}
            setFadeInFunction={this.setFadeInFunction}
          />
          <WebView
            allowsFullscreenVideo={true}
            decelerationRate='normal'
            injectedJavaScript={'(document.body && document.body.scrollHeight) && document.body.scrollHeight'}
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
              height: this.state.webViewHeight,
              backgroundColor: this.props.isDarkBackground ? 'black' : hslString('rizzleBg')
            }}
            source={{
              html: html,
              baseUrl: 'web/'}}
            useWebKit={false}
          />
        </Animated.ScrollView>
      </Animated.View>
    )
  }

  passScrollPositionToWebView (position) {
    // console.log(position)
  }

  launchImageViewer (url) {
    this.props.showImageViewer(url)
  }

  async openLink (url) {
    try {
      await InAppBrowser.isAvailable()
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
    onScrollEnd(scrollOffset)
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
