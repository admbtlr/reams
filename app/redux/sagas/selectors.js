import {getUnreadItems, getCurrentUnreadItem} from '../selectors/items'

export function getItems (state, type) {
  return type || state.itemsMeta.display === 'unread' ?
    getUnreadItems(state) :
    state.itemsSaved.items
}

export function getDisplay (state) {
  return state.itemsMeta.display
}

export function getCurrentItem (state) {
  return getCurrentUnreadItem(state)
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
