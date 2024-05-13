import React from 'react'
import {ActivityIndicator, Animated, Dimensions, Easing, Linking, View} from 'react-native'
import CoverImage from './CoverImage'
import ItemBody from './ItemBody'
import ItemTitleContainer from '../containers/ItemTitle'
import {deepEqual, deviceCanHandleAnimations, diff, getCachedCoverImagePath} from '../utils/'
import { getMargin } from '../utils/dimensions'
import { hslString } from '../utils/colors'
import { getItem as getItemSQLite } from "../storage/sqlite"
import { getItem as getItemIDB } from "../storage/idb-storage"

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
    // if (isDiff) {
    //   console.log('changes', changes)
    // }
    return isDiff
  }

  componentDidMount () {
    this.inflateItemAndSetState(this.props.item)
    this.hasMounted = true
  }

  componentDidUpdate (prevProps) {
    const { isVisible, item, setScrollAnim } = this.props
    this.initAnimatedValues(true)
    if ((item.isNewsletter || item.isExternal) && 
      (item.isDecorated && !prevProps.item.isDecorated)) {
      console.log('(item.isNewsletter || item.isExternal) && item.isDecorated && !prevProps.item.isDecorated')
      this.inflateItemAndSetState(item)
    }
    if (isVisible) {
      setScrollAnim(this.scrollAnim)
      this.scrollToOffset(true)
    }
  }

  async inflateItemAndSetState (item) {
    try {
      const inflatedItem = Platform.OS === 'web' ?
      await getItemIDB(item) :
      await getItemSQLite(item)
      const that = this
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

  scrollToOffset (isOverridable = false) {
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
    }, 2000)
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

    const bodyColor = this.props.isDarkMode ? 'black' : hslString('rizzleBg')

    if (styles === undefined || styles === null || Object.keys(styles).length === 0) {
      //styles = item.styles = createItemStyles(item)
      return emptyState
    }

    showCoverImage = showCoverImage && !(styles.isCoverInline && orientation === 'landscape')

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
        { showCoverImage && !styles.isCoverInline && coverImage }
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
          { showCoverImage && styles.isCoverInline && coverImage }
          <ItemTitleContainer
            anims={this.anims}
            addAnimation={this.addAnimation}
            item={inflatedItem}
            isVisible={isVisible}
            title={title}
            excerpt={inflatedItem.excerpt}
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
          that.scrollToOffset(true)
        }, 500)
      }
    }
  }

}

FeedItem.whyDidYouRender = true

export default FeedItem