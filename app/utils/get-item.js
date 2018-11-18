export const getItems = (state) => {
  const feedFilter = state.config.feedFilter
  return state.itemsMeta.display === 'unread' ?
    (feedFilter ?
      state.itemsUnread.items.filter(item => item.feed_id === feedFilter) :
      state.itemsUnread.items) :
    state.itemsSaved.items
}

export const getCurrentItem = (state) => {
  const feedFilter = state.config.feedFilter
  const items = state.itemsMeta.display === 'unread' ?
    (feedFilter ?
      state.itemsUnread.items.filter(item => item.feed_id === feedFilter) :
      state.itemsUnread.items) :
    state.itemsSaved.items
  const index = state.itemsMeta.display === 'unread' ?
    state.itemsMeta.index :
    state.itemsMeta.index
  return items[index]
}

