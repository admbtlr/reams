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
  rizzleSort,
  setShowCoverImage
} from '../../utils/item-utils.js'

// export const initialState = {
//   items: []
// }

export const initialState = {
  items: [],
  index: 0
}

export function itemsHasErrored (state = false, action) {
  switch (action.type) {
    case 'ITEMS_HAS_ERRORED':
      return action.hasErrored
    default:
      return state
  }
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


export const itemsUnread = (state = initialState, action) => {
  let items = []
  let newItems = []
  let saved = []
  let savedItem = {}
  let newState = {}
  let currentItem

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

    case 'ITEMS_UPDATE_CURRENT_INDEX':
      if (action.displayMode === 'unread') {
        newState.index = action.index
      }
      return {
        ...state,
        ...newState
      }

    case 'ITEMS_BATCH_FETCHED':
      const feeds = action.feeds
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

      // remove read items
      items = items.filter(i => !i.readAt)

      // order by date
      // items.sort((a, b) => a.created_at - b.created_at)
      // const index = items.indexOf(currentItem)

      items = rizzleSort(items, feeds)
      // check for current item
      currentItem = state.items[state.index]
      if (currentItem && !items.find(item => item && item._id === currentItem._id)) {
        items.unshift(currentItem)
      }

      return {
        ...state,
        items,
        index: 0
      }

    case 'ITEMS_FETCH_DATA_SUCCESS':
      // merge with existing items
      return {
        ...state
      }

    case 'ITEMS_FLATE':
      const flatedItems = action.itemsToInflate
        .concat(action.itemsToDeflate)
      items = [...state.items]
      flatedItems.forEach(fi => {
        // some of the items might have been deleted in Firebase
        // which means that they will come back as undefined
        // I think we can just ignore them
        // TODO check whether this is really the case!
        if (fi) {
          const index = items.findIndex(item => item._id === fi._id)
          items[index] = fi
        }
      })
      return {
        ...state,
        items
      }

    case 'ITEMS_CLEAR_READ_SUCCESS':
      return {
        items: state.items.filter(item => !item.readAt)
      }

    case 'ITEM_ADD_READING_TIME':
      newState = { ...state }
      let item = newState.items.find(item => item._id === action.item._id)
      if (!item) return newState

      if (item.readingTime) {
        item.readingTime += action.readingTime
      } else {
        item.readingTime = action.readingTime
      }
      return newState

    case 'ITEM_MARK_READ':
      return itemMarkRead(action, state)

    case 'ITEM_SET_SCROLL_OFFSET':
      return itemSetScrollOffset(action, state)

    case 'FEED_MARK_READ':
      const feedId = action.id
      const olderThan = action.olderThan || Math.floor(Date.now() / 1000)
      currentItem = state.items[state.index]
      // if no feedId specified, then we mean ALL items
      const isInFeed = (item) => feedId ? item.feed_id === feedId : true
      items = [ ...state.items ].filter((item) => {
        return isInFeed(item) ?
          (item.created_at > olderThan) :
          true
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
