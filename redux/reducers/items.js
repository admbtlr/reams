import {REHYDRATE} from 'redux-persist/constants'
import {createItemStyles} from '../../utils/createItemStyles'

export const initialState = {
  items: [],
  saved: [],
  index: 0,
  savedIndex: 0,
  display: 'unread' // currently 'unread' || 'saved'
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
  const key = state.display === 'unread' ? 'items' : 'savedItems'
  const indexKey = state.display === 'unread' ? 'index' : 'savedIndex'

  switch (action.type) {
    case REHYDRATE:
      // workaround to make up for slideable bug
      let incoming = action.payload.items
      console.log('REHYDRATE!' + action.payload.items)
      if (incoming) {
        return {
          ...state,
          ...incoming,
          index: incoming.index < 0 ? 0 : incoming.index,
          savedIndex: incoming.savedIndex < 0 ? 0 : incoming.savedIndex
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
      const currentItem = state.items[state.index] || 0
      items = interleaveItems(state.items, action.items, currentItem)
        .map(addStylesIfNecessary)

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

    case 'ITEM_MARK_READ_SUCCESS':
      items = state[key]
      items[action.index].readAt = Date.now()
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
      savedItem = addStylesIfNecessary(action.item)
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

    case 'ITEMS_UPDATE_CURRENT_INDEX':
      let newState = { ...state }
      newState[indexKey] = action.index
      return newState

    case 'ITEMS_KEEP_CURRENT_ITEM_UNREAD':
      newItems = state.items
      newItems[state.index].keepUnread = true
      return {
        ...state,
        items: newItems
      }

    case 'ITEM_LOAD_MERCURY_STUFF_SUCCESS':
      const testAndAddMercury = (item) => {
        if (item._id === action.item._id) {
          return addMercuryStuffToItem(item, action.mercuryStuff)
        } else {
          return item
        }
      }

      items = state.items.map(testAndAddMercury).map(addStylesIfNecessary)
      saved = state.saved.map(testAndAddMercury).map(addStylesIfNecessary)
      return {
        ...state,
        items,
        saved
      }

    case 'TOGGLE_DISPLAYED_ITEMS':
      const display = state.display === 'unread' ? 'saved' : 'unread'
      return {
        ...state,
        display
      }

    default:
      return state
  }
}

function addStylesIfNecessary (item) {
  if (item.styles && !item.styles.temporary) {
    return item
  } else {
    let styles = createItemStyles(item)
    if (item.title === 'Loading...') {
      styles.temporary = true
    }
    return {
      ...item,
      styles: createItemStyles(item)
    }
  }
}

function mergeDedupe (oldItems, newItems) {
  let items = []

  // go through new items, replacing new ones with matching old ones (to get Mercury stuff)
  newItems.forEach(newItem => {
    let match = false
    oldItems.forEach(oldItem => {
      if (newItem.id === oldItem.id) {
        match = oldItem
      }
    })
    items.push(match || newItem)
  })

  // oldItems.forEach(oldItem => {
  //   if (!items.find((item) => item.feed_item_id === oldItem.feed_item_id) &&
  //     !oldItem.readAt) {
  //     items.push(oldItem)
  //   }
  // })

  return items.filter(item => !item.readAt)
}

function interleaveItems (oldItems, newItems, currentItem) {
  let items = mergeDedupe(oldItems, newItems).map(item => {
    return {
      ...item,
      _id: item._id ? item._id : id()
    }
  })

  if (currentItem) {
    let includesCurrent = items.find(item => item._id === currentItem._id)
    if (!includesCurrent) {
      items.push(currentItem)
    }
  }

  items.sort((a, b) => a.date_published - b.date_published)
  return items
}

function id () {
  return Math.random().toString(36).substring(7)
}

function addMercuryStuffToItem (item, mercury) {
  if (item.is_external) {
    return {
      ...item,
      external_url: item.url,
      title: mercury.title,
      content_html: mercury.content,
      date_published: mercury.date_published,
      date_modified: mercury.date_published,
      author: mercury.author,
      feed_title: mercury.domain,
      banner_image: mercury.lead_image_url,
      excerpt: mercury.excerpt
    }
  }

  let content = mercury.content && mercury.content.length && mercury.content.length > item.content_html.length
    ? mercury.content
    : item.body
  return {
    ...item,
    banner_image: mercury.lead_image_url,
    body: content
  }
}
