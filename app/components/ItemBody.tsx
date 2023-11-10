import React, { useEffect, useRef, useState } from 'react'
import {Dimensions, Linking, Platform, View} from 'react-native'
import {WebView, WebViewNavigation} from 'react-native-webview'
import { openLink } from '../utils/open-link'
import { INITIAL_WEBVIEW_HEIGHT } from './FeedItem'
import { hslString } from '../utils/colors'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { deepEqual, id, pgTimestamp } from '../utils'
import { RootState } from '../store/reducers'
import { HIDE_ALL_BUTTONS } from '../store/ui/types'
import { HighlightModeContext } from './ItemsScreen'
import { Item, SAVE_ITEM } from '../store/items/types'
import { ADD_ITEM_TO_CATEGORY, Category } from '../store/categories/types'
import isEqual from 'lodash.isequal'
import { createAnnotation } from '../store/annotations/annotations'

const calculateHeight = `
  (document.body && document.body.scrollHeight) &&
    window.ReactNativeWebView.postMessage(getHeight())
`

const injectedJavaScript = `
window.ReactNativeWebView.postMessage('loaded');
window.setTimeout(() => {
  if (document.body && document.body.scrollHeight) {
    const height = Math.ceil(document.querySelector('article').getBoundingClientRect().height)
    window.ReactNativeWebView.postMessage('resize:' + height);
  }  
}, 500);
window.onload = () => {
  if (document.body && document.body.scrollHeight) {
    const height = Math.ceil(document.querySelector('article').getBoundingClientRect().height)
    window.ReactNativeWebView.postMessage('resize:' + height);
  }  
};
true;`

const stripInlineStyles = (html: string) => {
  if (!html) return html
  const pattern = new RegExp(/style=".*?"/, 'g')
  return html.replace(pattern, '')
}

const stripEmptyTags = (html: string) => {
  const pattern = new RegExp(/<[^\/<]+?>\s*?<\/\1>/, 'g')
  return html ? html.replace(pattern, '') : html
}

const stripUTags = (html: string) => {
  const pattern = new RegExp(/<\/?u>/, 'g')
  return html.replace(pattern, '')
}

interface ItemBodyProps {
  bodyColor: string
  item: Item
  onTextSelection: (text: string, serialized: string) => void
  orientation: string
  showImageViewer: (image: string) => void
  updateWebViewHeight: (height: number) => void
  webViewHeight: number
}

