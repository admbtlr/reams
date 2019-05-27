import React from 'react'
import {Animated, Dimensions, InteractionManager, Linking, ScrollView, View, WebView} from 'react-native'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import CoverImage from './CoverImage'
import ItemTitleContainer from '../containers/ItemTitle'
import {deepEqual, getCachedImagePath} from '../utils/'
import {createItemStyles} from '../utils/createItemStyles'
import {onScrollEnd, scrollHandler} from '../utils/animationHandlers'
import { hslString } from '../utils/colors'
import log from '../utils/log'

class FeedItem extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    // if (__DEV__) {
    //   this.props.item.styles = createItemStyles(this.props.item)
    // }

    this.scrollOffset = new Animated.Value(0)

    this.state = {
      webViewHeight: 500,
      scaleAnim: new Animated.Value(1)
    }

    this.removeBlackHeading = this.removeBlackHeading.bind(this)
    this.updateWebViewHeight = this.updateWebViewHeight.bind(this)
    this.openLink = this.openLink.bind(this)
  }

  componentDidMount () {
    // this.loadMercuryStuff()
    // this.resizeTitleFontToFit()
    // this.markShortParagraphs()
    // this.markFirstParagraph()
    // this.hideFeedFlare()
  }

  diff (a, b, changes = {}) {
    changes = this.oneWayDiff (a, b, changes)
    return this.oneWayDiff(b, a, changes)
  }

  oneWayDiff (a, b, changes) {
    for (var key in a) {
      if (a[key] !== b[key] && changes[key] === undefined) {
        changes[key] = {
          old: a[key],
          new: b[key]
        }
      }
    }
    return changes
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.isAnimating) return true
    let changes
    let isDiff = !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState)
    // console.log('Should update? - '
      // + this.props.item.title
      // + (isDiff ? ' - YES' : ' - NO'))
    if (isDiff) {
      changes = this.diff(this.props, nextProps, this.diff(this.state, nextState))
      // console.log(this.props.item._id + ' (' + this.props.item.title + ') will update:')
      // console.log(changes)
    }

    // various special cases
    if (changes && Object.keys(changes).length === 1) {
      switch (Object.keys(changes)[0]) {
        case 'isVisible':
          isDiff = false
          // this is a bit sneaky...
          if (nextProps.isVisible) {
            scrollHandler(this.scrollOffset)
            // and let the world (i.e. the topbar and buttons) know that the scroll handler has changed
            this.props.scrollHandlerAttached(this.props.item._id)
          }
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

        case 'isImageViewerVisible':
          isDiff = false
          if (!this.props.isVisible) break
          this.isAnimating = true
          let toValue = 1
          const that = this
          if (nextProps.isImageViewerVisible) {
            toValue = 0.9
          }
          Animated.timing(
            this.state.scaleAnim,
            { toValue }).start(() => {
              setTimeout(() => {
                that.isAnimating = false
              }, 2000)
            })
          break

        case 'scaleAnim':
          isDiff = false
      }
    }
    return isDiff
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
      return <View style={{ flex: 1 }} />
    }

    if (/*__DEV__ || */!this.props.item.styles) {
      this.props.item.styles = createItemStyles(this.props.item)
    }
    let {
      feed_title,
      url,
      title,
      author,
      banner_image,
      content_html,
      content_mercury,
      hasCoverImage,
      imageDimensions,
      showCoverImage,
      styles,
      created_at,
      excerpt
    } = this.props.item
    // console.log(`-------- RENDER: ${title} ---------`)
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

    this.screenDimensions = Dimensions.get('window')
    const height = this.screenDimensions.height
    const calculateHeight = `(document.body && document.body.scrollHeight) ? document.body.scrollHeight : ${height * 2}`

    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }

    if (this.props.isVisible) {
      scrollHandler(this.scrollOffset)
    }

    if (!showCoverImage || this.isCoverImagePortrait()) {
      styles.coverImage.isInline = false
    }

    const authorHeading = !!author ? `<h2 class="author">${author}</h2>` : ''
    const excerptPara = !!excerpt ? `<p class="excerpt">${excerpt}</p>` : ''

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
        <link rel="stylesheet" type="text/css" href="${server}webview/css/output.css">
      </head>
      <body class="${visibleClass} ${scrollingClass} ${blockquoteClass}" data-cover="${data}">
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
            imagePath={!!hasCoverImage && getCachedImagePath(this.props.item)}
            imageDimensions={!!hasCoverImage && imageDimensions}
            feedTitle={this.props.item.feed_title}
          />

    return (
      <Animated.View style={{
        flex: 1,
        overflow: 'hidden',
        transform: [
          { scaleX: this.state.scaleAnim },
          { scaleY: this.state.scaleAnim }
        ]
      }}>
        { showCoverImage && !styles.isCoverInline && coverImage }
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: {
              contentOffset: { y: this.scrollOffset }
            }}],
            { useNativeDriver: true }
          )}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
          onScrollEndDrag={this.onScrollEndDrag}
          ref={(ref) => { this.scrollView = ref }}
          scrollEventThrottle={16}
          style={{flex: 1}}
        >
          { showCoverImage && styles.isCoverInline && coverImage }
          <ItemTitleContainer
            item={this.props.item}
            index={this.props.index}
            title={title}
            excerpt={this.props.item.excerpt}
            date={created_at}
            scrollOffset={this.scrollOffset}
            font={styles.fontClasses.heading}
            bodyFont={styles.fontClasses.body}
            hasCoverImage={hasCoverImage}
            showCoverImage={showCoverImage}
            coverImageStyles={styles.coverImage}
          />
          <WebView
            decelerationRate='normal'
            injectedJavaScript={calculateHeight}
            onMessage={(event) => {
              const msg = decodeURIComponent(decodeURIComponent(event.nativeEvent.data))
              if (msg.substring(0, 6) === 'image:') {
                that.props.showImageViewer(msg.substring(6))
              } else if (msg.substring(0, 5) === 'link:') {
                const url = msg.substring(5)
                // console.log('OPEN LINK: ' + url)
                if (!__DEV__) {
                  Linking.openURL(url)                }
              }
            }}
            {...openLinksExternallyProp}
            originWhitelist={['*']}
            ref={(ref) => { this.webView = ref }}
            scalesPageToFit={false}
            scrollEnabled={false}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: this.state.webViewHeight,
              backgroundColor: 'red'
            }}
            source={{
              html: html,
              baseUrl: 'web/'}}
            onNavigationStateChange={this.updateWebViewHeight}
          />
        </Animated.ScrollView>
      </Animated.View>
    )
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
    onScrollEnd()
  }

  //called when HTML was loaded and injected JS executed
  updateWebViewHeight (event) {
    const calculatedHeight = parseInt(event.jsEvaluationValue) || this.screenDimensions.height// * 2
    if (!this.pendingWebViewHeight || calculatedHeight !== this.pendingWebViewHeight) {
      this.pendingWebViewHeight = calculatedHeight
    }

    // console.log(`updateWebViewHeight! ${calculatedHeight}`)
    const that = this
    // debounce
    if (!this.pendingWebViewHeightId) {
      this.pendingWebViewHeightId = setTimeout(() => {
        that.setState({
          ...that.state,
          webViewHeight: that.pendingWebViewHeight
        })
        that.pendingWebViewHeightId = null
      }, 1000)
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
