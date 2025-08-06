import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, Linking, Platform, Text, TouchableOpacity, View } from 'react-native'
import { WebView, WebViewNavigation } from 'react-native-webview'
import { openLink } from '../../utils/open-link'
import { INITIAL_WEBVIEW_HEIGHT } from './index'
import { hslString } from '../../utils/colors'
import { useDispatch, useSelector } from 'react-redux'
import { id } from '../../utils'
import { RootState } from '../../store/reducers'
import { HIDE_ALL_BUTTONS } from '../../store/ui/types'
import { ActiveHighlightContext } from '../ItemsScreen'
import { ITEM_BODY_CLEANED, ItemInflated, RESET_DECORATION_FALIURES, SAVE_ITEM } from '../../store/items/types'
import { Category } from '../../store/categories/types'
import isEqual from 'lodash.isequal'
import { createAnnotation } from '../../store/annotations/annotations'
import { updateItem as updateItemIDB } from '../../storage/idb-storage'
import { updateItem as updateItemSQLite } from '../../storage/sqlite'
import log from '../../utils/log'
import { textInfoBoldStyle } from '../../utils/styles'
import TextButton from '../TextButton'
import { getMargin, isPortrait } from '../../utils/dimensions'
import { useColor } from '../../hooks/useColor'

const injectedJavaScript = `
window.ReactNativeWebView?.postMessage('loaded');
window.setTimeout(() => {
  if (document.body && document.body.scrollHeight) {
    const height = Math.ceil(document.querySelector('article').getBoundingClientRect().height)
    window.ReactNativeWebView?.postMessage('resize:' + height);
  }
}, 500);
window.onload = () => {
  if (document.body && document.body.scrollHeight) {
    const height = Math.ceil(document.querySelector('article').getBoundingClientRect().height)
    window.ReactNativeWebView?.postMessage('resize:' + height);
  }
};
true;`

const stripInlineStyles = (html: string | undefined) => {
  if (!html) return ''
  const pattern = new RegExp(/style=".*?"/, 'g')
  return html.replace(pattern, '')
}

const stripEmptyTags = (html: string) => {
  const pattern = new RegExp(/<([^\/<]+?)>\s*?<\/\1>/, 'g')
  return html ? html.replace(pattern, '') : html
}

const stripUTags = (html: string) => {
  const pattern = new RegExp(/<\/?u>/, 'g')
  return html.replace(pattern, '')
}

interface ItemBodyProps {
  bodyColor: string
  item: ItemInflated
  orientation: string
  showImageViewer: (image: string) => void
  updateWebViewHeight: (height: number) => void
  webViewHeight: number
}

