import { RootState } from 'store/reducers'
import {
  getCurrentItem as getCurrentItemUtils,
  getItems as getItemsUtils,
  getItem as getItemUtils,
  getIndex as getIndexUtils
} from '../utils/get-item'
import { ItemType } from '../store/items/types'

export function getItems (state: RootState, type: string) {
  return getItemsUtils(state, type)
}

export function getUnreadItems (state: RootState) {
  return getItemsUtils(state, 'unread')
}

export function getSavedItems (state: RootState) {
  return getItemsUtils(state, 'saved')
}

export function getItem (state: RootState, id: string, type: string) {
  return getItemUtils(state, id, type)
}

export function getDisplay (state: RootState) {
  return state.itemsMeta.display
}

export function getCurrentItem (state: RootState, type: string) {
  return getCurrentItemUtils(state, type)
}

// gets the current item, plus eight on either side
export function getActiveItems (state: RootState) {
  const displayMode = state.itemsMeta.display
  const items = getItemsUtils(state, displayMode)
  const index = getIndexUtils(state, displayMode)
  const buffer = 8
  const preBuffer = index < buffer ? index : buffer
  const postBuffer = index + buffer
  let activeItems = []
  // let activeItems = [ items[index] ]
  // for (var i = -buffer; i <= buffer; i++) {
  //   if (index + i >= 0 && index + i < items.length) {
  //     const activeItem = items[index + i]
  //     if (!activeItems.find(ai => ai._id === activeItem._id)) {
  //       activeItems.push(activeItem)
  //     }
  //   }
  // }
  for (let i = index - preBuffer; i <= index + postBuffer; i++) {
    if (items[i] === undefined) continue
    activeItems.push(items[i])
  }
  return activeItems
}

export function getIndex (state: RootState, type: ItemType) {
  return getIndexUtils(state, type)
}

export function getFeeds (state: RootState) {
  return state.feeds.feeds
}

export function getFeedsLocal (state: RootState) {
  return state.feedsLocal.feeds
}

export function getNewsletters (state: RootState) {
  return state.newsletters.newsletters
}

export function getLastUpdated (state: RootState, type: ItemType) {
  if (type === 'unread') {
    return state.itemsUnread.lastUpdated || 0
  } else {
    return state.itemsSaved.lastUpdated || 0
  }
}

export function getRemoteActions (state: RootState) {
  return state.remoteActionQueue.actions
}

export function getConfig (state: RootState) {
  return state.config
}

export function getFilter (state: RootState) {
  return state.config.filter
}

export function getCategories (state: RootState) {
  return state.categories.categories
}

export function getUser<UserState> (state: RootState) {
  return state.user
}

export function isOnline (state: RootState) {
  return state.config.isOnline
}

export function getAnnotations (state: RootState) {
  return state.annotations.annotations
}