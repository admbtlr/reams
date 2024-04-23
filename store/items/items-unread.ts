import {
  SET_ITEM_SORT,
  ConfigActionTypes 
} from '../config/types'
import {
  UNSET_BACKEND,
  UserActionTypes,
} from '../user/types'
import {
  REMOVE_FEED,
  UPDATE_FEED,
  MUTE_FEED_TOGGLE,
  LIKE_FEED_TOGGLE,
  FeedActionTypes 
} from '../feeds/types'
import {
  ADD_readingTime,
  ITEMS_BATCH_FETCHED,
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS,
  MARK_ITEM_READ,
  MARK_ITEMS_READ,
  PRUNE_UNREAD,
  REMOVE_ITEMS,
  SAVE_ITEM,
  SET_SCROLL_OFFSET,
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
  DECREMENT_INDEX,
  UPDATE_ITEM,
  MARK_ITEMS_READ_SKIP_BACKEND
} from './types'
import {
  itemMarkRead,
  itemsMarkRead,
  itemSetScrollOffset,
  itemToggleMercury,
  itemDecorationSuccess,
  itemDecorationFailure,
  updateCurrentItemTitleFontSize,
  // updateCurrentItemTitleFontResized
} from './items-common'
import rizzleSort from '../../utils/rizzle-sort'

import { BUFFER_LENGTH } from '../../components/ItemCarousel'

export const selectItemsUnread = (state: ItemsState) => state.items

export const initialState:ItemsState = {
  items: [],
  index: 0,
  lastUpdated: 0
}

export function itemsUnread (
  state = initialState, 
  action: any //ItemActionTypes | ConfigActionTypes | FeedActionTypes | UserActionTypes
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

    case UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map(item => {
          if (item._id === action.item._id) {
            return action.item
          }
          return item
        })
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

    case PRUNE_UNREAD:
      items = [...state.items]
      index = state.index
      if (items.length < action.maxItems) {
        return state
      }

      currentItem = items[state.index]
      items = items.filter(item => action.prunedItems.find((pi: Item) => pi._id === item._id) === undefined)
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
        items: items.filter(item => item.feed_id !== action.feed._id)
      }

    case SET_LAST_UPDATED:
      if (action.itemType === ItemType.unread) {
        return {
          ...state,
          lastUpdated: Date.now()
        }
      } else return state

    // TODO: this needs to go into the database
    // case ADD_readingTime:
    //   let item = state.items?.find(item => item._id === action.item._id)
    //   if (!item) return state

    //   item = { ...item }
    //   if (item.readingTime) {
    //     item.readingTime += action.readingTime
    //   } else {
    //     item.readingTime = action.readingTime
    //   }
    //   return {
    //     ...state,
    //     ...newState
    //   }

    case MARK_ITEM_READ:
      return itemMarkRead(action, state)

    case MARK_ITEMS_READ:
    case MARK_ITEMS_READ_SKIP_BACKEND:
      return itemsMarkRead(action, state)

    case SET_SCROLL_OFFSET:
      return itemSetScrollOffset(action, state)

    case REMOVE_FEED:
      return {
        ...state,
        items: state.items.filter(i => i.feed_id !== action.feed._id)
      }

    case REMOVE_ITEMS:
      // const itemIds = action.items.map(f => f._id)
      return {
        ...state,
        items: state.items.filter(i => action.items.find((ai: Item) => ai._id === i._id) === undefined)
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
            isSaved: false,
            savedAt: undefined
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

    default:
      return state
  }
}

// check for the items that are currently in the carousel
// places them at the beginning of the new items array
// and sets index appropriately
// (sucks that reducers need to think about UI implementation, but :shrug:)
const maintainCarouselItems = (state: ItemsState, items: Item[]) => {
  // keep the current item minus two more, to avoid items jumping around and disappearing
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