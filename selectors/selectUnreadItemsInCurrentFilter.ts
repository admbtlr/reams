import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store/reducers'
import { ItemType } from '../store/items/types'
import { Platform } from 'react-native'
import { searchItems } from '../storage/sqlite'

export const selectUnreadItemsInCurrentFilter = createSelector(
  [
    (state: RootState) => state.config.filter,
    (state: RootState) => state.itemsMeta.display,
    (state: RootState) => state.itemsUnread.items,
    (state: RootState) => state.itemsSaved.items,
    (state: RootState) => state.categories.categories
  ],
  (filter, displayMode, unreadItems, savedItems, categories) => {
    // If no filter is set, return the count of items in the current display mode
    if (!filter) {
      return displayMode === ItemType.unread ? unreadItems.length : savedItems.length
    }

    // Get the items for the current display mode
    const itemsToFilter = displayMode === ItemType.unread ? unreadItems : savedItems

    // Apply filtering based on filter type
    let filteredItems = itemsToFilter

    if (filter.type === 'search' &&
      Platform.OS !== 'web' &&
      filter.title &&
      filter.title.length > 0) {
      // For search filters, use SQLite search
      const dbItems = searchItems(filter.title)
      const dbItemIds = dbItems.map(i => i._id)
      filteredItems = itemsToFilter.filter(item =>
        dbItemIds.indexOf(item._id) !== -1
      )
    } else if (filter.type === 'category' && filter._id) {
      // For category filters, filter by feed IDs or item IDs
      const category = categories.find(c => c._id === filter._id)
      if (category) {
        if (displayMode === ItemType.unread && category.feedIds) {
          // For unread items, filter by feed IDs
          filteredItems = itemsToFilter.filter(item =>
            category.feedIds.indexOf(item.feed_id) !== -1
          )
        } else if (displayMode === ItemType.saved && category.itemIds) {
          // For saved items, filter by item IDs
          filteredItems = itemsToFilter.filter(item =>
            category.itemIds.indexOf(item._id) !== -1
          )
        }
      }
    } else if ((filter.type === 'feed' || filter.type === 'newsletter') && filter._id) {
      // For feed/newsletter filters, filter by feed ID
      filteredItems = itemsToFilter.filter(item =>
        item.feed_id === filter._id
      )
    }

    return filteredItems.length
  }
)
