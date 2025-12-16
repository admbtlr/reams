import { SET_ITEM_SORT, ConfigActionTypes } from '../config/types'
import { UNSET_BACKEND, UserActionTypes } from '../user/types'
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
  IMAGE_ANALYSIS_DONE,
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
  UPDATE_CURRENT_ITEM,
  Item,
  ItemActionTypes,
  ItemsState,
  ItemType,
  UPDATE_ITEM,
  MARK_ITEMS_READ_SKIP_BACKEND,
  ITEM_BODY_CLEANED,
  RESET_DECORATION_FALIURES,
  SET_KEEP_UNREAD
} from './types'
import {
  itemMarkRead,
  itemsMarkRead,
  itemSetScrollOffset,
  itemToggleMercury,
  itemDecorationSuccess,
  imageAnalysisSuccess,
  itemDecorationFailure,
  updateCurrentItemTitleFontSize,
  itemBodyCleaned,
  resetDecorationFailures
  // updateCurrentItemTitleFontResized
} from './items-common'
import rizzleSort from '../../utils/rizzle-sort'
import { RootState } from '../reducers'

export const selectItemsUnread = (state: RootState) => state.itemsUnread.items

export const initialState: ItemsState = {
  items: [],
  currentItemId: null,
  lastUpdated: 0
}

export function itemsUnread(
  state = initialState,
  action: any //ItemActionTypes | ConfigActionTypes | FeedActionTypes | UserActionTypes
): ItemsState {
  let items: Item[] = []
  let newItems: Item[] = []
  let index: number
  let newState: {
    currentItemId?: string | null
    lastUpdated?: number
    items?: Item[]
  } = {}
  let currentItem: Item | undefined
  let newCurrentItemId: string | null | undefined

  switch (action.type) {
    case UPDATE_CURRENT_ITEM:
      if (action.displayMode !== ItemType.unread) return state
      return {
        ...state,
        currentItemId: action.itemId
      }

    case UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map((item) => {
          if (item._id === action.item._id) {
            return action.item
          }
          return item
        })
      }

    case ITEMS_BATCH_FETCHED:
      if (action.itemType !== ItemType.unread) return state
      items = [...state.items]
      currentItem = state.currentItemId
        ? items.find((item) => item._id === state.currentItemId)
        : undefined
      newItems = action.items
      newItems.forEach((newItem) => {
        let indexToUpdate = items.findIndex(
          (item) =>
            item.id === newItem.id ||
            (item._id === newItem._id && item.title === newItem.title)
        )
        if (indexToUpdate !== -1) {
          items[indexToUpdate] = newItem
        } else {
          items.push(newItem)
        }
      })

      items = rizzleSort(items, action.feeds, action.sortDirection)
      // carouselled = maintainCarouselItems(state, items)
      if (
        currentItem !== undefined &&
        items.map((i) => i._id).indexOf(currentItem._id)
      ) {
        items = items.filter((i) => i._id !== currentItem?._id)
        items.unshift(currentItem)
      }
      newCurrentItemId =
        items.length > 0
          ? items.find((item) => item._id === state.currentItemId)
            ? state.currentItemId
            : items[0]._id
          : null

      return {
        ...state,
        items,
        currentItemId: newCurrentItemId
      }

    case PRUNE_UNREAD:
      items = [...state.items]
      if (items.length < action.maxItems) {
        return state
      }

      currentItem = state.currentItemId
        ? items.find((item) => item._id === state.currentItemId)
        : undefined
      items = items.filter(
        (item) =>
          action.prunedItems.find((pi: Item) => pi._id === item._id) ===
          undefined
      )
      if (currentItem && items.indexOf(currentItem) === -1) {
        items.unshift(currentItem)
      }
      newCurrentItemId =
        items.length > 0
          ? items.find((item) => item._id === state.currentItemId)
            ? state.currentItemId
            : items[0]._id
          : null
      return {
        ...state,
        items,
        currentItemId: newCurrentItemId
      }

    case MUTE_FEED_TOGGLE:
      items = [...state.items]
      // if there are any items from this feed, we must be toggling mute ON
      return {
        ...state,
        items: items.filter((item) => item.feed_id !== action.feed._id)
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
        items: state.items.filter((i) => i.feed_id !== action.feed._id)
      }

    case REMOVE_ITEMS:
      // const itemIds = action.items.map(f => f._id)
      currentItem = state.currentItemId
        ? state.items.find((item) => item._id === state.currentItemId)
        : undefined
      items = state.items.filter(
        (i) => action.items.find((ai: Item) => ai._id === i._id) === undefined
      )
      newCurrentItemId =
        items.length > 0
          ? currentItem && items.find((i) => i._id === currentItem!._id)
            ? currentItem._id
            : items[0]._id
          : null
      return {
        ...state,
        items,
        currentItemId: newCurrentItemId
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
        items: state.items.map((item) =>
          item._id === action.item._id
            ? {
                ...item,
                isSaved: true,
                savedAt: action.savedAt
              }
            : item
        )
      }

    case UNSAVE_ITEM:
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.item._id
            ? {
                ...item,
                isSaved: false,
                savedAt: undefined
              }
            : item
        )
      }

    case SET_KEEP_UNREAD:
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.item._id
            ? {
                ...item,
                isKeepUnread: action.keepUnread
              }
            : item
        )
      }

    case TOGGLE_MERCURY_VIEW:
      return itemToggleMercury(action, state)

    case ITEM_DECORATION_SUCCESS:
      return action.isSaved
        ? state
        : itemDecorationSuccess(action, state, action.displayMode === 'unread')

    case IMAGE_ANALYSIS_DONE:
      return action.isSaved ? state : imageAnalysisSuccess(action, state)

    case ITEM_DECORATION_FAILURE:
      return action.isSaved ? state : itemDecorationFailure(action, state)

    case SET_TITLE_FONT_SIZE:
      return updateCurrentItemTitleFontSize(action, state)

    case ITEM_BODY_CLEANED:
      return itemBodyCleaned(action, state)

    case RESET_DECORATION_FALIURES:
      return resetDecorationFailures(action, state)

    default:
      return state
  }
}
