import { RootState } from 'store/reducers'
import {
  getCurrentItem as getCurrentItemUtils,
  getItems as getItemsUtils,
  getItem as getItemUtils,
  getIndex as getIndexUtils
} from '../utils/get-item'
import { ItemType } from '../store/items/types'

export function getItems(state: RootState, type: string) {
  return getItemsUtils(state, type as ItemType)
}

export function getUnreadItems(state: RootState) {
  return getItemsUtils(state, ItemType.unread)
}

export function getSavedItems(state: RootState) {
  return getItemsUtils(state, ItemType.saved)
}

export function getItem(state: RootState, id: string, type: string) {
  return getItemUtils(state, id, type)
}

export function getDisplay(state: RootState) {
  return state.itemsMeta.display
}

export function getCurrentItem(state: RootState, type: string) {
  return getCurrentItemUtils(state, type as ItemType)
}

export function getIndex(state: RootState, type: ItemType) {
  return getIndexUtils(state, type)
}

export function getFeeds(state: RootState) {
  return state.feeds.feeds
}

export function getFeedsLocal(state: RootState) {
  return state.feedsLocal.feeds
}

export function getNewsletters(state: RootState) {
  return state.newsletters.newsletters
}

export function getLastUpdated(state: RootState, type: ItemType) {
  if (type === 'saved') {
    return state.itemsSaved.lastUpdated || 0
  } else {
    return state.itemsUnread.lastUpdated || 0
  }
}

export function getRemoteActions(state: RootState) {
  return state.remoteActionQueue.actions
}

export function getConfig(state: RootState) {
  return state.config
}

export function getFilter(state: RootState) {
  return state.config.filter
}

export function getCategories(state: RootState) {
  return state.categories.categories
}

export function getUser<UserState>(state: RootState) {
  return state.user
}

export function isOnline(state: RootState) {
  return state.config.isOnline
}

export function getAnnotations(state: RootState) {
  return state.annotations.annotations
}
