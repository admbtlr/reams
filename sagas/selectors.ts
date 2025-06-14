import { RootState } from 'store/reducers'
import {
  getCurrentItem as getCurrentItemUtils,
  getItems as getItemsUtils,
  getItem as getItemUtils,
  getIndex as getIndexUtils
} from '../utils/get-item'
import { ItemType } from '../store/items/types'
import { createSelector } from '@reduxjs/toolkit'

export function getItems(state: RootState, type: string) {
  return getItemsUtils(state, type as ItemType)
}

export function getUnreadItems(state: RootState) {
  return getItemsUtils(state, ItemType.unread)
}

export function getSavedItems(state: RootState) {
  return getItemsUtils(state, ItemType.saved)
}

export function getItem(state: RootState, id: string, type: string) {
  return getItemUtils(state, id, type)
}

export function getDisplay(state: RootState) {
  return state.itemsMeta.display
}

export function getCurrentItem(state: RootState, type: string) {
  return getCurrentItemUtils(state, type as ItemType)
}

// gets the current item, plus eight on either side
export function getActiveItems(state: RootState) {
  const displayMode = state.itemsMeta.display
  const items = getItemsUtils(state, displayMode)
  const index = getIndexUtils(state, displayMode)
  const buffer = 8
  const preBuffer = index < buffer ? index : buffer
  const postBuffer = index + buffer
  let activeItems = []
  // let activeItems = [ items[index] ]
  // for (var i = -buffer; i <= buffer; i++) {
  //   if (index + i >= 0 && index + i < items.length) {
  //     const activeItem = items[index + i]
  //     if (!activeItems.find(ai => ai._id === activeItem._id)) {
  //       activeItems.push(activeItem)
  //     }
  //   }
  // }
  for (let i = index - preBuffer; i <= index + postBuffer; i++) {
    if (items[i] === undefined) continue
    activeItems.push(items[i])
  }
  return activeItems
}

export function getIndex(state: RootState, type: ItemType) {
  return getIndexUtils(state, type)
}

export function getFeeds(state: RootState) {
  return state.feeds.feeds
}

export function getFeedsLocal(state: RootState) {
  return state.feedsLocal.feeds
}

export function getNewsletters(state: RootState) {
  return state.newsletters.newsletters
}

export function getLastUpdated(state: RootState, type: ItemType) {
  if (type === 'saved') {
    return state.itemsSaved.lastUpdated || 0
  } else {
    return state.itemsUnread.lastUpdated || 0
  }
}

export function getRemoteActions(state: RootState) {
  return state.remoteActionQueue.actions
}

export function getConfig(state: RootState) {
  return state.config
}

export function getFilter(state: RootState) {
  return state.config.filter
}

export function getCategories(state: RootState) {
  return state.categories.categories
}

export function getUser<UserState>(state: RootState) {
  return state.user
}

export function isOnline(state: RootState) {
  return state.config.isOnline
}

export function getAnnotations(state: RootState) {
  return state.annotations.annotations
}

export const selectFilterTitle = createSelector(
  [
    (state: RootState) => state.config.filter,
    (state: RootState) => state.feeds.feeds,
    (state: RootState) => state.categories.categories,
    (state: RootState) => state.newsletters.newsletters
  ],
  (filter, feeds, categories, newsletters) => {
    if (!filter) return null

    // If filter already has a title, use it
    if (filter.title) return filter.title

    // Otherwise, look up the title based on type and _id
    switch (filter.type) {
      case 'feed':
        const feed = feeds.find(f => f._id === filter._id)
        return feed?.title || null

      case 'category':
        const category = categories.find(c => c._id === filter._id)
        return category?.name || null

      case 'newsletter':
        const newsletter = newsletters.find(n => n._id === filter._id)
        return newsletter?.title || null

      case 'search':
        return filter.title || 'Search Results'

      default:
        return null
    }
  }
)
