import { getItems } from '@/utils/get-item'
import { createSelector } from '@reduxjs/toolkit'

// Memoize the filtered items
export const selectFilteredItems = createSelector(
  [
    (state: RootState) => state.config.filter,
    (state: RootState) => state.itemsMeta.display,
    (state: RootState) => state.itemsUnread.items,
    (state: RootState) => state.itemsSaved.items,
    (state: RootState) => state.categories.categories
  ],
  (filter, displayMode, unreadItems, savedItems, categories) => {
    // Move expensive filtering logic here with proper memoization
    return getItems({ config: { filter }, itemsMeta: { display: displayMode }, itemsUnread: { items: unreadItems }, itemsSaved: { items: savedItems }, categories: { categories } }, displayMode)
  }
)
