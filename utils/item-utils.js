const fuzz = require('fuzzball')
import * as FileSystem from 'expo-file-system'
const sanitizeHtml = require('sanitize-html')
import { createItemStyles, compressStyles, expandStyles } from './createItemStyles'
import { fileExists, getCachedCoverImagePath } from './index'
import log from './log'
import LZString from 'lz-string'
import { Platform } from 'react-native'

export function addStylesIfNecessary(item, index, items) {
  if (item.styles && !item.styles.temporary) {
    return item
  } else {
    const prevStyles = index > 0 ? items[index].styles : null
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

export function deflateItem(item) {
  if (!item) {
    log('Item is null?')
  }
  // const styles = item.styles
  // const compressed = LZString.compressToUTF16(JSON.stringify(compressStyles(item.styles)))
  const deflated = {
    _id: item._id,
    author: item.author,
    coverImageUrl: item.coverImageUrl, // needed by the feed component
    content_length: item.content_length || (item.content_html
      ? stripTags(item.content_html).length
      : 0),
    created_at: item.created_at,
    date_published: item.date_published,
    decoration_failures: item.decoration_failures,
    feed_id: item.feed_id,
    feed_title: item.feed_title,
    // feed_color: item.feed_color,
    hasCoverImage: item.hasCoverImage,
    showCoverImage: item.showCoverImage,
    imageDimensions: item.imageDimensions,
    isAnalysed: item.isAnalysed,
    isDecorated: item.isDecorated,
    isExternal: item.isExternal,
    isKeepUnread: item.isKeepUnread,
    isNewsletter: item.isNewsletter,
    id: item.id, // needed to match existing copy in store
    readAt: item.readAt,
    // styles: item.styles,
    title: item.title,
    url: item.url,
    isSaved: item.isSaved,
    savedAt: item.savedAt
  }
  Object.keys(deflated).forEach(key => deflated[key] === undefined && delete deflated[key])
  return deflated
}

export function inflateStyles(item) {
  if (!item) {
    log('inflateStyles', 'Item is null?')
  }
  const styles = item.styles
  if (typeof styles === 'object') return item
  const expanded = expandStyles(JSON.parse(LZString.decompressFromUTF16(styles)))
  return {
    ...item,
    styles: expanded
  }
}

export function isInflated(item) {
  return Object.keys(item).indexOf('content_html') !== -1 && !!item.content_html
}

export function fixRelativePaths(item) {
  if (!item.url) return item
  const matches = /http[s]?:\/\/[^:\/\s]+/.exec(item.url)
  if (!matches) return item
  const host = matches[0]
  const derelativise = s => {
    s = s.replace(/(src.*?)="\/\//g, '$1="https://')
    s = s.replace(/(src.*?)="\//g, `$1="${host}/`)
    return s
  }
  if (item.content_html) item.content_html = derelativise(item.content_html)
  if (item.content_mercury) item.content_mercury = derelativise(item.content_mercury)
  if (item.body) item.body = derelativise(item.body)
  return item
}

export function sanitizeContent(item) {
  const settings = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'script', 'video']),
    allowedAttributes: false,
    allowVulnerableTags: true
  }
  if (item.content_html) item.content_html = sanitizeHtml(item.content_html, settings)
  if (item.content_mercury) item.content_mercury = sanitizeHtml(item.content_mercury, settings)
  return item
}

export function nullValuesToEmptyStrings(item) {
  item.title = item.title ? item.title : ''
  item.content_html = item.content_html ? item.content_html : ''
  return item
}

export function addMercuryStuffToItem(item, mercury) {
  // mercury.content = sanitizeHtml(mercury.content, {
  //   allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
  // })
  if (item.isExternal) {
    item = {
      ...item,
      title: mercury.title,
      content_mercury: mercury.content,
      // body: mercury.content ? mercury.content : '',
      date_published: mercury.date_published,
      author: mercury.author,
      feed_title: mercury.domain,
      coverImageUrl: mercury.lead_image_url,
      excerpt: mercury.excerpt,
      isDecorated: true,
      showMercuryContent: true
    }
    return fixRelativePaths(item)
  }

  // if excerpt == content_html, showMercury
  let decoratedItem = {
    ...item,
    author: mercury.author || item.author,
    title: mercury.title,
    coverImageUrl: mercury.lead_image_url,
    // body: content,
    content_mercury: mercury.content ? mercury.content : '',
    content_html: item.content_html ? item.content_html : '',
    date_published: mercury.date_published || item.date_published,
    excerpt: mercury.excerpt,
    isDecorated: true
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

  const htmlPartial = stripTags(decoratedItem.content_html)
  const mercuryPartial = stripTags(decoratedItem.content_mercury)

  if (mercuryPartial.length / htmlPartial.length > 1.3 &&
    fuzz.partial_ratio(htmlPartial.substring(0, 500), mercuryPartial.substring(0, 500)) > 90) {
    decoratedItem.showMercuryContent = true
  }

  if (decoratedItem.excerpt && decoratedItem.excerpt.length > 0 &&
    fuzz.partial_ratio(decoratedItem.excerpt, htmlPartial.substring(0, 500)) > 90) {
    if (decoratedItem.content_html.indexOf(`<p>${decoratedItem.excerpt}</p>`) > -1) {
      // excerpt is first paragraph of content_html
      decoratedItem.content_html = decoratedItem.content_html.replace(`<p>${decoratedItem.excerpt}</p>`, '')
    } else if (decoratedItem.excerpt === htmlPartial && mercuryPartial.length > 0) {
      decoratedItem.showMercuryContent = true
    } else {
      decoratedItem.excerpt = null
    }
  }

  if (htmlPartial.length < 500 &&
    fuzz.partial_ratio(htmlPartial, mercuryPartial.substring(0, 500)) > 90) {
    decoratedItem.showMercuryContent = true
  }

  decoratedItem = fixRelativePaths(decoratedItem)

  return decoratedItem
}

function stripTags(text) {
  return text.replace(/<.*?>/g, '')
}

export function isExcerptUseful(item) {
  return item.excerpt && item.excerpt.length < 200
}

export function isExcerptFirstPara(item) {
  if (!item.content_html) return
  let firstPara = item.content_html.split('</p>')[0].replace('<p>', '')
  return firstPara && strip(firstPara) === item.excerpt
}

export function isExcerptExtract(item, isMercury = false) {
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

export function addCoverImageToItem(item, imageStuff) {
  return {
    ...item,
    ...imageStuff
  }
}

export function setShowCoverImage(item) {
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
    showCoverImage: item.hasCoverImage //&&
    // (currentItem ? item._id !== currentItem._id : true) &&
    //(getLongestContentLength(item) > 1500)
  }
}

export function removeCachedCoverImageDuplicate(item) {
  if (item.showCoverImage && item.styles && item.styles.coverImage?.isInline && item.coverImageUrl) {
    const getImageFileName = (path) => /.*\/(.*?)\./.exec(path)[1]
    const imageSrcIsUrl = (path) => path.startsWith('http')
    let visibleContentKey = item.showMercuryContent ?
      'content_mercury' :
      'content_html'
    const firstImg = /<img.*?src="(.*?)".*?>/.exec(item[visibleContentKey]) &&
      /<img.*?src="(.*?)".*?>/.exec(item[visibleContentKey])[1]
    if (firstImg &&
      item.coverImageUrl &&
      item.styles.coverImage?.isInline &&
      imageSrcIsUrl(firstImg) &&
      fuzz.ratio(getImageFileName(firstImg), getImageFileName(item.coverImageUrl)) > 70) {
      item[visibleContentKey] = item[visibleContentKey].replace(/<img.*?>/, '')
    }
  }
  return item
}

export async function removeCachedCoverImages(items) {
  if (!items) return

  if (Platform.OS === 'web') return

  for (let item of items) {
    let path = getCachedCoverImagePath(item)
    if (path) {
      try {
        const exists = await fileExists(path)
        if (exists) {
          await FileSystem.deleteAsync(path)
        }
      } catch (err) {
        log('removeCachedCoverImages', err)
      }
    }
  }
}
