import React from 'react'
import {Animated, Dimensions, InteractionManager, Linking, ScrollView, View, WebView} from 'react-native'
import CoverImage from './CoverImage'
import ItemTitleContainer from '../containers/ItemTitle'
import FeedInfoContainer from '../containers/FeedInfo'
import {deepEqual, getCachedImagePath} from '../utils/'
import {createItemStyles} from '../utils/createItemStyles'
import {onScrollEnd, scrollHandler} from '../utils/animationHandlers'

class FeedItem extends React.Component {
  constructor(props) {
    super(props)
    this.props = props

    this.scrollOffset = new Animated.Value(0)

    this.state = {
      headerClassList: this.props.item ? this.getHeaderClasses() : [],
      webViewHeight: 500,
      scaleAnim: new Animated.Value(1)
    }

    this.removeBlackHeading = this.removeBlackHeading.bind(this)
    this.updateWebViewHeight = this.updateWebViewHeight.bind(this)
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
          isDiff = false
          this.webView.injectJavaScript(`setFontSize(${nextProps.fontSize})`)
          break

        case 'isDarkBackground':
          isDiff = false
          this.webView.injectJavaScript(`toggleDarkBackground(${nextProps.isDarkBackground})`)
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
    return this.props.item && typeof this.props.item.content_html !== 'undefined'
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
      ...styles.fontClasses,
      'itemArticle',
      styles.color,
      styles.dropCapFamily === 'header' ? 'dropCapFamilyHeader' : '',
      styles.dropCapIsMonochrome ? 'dropCapIsMonochrome' : '',
      `dropCapSize${styles.dropCapSize}`,
      styles.dropCapIsDrop ? 'dropCapIsDrop' : '',
      styles.dropCapIsBold ? 'dropCapIsBold' : '',
      styles.dropCapIsStroke ? 'dropCapIsStroke' : ''].join(' ')

    let headerClasses = this.state.headerClassList.join(' ')

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

    const html = `<html class="font-size-${this.props.fontSize}">
      <head>
        <link rel="stylesheet" type="text/css" href="${server}webview/css/output.css">
      </head>
      <body class="${visibleClass} ${scrollingClass} ${blockquoteClass}">
        <article
          class="${articleClasses} ${this.props.isDarkBackground ? 'dark-background' : ''}"
          style="min-height: ${height}px; width: 100vw;">
          ${body}
        </article>
      </body>
      <script src="${server}webview/js/feed-item.js"></script>
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

    const coverImage = <CoverImage
            styles={styles.coverImage}
            scrollOffset={this.scrollOffset}
            imagePath={!!hasCoverImage && getCachedImagePath(this.props.item)}
            imageDimensions={!!hasCoverImage && imageDimensions}
            feedTitle={this.props.item.feed_title}
          />

    const that = this

    return (
      <Animated.View style={{
        flex: 1,
        overflow: 'hidden',
        transform: [
          { scaleX: this.state.scaleAnim },
          { scaleY: this.state.scaleAnim }
        ]
      }}>
        {showCoverImage && !styles.isCoverInline && coverImage}
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
          scrollEventThrottle={1}
          style={{flex: 1}}
        >
          {showCoverImage && styles.isCoverInline && coverImage}
          <ItemTitleContainer
            item={this.props.item}
            index={this.props.index}
            title={title}
            excerpt={this.props.item.excerpt}
            date={created_at}
            scrollOffset={this.scrollOffset}
            font={styles.fontClasses[0]}
            bodyFont={styles.fontClasses[1]}
            hasCoverImage={hasCoverImage}
            showCoverImage={showCoverImage}
            coverImageStyles={styles.coverImage}
          />
          {false &&
          <FeedInfoContainer
            index={this.props.index}
          />}
          <WebView
            decelerationRate='normal'
            injectedJavaScript={calculateHeight}
            onMessage={(event) => {
              const msg = event.nativeEvent.data
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
    this.props.setScrollOffset(this.props.item, scrollOffset)
    onScrollEnd()
  }

  //called when HTML was loaded and injected JS executed
  updateWebViewHeight (event) {
    const calculatedHeight = parseInt(event.jsEvaluationValue) || this.screenDimensions.height * 2
    if (!this.pendingWebViewHeight || calculatedHeight > this.pendingWebViewHeight) {
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

  getHeaderClasses = () => {
    let classes = ['header']
    let vAlign = ['headerBottom', 'headerMiddle', 'headerTop']
    classes.push(vAlign[Math.floor(Math.random() * 2.5)])
    if ((classes.indexOf('headerMiddle') > 0 && Math.random() > 0.2)
        || Math.random() > 0.5) {
      classes.push('headerCentered')
    }
    // if (Math.random() > 0.8) {
    //   classes.push('headerUnderlined')
    // }
    if (Math.random() > 0.5) {
      classes.push('headerItalic')
    }
    if (Math.random() > 0.9) {
      classes.push('headerBlock')
    } else if (Math.random() > 0.9) {
      classes.push('headerBlockInverse')
    }
    if (this.props.item.title && this.props.item.title.length > 80) {
      classes.push('headerSmall')
    // } else if (Math.random() > 0.8 &&
    //     classes.indexOf('headerBlock') === -1 &&
    //     classes.indexOf('headerBlockInverse') === -1) {
    //   classes.push('headerSmall')
    //   classes.push('headerSheepStealer')
    }

    let colors = ['headerBlack', 'header-' + this.props.item.styles.color]
    let index = Math.floor(Math.random() * 2)
    classes.push(colors[index])
    return classes
  }

  // calculateElementWidth = (titleEl) => {
  //   let titleWidth = titleEl.getBoundingClientRect().width

  //   // TODO calculate padding/margin + padding of parent
  //   titleWidth += 28

  //   return titleWidth
  // }


}

export default FeedItem
