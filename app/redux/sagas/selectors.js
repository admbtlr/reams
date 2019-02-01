import { getItems as getItemsUtils } from '../../utils/get-item'

export function getItems (state, type) {
  return getItemsUtils(state, type)
}

export function getUnreadItems (state) {
  return getItemsUtils(state, 'unread')
}

export function getDisplay (state) {
  return state.itemsMeta.display
}

export function getCurrentItem (state) {
  return state.itemsUnread.items[state.itemsMeta.index]
}

export function getIndex (state) {
  return state.itemsMeta.index
}

export function getFeeds (state) {
  return state.feeds.feeds
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

export function getUid (state) {
  return state.user.uid
}
