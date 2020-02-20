const fuzz = require('fuzzball')
const RNFS = require('react-native-fs')
const sanitizeHtml = require('sanitize-html')
import {Dimensions} from 'react-native'
import {createItemStyles, compressStyles, expandStyles} from './createItemStyles'
import {getCachedCoverImagePath} from './index'
import log from './log'
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
  if (!item) {
    log('Item is null?')
  }
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
    feed_title: item.feed_title,
    feed_color: item.feed_color,
    hasCoverImage: item.hasCoverImage,
    imageDimensions: item.imageDimensions,
    hasLoadedMercuryStuff: item.hasLoadedMercuryStuff,
    id: item.id, // needed to match existing copy in store
    readAt: item.readAt,
    title: item.title,
    url: item.url,
    isSaved: item.isSaved,
    savedAt: item.savedAt
  }
}

export function inflateStyles (item) {
  if (!item) {
    log('inflateItem', 'Item is null?')
  }
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
  const settings = {
    allowedTags: false,
    allowedAttributes: false
  }
  if (item.content_html) item.content_html = sanitizeHtml(item.content_html, settings)
  if (item.content_mercury) item.content_mercury = sanitizeHtml(item.content_mercury, settings)
  return item
}

export function nullValuesToEmptyStrings (item) {
  item.title = item.title ? item.title : ''
  item.content_html = item.content_html ? item.content_html : ''
  return item
}

export function addMercuryStuffToItem (item, mercury) {
  // mercury.content = sanitizeHtml(mercury.content, {
  //   allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
  // })
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

  if (decoratedItem.content_html.length === 0 &&
    decoratedItem.content_mercury.length !== 0) {
    decoratedItem.showMercuryContent = true
  }

  if (stripTags(decoratedItem.content_html) === decoratedItem.excerpt && decoratedItem.content_mercury.length > 0) {
    decoratedItem.showMercuryContent = true
  }

  // if content is substring of excerpt + mercury, show mercury
  // const allMercury = (decoratedItem.excerpt ? stripTags(decoratedItem.excerpt) : '') +
  //   (decoratedItem.content_mercury ? stripTags(decoratedItem.content_mercury) : '')

  // console.log('Calculating partial ratios...')

  const htmlPartial = decoratedItem.content_html ?
    stripTags(decoratedItem.content_html) :
    ''
  const mercuryPartial = decoratedItem.content_mercury ?
    stripTags(decoratedItem.content_mercury)
    : ''

  if (mercuryPartial.length > htmlPartial.length &&
    fuzz.partial_ratio(htmlPartial.substring(0, 500), mercuryPartial.substring(0, 500)) > 90) {
    decoratedItem.showMercury = true
  }

  if (decoratedItem.excerpt && decoratedItem.excerpt.length > 0 &&
    fuzz.partial_ratio(decoratedItem.excerpt, htmlPartial.substring(0, 500)) > 90) {
    if (decoratedItem.content_html.indexOf(`<p>${decoratedItem.excerpt}</p>`) > -1) {
      // excerpt is first paragraph of content_html
      decoratedItem.content_html = decoratedItem.content_html.replace(`<p>${decoratedItem.excerpt}</p>`, '')
    } else if (decoratedItem.excerpt === htmlPartial && mercuryPartial.length > 0) {
      decoratedItem.showMercury = true
    } else {
      decoratedItem.excerpt = null
    }
  }

  if (htmlPartial.length < 500 &&
    fuzz.partial_ratio(htmlPartial, mercuryPartial.substring(0, 500)) > 90) {
    decoratedItem.showMercury = true
  }

  const getImageFileName = (path) => /.*\/(.*?)\./.exec(path)[1]
  let visibleContentKey = decoratedItem.showMercuryContent ?
    'content_mercury' :
    'content_html'
  const firstImg = /<img.*?src="(.*?)".*?>/.exec(decoratedItem[visibleContentKey]) &&
    /<img.*?src="(.*?)".*?>/.exec(decoratedItem[visibleContentKey])[1]
  if (firstImg &&
    decoratedItem.banner_image &&
    decoratedItem.styles.coverImage.isInline &&
    getImageFileName(firstImg) === getImageFileName(decoratedItem.banner_image)) {
    decoratedItem[visibleContentKey] = decoratedItem[visibleContentKey].replace(/<img.*?>/, '')
  }

  return decoratedItem
}

function stripTags (text) {
  return text.replace(/<.*?>/g, '')
}

export function isExcerptUseful (item) {
  return item.excerpt && item.excerpt.length < 200
}

export function isExcerptFirstPara (item) {
  if (!item.content_html) return
  let firstPara = item.content_html.split('</p>')[0].replace('<p>', '')
  return firstPara && strip(firstPara) === item.excerpt
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
    .replace(/\n+/g, ' ')
    .trim()
}

export function addCoverImageToItem (item, imageStuff) {
  return {
    ...item,
    ...imageStuff
  }
}

export function setShowCoverImage (item, currentItem) {
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
      (currentItem ? item._id !== currentItem._id : true) &&
      (getLongestContentLength(item) > 1500)
  }
}

export function removeCoverImageDuplicate (item) {
  if (item.showCoverImage && item.styles && item.styles.coverImage.isInline && item.banner_image) {
    const coverUrl = item.banner_image
    const imgRegEx = /<img.*?>/g
    let content_html = item.content_html || ''
    let content_mercury = item.content_mercury || ''
    const images = imgRegEx.exec(content_html)
    if (images && images[0].indexOf(coverUrl) !== -1) {
      content_html = content_html.replace(/<img.*?>/, '')
    }
    item = {
      ...item,
      content_html,
      content_mercury
    }
  }
  return item
}

export function removeCachedCoverImages (items) {
  if (!items) return
  items.forEach(item => {
    let path = getCachedCoverImagePath(item)
    if (path) {
      RNFS.unlink(path)
        .catch((error) => {
          // console.log(error)
        })
    }
  })
  // for (let item of items) {
  // }
}
