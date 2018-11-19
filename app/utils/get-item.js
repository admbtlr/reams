export const getItems = (state) => {
  const feedFilter = state.config.feedFilter
  return state.itemsMeta.display === 'unread' ?
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
    state.itemsMeta.index || 0 :
    state.itemsMeta.savedIndex || 0
}