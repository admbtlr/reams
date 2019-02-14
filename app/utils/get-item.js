export const getItems = (state, type) => {
  const feedFilter = state.config.feedFilter
  type = type || state.itemsMeta.display
  return type === 'unread' ?
    (feedFilter ?
      state.itemsUnread.items.filter(item => item.feed_id === feedFilter) :
      state.itemsUnread.items) :
    state.itemsSaved.items
}

export const getCurrentItem = (state) => {
  return getItems(state)[getIndex(state)]
}

export const getIndex = (state) => {
  return state.itemsMeta.display === 'unread' ?
    state.itemsUnread.index || 0 :
    state.itemsSaved.savedIndex || 0
}