import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Item, ItemType } from '@/store/items/types'
import { getItems } from '@/utils/get-item'
import { Feed } from '@/store/feeds/types'
import { RootState } from '@/store/reducers'
import { store } from '@/store'
import { useUpdateFromRedux, useClearBuffer } from './bufferedItemsStore'

// Singleton pattern - ensure initialization happens only once globally
let isManagerInitialized = false
let isSortWatcherInitialized = false

/**
 * Hook that manages the buffered items store by watching Redux state changes
 * and updating the buffer accordingly.
 */
export const useBufferedItemsManager = () => {
  const updateFromRedux = useUpdateFromRedux()
  const clearBuffer = useClearBuffer()

  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const dispatch = useDispatch()

  // Single effect - initialization only (or when display mode changes)
  useEffect(() => {
    if (!isManagerInitialized) {
      isManagerInitialized = true

      // Get items/feeds only for initialization
      const state = store.getState() as RootState
      const items = getItems(state)
      const feeds = state.feeds.feeds

      updateFromRedux(items, feeds, displayMode, dispatch)
    }
  }, [displayMode, dispatch, updateFromRedux])

  // Watch for re-sorts in Redux (e.g. SORT_ITEMS dispatched from the settings
  // screen). The carousel renders from this buffer, not directly from Redux,
  // so a re-sort must rebuild the buffer to have any visible effect.
  useEffect(() => {
    if (!store || isSortWatcherInitialized) return
    isSortWatcherInitialized = true

    const getSliceItems = (state: RootState) =>
      state[displayMode === ItemType.unread ? 'itemsUnread' : 'itemsSaved'].items || []

    const initialItems = getSliceItems(store.getState() as RootState)
    let previousOrderKey = initialItems.map(i => i._id).join('|')
    let previousIdSet = initialItems.map(i => i._id).sort().join('|')

    const unsubscribe = store.subscribe(() => {
      const state = store.getState() as RootState
      const items = getSliceItems(state)
      const orderKey = items.map(i => i._id).join('|')
      const idSet = items.map(i => i._id).sort().join('|')

      // same items in a different order => the list was re-sorted
      if (idSet === previousIdSet && orderKey !== previousOrderKey) {
        console.log('[BufferedItems] Redux items were re-sorted, rebuilding buffer')
        clearBuffer()
        updateFromRedux(getItems(state), state.feeds.feeds, displayMode, dispatch)
      }

      previousOrderKey = orderKey
      previousIdSet = idSet
    })

    return () => {
      isSortWatcherInitialized = false
      unsubscribe()
    }
  }, [displayMode, dispatch, updateFromRedux, clearBuffer])

  // Cleanup
  useEffect(() => {
    return () => {
      isManagerInitialized = false
      clearBuffer()
    }
  }, [clearBuffer])

  return {
    displayMode
  }
}
