import {combineReducers} from 'redux'
import {REHYDRATE} from 'redux-persist'
import {
  UNSET_BACKEND,
  ConfigActionTypes 
} from '../config/types'
import {
  REMOVE_FEED,
  UPDATE_FEED,
  MUTE_FEED_TOGGLE,
  FeedActionTypes 
} from '../feeds/types'
import {
  ADD_READING_TIME,
  CLEAR_READ_ITEMS_SUCCESS,
  FLATE_ITEMS,
  FLATE_ITEMS_ERROR,
  ITEMS_BATCH_FETCHED,
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS,
  MARK_ITEM_READ,
  MARK_ITEMS_READ,
  PRUNE_UNREAD,
  REMOVE_ITEMS,
  SAVE_ITEM,
  SET_SCROLL_OFFSET,
  SET_TITLE_FONT_RESIZED,
  SET_TITLE_FONT_SIZE,
  SET_LAST_UPDATED,
  TOGGLE_MERCURY_VIEW,
  UNSAVE_ITEM,
  UPDATE_CURRENT_INDEX, 
  Item,
  ItemActionTypes,
  ItemsState,
  ItemType
} from './types'
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
import rizzleSort from '../../utils/rizzle-sort'

import { BUFFER_LENGTH } from '../../components/ItemCarousel'

// export const initialState = {
//   items: []
// }

const initialState:ItemsState = {
  items: [],
  index: 0,
  lastUpdated: 0
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


export function itemsUnread (
  state = initialState, 
  action: ItemActionTypes | ConfigActionTypes | FeedActionTypes
) : ItemsState {
  let items: Item[] = []
  let newItems: Item[] = []
  let index: number
  let newState: { 
    index? : number, 
    lastUpdated? : number
    items? : Item[]
  } = {}
  let currentItem: Item
  let carouselled: { index : number, items : Item[] }

  switch (action.type) {
    case UPDATE_CURRENT_INDEX:
      if (action.displayMode === ItemType.unread) {
        newState.index = action.index
      }
      return {
        ...state,
        ...newState
      }

    case ITEMS_BATCH_FETCHED:
      if (action.itemType !== ItemType.unread) return state
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

      items = rizzleSort(items)

      carouselled = maintainCarouselItems(state, items)

      return {
        ...state,
        items: carouselled.items,
        index: carouselled.index
        // items,
        // index
      }

    case PRUNE_UNREAD:
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

    case MUTE_FEED_TOGGLE:
      items = [...state.items]
      // if there are any items from this feed, we must be toggling mute ON
      return {
        ...state,
        items: items.filter(item => item.feed_id !== action.id)
      }

    case CLEAR_READ_ITEMS_SUCCESS:
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

    case SET_LAST_UPDATED:
      if (action.itemType === ItemType.unread) {
        return {
          ...state,
          lastUpdated: Date.now()
        }
      } else return state

    case ADD_READING_TIME:
      newState = { ...state }
      let item = newState.items?.find(item => item._id === action.item._id)
      if (!item) return state

      if (item.readingTime) {
        item.readingTime += action.readingTime
      } else {
        item.readingTime = action.readingTime
      }
      return {
        ...state,
        ...newState
      }

    case FLATE_ITEMS:
      return itemsFlate(action, state)

    case FLATE_ITEMS_ERROR:
      return itemsFlateError(action, state)

    case MARK_ITEM_READ:
      return itemMarkRead(action, state)

    case MARK_ITEMS_READ:
      return itemsMarkRead(action, state)

    case SET_SCROLL_OFFSET:
      return itemSetScrollOffset(action, state)

    case REMOVE_FEED:
      return {
        ...state,
        items: state.items.filter(i => i.feed_id !== action.feed._id)
      }

    case REMOVE_ITEMS:
      const itemIds = action.items.map(f => f._id)
      return {
        ...state,
        items: state.items.filter(i => !items.
          map(i => i._id).includes(i._id))
      }

    case UNSET_BACKEND:
      return initialState

    case UPDATE_FEED:
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

    case SAVE_ITEM:
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

    case UNSAVE_ITEM:
      return {
        ...state,
        items: state.items.map(item => item._id === action.item._id ?
          {
            ...item,
            isSaved: false
          } :
          item)
      }

    case TOGGLE_MERCURY_VIEW:
      return itemToggleMercury(action, state)

    case ITEM_DECORATION_SUCCESS:
      return action.isSaved ? state : itemDecorationSuccess(action, state)

    case ITEM_DECORATION_FAILURE:
      return action.isSaved ? state : itemDecorationFailure(action, state)

    case SET_TITLE_FONT_SIZE:
      return updateCurrentItemTitleFontSize(action, state)

    case SET_TITLE_FONT_RESIZED:
      return updateCurrentItemTitleFontResized(action, state)

    default:
      return state
  }
}

// check for the items that are currently in the carousel
// places them at the beginning of the new items array
// and sets index appropriately
// (sucks that reducers need to think about UI implementation, but :shrug:)
const maintainCarouselItems = (state: ItemsState, items: Item[]) => {
  let currentItem = state.items[state.index]
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