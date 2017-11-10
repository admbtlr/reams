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
      var incoming = action.payload.items
      console.log('REHYDRATE!' + action.payload.items)
      if (incoming) {
        return {
          ...state,
          ...incoming,
          index: incoming.index < 0 ? 0 : incoming.index
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
      const currentItem = state.items[state.index]
      items = interleaveItems(state.items, action.items, currentItem)
        .map((item) => {
          return {
            ...item,
            styles: createItemStyles(item)
          }
        })

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
      items = state.items.map((item) => {
        if (item._id === action.item._id) {
          return addMercuryStuffToItem(item, action.mercuryStuff)
        } else {
          return item
        }
      })
      return {
        ...state,
        items
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

function mergeDedupe (oldItems, newItems) {
  let items = []

  // go through new items, replacing new ones with matching old ones (to get Mercury stuff)
  // add current item if not present
  newItems.forEach(newItem => {
    let match = false
    oldItems.forEach(oldItem => {
      if (newItem.feed_item_id === oldItem.feed_item_id) {
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

  return items
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

  items.sort((a, b) => a.created_at - b.created_at)
  return items
}

function id () {
  return Math.random().toString(36).substring(7)
}

function addMercuryStuffToItem (item, mercury) {
  let content = mercury.content.length && mercury.content.length > item.body.length
    ? mercury.content
    : item.body
  return {
    ...item,
    leadImg: mercury.lead_image_url,
    body: content
  }
}
