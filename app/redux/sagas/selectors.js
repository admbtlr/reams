export function getItems (state, type) {
  return type  === 'unread'
    || state.itemsMeta.display === 'unread' ?
    state.itemsUnread.items :
    state.itemsSaved.items
}

export function getDisplay (state) {
  return state.itemsMeta.display
}

export function getCurrentItem (state) {
  return state.itemsUnread[state.itemsMeta.index]
}

export function getFeeds (state) {
  console.log(state)
  console.log(state.feeds.feeds)
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
