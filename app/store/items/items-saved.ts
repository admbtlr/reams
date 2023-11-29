import {
  SET_BACKEND,
  UNSET_BACKEND,
  UserActionTypes 
} from '../user/types'
import { 
  ITEM_DECORATION_FAILURE,
  ITEM_DECORATION_SUCCESS,
  ITEMS_BATCH_FETCHED, 
  MARK_ITEM_READ,
  SAVE_ITEM,
  SAVE_EXTERNAL_ITEM,
  SET_SCROLL_OFFSET,
  SET_LAST_UPDATED,
  SET_TITLE_FONT_RESIZED,
  SET_TITLE_FONT_SIZE,
  TOGGLE_MERCURY_VIEW,
  UNSAVE_ITEM,
  UNSAVE_ITEMS,
  UPDATE_CURRENT_INDEX,
  UPDATE_ITEM,
  Item,
  ItemActionTypes,
  ItemsState,
  ItemType,
  SAVE_EXTERNAL_ITEM_SUCCESS,
  SET_SAVED_ITEMS,
  INCREMENT_INDEX,
  DECREMENT_INDEX
} from './types'
import {
  itemMarkRead,
  itemSetScrollOffset,
  itemToggleMercury,
  itemDecorationSuccess,
  itemDecorationFailure,
  updateCurrentItemTitleFontSize,
  updateCurrentItemTitleFontResized
} from './items-common'
import {
  addStylesIfNecessary,
  nullValuesToEmptyStrings
} from '../../utils/item-utils.js'
import { RootState } from '../reducers'

export const initialState:ItemsState = {
  items: [],
  index: 0,
  lastUpdated: 0
}

export const selectItemsSaved = (state: RootState) => state.itemsSaved.items

export function itemsSaved (
  state = initialState, 
  action: ItemActionTypes | UserActionTypes
) : ItemsState {
  let items: Item[] = []
  let newItems: Item[] = []
  let savedItem: Item
  let index: number
  let currentItem: Item

  switch (action.type) {
    case UPDATE_CURRENT_INDEX:
      if (action.displayMode !== ItemType.saved) return state
      return {
        ...state,
        index: action.index
      }

    case INCREMENT_INDEX:
      index = state.index
      if (action.displayMode === ItemType.unread && 
        state.index < state.items.length - 1) {
        index++
      }
      return {
        ...state,
        index
      }

    case DECREMENT_INDEX:
      index = state.index
      if (action.displayMode === ItemType.unread && 
        state.index > 0) {
        index--
      }
      return {
        ...state,
        index
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

    case MARK_ITEM_READ:
      return itemMarkRead(action, state)

    case SET_SCROLL_OFFSET:
      return itemSetScrollOffset(action, state)

    case TOGGLE_MERCURY_VIEW:
      return itemToggleMercury(action, state)

    case SET_SAVED_ITEMS:
      return {
        ...state,
        items: action.items
      }

    case SAVE_ITEM:
      items = [ ...state.items ]
      savedItem = action.item
      savedItem.isSaved = true
      savedItem.savedAt = action.savedAt
      items.unshift(savedItem)
      return {
        ...state,
        items
      }

    case SAVE_EXTERNAL_ITEM:
      items = [ ...state.items ]
      savedItem = nullValuesToEmptyStrings(action.item)
      savedItem = addStylesIfNecessary(savedItem)
      savedItem.isSaved = true
      savedItem.savedAt = action.savedAt
      items.unshift(savedItem)
      return {
        ...state,
        items,
        index: 0
      }

    case SAVE_EXTERNAL_ITEM_SUCCESS:
      const backendItem = action.item
      items = state.items.map(item => {
        if (item.url === backendItem.url) {
          item.id = backendItem.id
        }
        return item
      })
      return {
        ...state,
        items
      }
  
    case UNSAVE_ITEM:
      items = state.items
        .filter((item) => item._id !== action.item._id)
        .map(item => item)
      index = state.index > items.length - 1 ?
        items.length - 1 :
        state.index
      return {
        ...state,
        items,
        index
      }

    case UNSAVE_ITEMS:
      currentItem = state.items[state.index]
      items = state.items
        .filter((item) => {
          return action.items.find(ai => ai._id === item._id) === undefined
        })
        .map(item => item)
      if (items.indexOf(currentItem) === -1) {
        index = 0
      } else {
        index = items.indexOf(currentItem)
      }
      return {
        ...state,
        items,
        index
      }

    case UNSET_BACKEND:
      if (action.backend === 'reams') {
        return initialState
      } else {
        return state
      }


    // case 'ITEMS_UNSAVE_ITEM_SUCCESS':
    //   currentItem = state.items[state.index]
    //   items = state.items
    //     .filter(item => item._id !== action.item._id)
    //     .map(item => item)
    //   if (items.indexOf(currentItem) === -1) {
    //     index = 0
    //   } else {
    //     index = items.indexOf(currentItem)
    //   }

    //   return {
    //     ...state,
    //     items,
    //     index
    //   }

    case SET_LAST_UPDATED:
      if (action.itemType !== ItemType.saved) return state
      return {
        ...state,
        lastUpdated: Date.now()
      }

    case ITEMS_BATCH_FETCHED:
      if (action.itemType !== ItemType.saved) return state
      items = [...state.items]
      currentItem = items[state.index]
      newItems = action.items.map(item => ({
        ...item,
        savedAt: item.savedAt || item.created_at || 0,
        isSaved: true
      }))
      newItems.forEach(newItem => {
        let indexToUpdate = items.findIndex(item => item._id === newItem._id)
        if (indexToUpdate !== -1) {
          items[indexToUpdate] = {
            ...newItem,
            ...items[indexToUpdate]
          }
        } else {
          items.push(newItem)
        }
      })

      // order by date
      items.sort((a, b) => ((b.savedAt || b.created_at) - (a.savedAt || a .created_at) ))
      index = items.indexOf(currentItem)
      index = index < 0 ? 0 : index

      return {
        ...state,
        items,
        index
      }

    case ITEM_DECORATION_SUCCESS:
      if (!action.isSaved) return state
      // I'm setting isCurrentDisplayMode to false because I always want saved external items to re-render
      return itemDecorationSuccess(action, state, false)

    case ITEM_DECORATION_FAILURE:
      return action.isSaved ? itemDecorationFailure(action, state) : state

    case SET_TITLE_FONT_SIZE:
      return updateCurrentItemTitleFontSize(action, state)

    case SET_TITLE_FONT_RESIZED:
      if (action.item.title === 'Loading...') return state
      return updateCurrentItemTitleFontResized(action, state)

    default:
      return state
  }
}
