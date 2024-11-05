import React from 'react'
import {ActivityIndicator, Animated, Dimensions, Easing, Linking, Platform, Text, View} from 'react-native'
import CoverImage from './CoverImage'
import ItemBody from './ItemBody'
import ItemTitleContainer from '../containers/ItemTitle'
import {deepEqual, deviceCanHandleAnimations, diff, getCachedCoverImagePath} from '../utils/'
import { getMargin, getStatusBarHeight } from '../utils/dimensions'
import { hslString } from '../utils/colors'
import { getItem as getItemSQLite } from "../storage/sqlite"
import { getItem as getItemIDB } from "../storage/idb-storage"
import log from '../utils/log'
import { useColor } from '@/hooks/useColor'
import { textInfoStyle } from '@/utils/styles'
import Nudge from './Nudge'
import { MAX_DECORATION_FAILURES } from '../sagas/decorate-items'

export const INITIAL_WEBVIEW_HEIGHT = 1000

class FeedItem extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    // if (__DEV__) {
    //   this.props.item.styles = createItemStyles(this.props.item)
    // }

    this.scrollAnim = new Animated.Value(0)

    this.state = {
      webViewHeight: INITIAL_WEBVIEW_HEIGHT,
      inflatedItem: null,
      hasRendered: false
    }

    this.initAnimatedValues(false)

    this.updateWebViewHeight = this.updateWebViewHeight.bind(this)
    this.addAnimation = this.addAnimation.bind(this)

    this.screenDimensions = Dimensions.get('window')
    this.hasWebViewResized = false

    this.wasShowCoverImage = this.props.item.showCoverImage
    this.currentScrollOffset = 0
    this.hasBegunScroll = false
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
    if (isMounted && this.prevPanAnim !== panAnim) {
      this.anims = anims
      this.prevPanAnim = panAnim
      // weird little hack to ensure a re-render
      // (when I put the anims into state I got ugly errors)
      this.setState({
        animsUpdated: Date.now()
      })
    } else {
      this.anims = anims
    }
  }

  addAnimation (style, anim, isVisible) {
    const width = getMargin()
    const transform = style.transform || []
    if (isVisible) {
      return {
        ...style,
        left: width,
        opacity: anim.interpolate({
          inputRange: [0, 1, 1.05, 1.1, 2],
          outputRange: [1, 1, 1, 1, 1]
        }),
        transform: [
          ...transform,
          {
            translateX: anim.interpolate({
              inputRange: [0, 1.01, 1.1, 2],
              outputRange: [-width, -width, -width, -width]
            })
          }
        ]
      }
    } else {
      return {
        ...style,
        left: width,
        opacity: anim.interpolate({
          inputRange: [0, 1, 1.05, 1.1, 2],
          outputRange: [1, 1, 1, 0, 0]
        }),
        transform: [
          ...transform,
          {
            translateX: anim.interpolate({
              inputRange: [0, 1.01, 1.1, 2],
              outputRange: [-width, -width, width * 4, width * 4]
            })
          }
        ]
      }  
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
          // isDiff = false
          // this is a bit sneaky...
          // if (nextProps.isVisible) {
          //   setTimeout(() => {
          //     this.props.setScrollAnim(this.scrollAnim)
          //   }, 0)
          // }
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
          if (changes && changes.item && Object.keys(changes.item).length === 1) {
            switch (Object.keys(changes.item)[0]) {
              case 'scrollRatio':
              case 'readingTime':
              case 'readAt':
              
              // these two are here because we don't want to re-render ItemBody
              // it already has the cleaned version, since it was the one that did the cleaning
              case 'isMercuryCleaned':
              case 'isHtmlCleaned':
                isDiff = false
                break
            }
          }
          break

        case 'panAnim':
          console.log('panAnim changed!')
          break
      }
    }
    if (isDiff) {
      console.log('changes', changes)
    }
    // don't re-render if the reveal animation is running
    // once the animation has finished the hasRendered state gets set
    // which will trigger a new render anyway
    return !this.isRevealing && isDiff
  }

  componentDidMount () {
    this.props.emitter.on('scrollToRatio', this.scrollToRatioIfVisible.bind(this), this.props.item._id)
    this.inflateItemAndSetState(this.props.item)
    this.hasMounted = true
  }

  componentDidUpdate (prevProps) {
    const { isVisible, item, setScrollAnim } = this.props
    this.initAnimatedValues(true)
    if ((item.isNewsletter || item.isExternal) && 
      ((item.isDecorated && !prevProps.item.isDecorated) ||
      (item.isHtmlCleaned && !prevProps.item.isHtmlCleaned) ||
      (item.isMercuryCleaned && !prevProps.item.isMercuryCleaned)
    )) {
      console.log('(item.isNewsletter || item.isExternal) && item.isDecorated && !prevProps.item.isDecorated')
      this.inflateItemAndSetState(item)
    }
    if (isVisible) {
      setScrollAnim(this.scrollAnim)
    }
  }

  componentWillUnmount () {
    const { emitter, item } = this.props
    emitter.off(item._id)
  }

  async inflateItemAndSetState (item) {
    try {
      const inflatedItem = Platform.OS === 'web' ?
      await getItemIDB(item) :
      await getItemSQLite(item)
      const that = this

      // check whether title is first words of content
      if (inflatedItem.content_html?.length < 1000 && 
        inflatedItem.content_html
          .replace(/<.*?>/g, '')
          .trim()
          .startsWith(inflatedItem.title.replace('...', ''))) {
        inflatedItem.title = ''
      }
      if (inflatedItem.content_html?.length < 1000 && 
        inflatedItem.excerpt?.replace(/<.*?>/g, '')
          .trim()
          .startsWith(inflatedItem.excerpt.replace('...', ''))) {
        inflatedItem.excerpt = ''
      }


      this.setState({
        inflatedItem: {
          ...item,
          ...inflatedItem  
        }
      })
    } catch (err) {
      log('inflateItemAndSetState', err)
    }
    // not sure I actually need this - if it turns out I do, maybe an explanatory comment would be nice?
    // setTimeout(() => {
    //   that.setState({shouldRender: true})
    // }, 200)
  }

  scrollToRatioIfVisible () {
    if (this.props.isVisible) {
      this.scrollToOffset(false, false)
    }
  }

  scrollToOffset (isOverridable = false, useTimeout = true) {
    if (isOverridable && this.hasBegunScroll) return
    const {item} = this.props
    const {webViewHeight} = this.state
    const scrollView = this.scrollView
    if (!scrollView) return
    if (!this.hasWebViewResized) return
    if (!item.scrollRatio || typeof item.scrollRatio !== 'object') return
    const scrollRatio = item.scrollRatio[item.showMercuryContent ? 'mercury' : 'html']
    if (!scrollRatio || scrollRatio === 0) return
    setTimeout(() => {
      if (scrollView) {
        scrollView.scrollTo({
          x: 0,
          y: scrollRatio * webViewHeight,
          animated: true
        })
      }
    }, useTimeout ? 2000: 0)
  }

  render () {
    // __DEV__ && console.log('Rendering item', this.props.index)
    const emptyState = (
      <View style={{
        width: this.screenDimensions.width,
        height: this.screenDimensions.height,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ActivityIndicator size="large" color={hslString('rizzleFG')}/>
      </View>
    )

    const { 
      hasRendered,
      inflatedItem,
      webViewHeight 
    } = this.state

    if (!inflatedItem) return emptyState

    const {
      displayMode,
      isVisible,
      item,
      orientation,
      showMercuryContent 
    } = this.props

    let {
      title,
      faceCentreNormalised,
      hasCoverImage,
      imageDimensions,
      showCoverImage,
      styles,
      created_at,
      savedAt
    } = inflatedItem

    const reveal = new Animated.Value(hasRendered ? 0 : 1)
    if (!hasRendered && (item.isDecorated || 
        (item.decoration_failures && item.decoration_failures >= MAX_DECORATION_FAILURES))) {
      this.isRevealing = true
      const that = this
      const animation = Animated.timing(reveal, {
        toValue: 0,
        delay: 2000,
        duration: 500,
        useNativeDriver: true
      })
      animation.start(({finished}) => {
        if (finished) {
          this.isRevealing = false
          that.setState({ hasRendered: true })
        }
      })
    }

    const isCoverInline = orientation !== 'landscape' && styles.isCoverInline

    const bodyColor = this.props.isDarkMode ? 
      'black' : 
      styles.hasFeedBGColor && !!item.feed_color && JSON.stringify(item.feed_color) !== '[0,0,0]' ?
        `hsl(${(item.feed_color[0] + 180) % 360}, 15%, 80%)` :
        hslString('bodyBG')

    if (styles === undefined || styles === null || Object.keys(styles).length === 0) {
      //styles = item.styles = createItemStyles(item)
      return emptyState
    }

    const coverImage = showCoverImage ? 
      <CoverImage
        styles={styles.coverImage}
        scrollAnim={this.scrollAnim}
        imagePath={!!hasCoverImage && getCachedCoverImagePath(inflatedItem)}
        imageDimensions={!!hasCoverImage && imageDimensions}
        faceCentreNormalised={faceCentreNormalised}
        orientation={orientation}
      /> :
      null

    const bodyStyle = {
      backgroundColor: bodyColor
    }
    const that = this

    return (
      <View
        ref={(ref) => { this.view = ref }}
        style={{
          backgroundColor: bodyColor,
          flex: 1,
          overflow: 'hidden'
        }}
      >
        { (showCoverImage && !isCoverInline) && coverImage }
        <Animated.ScrollView
          onScroll={
            this.scrollAnim && Animated.event(
              [{ nativeEvent: {
                contentOffset: { y: this.scrollAnim }
              }}],
              {
                useNativeDriver: true
              }
            )
          }
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
          onScrollBeginDrag={() => { that.hasBegunScroll = true }}
          onScrollEndDrag={this.onScrollEndDrag}
          pinchGestureEnabled={false}
          ref={(ref) => { this.scrollView = ref }}
          scrollEventThrottle={1}
          style={{
            flex: 1,
            minHeight: 100,
            minWidth: 100
          }}
        >
          { (isCoverInline || !showCoverImage || !coverImage) && 
            <Nudge 
              feed_id={this.props.item.feed_id}
              scrollAnim={this.scrollAnim}
            />
          }
          { (showCoverImage && isCoverInline) && coverImage }
          <ItemTitleContainer
            anims={this.anims}
            addAnimation={this.addAnimation}
            backgroundColor={bodyColor}
            item={inflatedItem}
            isVisible={isVisible}
            title={title}
            excerpt={inflatedItem.excerpt}
            date={savedAt ? savedAt * 1000 : created_at}
            scrollOffset={this.scrollAnim}
            font={styles.fontClasses.heading}
            bodyFont={styles.fontClasses.body}
            hasCoverImage={hasCoverImage}
            showCoverImage={showCoverImage}
            isCoverInline={isCoverInline}
            layoutListener={(bottomY) => this.setWebViewStartY(bottomY)}
          />
          <Animated.View style={webViewHeight !== INITIAL_WEBVIEW_HEIGHT && // avoid https://sentry.io/organizations/adam-butler/issues/1608223243/
            (styles.coverImage?.isInline || !showCoverImage) ? 
              this.addAnimation(bodyStyle, this.anims[5], isVisible) :
              bodyStyle}
          >
            <View style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              paddingTop: 100,
              backgroundColor: bodyColor
            }}>
              <ActivityIndicator size="large" color={hslString('rizzleFG')}/>
            </View>
            <ItemBody 
              bodyColor={bodyColor}
              item={{
                ...inflatedItem,
                ...item
              }}
              onTextSelection={this.props.onTextSelection}
              orientation={orientation}
              showImageViewer={this.props.showImageViewer}
              updateWebViewHeight={this.updateWebViewHeight}
              webViewHeight={this.state.webViewHeight}
          />
          </Animated.View>
        </Animated.ScrollView>
        { !hasRendered && 
          <Animated.View
            style={{
              backgroundColor: bodyColor,
              position: 'absolute',
              top: 0, 
              left: 0,
              right: 0,
              bottom: 0,
              opacity: reveal
            }}
          >
            {emptyState}
          </Animated.View>
        }
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
    this.hasBegunScroll = true
  }

  onMomentumScrollEnd = (scrollOffset) => {
    const {inflatedItem} = this.state
    scrollOffset = typeof scrollOffset === 'number' ?
      scrollOffset :
      scrollOffset.nativeEvent.contentOffset.y
    this.currentScrollOffset = scrollOffset
    this.props.setScrollOffset(inflatedItem, scrollOffset, this.state.webViewHeight)
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
            webViewHeight: that.pendingWebViewHeight
          })
          that.hasWebViewResized = true
          that.pendingWebViewHeightId = null
          // that.scrollToOffset(true)
        }, 500)
      }
    }
  }

}

FeedItem.whyDidYouRender = true

export default FeedItem