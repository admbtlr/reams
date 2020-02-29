import {
  UNSET_BACKEND,
  ConfigActionTypes 
} from '../config/types'
import { 
  FLATE_ITEMS,
  FLATE_ITEMS_ERROR,
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
  Item,
  ItemActionTypes,
  ItemsState,
  ItemType
} from './types'
import {
  itemMarkRead,
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
  nullValuesToEmptyStrings
} from '../../utils/item-utils.js'

const initialState:ItemsState = {
  items: [],
  index: 0,
  lastUpdated: 0
}

export function itemsSaved (
  state = initialState, 
  action: ItemActionTypes | ConfigActionTypes
) : ItemsState {
  let items: Item[] = []
  let newItems: Item[] = []
  let savedItem: Item
  let index: number
  let newState: { 
    index? : number, 
    lastUpdated : number
    items : Item[]
  } = {
    index: 0,
    items: [],
    lastUpdated: 0
  }
  let currentItem: Item
  let carouselled: { index : number, items : Item[] }

  switch (action.type) {
    case UNSET_BACKEND:
      return initialState

    case UPDATE_CURRENT_INDEX:
      if (action.displayMode !== ItemType.saved) return state

      return {
        ...state,
        index: action.index
      }

    case MARK_ITEM_READ:
      return itemMarkRead(action, state)

    case SET_SCROLL_OFFSET:
      return itemSetScrollOffset(action, state)

    case TOGGLE_MERCURY_VIEW:
      return itemToggleMercury(action, state)

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
      if (action.itemType === ItemType.unread) {
        return {
          ...state,
          lastUpdated: Date.now()
        }
      } else return state

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
            savedAt: items[indexToUpdate].savedAt,
            isSaved: true
          }
        } else {
          items.push(newItem)
        }
      })

      // order by date
      items.sort((a, b) => ((b.savedAt || 0) - (a.savedAt || 0) ))
      index = items.indexOf(currentItem)
      index = index < 0 ? 0 : index

      return {
        ...state,
        items,
        index
      }

    case FLATE_ITEMS:
      return itemsFlate(action, state)

    case FLATE_ITEMS_ERROR:
      return itemsFlateError(action, state)

    case ITEM_DECORATION_SUCCESS:
      if (!action.isSaved) return state
      let newState = itemDecorationSuccess(action, state)
      newState.items.sort((a: Item, b: Item) => ((b.savedAt || 0) - (a.savedAt || 0)))
      return newState

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
