import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Item, ItemInflated, ItemType, UPDATE_CURRENT_ITEM } from '@/store/items/types'
import { Feed } from '@/store/feeds/types'
import { BUFFER_LENGTH } from './constants'
import { getItemsSync as getItemsSyncSqlite } from '@/storage/sqlite'
import { useSelector } from 'react-redux'
import { store } from '@/store'

interface BufferedItemsStore {
  // State
  bufferedItems: ItemInflated[]
  bufferStartIndex: number
  bufferIndex: number
  previouslyInflated: ItemInflated[]

  // Public API - called by manager and components
  updateFromRedux: (items: Item[], feeds: Feed[], displayMode: ItemType, dispatch: any) => void
  setBufferIndex: (index: number, dispatch: any, displayMode: ItemType) => void
  clearBuffer: () => void

  // Selectors
  getItemByIndex: (index: number) => ItemInflated | undefined
  getCurrentItem: () => ItemInflated | undefined

  // Internal methods (can call each other)
  shouldRebuildBuffer: () => boolean
  calculateNewBufferStart: () => number
  rebuildBuffer: (displayMode: ItemType, newStartIndex?: number) => void
  inflateItems: (items: Item[], feeds: Feed[], displayMode: ItemType, bufferStart: number) => ItemInflated[]
}

export const useBufferedItemsStore = create<BufferedItemsStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    bufferedItems: [],
    bufferStartIndex: 0,
    bufferIndex: 0,
    previouslyInflated: [],

    // Public API
    updateFromRedux: (items, feeds, displayMode, dispatch) => {
      if (items.length === 0) {
        get().clearBuffer()
        return
      }

      const { bufferedItems } = get()
      if (bufferedItems.length === 0) {
        // First time initialization
        get().rebuildBuffer(displayMode, 0)
      } else if (get().shouldRebuildBuffer()) {
        // Buffer needs shifting
        const newStart = get().calculateNewBufferStart()
        get().rebuildBuffer(displayMode, newStart)
      }
    },

    setBufferIndex: (bufferIndex, dispatch, displayMode) => {
      const { bufferedItems, bufferIndex: currentBufferIndex } = get()
      const previousItem = bufferedItems[currentBufferIndex]

      set({ bufferIndex })

      // Dispatch Redux action
      if (bufferedItems[bufferIndex]) {
        dispatch({
          type: UPDATE_CURRENT_ITEM,
          displayMode,
          itemId: bufferedItems[bufferIndex]._id,
          previousItemId: previousItem?._id
        })
      }

      if (get().shouldRebuildBuffer()) {
        // Buffer needs shifting
        const newStart = get().calculateNewBufferStart()
        get().rebuildBuffer(displayMode, newStart)
      }
    },

    clearBuffer: () => set({
      bufferedItems: [],
      bufferStartIndex: 0,
      bufferIndex: 0,
      previouslyInflated: []
    }),

    // Selectors
    getItemByIndex: (index) => {
      const { bufferedItems } = get()
      return bufferedItems[index]
    },

    getCurrentItem: () => {
      const { bufferedItems, bufferIndex } = get()
      return bufferedItems[bufferIndex]
    },

    // Internal methods
    shouldRebuildBuffer: () => {
      const { bufferIndex, bufferedItems } = get()

      // Edge cases that require buffer rebuild
      return bufferIndex === 0 || bufferIndex === bufferedItems.length - 1
    },

    calculateNewBufferStart: () => {
      const { bufferIndex, bufferStartIndex } = get()

      if (bufferIndex === BUFFER_LENGTH - 1) {
        // Remember that there's an item BEFORE the current Item
        // which is why we have to do -2 instead of just -1 here
        return bufferStartIndex + BUFFER_LENGTH - 2
      } else if (bufferIndex === 0) {
        return Math.max(0, bufferStartIndex - 1)
      } else {
        return bufferStartIndex
      }
    },

    rebuildBuffer: (displayMode, newStartIndex) => {
      if (store === undefined) return
      const { bufferStartIndex } = get()
      const reduxState = store.getState()
      const items = reduxState[displayMode === 'unread' ? 'itemsUnread' : 'itemsSaved'].items
      const feeds = reduxState.feeds.feeds
      const startIndex = newStartIndex ?? bufferStartIndex

      const inflated = get().inflateItems(items, feeds, displayMode, startIndex)

      set({
        bufferedItems: inflated,
        bufferStartIndex: startIndex,
        bufferIndex: startIndex === 0 ? 0 : 1
      })
    },

    inflateItems: (items, feeds, displayMode, bufferStart) => {
      const { bufferedItems, previouslyInflated } = get()
      const previouslyInflatedMaxLength = 20

      const bufferEnd = bufferStart + BUFFER_LENGTH > items.length - 1 ?
        items.length :
        bufferStart + BUFFER_LENGTH
      const buffered = items.slice(bufferStart, bufferEnd) as (Item | ItemInflated)[]

      // Extract the inflated items that we already have in the current buffer
      let alreadyInflated
      for (let i = 0; i < buffered.length; i++) {
        if (alreadyInflated = bufferedItems.find(bi => bi._id === buffered[i]._id)) {
          buffered[i] = alreadyInflated
        } else if (alreadyInflated = previouslyInflated.find(pi => pi._id === buffered[i]._id)) {
          buffered[i] = alreadyInflated
        }
      }

      const toInflate = buffered.filter(b => !('styles' in b))
      if (toInflate.length > 0) {
        const now = Date.now()
        const inflated = getItemsSyncSqlite(toInflate)
        console.log(`Time taken to inflate items: ${Date.now() - now}ms`)

        const newPreviouslyInflated = [...previouslyInflated, ...inflated]
        const trimmedPreviouslyInflated = newPreviouslyInflated.length > previouslyInflatedMaxLength ?
          newPreviouslyInflated.slice(-previouslyInflatedMaxLength) :
          newPreviouslyInflated

        set({ previouslyInflated: trimmedPreviouslyInflated })

        for (let i = 0; i < buffered.length; i++) {
          if (!('styles' in buffered[i])) {
            buffered[i] = inflated.find(inf => inf._id === buffered[i]._id) as ItemInflated
          }
        }
      }

      if (displayMode === ItemType.saved) {
        return buffered as ItemInflated[]
      } else {
        return buffered.map(bi => {
          const feed = feeds && feeds.length > 0 && feeds.find(f => f._id === bi.feed_id)
          return {
            ...bi,
            isFeedMercury: feed && feed.isMercury
          }
        }) as ItemInflated[]
      }
    }
  }))
)

// Selective hooks for better performance
export const useBufferedItem = (index: number) =>
  useBufferedItemsStore(state => state.getItemByIndex(index))

export const useCurrentBufferedItem = () =>
  useBufferedItemsStore(state => state.getCurrentItem())

export const useBufferStartIndex = () =>
  useBufferedItemsStore(state => state.bufferStartIndex)

export const useBufferedItems = () =>
  useBufferedItemsStore(state => state.bufferedItems)

export const useBufferedItemsLength = () =>
  useBufferedItemsStore(state => state.bufferedItems.length)

export const useBufferIndex = () =>
  useBufferedItemsStore(state => state.bufferIndex)

// Individual action hooks - simple and avoids selector issues
export const useSetBufferIndex = () =>
  useBufferedItemsStore(state => state.setBufferIndex)

export const useUpdateFromRedux = () =>
  useBufferedItemsStore(state => state.updateFromRedux)

export const useClearBuffer = () =>
  useBufferedItemsStore(state => state.clearBuffer)
