import {REHYDRATE} from 'redux-persist'
import {
  itemMarkRead,
  itemSetScrollOffset,
  itemToggleMercury,
  itemDecorationSuccess,
  itemDecorationFailure,
  itemsFlate,
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
  items: [],
  index: 0
}

export const itemsSaved = (state = initialState, action) => {
  let items = []
  let newItems = []
  let savedItems = []
  let savedItem = {}
  let newState = {}
  let currentItem

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

    case 'ITEMS_UPDATE_CURRENT_INDEX':
      if (action.displayMode !== 'saved') return state

      return {
        ...state,
        index: action.index
      }

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
      savedItem.savedAt = action.savedAt
      items.unshift(savedItem)
      return {
        ...state,
        items
      }

    case 'ITEM_SAVE_EXTERNAL_ITEM':
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

    case 'ITEM_UNSAVE_ITEM':
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

    case 'ITEMS_UNSAVE_ITEMS':
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

    case 'SAVED_ITEMS_SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: Date.now()
      }

    case 'ITEMS_BATCH_FETCHED':
      if (action.itemType !== 'saved') return state
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

    case 'ITEMS_FLATE':
      return itemsFlate(action, state)

    case 'ITEM_DECORATION_SUCCESS':
      if (!action.isSaved) return state
      let newState = itemDecorationSuccess(action, state)
      newState.items.sort((a, b) => ((b.savedAt || 0) - (a.savedAt || 0)))
      return newState

    case 'ITEM_DECORATION_FAILURE':
      return action.isSaved ? itemDecorationFailure(action, state) : state

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_SIZE':
      return updateCurrentItemTitleFontSize(action, state)

    case 'UPDATE_CURRENT_ITEM_TITLE_FONT_RESIZED':
      if (action.item.title === 'Loading...') return state
      return updateCurrentItemTitleFontResized(action, state)

    default:
      return state
  }
}
