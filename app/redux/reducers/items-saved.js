import {REHYDRATE} from 'redux-persist'
import {
  itemMarkRead,
  itemSetScrollOffset,
  itemToggleMercury,
  itemDecorationSuccess,
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

export const initialState = {
  items: []
}

export const itemsSaved = (state = initialState, action) => {
  let items = []
  let newItems = []
  let savedItems = []
  let savedItem = {}
  let newState = {}

  switch (action.type) {
    case 'ITEMS_REHYDRATE_SAVED':
      // workaround to make up for slideable bug
      if (action.items) {
        console.log('REHYDRATE SAVED ITEMS!')
        return {
          items: action.items
        }
      }
      return { ...state }

    case 'ITEM_MARK_READ':
      return itemMarkRead(action, state)

    case 'ITEM_SET_SCROLL_OFFSET':
      return itemSetScrollOffset(action, state)

    case 'ITEM_TOGGLE_MERCURY':
      return itemToggleMercury(action, state)

    case 'ITEM_SAVE_ITEM':
      items = [ ...state.items ]
      savedItem = action.item
      savedItem.isSaved = true
      items.push({
        ...savedItem,
        savedAt: Date.now()
      })
      return {
        ...state,
        items
      }

    case 'ITEM_SAVE_EXTERNAL_ITEM':
      items = [ ...state.items ]
      savedItem = nullValuesToEmptyStrings(action.item)
      savedItem = addStylesIfNecessary(savedItem)
      savedItem.isSaved = true
      items.push({
        ...savedItem,
        savedAt: Date.now()
      })
      return {
        ...state,
        items
      }

    // TODO; saved index
    case 'ITEM_UNSAVE_ITEM':
      let savedIndex = state.items.indexOf(action.item) || 0
      savedItem = state.items.find((item) => item._id === action.item._id)
      savedItem = state.items.find((item) => item._id === action.item._id)
      items = items.filter((item) => item._id !== action.item._id)
      if (savedItem) savedItem.isSaved = false
      if (savedIndex > items.length - 1) {
        savedIndex = items.length - 1
      }
      return {
        ...state,
        items
      }

      // newState = { ...state }
      // newState[indexKey] = action.index
      // return newState

    // case 'ITEMS_KEEP_CURRENT_ITEM_UNREAD':
    //   newItems = state.items
    //   newItems[state.index].keepUnread = true
    //   return {
    //     ...state,
    //     items: newItems
    //   }

    case 'ITEM_DECORATION_SUCCESS':
      return itemDecorationSuccess(action, state)

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_SIZE':
      return updateCurrentItemTitleFontSize(action, state)

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_RESIZED':
      if (action.item.title === 'Loading...') return state
      return updateCurrentItemTitleFontResized(action, state)

    default:
      return state
  }
}
