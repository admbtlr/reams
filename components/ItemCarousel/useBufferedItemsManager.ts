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