const ItemBody = ({ bodyColor, item, onTextSelection, orientation, showImageViewer, updateWebViewHeight, webViewHeight }: ItemBodyProps) => {
  const webViewRef = useRef(null)
  const dispatch = useDispatch()
  const { activeHighlightId, setActiveHighlightId, activeHighlight } = React.useContext(ActiveHighlightContext)
  const annotatedCategory: Category | undefined = useSelector((store: RootState) => store.categories.categories.find(c => c.name === 'annotated'), isEqual)
  const [annotatedCategoryId, setAnnotatedCategoryId] = useState(annotatedCategory?._id)
  useEffect(() => {
    setAnnotatedCategoryId(annotatedCategory?._id)
  }, [annotatedCategory?._id])
  const [isLoaded, setIsLoaded] = useState(false)
  const [cleanedHtmlContent, setCleanedHtmlContent] = useState<string | undefined>()
  const [cleanedMercuryContent, setCleanedMercuryContent] = useState<string | undefined>()

  useEffect(() => {
    if (activeHighlightId === null) {
      deselectHighlight()
    }
  }, [activeHighlightId])

  const openLinksExternallyProp = /*__DEV__ ? {} :*/ {
    onShouldStartLoadWithRequest: (e: any) => {
      if (e.navigationType === 'click') {
        // Linking.openURL(e.url)
        openLink(e.url, hslString(feedColor))
        return false
      }
      return true
    }
  }

  // called when HTML was loaded and injected JS executed
  const onNavigationStateChange = useCallback((event: WebViewNavigation) => {
    // this means we're loading an image
    if (event.url.startsWith('react-js-navigation')) return
    const calculatedHeight = Number.parseInt(event.jsEvaluationValue)
    if (calculatedHeight) {
      updateWebViewHeight(calculatedHeight)
    }
  }, [updateWebViewHeight])

  const highlightSelection = () => {
    if (Platform.OS !== 'web' && webViewRef?.current) {
      (webViewRef.current as any).injectJavaScript(`
        highlightSelection();
        true;
      `)
    }
  }

  const deselectHighlight = () => {
    if (Platform.OS !== 'web' && webViewRef?.current) {
      (webViewRef.current as any).injectJavaScript(`
        deselectHighlight();
        true;
      `)
    }
  }

  const onHighlight = (text: string, serialized: string) => {
    const newHighlight = {
      _id: id(),
      text,
      serialized,
      item_id: item._id,
      url: item.url
    }
    dispatch(createAnnotation(newHighlight) as any)
  }

  const endHighlight = () => {
    setActiveHighlightId(null)
  }

  const editHighlight = (annotationId: string) => {
    dispatch({ type: HIDE_ALL_BUTTONS })
    setActiveHighlightId(annotationId)
  }

  const onBodyCleaned = async (cleanedBody: string) => {
    let cleanedItem = { ...item }
    if (showMercuryContent) {
      cleanedItem.content_mercury = cleanedBody
      setCleanedMercuryContent(cleanedBody)
    } else {
      cleanedItem.content_html = cleanedBody
      setCleanedHtmlContent(cleanedBody)
    }
    try {
      if (Platform.OS === 'web') {
        await updateItemIDB(cleanedItem)
      } else {
        await updateItemSQLite(cleanedItem)
      }
      dispatch({
        type: ITEM_BODY_CLEANED,
        item: cleanedItem
      })
    } catch (error) {
      log(error)
    }
  }

  const {
    _id,
    coverImageUrl,
    decoration_failures,
    isHtmlCleaned,
    isMercuryCleaned,
    isNewsletter,
    isSaved,
    showCoverImage,
    showMercuryContent,
    styles,
    url
  } = item
  const content_html = cleanedHtmlContent || item.content_html
  const content_mercury = cleanedMercuryContent || item.content_mercury
  const fontSize = useSelector((state: RootState) => state.ui.fontSize)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const annotations = useSelector(
    (state: RootState) => state.annotations.annotations.filter(a => a?.item_id === _id),
    (a1, a2) => JSON.stringify(a1) === JSON.stringify(a2)
  )

  const isCoverImagePortrait = () => {
    const { imageDimensions } = item
    return imageDimensions && imageDimensions.height > imageDimensions.width
  }

  if (styles === undefined) {
    console.log('what?')
  }

  const articleClasses = [
    ...Object.values(styles.fontClasses || {}),
    'itemArticle',
    styles.color,
    styles.dropCapFamily === 'header' ? 'dropCapFamilyHeader' : '',
    styles.dropCapIsMonochrome ? 'dropCapIsMonochrome' : '',
    `dropCapSize${styles.dropCapSize}`,
    styles.dropCapIsDrop ? 'dropCapIsDrop' : '',
    styles.dropCapIsBold ? 'dropCapIsBold' : '',
    styles.dropCapIsStroke ? 'dropCapIsStroke' : '',
    (showMercuryContent && isMercuryCleaned) || isHtmlCleaned ? 'cleaned' : '',
    isPortrait() ? 'portrait' : 'landscapes'
  ].join(' ')

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

  const getBody = () => {
    if (showMercuryContent) {
      return content_mercury
    }
    if (!!content_html) {
      return content_html
    }
    if (!!content_mercury) {
      return content_mercury
    }
    return ''
  }

  let body = stripInlineStyles(getBody())
  body = stripEmptyTags(body)
  body = stripUTags(body)

  // hide the image in the body to avoid repetition
  let data: string | undefined = ''
  if (styles.coverImage.isInline) {
    data = coverImageUrl
  }

  const feedColor = useColor(url)

  const { width, height } = Dimensions.get('window')
  const deviceWidth = height > width ? width : height
  const deviceWidthToggle = deviceWidth > 600 ? 'tablet' : 'phone'

  const html = `<html class="font-size-${fontSize} ${isDarkMode ? 'dark-background' : ''} ${orientation} ${deviceWidthToggle} ${Platform.OS} ${isNewsletter ? 'newsletter' : ''}">
<head>
  <style>
:root {
--feed-color: ${feedColor ?? 'hsl(0, 0%, 0%)'};
--font-path-prefix: ${server === '' ? '../' : server};
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

  // if (body === '') {
  //   return (
  //     <EmptyState
  //       _id={_id}
  //       bodyColor={bodyColor}
  //       decoration_failures={decoration_failures}
  //     />
  //   )
  // }

  // see https://github.com/facebook/react-native/issues/32547#issuecomment-962009710 for androidLayerType

  return (
    <>
      {/* <EmptyState
        _id={_id}
        bodyColor={bodyColor}
        decoration_failures={decoration_failures}
        underlay
      /> */}
      <WebView
        allowsFullscreenVideo={true}
        allowsLinkPreview={true}
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        allowFileAccess
        androidLayerType='hardware'
        containerStyle={{
          backgroundColor: 'transparent',
          flex: 0,
          height: webViewHeight,
        }}
        decelerationRate='normal'
        injectedJavaScript={injectedJavaScript}
        mixedContentMode='compatibility'
        menuItems={[
          {
            label: 'Highlight',
            key: 'highlight'
          }
        ]}
        onContentProcessDidTerminate={() => {
          webViewRef.current && (webViewRef.current as any).reload();
        }}
        onCustomMenuSelection={({ nativeEvent }) => {
          if (nativeEvent?.key === 'highlight') {
            highlightSelection()
          }
        }}
        onMessage={(event) => {
          const rawMsg = event.nativeEvent.data
          let msg = ''
          try {
            msg = decodeURIComponent(decodeURIComponent(event.nativeEvent.data))
          } catch (error) {
            // log(error)
            // this just means that this is an unencoded, cleaned body
          }
          if (msg.substring(0, 6) === 'image:') {
            showImageViewer(msg.substring(6))
          } else if (msg.substring(0, 5) === 'link:') {
            const url = msg.substring(5)
            console.log('OPEN LINK: ' + url)
            if (!__DEV__) {
              Linking.openURL(url)
            }
          } else if (msg.substring(0, 7) === 'resize:') {
            updateWebViewHeight(parseInt(msg.substring(7)))
          } else if (msg.substring(0, 10) === 'highlight:') {
            const selectedText = msg.substring(10)
            const split = selectedText.split('++++++')
            console.log('HIGHLIGHT: ' + split[0] + ' (' + split[1] + ')')
            onHighlight(split[0], split[1])
          } else if (msg.substring(0, 15) === 'edit-highlight:') {
            editHighlight(msg.substring(15))
          } else if (msg.substring(0, 14) === 'end-highlight') {
            endHighlight()
          } else if (msg.substring(0, 6) === 'loaded') {
            setIsLoaded(true)
          } else if (rawMsg && rawMsg !== '') {
            onBodyCleaned(rawMsg)
          }
        }}
        onNavigationStateChange={onNavigationStateChange}
        {...openLinksExternallyProp}
        originWhitelist={['*']}
        ref={process.env.NODE_ENV === 'test' ? undefined : webViewRef}
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
        testID='mock-webview'
        webviewDebuggingEnabled={true}
      />
    </>
  )
}

export default React.memo(ItemBody, (prevProps, nextProps) => (
  prevProps === nextProps ||
  isEqual(prevProps, nextProps)
))

const EmptyState = ({ _id, bodyColor, decoration_failures, underlay }: {
  _id: string,
  bodyColor: string,
  decoration_failures?: number,
  underlay?: boolean,
}) => {
  const [yPos, setYPos] = useState<number | null>(null)
  const [view, setView] = useState<View | null>(null)
  const [isLayedOut, setIsLayedOut] = useState(false)
  const [viewHeight, setViewHeight] = useState(0)
  const dispatch = useDispatch()

  const { width, height } = Dimensions.get('screen')

  useEffect(() => {
    if (isLayedOut && view) {
      view.measure((x: number, y: number, w: number, h: number, pageX: number, pageY: number) => {
        if (pageY < height - 100) {
          setViewHeight(height - pageY)
        } else {
          setViewHeight(200)
        }
      })
    }
  }, [isLayedOut, view])
  return (
    <View
      onLayout={event => {
        setIsLayedOut(true)
      }}
      ref={view => setView(view)}
      style={{
        width,
        height: viewHeight,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bodyColor,
        opacity: 1,
        position: underlay ? 'absolute' : 'relative',
        // zIndex: underlay ? 0 : 1
      }}
    >
      <View style={{
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
      }}>
        {(decoration_failures && decoration_failures === 5) ?
          (
            <>
              <Text style={{
                ...textInfoBoldStyle(),
                marginBottom: getMargin(),
                textAlign: 'center'
              }}>Oh no! Something went wrong downloading this article.</Text>
              <TextButton
                onPress={() => dispatch({
                  type: RESET_DECORATION_FALIURES,
                  itemId: _id
                })}
                text='Try again'
              />
            </>
          ) :
          (<View>
            <ActivityIndicator size="large" color={hslString('rizzleFG')} />
          </View>)
        }
      </View>
    </View>
  )
}

// ItemBody.whyDidYouRender = true
