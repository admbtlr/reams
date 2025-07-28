import { Item, ItemInflated, ItemType } from '../store/items/types'
// @ts-ignore
import { store } from '../store'
import { RootState } from '../store/reducers'
import { Platform } from 'react-native'
import { searchItems } from '../storage/sqlite'
import { createSelector } from '@reduxjs/toolkit'

const selectItems = (state: RootState) => {
  return state.itemsMeta.display === ItemType.saved ?
    state.itemsSaved.items :
    state.itemsUnread.items
}

const selectFilter = (state: RootState) => state.config.filter

const selectCategories = (state: RootState) => state.categories.categories

export const selectFilteredItems = createSelector([selectItems, selectFilter, selectCategories], (items, filter, categories) => {
  let filterFeedIds: string[] | undefined, filterItemIds: string[] | undefined
  if (filter?.type === 'category' && filter._id) {
    filterFeedIds = categories.find(c => c._id === filter._id)?.feedIds
    filterItemIds = categories.find(c => c._id === filter._id)?.itemIds
  } else if ((filter?.type === 'feed' || filter?.type === 'newsletter') && filter._id) {
    filterFeedIds = [filter._id]
  }

  return filterFeedIds ?
    items.filter((item: Item) => filterFeedIds?.indexOf(item.feed_id) !== -1) :
    (filterItemIds ?
      items.filter((item: Item) => filterItemIds?.indexOf(item._id) !== -1) :
      items)
})

export const getItems = (state: RootState, type?: ItemType) => {
  if (type === undefined) {
    type = state.itemsMeta.display
  }

  const filter = state.config.filter
  let filterFeedIds: string[] | undefined, filterItemIds: string[] | undefined

  if (filter?.type === 'search' &&
    Platform.OS !== 'web' &&
    filter?.title?.length !== undefined &&
    filter?.title?.length > 0) {
    const dbItems = searchItems(filter.title)
    const dbItemIds = dbItems.map(i => i._id)
    return type === ItemType.unread ?
      state.itemsUnread.items.filter((iu: Item) => dbItemIds.indexOf(iu._id) !== -1) :
      state.itemsSaved.items.filter((is: Item) => dbItemIds.indexOf(is._id) !== -1)
  } else if (filter?.type === 'category' && filter._id) {
    filterFeedIds = state.categories.categories.find(c => c._id === filter._id)?.feedIds
    filterItemIds = state.categories.categories.find(c => c._id === filter._id)?.itemIds
  } else if ((filter?.type === 'feed' || filter?.type === 'newsletter') && filter._id) {
    filterFeedIds = [filter._id]
  }
  type = type || state.itemsMeta.display

  return type === ItemType.unread ?
    (filterFeedIds ?
      state.itemsUnread.items.filter((item: Item) => filterFeedIds?.indexOf(item.feed_id) !== -1) :
      state.itemsUnread.items) :
    (filterItemIds ?
      state.itemsSaved.items.filter((item: Item) => filterItemIds?.indexOf(item._id) !== -1) :
      state.itemsSaved.items)
}

export const getCurrentItem = (state: RootState, type: ItemType) => {
  const currentItemId = getCurrentItemId(state, type)
  if (!currentItemId) return null
  const items = getItems(state, type)
  return items.find(item => item._id === currentItemId) || null
}

export const getCurrentItemId = (state: RootState, type: ItemType | undefined = undefined) => {
  const theType = type || state.itemsMeta.display
  return theType === ItemType.unread ?
    state.itemsUnread.currentItemId :
    state.itemsSaved.currentItemId
}

export const getIndex = (state: RootState, type: ItemType | undefined = undefined) => {
  const theType = type || state.itemsMeta.display
  const currentItemId = getCurrentItemId(state, theType)
  if (!currentItemId) return 0
  const items = getItems(state, theType)
  const index = items.findIndex(item => item._id === currentItemId)
  return index >= 0 ? index : 0
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

// Helper functions for item navigation
export const findItemIndexById = (items: Item[], id: string | null): number => {
  if (!id) return 0
  const index = items.findIndex(item => item._id === id)
  return index >= 0 ? index : 0
}

export const getNextItem = (items: Item[], currentId: string | null): Item | null => {
  if (!currentId || items.length === 0) return items[0] || null
  const currentIndex = findItemIndexById(items, currentId)
  return items[currentIndex + 1] || null
}

export const getPreviousItem = (items: Item[], currentId: string | null): Item | null => {
  if (!currentId || items.length === 0) return items[0] || null
  const currentIndex = findItemIndexById(items, currentId)
  return currentIndex > 0 ? items[currentIndex - 1] : null
}
