import { useEffect, useState } from "react"
import { Animated, Image, ScaledSize, Text, View, useWindowDimensions } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../store/reducers"
import { hslString } from "../../utils/colors"
import { Item, ItemInflated } from "../../store/items/types"
import { textInfoStyle } from '../../utils/styles'
import WebView from "react-native-webview"
import ButtonSet from "../ButtonSet"
import FeedIcon from "../FeedIcon"
import { HIDE_ALL_BUTTONS, SHOW_ITEM_BUTTONS } from "../../store/ui/types"
import { useColor } from "../../hooks/useColor"
import { decode } from "entities"

const TOP_BAR_HEIGHT = 60

export default function ItemView ({item}: {item: ItemInflated | undefined}) {
  if (!item?.styles?.fontClasses) return null
  const dispatch = useDispatch()
  let dimensions: ScaledSize = useWindowDimensions()
  const [coverImageSize, setCoverImageSize] = useState({width: 0, height: 0})
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const feed = item?.isNewsletter ?
    useSelector((state: RootState) => state.newsletters.newsletters.find(f => f._id === item?.feed_id)) :
    useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === item?.feed_id))    
  const bodyColor = isDarkMode ? 'black' : hslString('rizzleBg')
  if (item?.coverImageUrl) {
    Image.getSize(item.coverImageUrl, (width, height) => {
      if (width !== coverImageSize.width || height !== coverImageSize.height) {
        setCoverImageSize({width, height})
      }
    })
  } else {
    if (coverImageSize.height > 0) {
      setCoverImageSize({width: 0, height: 0})
    }
  }
  const coverImageHeight = coverImageSize.height > 0 ? Math.round(dimensions.width * (coverImageSize.height / coverImageSize.width)) : 0
  // console.log('coverImageHeight', coverImageHeight)
  useEffect(() => {
    dispatch({type: SHOW_ITEM_BUTTONS})
  }, [item])
  // const coverImage = /*item?.showCoverImage && */typeof item?.coverImageUrl === 'string' ?
  //   <Image 
  //     source={item.coverImageUrl}
  //     style={{
  //       width: '100%',
  //       height: dimensions.width * (coverImageSize.height / coverImageSize.width),
  //     }} /> :
  //   null

  const feedColor = useColor(feed?.url)
  const fontSize = useSelector((state: RootState) => state.ui.fontSize)
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)

  // hide the image in the body to avoid repetition
  let data = ''
  if (item?.styles?.coverImage?.isInline) {
    data = item.coverImageUrl || ''
  }
  
  let articleClasses = ''

  if (item?.styles && item?.styles.fontClasses) {
    articleClasses = [
      ...Object.values(item?.styles.fontClasses),
      'itemArticle',
      item?.styles.color,
      item?.styles.dropCapFamily === 'header' ? 'dropCapFamilyHeader' : '',
      item?.styles.dropCapIsMonochrome ? 'dropCapIsMonochrome' : '',
      `dropCapSize${item?.styles.dropCapSize}`,
      item?.styles.dropCapIsDrop ? 'dropCapIsDrop' : '',
      item?.styles.dropCapIsBold ? 'dropCapIsBold' : '',
      item?.styles.dropCapIsStroke ? 'dropCapIsStroke' : ''].join(' ')
  }

  const headingClasses = [
    'itemTitle',
    item?.styles?.fontClasses?.heading || '',
    item?.styles?.title.isUpperCase ? 'isUpperCase' : '',
    item?.styles?.title.isBold ? 'bg' : '',
    item?.styles?.title.isItalic ? 'isItalic' : '',
    item?.styles?.title.invertBG ? 'invertBG' : '',
    item?.styles?.title.bg ? 'bg' : '',
    item?.styles?.title.textAlign || ''
  ].join(' ')

  const body = item?.showMercuryContent ? item?.content_mercury : item?.content_html
  const coverImageUrl = item?.coverImageUrl?.replace('(', '%28').replace(')', '%29')
    
  const fontStyles = document.getElementById('expo-generated-fonts')

  const matches = item.url.match(/:\/\/(.*?)\//)
  const host = matches && matches.length > 1 ? matches[1] : null

  console.log('Rendering ItemView, item: ' + item?.title + ', feed: ' + feed?.title)

  const html = item && `<html class="font-size-${fontSize} web ${isDarkMode ? 'dark-background' : ''}">
  <head>
    <style>
  :root {
  --feed-color: ${feedColor};
  --font-path-prefix: '/fonts';
  --device-width: 1000;
  }
  html, body {
    background-color: ${bodyColor};
  }
    </style>
    <link rel="stylesheet" type="text/css" href="/css/output.css">
    <link rel="stylesheet" type="text/css" href="/css/fonts.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <style>${fontStyles?.innerText}</style>
  </head>
  <body class="${displayMode} ${coverImageHeight > 0 ? 'hasCoverImage' : ''} web" style="background-color: ${bodyColor}" data-cover="${data}">
    <div class="coverHolder" style="${coverImageHeight > 0 ? `height: ${coverImageHeight}px;` : ''}  max-height: ${dimensions.height - TOP_BAR_HEIGHT}px;">
      <div class="coverImage" style="background-image: url(${coverImageUrl}); height: ${coverImageHeight}px; max-height: ${dimensions.height - TOP_BAR_HEIGHT}px;">.</div>
      <div class="${headingClasses}" style="${dimensions.width > 1200 && coverImageHeight > dimensions.height ? 'margin-bottom: 2rem' : ''}">
        <h1>${item?.title}</h1>
        ${item?.excerpt ? `<p class="excerpt">${item?.excerpt}</p>` : ''}
        ${item?.author ? `<p><b>${item?.author}</b></p>` : ''}
        ${item?.date_published ? `<p class="date-published">${new Date(item.date_published).toUTCString()}</p>` : ''}
      </div>
    </div>
    <div class="articleHolder">
      <article
        class="${articleClasses}"
        style="min-height: 100vh; width: 100vw;">
        ${body}
      </article>
    </div>
  </body>
  <script>${`const highlights = []`}</script>
  <script src="/js/feed-item.js"></script>
  <script src="/js/rangy-core.js"></script>
  <script src="/js/rangy-classapplier.js"></script>
  <script src="/js/rangy-highlighter.js"></script>
  </html>`
  return (
    item && (
      <View style={{
        backgroundColor: hslString('white'),
        flex: 1,
      }}>
        <View style={{
          flex: -1,
          height: TOP_BAR_HEIGHT,
          width: '100%',
          backgroundColor: feedColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          { host && 
              <img height="32" width="auto" src={`https://icons.duckduckgo.com/ip3/${host}.ico`} />
          }
          <Text style={{ 
            ...textInfoStyle(),
            marginLeft: 10,
            color: 'white',
          }}>{ decode(feed?.title) }</Text>
        </View>
        <WebView 
          onMessage={(event) => {
            if (event.nativeEvent.data === '"scroll-down"') {
              dispatch({type: HIDE_ALL_BUTTONS})
            } else if (event.nativeEvent.data === '"scroll-up"') {
              dispatch({type: SHOW_ITEM_BUTTONS})
            }
          }}
          source={{
            html      
          }}
          style={{
            flex: 1,
          }}
      />
      <ButtonSet
          displayMode={displayMode}
          isCurrent
          item={item}
          opacityAnim={new Animated.Value(1)}
          visible
        />
      </View>
    )
  )
}