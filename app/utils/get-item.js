import { store } from '../store'

export const getItems = (state, type) => {
  const filter = state.config.filter
  let filterFeedIds
  if (filter?.type === 'category') {
    filterFeedIds = state.categories.categories.find(c => c._id === filter._id)?.feeds
  } else if (filter?.type === 'feed') {
    filterFeedIds = [filter._id]
  }
  type = type || state.itemsMeta.display

  return type === 'unread' ?
    (filterFeedIds ?
      state.itemsUnread.items.filter(item => filterFeedIds.indexOf(item.feed_id) !== -1) :
      state.itemsUnread.items) :
    state.itemsSaved.items
}

export const getCurrentItem = (state, type) => {
  return getItems(state, type)[getIndex(state, type)]
}

export const getIndex = (state, type) => {
  type = type || state.itemsMeta.display
  const index = type === 'unread' ?
    state.itemsUnread.index :
    state.itemsSaved.index
  return index && index >= 0 ? index : 0
}

export const getItemId = (state, index) => {
  if (!state) state = store.getState()
  if (state.config.isOnboarding) return index
  const items = getItems(state)
  if (!items[index]) {
    console.log(`No item at index: ${index} (${items.length} items)`)
  }
  return items[index]._id
}

export const getItem = (state, id, type = 'unread') => {
  if (!state) state = store.getState()
  let items = type === 'unread' ?
    state.itemsUnread.items :
    state.itemsSaved.items
  let item = items.find(item => item._id === id)
  if (!item) {
    items = type === 'unread' ?
      state.itemsSaved.items : 
      state.itemsUnread.items
  }
  return items.find(item => item._id === id)
}
