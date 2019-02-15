import {Dimensions} from 'react-native'
import {createItemStyles} from './createItemStyles'
import {getCachedImagePath} from './index'
const RNFS = require('react-native-fs')
const sanitizeHtml = require('sanitize-html')

export function addStylesIfNecessary (item, index, items) {
  if (item.styles && !item.styles.temporary) {
    return item
  } else {
    const prevStyles = index > 0 ? items[index-1].styles : null
    let styles = createItemStyles(item, prevStyles)
    if (item.title === 'Loading...') {
      styles.temporary = true
    }
    return {
      ...item,
      styles
    }
  }
}

export function deflateItem (item) {
  return {
    _id: item._id,
    banner_image: item.bannerImage, // needed by the feed component
    content_length: item.content_html.length,
    created_at: item.created_at,
    feed_id: item.feed_id,
    feed_color: item.feed_color,
    hasLoadedMercuryStuff: item.hasLoadedMercuryStuff,
    id: item.id, // needed to match existing copy in store
    readAt: item.readAt,
    styles: item.styles,
    title: item.title,
    url: item.url,
  }
}

export function isInflated (item) {
  return Object.keys(item).indexOf('content_html') !== -1
}

export function fixRelativePaths (item) {
  if (!item.url) return item
  const matches = /http[s]?:\/\/[^:\/\s]+/.exec(item.url)
  if (!matches) return item
  const host = matches[0]
  const derelativise = s => s.replace(/src="\//g, `src="${host}/`)
  if (item.content_html) item.content_html = derelativise(item.content_html)
  if (item.content_mercury) item.content_mercury = derelativise(item.content_mercury)
  if (item.body) item.body = derelativise(item.body)
  return item
}

export function sanitizeContent (item) {
  if (item.content_html) item.content_html = sanitizeHtml(item.content_html)
  if (item.content_mercury) item.content_mercury = sanitizeHtml(item.content_mercury)
  return item
}

export function nullValuesToEmptyStrings (item) {
  item.title = item.title ? item.title : ''
  item.content_html = item.content_html ? item.content_html : ''
  return item
}

export function addMercuryStuffToItem (item, mercury) {
  mercury.content = sanitizeHtml(mercury.content)
  if (item.is_external) {
    return {
      ...item,
      external_url: item.url,
      title: mercury.title,
      content_mercury: mercury.content ? mercury.content : '',
      body: mercury.content ? mercury.content : '',
      date_published: mercury.date_published,
      date_modified: mercury.date_published,
      author: mercury.author,
      feed_title: mercury.domain,
      banner_image: mercury.lead_image_url,
      excerpt: mercury.excerpt,
      hasLoadedMercuryStuff: true,
      showMercuryContent: true
    }
  }

  // if excerpt == content_html, showMercury
  let decoratedItem = {
    ...item,
    banner_image: mercury.lead_image_url,
    // body: content,
    content_mercury: mercury.content ? mercury.content : '',
    excerpt: mercury.excerpt,
    hasLoadedMercuryStuff: true
  }
  if (!isExcerptUseful(decoratedItem)) {
    decoratedItem.excerpt = undefined
  } else if (isExcerptExtract(decoratedItem)) {
    if (!decoratedItem.content_mercury ||
      decoratedItem.content_mercury == '' ||
      isExcerptExtract(decoratedItem, true)) {
      decoratedItem.excerpt = undefined
    } else {
      decoratedItem.showMercuryContent = true
    }
  }

  return decoratedItem
}

export function isExcerptUseful (item) {
  return item.excerpt && item.excerpt.length < 200
}

export function isExcerptExtract (item, isMercury = false) {
  if (!item.content_html) return false
  const excerptWithoutEllipsis = item.excerpt.substring(0, item.excerpt.length - 4)
  return strip(item.content_html).substring(0, excerptWithoutEllipsis.length) === excerptWithoutEllipsis
}

export function strip(content) {
  return content
    .replace(/<.*?>/g, '')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&apos;/g, "'")
    .trim()
}

export function addCoverImageToItem (item, imageStuff) {
  return {
    ...item,
    ...imageStuff
  }
}

export function setShowCoverImage (item) {
  const getLongestContentLength = (item) => {
    const hasMercury = item.content_mercury && typeof item.content_mercury === 'string'
    const hasHtml = item.content_html && typeof item.content_mercury === 'string'
    const mercuryLength = hasMercury ?
      item.content_mercury.length :
      0
    const htmlLength = hasHtml ?
      item.content_html.length :
      0
    return mercuryLength > htmlLength ?
      mercuryLength :
      htmlLength
  }

  return {
    ...item,
    showCoverImage: item.hasCoverImage &&
      (getLongestContentLength(item) > 2000)
  }
}

export function removeCachedCoverImages (items) {
  if (!items) return
  items.forEach(item => {
    let path = getCachedImagePath(item)
    if (path) {
      RNFS.unlink(path)
        .catch((error) => {
          console.log(error)
        })
    }
  })
  // for (let item of items) {
  // }
}

export function rizzleSort (items, feeds) {
  let itemsByFeed = {}
  let keys = []
  let sorted = []
  items.forEach(i => {
    (itemsByFeed[i.feed_id] = itemsByFeed[i.feed_id] || []).push(i)
  })
  keys = Object.keys(itemsByFeed)
  keys.forEach(k => {
    itemsByFeed[k].sort((a, b) => b.created_at - a.created_at)
  })
  keys.sort((a, b) => {
    aFeed = feeds.find(f => f._id === a)
    bFeed = feeds.find(f => f._id === b)
    return bFeed.reading_rate - aFeed.reading_rate
  })
  keys.forEach(k => {
    sorted = sorted.concat(itemsByFeed[k])
  })
  return sorted
}