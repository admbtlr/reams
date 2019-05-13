import { store } from '../redux/store'

export const getItems = (state, type) => {
  const feedFilter = state.config.feedFilter
  type = type || state.itemsMeta.display
  return type === 'unread' ?
    (feedFilter ?
      state.itemsUnread.items.filter(item => item.feed_id === feedFilter) :
      state.itemsUnread.items) :
    state.itemsSaved.items
}

export const getCurrentItem = (state, type) => {
  return getItems(state, type)[getIndex(state, type)]
}

export const getIndex = (state, type) => {
  type = type || state.itemsMeta.display
  return type === 'unread' ?
    state.itemsUnread.index || 0 :
    state.itemsSaved.index || 0
}

export const getItemId = (state, index) => {
  if (!state) state = store.getState()
  const items = getItems(state)
  return items[index]._id
}