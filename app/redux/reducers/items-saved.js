import {REHYDRATE} from 'redux-persist'
import {
  itemMarkRead,
  itemSetScrollOffset,
  itemToggleMercury,
  itemDecorationSuccess,
  updateCurrentItemTitleFontSize,
  updateCurrentItemTitleFontResized
} from './items-common'

export const initialState = []

export const itemsSaved = (state = initialState, action) => {
  let items = []
  let newItems = []
  let saved = []
  let savedItem = {}
  let newState = {}

  switch (action.type) {
    case REHYDRATE:
      // workaround to make up for slideable bug
      let incoming = action.payload ? action.payload.items : null
      if (incoming) {
        console.log('REHYDRATE!' + action.payload.items)
        return {
          ...state,
          ...incoming
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
      savedItem = items.find((item) => item._id === action.item._id)
      savedItem.isSaved = true
      saved.push({
        ...savedItem,
        savedAt: Date.now()
      })
      return {
        ...state,
        items
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

    // TODO; saved index
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
      return updateCurrentItemTitleFontResized(action, state)

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_RESIZED':
      return updateCurrentItemTitleFontResized(action, state)

    default:
      return state
  }
}
