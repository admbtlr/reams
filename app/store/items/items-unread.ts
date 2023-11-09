import {
  SET_ITEM_SORT,
  ConfigActionTypes 
} from '../config/types'
import {
  SET_BACKEND,
  UNSET_BACKEND,
  UserActionTypes,
} from '../user/types'
import {
  REMOVE_FEED,
  UPDATE_FEED,
  MUTE_FEED_TOGGLE,
  LIKE_FEED_TOGGLE,
  UNLIKE_FEED,
  FeedActionTypes 
} from '../feeds/types'
import {
  ADD_READING_TIME,
  CLEAR_READ_ITEMS_SUCCESS,
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
  SORT_ITEMS,
  TOGGLE_MERCURY_VIEW,
  UNSAVE_ITEM,
  UPDATE_CURRENT_INDEX, 
  Item,
  ItemActionTypes,
  ItemsState,
  ItemType,
  INCREMENT_INDEX,
  DECREMENT_INDEX
} from './types'
import {
  itemMarkRead,
  itemsMarkRead,
  itemSetScrollOffset,
  itemToggleMercury,
  itemDecorationSuccess,
  itemDecorationFailure,
  updateCurrentItemTitleFontSize,
  updateCurrentItemTitleFontResized
} from './items-common'
import rizzleSort from '../../utils/rizzle-sort'

import { BUFFER_LENGTH } from '../../components/ItemCarousel'

export const selectItemsUnread = (state: ItemsState) => state.items

export const initialState:ItemsState = {
  items: [],
  index: 0,
  lastUpdated: 0
}

// Rehydrated items are just:
 
//
// Inflated items also have:
// - content_mercury
// - url
// - hasCoverImage
// - styles
// - content_html
// - coverImageUrl
// - imageDimensions
// - feed_title
// - showCoverImage
// - excerpt
// - author
//
// The Mercury stuff will be held in AsyncStorage to save $$$
// - content_mercury


export function itemsUnread (
  state = initialState, 
  action: ItemActionTypes | ConfigActionTypes | FeedActionTypes | UserActionTypes
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

    case INCREMENT_INDEX:
      if (action.displayMode === ItemType.unread && 
        state.index < state.items.length - 1) {
        newState.index = state.index + 1
      }
      return {
        ...state,
        ...newState
      }

    case DECREMENT_INDEX:
      if (action.displayMode === ItemType.unread && 
        state.index > 0) {
        newState.index = state.index - 1
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
        let indexToUpdate = items.findIndex(item => item.id === newItem.id || (item._id === newItem._id && item.title === newItem.title))
        if (indexToUpdate !== -1) {
          items[indexToUpdate] = newItem
        } else {
          items.push(newItem)
        }
      })

      items = rizzleSort(items, action.feeds, action.sortDirection)
      carouselled = maintainCarouselItems(state, items)

      return {
        ...state,
        items: carouselled.items,
        index: carouselled.index
        // items,
        // index
      }

    case SORT_ITEMS:
      items = [...state.items]
      items = rizzleSort(items)
      // carouselled = maintainCarouselItems(state, items)
      return {
        ...state,
        items: items,
        index: 0
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
      // index = state.index
      currentItem = state.items[state.index]
      items = items.filter(i => i.readAt === undefined || i._id === currentItem._id)      
      index = items.findIndex(i => i._id === currentItem._id)
      // carouselled = maintainCarouselItems(state, unreadItems)
      return {
        ...state,
        // items: carouselled.items,
        // index: carouselled.index
        items,
        index
      }

    case SET_LAST_UPDATED:
      if (action.itemType === ItemType.unread) {
        return {
          ...state,
          lastUpdated: Date.now()
        }
      } else return state

    case ADD_READING_TIME:
      let item = state.items?.find(item => item._id === action.item._id)
      if (!item) return state

      item = { ...item }
      if (item.readingTime) {
        item.readingTime += action.readingTime
      } else {
        item.readingTime = action.readingTime
      }
      return {
        ...state,
        ...newState
      }

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
      if (action.backend === 'reams') {
        return initialState
      } else {
        return state
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
      return action.isSaved ? state : itemDecorationSuccess(action, state, action.displayMode === 'unread')

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

  // redo: just keep the current item, place at front of array
  // re-redo: keep the current item plus two more, to give time for new items to get mercury
  // re-re-redo: keep the current item minus two more, to avoid items jumping around and disappearing
  let index = 0
  let currentItem = state.items[state.index]
  let itemsToKeep: Item[] = []
  if (currentItem) {
    itemsToKeep.push(currentItem)
    if (state.items.length > state.index + 2) {
      for (let i = 1; i <= 2; i++) {
        if (state.items[state.index + i]) {
          itemsToKeep.push(state.items[state.index + i])
        }
      }  
    }
  }
  if (itemsToKeep.length > 0) {
    items = items.filter(item => !itemsToKeep.find(keeper => keeper._id === item._id))
    items.unshift(...itemsToKeep)
  }
  return { items, index }

}