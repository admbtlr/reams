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

export const initialState = []

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
    case REHYDRATE:
      // workaround to make up for slideable bug
      let incoming = action.payload ? action.payload.items : null
      if (incoming) {
        console.log('REHYDRATE!' + action.payload.items)
        return {
          ...state,
          ...incoming,
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
        .map(nullValuesToEmptyStrings)
        .map(fixRelativePaths)
        .map(addStylesIfNecessary)
        .map(setShowCoverImage)

      // let index = 0
      // TODO what about the index?
      // if (currentItem) {
      //   items.forEach((item, i) => {
      //     if (item._id === currentItem._id) {
      //       index = i
      //     }
      //   })
      // }
      return {
        ...state,
        items,
        // index
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
      // let newIndex = 0
      // items.forEach((item, index) => {
      //   if (item._id === currentItem._id) {
      //     newIndex = index
      //   }
      // })
      // if (newIndex == 0) {
      //   // find the first unread item and start there
      //   let i = 0
      //   for (let item of items) {
      //     if (!item.readAt) {
      //       newIndex = i
      //       break
      //     }
      //     i++
      //   }
      // }
      return {
        ...state,
        items,
        // index: newIndex
      }

    case 'ITEM_SAVE_ITEM':
      items = [ ...state.items ]
      let savedItem = items.find((item) => item._id === action.item._id)
      if (savedItem) savedItem.isSaved = true
      return {
        ...state,
        items
      }

    case 'ITEM_TOGGLE_MERCURY':
      return itemToggleMercury(action, state)

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
      return updateCurrentItemTitleFontSize(action, state)

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_RESIZED':
      return updateCurrentItemTitleFontResized(action, state)

    default:
      return state
  }
}
