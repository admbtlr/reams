import { RootState } from 'store/reducers'
import {
  getCurrentItem as getCurrentItemUtils,
  getItems as getItemsUtils,
  getItem as getItemUtils,
  getIndex as getIndexUtils
} from '../utils/get-item'

export function getItems (state, type) {
  return getItemsUtils(state, type)
}

export function getUnreadItems (state) {
  return getItemsUtils(state, 'unread')
}

export function getSavedItems (state) {
  return getItemsUtils(state, 'saved')
}

export function getItem (state, id, type) {
  return getItemUtils(state, id, type)
}

export function getDisplay (state) {
  return state.itemsMeta.display
}

export function getCurrentItem (state, type) {
  return getCurrentItemUtils(state, type)
}

// gets the current item, plus eight on either side
export function getActiveItems (state) {
  const displayMode = state.itemsMeta.display
  const items = getItemsUtils(state, displayMode)
  const index = getIndexUtils(state, displayMode)
  const buffer = items.length < 8 ? items.length : 8
  let activeItems = [ items[index] ]
  for (var i = -buffer; i <= buffer; i++) {
    if (index + i >= 0 && index + i < items.length) {
      const activeItem = items[index + i]
      if (!activeItems.find(ai => ai._id === activeItem._id)) {
        activeItems.push(activeItem)
      }
    }
  }
  return activeItems
}

export function getIndex (state, type) {
  return getIndexUtils(state, type)
}

export function getFeeds (state) {
  return state.feeds.feeds
}

export function getFeedsLocal (state) {
  return state.feedsLocal.feeds
}

export function getLastUpdated (state, type) {
  if (type === 'unread') {
    return state.itemsUnread.lastUpdated || 0
  } else {
    return state.itemsSaved.lastUpdated || 0
  }
}

export function getRemoteActions (state) {
  return state.remoteActionQueue.actions
}

export function getConfig (state) {
  return state.config
}

export function getFilter (state) {
  return state.config.filter
}

export function getCategories (state) {
  return state.categories.categories
}

export function getUser<UserState> (state: RootState) {
  return state.user
}

export function isOnline (state) {
  return state.config.isOnline
}

export function getAnnotations (state) {
  return state.annotations.annotations
}