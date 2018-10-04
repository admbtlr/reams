export function getItems (state, type) {
  return type || state.itemsMeta.display === 'unread' ?
    state.itemsUnread :
    state.itemsSaved
}

export function getDisplay (state) {
  return state.itemsMeta.display
}

export function getCurrentItem (state) {
  return state.itemsUnread[state.itemsMeta.index]
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
