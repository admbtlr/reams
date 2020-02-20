import {combineReducers} from 'redux'
import {REHYDRATE} from 'redux-persist'
import {
  itemMarkRead,
  itemsMarkRead,
  itemSetScrollOffset,
  itemToggleMercury,
  itemDecorationSuccess,
  itemDecorationFailure,
  itemsFlate,
  itemsFlateError,
  updateCurrentItemTitleFontSize,
  updateCurrentItemTitleFontResized
} from './items-common'
import {
  addStylesIfNecessary,
  fixRelativePaths,
  nullValuesToEmptyStrings,
  addMercuryStuffToItem,
  addCoverImageToItem,
  setShowCoverImage
} from '../../utils/item-utils.js'
import rizzleSort from '../../utils/rizzle-sort'

import { BUFFER_LENGTH } from '../../components/ItemCarousel'

// export const initialState = {
//   items: []
// }

export const initialState = {
  items: [],
  index: 0
}

export function itemsHasErrored (state = false, action) {
  switch (action.type) {
    case 'ITEMS_HAS_ERRORED':
      return action.hasErrored
    default:
      return state
  }
}

// Rehydrated items are just:
// - _id
// - id
// - title
// - created_at
// - feed_id
// - feed_color
// - hasLoadedMercuryStuff
//
// Inflated items also have:
// - content_mercury
// - url
// - hasCoverImage
// - styles
// - content_html
// - banner_image
// - imageDimensions
// - feed_title
// - showCoverImage
// - external_url
// - excerpt
// - author
//
// The Mercury stuff will be held in AsyncStorage to save $$$
// - content_mercury


