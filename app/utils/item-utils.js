const RNFS = require('react-native-fs')
const sanitizeHtml = require('sanitize-html')
import {Dimensions} from 'react-native'
import {createItemStyles, compressStyles, expandStyles} from './createItemStyles'
import {getCachedImagePath} from './index'
import LZString from 'lz-string'

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
  const styles = item.styles
  // const compressed = LZString.compressToUTF16(JSON.stringify(compressStyles(item.styles)))
  return {
    _id: item._id,
    banner_image: item.banner_image, // needed by the feed component
    content_length: item.content_length || (item.content_html
      ? item.content_html.length
      : 0),
    created_at: item.created_at,
    feed_id: item.feed_id,
    feed_color: item.feed_color,
    hasCoverImage: item.hasCoverImage,
    imageDimensions: item.imageDimensions,
    hasLoadedMercuryStuff: item.hasLoadedMercuryStuff,
    id: item.id, // needed to match existing copy in store
    readAt: item.readAt,
    title: item.title,
    url: item.url,
  }
}

export function inflateItem (item) {
  const styles = item.styles
  if (typeof styles === 'object') return item
  const expanded = expandStyles(JSON.parse(LZString.decompressFromUTF16(styles)))
  return {
    ...item,
    styles: expanded
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
  if (item.content_html) item.content_html = sanitizeHtml(item.content_html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
  })
  if (item.content_mercury) item.content_mercury = sanitizeHtml(item.content_mercury, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
  })
  return item
}

export function nullValuesToEmptyStrings (item) {
  item.title = item.title ? item.title : ''
  item.content_html = item.content_html ? item.content_html : ''
  return item
}

export function addMercuryStuffToItem (item, mercury) {
  mercury.content = sanitizeHtml(mercury.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
  })
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
// another possible algorithm here would be
// sort the items by date
// then sort each by day by feed reading_rate
  const sorted = items.sort((a, b) => {
    const aDate = new Date(a.created_at)
    const bDate = new Date(b.created_at)
    if (aDate.getFullYear() === bDate.getFullYear() &&
      aDate.getMonth() === bDate.getMonth() &&
      aDate.getDate() === bDate.getDate()) {
      return feeds.find(f => f._id === b.feed_id).reading_rate || 0 -
        feeds.find(f => f._id === a.feed_id).reading_rate || 0
    } else {
      return b.created_at - a.created_at
    }
  })
  return rizzleShuffle(sorted)

  // let itemsByFeed = {}
  // let keys = []
  // let sorted = []
  // items.forEach(i => {
  //   (itemsByFeed[i.feed_id] = itemsByFeed[i.feed_id] || []).push(i)
  // })
  // keys = Object.keys(itemsByFeed)
  // keys.forEach(k => {
  //   itemsByFeed[k].sort((a, b) => b.created_at - a.created_at)
  // })
  // keys.sort((a, b) => {
  //   aFeed = feeds.find(f => f._id === a)
  //   bFeed = feeds.find(f => f._id === b)
  //   return bFeed.reading_rate - aFeed.reading_rate
  // })
  // keys.forEach(k => {
  //   sorted = sorted.concat(itemsByFeed[k])
  // })
  // return rizzleShuffle(sorted)
}

function rizzleShuffle(items) {
  return items.sort((a, b) => (items.indexOf(a) + Math.random() * items.length / 10) -
    (items.indexOf(b) + Math.random() * items.length / 10))
}