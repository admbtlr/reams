import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Item, ItemType } from '@/store/items/types'
import { getItems } from '@/utils/get-item'
import { Feed } from '@/store/feeds/types'
import { RootState } from '@/store/reducers'
import { useUpdateFromRedux, useClearBuffer } from './bufferedItemsStore'

// Singleton pattern - ensure initialization happens only once globally
let isManagerInitialized = false

/**
 * Hook that manages the buffered items store by watching Redux state changes
 * and updating the buffer accordingly.
 */
export const useBufferedItemsManager = () => {
  const updateFromRedux = useUpdateFromRedux()
  const clearBuffer = useClearBuffer()

  // Redux selectors with equality checks to prevent unnecessary updates
  const items = useSelector(getItems, (oldItems: Item[], newItems: Item[]) => (
    JSON.stringify(oldItems.map(i => i._id)) === JSON.stringify(newItems.map(i => i._id))
  ))

  const feeds = useSelector((state: RootState) => state.feeds.feeds, (oldFeeds: Feed[], newFeeds: Feed[]) => (
    JSON.stringify(oldFeeds.map(f => f._id)) === JSON.stringify(newFeeds.map(f => f._id))
  ))

  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)
  const dispatch = useDispatch()

  // Single effect - initialization and updates
  useEffect(() => {
    if (!isManagerInitialized) {
      isManagerInitialized = true
    }

    updateFromRedux(items, feeds, displayMode, dispatch)
  }, [items, feeds, displayMode, dispatch, updateFromRedux])

  // Cleanup
  useEffect(() => {
    return () => {
      isManagerInitialized = false
      clearBuffer()
    }
  }, [clearBuffer])

  return {
    items,
    feeds,
    displayMode
  }
}