const ItemBody = ({ bodyColor, item, onTextSelection, orientation, showImageViewer, updateWebViewHeight, webViewHeight }: ItemBodyProps) => {
  let webView = useRef(null)
  const dispatch = useDispatch()
  const { activeHighlight, setActiveHighlight } = React.useContext(HighlightModeContext)
  const annotatedCategory: Category | undefined = useSelector((store: RootState) => store.categories.categories.find(c => c.name === 'annotated'), isEqual)
  const [annotatedCategoryId, setAnnotatedCategoryId] = useState(annotatedCategory?._id)
  useEffect(() => {
    setAnnotatedCategoryId(annotatedCategory?._id)
  }, [annotatedCategory?._id])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (activeHighlight === null) {
      deselectHighlight()
    }
  }, [activeHighlight])

  const openLinksExternallyProp = /*__DEV__ ? {} :*/ {
    onShouldStartLoadWithRequest: (e) => {
      if (e.navigationType === 'click') {
        // Linking.openURL(e.url)
        openLink(e.url, hslString(item.feed_color))
        return false
      } else {
        return true
      }
    }
  }
  
  // called when HTML was loaded and injected JS executed
  const onNavigationStateChange = (event: WebViewNavigation) => {
    // this means we're loading an image
    if (event.url.startsWith('react-js-navigation')) return
    const calculatedHeight = parseInt(event.jsEvaluationValue)
    if (calculatedHeight) {
      updateWebViewHeight(calculatedHeight)
    }
  }

  const highlightSelection = () => {
    if (webView?.current) {
      webView.current.injectJavaScript(`
        highlightSelection();
        true;
      `)
    }
  }

  const deselectHighlight = () => {
    if (webView?.current) {
      webView.current.injectJavaScript(`
        deselectHighlight();
        true;
      `)
    }
  }

  const onHighlight = (text: string, serialized: string) => {
    const annotation = {
      _id: id() as string,
      text,
      serialized,
      item_id: item._id,
      url: item.url,
      created_at: pgTimestamp(),
    }
    dispatch(createAnnotation(annotation))
    if (!item.isSaved) {
      dispatch({
        type: SAVE_ITEM,
        item,
        savedAt: Date.now()
      })
      dispatch({
        type: ADD_ITEM_TO_CATEGORY,
        itemId: item._id,
        categoryId: annotatedCategory?._id
      })
    }
  }

  const editHighlight = (annotationId: string) => {
    dispatch({ type: HIDE_ALL_BUTTONS })
    setActiveHighlight(annotationId)
  }

  const { coverImageUrl, content_html, content_mercury, feed_color, showCoverImage, showMercuryContent } = item
  const styles = { ...item.styles }
  const fontSize = useSelector((state: RootState) => state.ui.fontSize)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const annotations = useSelector(
    (state: RootState ) => state.annotations.annotations.filter(a => a.item_id === item._id), 
    (a1, a2) => JSON.stringify(a1) === JSON.stringify(a2)
  )

  const isCoverImagePortrait = () => {
    const {imageDimensions} = item
    return imageDimensions && imageDimensions.height > imageDimensions.width
  }
    
  if (styles === undefined) {
    console.log('what?')
  }

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
    
  const blockquoteClass = styles.hasColorBlockquoteBG ? 'hasColorBlockquoteBG' : ''

  const minHeight = webViewHeight === INITIAL_WEBVIEW_HEIGHT ? 1 : webViewHeight
  let server = ''
  if (Platform.OS === 'android') {
    server = 'file:///android_asset/'
  } else if (__DEV__) {
    server = 'http://localhost:8888/'
  }

  if (!showCoverImage || isCoverImagePortrait()) {
    styles.coverImage = {
      ...styles.coverImage,
      isInline: false
    }
    styles.isCoverInline = false
  }

  let body = showMercuryContent ? content_mercury : content_html
  body = body || ''
  body = stripInlineStyles(body)
  body = stripEmptyTags(body)
  body = stripUTags(body)

  // hide the image in the body to avoid repetition
  let data = ''
  if (styles.coverImage.isInline) {
    data = coverImageUrl
  }

  const feedColor = feed_color ?
    hslString(feed_color, 'darkmodable') :
    hslString('logo1')

  const { width, height } = Dimensions.get('window')
  const deviceWidth = height > width ? width: height
  const deviceWidthToggle = deviceWidth > 600 ? 'tablet' : 'phone'

  const html = `<html class="font-size-${fontSize} ${isDarkMode ? 'dark-background' : ''} ${orientation} ${deviceWidthToggle} ${Platform.OS}">
<head>
  <style>
:root {
--feed-color: ${feedColor};
--font-path-prefix: ${ server === '' ? '../' : server };
--device-width: ${deviceWidth};
}
html, body {
  background-color: ${bodyColor};
}
  </style>
  <link rel="stylesheet" type="text/css" href="${server}webview/css/output.css">
  <link rel="stylesheet" type="text/css" href="${server}webview/css/fonts.css">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
</head>
<body class="${blockquoteClass} ${displayMode}" style="background-color: ${bodyColor}" data-cover="${data}">
  <article
    class="${articleClasses}"
    style="min-height: ${minHeight}px; width: 100vw;">
    ${body}
  </article>
</body>
<script>${`const highlights = ${JSON.stringify(annotations)}`}</script>
<script src="${server}webview/js/rangy-core.js"></script>
<script src="${server}webview/js/rangy-classapplier.js"></script>
<script src="${server}webview/js/rangy-highlighter.js"></script>
<script src="${server}webview/js/feed-item.js"></script>
</html>`

  // see https://github.com/facebook/react-native/issues/32547#issuecomment-962009710 for androidLayerType

  return <WebView
    allowsFullscreenVideo={true}
    allowsLinkPreview={true}
    allowFileAccessFromFileURLs
    allowUniversalAccessFromFileURLs
    allowFileAccess
    androidLayerType='hardware'
    containerStyle={{ 
      backgroundColor: bodyColor,
      flex: 0,
      height: webViewHeight,
    }}
    decelerationRate='normal'
    injectedJavaScript={ injectedJavaScript }
    mixedContentMode='compatibility'
    menuItems={[{ 
      label: 'Highlight', 
      key: 'highlight'
    }]}
    onCustomMenuSelection={({ nativeEvent }) => {
      if (nativeEvent?.key === 'highlight') {
        highlightSelection(nativeEvent.selection)
      }
    }}
    onMessage={(event) => {
      const msg = decodeURIComponent(decodeURIComponent(event.nativeEvent.data))
      if (msg.substring(0, 6) === 'image:') {
        showImageViewer(msg.substring(6))
      } else if (msg.substring(0, 5) === 'link:') {
        const url = msg.substring(5)
        // console.log('OPEN LINK: ' + url)
        if (!__DEV__) {
          Linking.openURL(url)
        }
      } else if (msg.substring(0,7) === 'resize:') {
        updateWebViewHeight(parseInt(msg.substring(7)))
      } else if (msg.substring(0, 10) === 'highlight:') {
        const selectedText = msg.substring(10)
        const split = selectedText.split('++++++')
        console.log('HIGHLIGHT: ' + split[0] + ' (' + split[1] + ')')
        onHighlight(split[0], split[1])
      } else if (msg.substring(0, 15) === 'edit-highlight:') {
        editHighlight(msg.substring(15))
      } else if (msg.substring(0, 6) === 'loaded') {
        setIsLoaded(true)
      }
    }}
    onNavigationStateChange={onNavigationStateChange}
    {...openLinksExternallyProp}
    originWhitelist={['*']}
    ref={webView}
    scalesPageToFit={false}
    scrollEnabled={false}
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      height: webViewHeight,
      width,
      flex: 0,
      backgroundColor: bodyColor,
      opacity: isLoaded ? 1 : 0,
    }}
    source={{
      html: html,
      baseUrl: Platform.OS === 'android' ?
        '' :
        'web/'
    }}
    webviewDebuggingEnabled={true}
  />

}

export default React.memo(ItemBody, (prevProps, nextProps) => (
  prevProps === nextProps ||
  isEqual(prevProps, nextProps)
)

)

// ItemBody.whyDidYouRender = true
