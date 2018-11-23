import {combineReducers} from 'redux'
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

// export const initialState = {
//   items: []
// }

export const initialState = {
  items: []
}

export function itemsHasErrored (state = false, action) {
  switch (action.type) {
    case 'ITEMS_HAS_ERRORED':
      return action.hasErrored
    default:
      return state
  }
}

// export const createItemsUnreadReducer = key => combineReducers({
//   items: itemsUnreadReducer(key)
// })

export const itemsUnread = (state = initialState, action) => {
  let items = []
  let newItems = []
  let saved = []
  let savedItem = {}
  let newState = {}

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

    case 'ITEMS_FETCH_DATA_SUCCESS':
      items = action.items

      return {
        ...state,
        items
      }

    case 'ITEMS_CLEAR_READ':
      return {
        items: state.items.filter(item => !item.readAt)
      }

    case 'ITEM_MARK_READ':
      return itemMarkRead(action, state)

    case 'ITEM_SET_SCROLL_OFFSET':
      return itemSetScrollOffset(action, state)

    case 'FEED_MARK_READ':
      const feedId = action.id
      const currentItem = state.items[state.index]
      items = [ ...state.items ].filter((item) => {
        return item.feed_id !== feedId &&
          item._id !== currentItem._id
      })
      return {
        ...state,
        items
      }

    case 'ITEM_TOGGLE_MERCURY':
      return itemToggleMercury(action, state)

    case 'ITEM_DECORATION_SUCCESS':
      return itemDecorationSuccess(action, state)

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_SIZE':
      return updateCurrentItemTitleFontSize(action, state)

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_RESIZED':
      return updateCurrentItemTitleFontResized(action, state)

    default:
      return state
  }
}
