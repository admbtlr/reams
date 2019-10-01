import {
  getCurrentItem as getCurrentItemUtils,
  getItems as getItemsUtils,
  getItem as getItemUtils,
  getIndex as getIndexUtils
} from '../../utils/get-item'

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

export function isFirstTime (state) {
  return state.config.isFirstTime
}

export function getRemoteActions (state) {
  return state.remoteActionQueue.actions
}

export function getConfig (state) {
  return state.config
}

export function getUser (state) {
  return state.user
}

export function getUid (state) {
  return state.user.uid
}

export function isOnline (state) {
  return state.config.isOnline
}