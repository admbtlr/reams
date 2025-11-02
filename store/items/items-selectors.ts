import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../reducers'
import { selectItemsUnread } from './items-unread'
import { selectItemsSaved } from './items-saved'
import { Item } from './types'

export const selectItemById = createSelector(
  [
    selectItemsUnread,
    selectItemsSaved,
    (_: RootState, itemId: string) => itemId
  ],
  (unreadItems, savedItems, itemId) => {
    // First check unread items
    const unreadItem = unreadItems.find((item) => item._id === itemId)
    if (unreadItem) return unreadItem

    // Then check saved items
    const savedItem = savedItems.find((item) => item._id === itemId)
    return savedItem || null
  }
)

export const selectItemShowMercury = createSelector(
  [(state: RootState, itemId: string) => selectItemById(state, itemId)],
  (item: Item | null) => item?.showMercuryContent || false
)
