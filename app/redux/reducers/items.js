import {REHYDRATE} from 'redux-persist'
import {createItemStyles} from '../../utils/createItemStyles'

export const initialState = {
  items: [],
  saved: [],
  index: 0,
  savedIndex: 0,
  display: 'unread', // currently 'unread' || 'saved'
  decoratedCoung: 0
}

export function itemsHasErrored (state = false, action) {
  switch (action.type) {
    case 'ITEMS_HAS_ERRORED':
      return action.hasErrored
    default:
      return state
  }
}

export function items (state = initialState, action) {
  let items = []
  let newItems = []
  let saved = []
  let savedItem = {}
  let newState = {}
  const key = state.display === 'unread' ? 'items' : 'saved'
  const indexKey = state.display === 'unread' ? 'index' : 'savedIndex'
  const currentItem = state[key][state[indexKey]] || 0

  switch (action.type) {
    case REHYDRATE:
      // workaround to make up for slideable bug
      let incoming = action.payload ? action.payload.items : null
      if (incoming) {
        console.log('REHYDRATE!' + action.payload.items)
        return {
          ...state,
          ...incoming,
          index: incoming.index < 0 ? 0 : incoming.index,
          savedIndex: incoming.savedIndex < 0 ? 0 : incoming.savedIndex,
        }
      }
      return { ...state }

    case 'UPDATE_ITEM':
      items = state[key]
      newItems = items.map(item =>
        item._id === action.item._id
          ? action.item
          : item
      )
      return {
        ...state,
        key: newItems
      }

    case 'INSERT_ITEM':
      if (action.item._id === '9999999999') {
        return state
      }
      return {
        ...state,
        items: [
          action.item,
          ...state.items
        ]
      }

    case 'ITEMS_FETCH_DATA_SUCCESS':
      items = action.items
        .map(nullValuesToEmptyStrings)
        .map(fixRelativePaths)
        .map(addStylesIfNecessary)
        .map(setShowCoverImage)

      let index = 0
      if (currentItem) {
        items.forEach((item, i) => {
          if (item._id === currentItem._id) {
            index = i
          }
        })
      }
      return {
        ...state,
        items,
        index
      }

    case 'ITEM_MARK_READ':
      items = state[key].map(item => {
        if (item._id === action.item._id) {
          item.readAt = Date.now()
        }
        return item
      })
      newState = { ...state }
      newState[key] = items
      return newState

    case 'ITEM_SET_SCROLL_OFFSET':
      items = state[key].map(item => {
        if (item._id === action.item._id) {
          item.scrollOffset = action.offset.y
        }
        return item
      })
      newState = { ...state }
      newState[key] = items
      return newState


    case 'ITEMS_UPDATE_CURRENT_INDEX':
      if (state.display === 'unread') {
        newState.index = action.index
      } else {
        newState.savedIndex = action.index
      }
      return {
        ...state,
        ...newState
      }

    case 'FEED_MARK_READ':
      const feedId = action.id
      const currentItem = state.items[state.index]
      items = [ ...state.items ].filter((item) => {
        return item.feed_id !== feedId &&
          item._id !== currentItem._id
      })
      let newIndex = 0
      items.forEach((item, index) => {
        if (item._id === currentItem._id) {
          newIndex = index
        }
      })
      if (newIndex == 0) {
        // find the first unread item and start there
        let i = 0
        for (let item of items) {
          if (!item.readAt) {
            newIndex = i
            break
          }
          i++
        }
      }
      return {
        ...state,
        items,
        index: newIndex
      }

    case 'ITEM_TOGGLE_MERCURY':
      items = [ ...state.items ]
      const item = items.find((item) => item._id === action.item._id)
      if (item && item.content_mercury) {
        item.showMercuryContent = !item.showMercuryContent
      }
      return {
        ...state,
        items
      }

    case 'ITEM_SAVE_ITEM':
      items = [ ...state.items ]
      saved = [ ...state.saved ]
      savedItem = items.find((item) => item._id === action.item._id)
      savedItem.isSaved = true
      saved.push({
        ...savedItem,
        savedAt: Date.now()
      })
      return {
        ...state,
        items,
        saved
      }

    case 'ITEM_SAVE_EXTERNAL_ITEM':
      saved = [ ...state.saved ]
      savedItem = nullValuesToEmptyStrings(action.item)
      savedItem = addStylesIfNecessary(savedItem)
      savedItem.isSaved = true
      saved.push({
        ...savedItem,
        savedAt: Date.now()
      })
      return {
        ...state,
        saved
      }

    case 'ITEM_UNSAVE_ITEM':
      items = [ ...state.items ]
      let savedIndex = state.savedIndex
      savedItem = state.saved.find((item) => item._id === action.item._id)
      saved = state.saved.filter((item) => item._id !== action.item._id)
      savedItem = items.find((item) => item._id === action.item._id)
      if (savedItem) savedItem.isSaved = false
      if (savedIndex > saved.length - 1) {
        savedIndex = saved.length - 1
      }
      return {
        ...state,
        items,
        saved,
        savedIndex
      }

      newState = { ...state }
      newState[indexKey] = action.index
      return newState

    case 'ITEMS_KEEP_CURRENT_ITEM_UNREAD':
      newItems = state.items
      newItems[state.index].keepUnread = true
      return {
        ...state,
        items: newItems
      }

    case 'ITEM_DECORATION_SUCCESS':
      const testAndDecorate = (item) => {
        if (item._id === action.item._id) {
          item =  addMercuryStuffToItem(item, action.mercuryStuff)
          return addCoverImageToItem(item, action.imageStuff)
        } else {
          return item
        }
      }

      items = state.items.map(testAndDecorate).map(addStylesIfNecessary)
      saved = state.saved.map(testAndDecorate).map(addStylesIfNecessary)
      return {
        ...state,
        items,
        saved
      }

    case 'ITEM_DECORATION_PROGRESS':
      return {
        ...state,
        decoratedCount: action.decoratedCount
      }

    case 'TOGGLE_DISPLAYED_ITEMS':
      const display = state.display === 'unread' ? 'saved' : 'unread'
      return {
        ...state,
        display
      }

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_SIZE':
      let stateChanged = false
      items = state[key]
      newItems = items.map(item => {
        if (item._id === action.item._id) {
          if (item.styles.title.fontSize !== action.fontSize) {
            item.styles.title.fontSize = action.fontSize
            item.styles.title.lineHeight = action.fontSize
            item.styles.title.fontResized = true
            stateChanged = true
          }
        }
        return item
      })
      return stateChanged ?
        {
          ...state,
          [key]: newItems
        } : state

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_RESIZED':
      items = state[key]
      newItems = items.map(item => {
        if (item._id === action.item._id) {
          item.styles.title.fontResized = true
        }
        return item
      })
      return {
        ...state,
        [key]: newItems
      }

    default:
      return state
  }
}

function addStylesIfNecessary (item, index, items) {
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

function setShowCoverImage (item) {
  let showCoverImage = false
  // arbitrary length...
  if (item.hasCoverImage && item.content_html.length > 2000) {
    showCoverImage = true
  }
  return {
    ...item,
    showCoverImage
  }
}

function fixRelativePaths (item) {
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

function nullValuesToEmptyStrings (item) {
  item.title = item.title ? item.title : ''
  item.content_html = item.content_html ? item.content_html : ''
  return item
}

function addMercuryStuffToItem (item, mercury) {
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

function isExcerptUseful (item) {
  return item.excerpt && item.excerpt.length < 200
}

function isExcerptExtract (item, isMercury = false) {
  if (!item.content_html) return false
  let isExcerptExtract
  const excerptWithoutEllipsis = item.excerpt.substring(0, item.excerpt.length - 4)
  return strip(item.content_html).substring(0, excerptWithoutEllipsis.length) === excerptWithoutEllipsis
}

function strip(content) {
  return content
    .replace(/<.*?>/g, '')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&apos;/g, "'")
    .trim()
}

function addCoverImageToItem (item, imageStuff) {
  return {
    ...item,
    ...imageStuff
  }
}
