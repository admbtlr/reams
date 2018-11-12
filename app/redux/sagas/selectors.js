export function getItems (state, type) {
  type = type || state.items.display === 'unread' ? 'items' : state.items.display
  return state.items[type]
}

export function getDisplay (state) {
  return state.items.display
}

export function getCurrentItem (state) {
  return state.items.items[state.items.index]
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