export const itemsUnread = (state = initialState, action) => {
  let items = []
  let newItems = []
  let saved = []
  let savedItem = {}
  let newState = {}
  let currentItem
  let carouselled

  switch (action.type) {
    case 'ITEMS_REHYDRATE_UNREAD':
      // workaround to make up for slideable bug
      if (action.items) {
        console.log('REHYDRATE UNREAD ITEMS!')
        return {
          items: action.items
          // index: incoming.index < 0 ? 0 : incoming.index,
          // savedIndex: incoming.savedIndex < 0 ? 0 : incoming.savedIndex,
        }
      }
      return { ...state }

    // case 'UPDATE_ITEM':
    //   items = state[key]
    //   newItems = items.map(item =>
    //     item._id === action.item._id
    //       ? action.item
    //       : item
    //   )
    //   return {
    //     ...state,
    //     key: newItems
    //   }

    // case 'INSERT_ITEM':
    //   if (action.item._id === '9999999999') {
    //     return state
    //   }
    //   return {
    //     ...state,
    //     items: [
    //       action.item,
    //       ...state.items
    //     ]
    //   }

    case 'ITEMS_UPDATE_CURRENT_INDEX':
      if (action.displayMode === 'unread') {
        newState.index = action.index
      }
      return {
        ...state,
        ...newState
      }

    case 'ITEMS_BATCH_FETCHED':
      if (action.itemType !== 'unread') return state
      const feeds = action.feeds
      items = [...state.items]
      newItems = action.items
      newItems.forEach(newItem => {
        let indexToUpdate = items.findIndex(item => item.id === newItem.id || item._id === newItem._id)
        if (indexToUpdate !== -1) {
          items[indexToUpdate] = newItem
        } else {
          items.push(newItem)
        }
      })

      items = rizzleSort(items, feeds)

      carouselled = maintainCarouselItems(state, items)

      return {
        ...state,
        items: carouselled.items,
        index: carouselled.index
        // items,
        // index
      }

    case 'ITEMS_PRUNE_UNREAD':
      items = [...state.items]
      index = state.index
      if (items.length < action.maxItems) {
        return state
      }

      currentItem = items[state.index]
      items = items.filter(item => action.prunedItems.find(pi => pi._id === item._id) === undefined)
      if (currentItem && items.indexOf(currentItem) === -1) {
        items.unshift(currentItem)
        index = 0
      }
      return {
        ...state,
        items,
        index
      }

    case 'FEED_TOGGLE_MUTE':
      items = [...state.items]
      // if there are any items from this feed, we must be toggling mute ON
      return {
        ...state,
        items: items.filter(item => item.feed_id !== action.id)
      }

    case 'ITEMS_CLEAR_READ_SUCCESS':
      items = [...state.items]
      index = state.index
      currentItem = items[state.index]
      let unreadItems = state.items.filter(i => i.readAt === undefined && i._id !== currentItem._id)
      carouselled = maintainCarouselItems(state, unreadItems)
      return {
        ...state,
        items: carouselled.items,
        index: carouselled.index
        // items,
        // index
      }

    case 'UNREAD_ITEMS_SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: Date.now()
      }

    case 'ITEM_ADD_READING_TIME':
      newState = { ...state }
      let item = newState.items.find(item => item._id === action.item._id)
      if (!item) return newState

      if (item.readingTime) {
        item.readingTime += action.readingTime
      } else {
        item.readingTime = action.readingTime
      }
      return newState

    case 'ITEMS_FLATE':
      return itemsFlate(action, state)

    case 'ITEMS_FLATE_ERROR':
      return itemsFlateError(action, state)

    case 'ITEM_MARK_READ':
      return itemMarkRead(action, state)

    case 'ITEMS_MARK_READ':
      return itemsMarkRead(action, state)

    case 'ITEM_SET_SCROLL_OFFSET':
      return itemSetScrollOffset(action, state)

    case 'FEEDS_REMOVE_FEED':
      return {
        ...state,
        items: state.items.filter(i => i.feed_id !== action.feed._id)
      }

    case 'ITEMS_REMOVE_ITEMS':
      const itemIds = action.items.map(f => f._id)
      return {
        ...state,
        items: state.items.filter(i => !items.includes(i._id))
      }

    case 'CONFIG_UNSET_BACKEND':
      return initialState

    case 'FEEDS_UPDATE_FEED':
      const feed = action.feed
      return {
        ...state,
        items: state.items.map(item => item.feed_id === feed._id ?
          {
            ...item,
            feed_color: feed.color
          } :
          item)
      }


    case 'ITEM_SAVE_ITEM':
      return {
        ...state,
        items: state.items.map(item => item._id === action.item._id ?
          {
            ...item,
            isSaved: true,
            savedAt: action.savedAt
          } :
          item)
      }

    case 'ITEM_UNSAVE_ITEM':
      return {
        ...state,
        items: state.items.map(item => item._id === action.item._id ?
          {
            ...item,
            isSaved: false
          } :
          item)
      }

    case 'ITEM_TOGGLE_MERCURY':
      return itemToggleMercury(action, state)

    case 'ITEM_DECORATION_SUCCESS':
      return action.isSaved ? state : itemDecorationSuccess(action, state)

    case 'ITEM_DECORATION_FAILURE':
      return action.isSaved ? state : itemDecorationFailure(action, state)

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_SIZE':
      return updateCurrentItemTitleFontSize(action, state)

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_RESIZED':
      return updateCurrentItemTitleFontResized(action, state)

    default:
      return state
  }
}

// check for the three items in the carousel
// places them at the beginning of the new items array
// and sets index appropriately
// (sucks that reducers need to think about UI implementation, but :shrug:)
const maintainCarouselItems = (state, items) => {
  currentItem = state.items[state.index]
  let index = state.index
  const indexStart = state.index === 0 ?
    0 :
    state.index - 1
  const indexEnd = state.index + BUFFER_LENGTH >= state.items.length ?
    state.items.length - 1 :
    state.index + BUFFER_LENGTH
  if (currentItem) {
    const currentItems = state.items.slice(indexStart, indexEnd+1)
    items = items.filter(item => !currentItems.find(ci => ci._id === item._id))
    items = currentItems.concat(items)
    index = currentItems.indexOf(currentItem)
  }
  return { items, index }
}