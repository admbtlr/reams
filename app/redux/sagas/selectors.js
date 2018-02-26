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
