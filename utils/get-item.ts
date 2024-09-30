import { Item, ItemInflated, ItemType } from '../store/items/types'
// @ts-ignore
import { store } from '../store'
import { RootState } from '../store/reducers'
import { Platform } from 'react-native'
import { searchItems } from '../storage/sqlite'

// this returns a promise if we're searching, otherwise Item[]
// which is probably weird
export const getItems = (state: RootState, type?: ItemType) => {
  if (type === undefined) {
    type = state.itemsMeta.display
  }

  const filter = state.config.filter
  let filterFeedIds, filterItemIds

  if (filter?.type === 'search' && 
    Platform.OS !== 'web' &&
    filter?.title?.length !== undefined && 
    filter?.title?.length > 0) {
    const dbItems =  searchItems(filter.title)
    const dbItemIds = dbItems.map(i => i._id)
    return type === ItemType.unread ?
      state.itemsUnread.items.filter((iu: Item) => dbItemIds.indexOf(iu._id) !== -1) :
      state.itemsSaved.items.filter((is: Item) => dbItemIds.indexOf(is._id) !== -1)    
  } 

  if (filter?.type === 'category') {
    filterFeedIds = state.categories.categories.find(c => c._id === filter._id)?.feedIds
    filterItemIds = state.categories.categories.find(c => c._id === filter._id)?.itemIds
  } else if (filter?.type === 'feed' || filter?.type === 'newsletter') {
    filterFeedIds = [filter._id]
  }
  type = type || state.itemsMeta.display

  return type === ItemType.unread ?
    (filterFeedIds ?
      state.itemsUnread.items.filter((item: Item) => filterFeedIds.indexOf(item.feed_id) !== -1) :
      state.itemsUnread.items) :
    (filterItemIds ?
      state.itemsSaved.items.filter((item: Item) => filterItemIds.indexOf(item._id) !== -1) :
      state.itemsSaved.items)
}

export const getCurrentItem = (state: RootState, type: ItemType) => {
  return getItems(state, type)[getIndex(state, type)]
}

export const getIndex = (state: RootState, type: ItemType) => {
  type = type || state.itemsMeta.display
  const index = type === ItemType.unread ?
    state.itemsUnread.index :
    state.itemsSaved.index
  return index && index >= 0 ? index : 0
}

export const getItem = (state: RootState, id: string, type = 'unread') => {
  // @ts-ignore
  if (!state) state = store.getState()
  let items = type === ItemType.unread ?
    state.itemsUnread.items :
    state.itemsSaved.items
  let item = items.find(item => item._id === id)
  if (!item) {
    items = type === ItemType.unread ?
      state.itemsSaved.items : 
      state.itemsUnread.items
  }
  return items.find(item => item._id === id)
}

export const getScrollRatio = (state: RootState, item: Item) => {
  const stateItem = state.itemsUnread.items.find(i => i._id === item._id) ||
    state.itemsSaved.items.find(i => i._id === item._id)
  return stateItem?.scrollRatio
}