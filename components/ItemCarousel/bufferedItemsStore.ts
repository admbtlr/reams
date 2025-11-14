import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Item, ItemInflated, ItemType, UPDATE_CURRENT_ITEM } from '@/store/items/types'
import { Feed } from '@/store/feeds/types'
import { BUFFER_LENGTH } from './constants'
import { getItemsSync } from '@/storage'
import { useSelector } from 'react-redux'
import { store } from '@/store'

interface BufferedItemsStore {
  // State
  bufferedItems: ItemInflated[]
  bufferStartIndex: number
  bufferIndex: number
  previouslyInflated: ItemInflated[]
  seenItems: ItemInflated[]  // All items seen so far, in order
  globalIndex: number  // Current position in seenItems

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
  findNextDecoratedItems: (count: number, allItems: Item[], usedIds: string[]) => Item[]
  appendToSeenItems: (items: ItemInflated[]) => void
  rebuildBufferFromSeen: () => void
}

export const useBufferedItemsStore = create<BufferedItemsStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    bufferedItems: [],
    bufferStartIndex: 0,
    bufferIndex: 0,
    previouslyInflated: [],
    seenItems: [],
    globalIndex: 0,

    // Public API
    updateFromRedux: (items, feeds, displayMode, dispatch) => {
      if (items.length === 0) {
        get().clearBuffer()
        return
      }

      let { seenItems } = get()

      // Check if seenItems are still valid (i.e., still in the new items list)
      // This handles filter changes where we need to rebuild from scratch
      const seenItemsStillValid = seenItems.length === 0 ||
        seenItems.every(seenItem => items.find(item => item._id === seenItem._id))

      if (!seenItemsStillValid) {
        console.log('[BufferedItems] Items list changed (filter/display mode), clearing buffer')
        get().clearBuffer()
        // Re-get seenItems after clearing
        seenItems = get().seenItems
      }

      if (seenItems.length === 0) {
        // First time initialization - find decorated items and build initial buffer
        console.log(`[BufferedItems] Initial buffer build - searching for ${BUFFER_LENGTH} items`)
        const nextItems = get().findNextDecoratedItems(BUFFER_LENGTH, items, [])

        // Inflate the items
        const inflated = getItemsSync(nextItems)
        console.log(`[BufferedItems] Inflated ${inflated.length} items for initial buffer`)

        // Add feed info if in unread mode
        const inflatedWithFeeds = displayMode === ItemType.saved
          ? inflated
          : inflated.map(bi => {
              const feed = feeds && feeds.length > 0 && feeds.find(f => f._id === bi.feed_id)
              return {
                ...bi,
                isFeedMercury: feed && feed.isMercury
              }
            })

        // Initialize seenItems with the inflated items
        set({
          seenItems: inflatedWithFeeds,
          globalIndex: 0
        })

        // Build the initial buffer from seenItems
        get().rebuildBufferFromSeen()

        // Dispatch Redux action for first item
        if (inflatedWithFeeds.length > 0) {
          dispatch({
            type: UPDATE_CURRENT_ITEM,
            displayMode,
            itemId: inflatedWithFeeds[0]._id
          })
        }
      }
      // If seenItems already exists, don't do anything - buffer management happens in setBufferIndex
    },

    setBufferIndex: (bufferIndex, dispatch, displayMode) => {
      const { bufferedItems, bufferIndex: currentBufferIndex, globalIndex, seenItems, bufferStartIndex } = get()
      const previousItem = bufferedItems[currentBufferIndex]

      // Calculate new globalIndex based on buffer position change
      const bufferIndexDelta = bufferIndex - currentBufferIndex
      const newGlobalIndex = globalIndex + bufferIndexDelta

      set({
        bufferIndex,
        globalIndex: newGlobalIndex
      })

      // Dispatch Redux action
      if (bufferedItems[bufferIndex]) {
        dispatch({
          type: UPDATE_CURRENT_ITEM,
          displayMode,
          itemId: bufferedItems[bufferIndex]._id,
          previousItemId: previousItem?._id
        })
      }

      // Check if we need to fetch more items when scrolling forward
      const remainingInSeen = seenItems.length - newGlobalIndex
      if (remainingInSeen <= BUFFER_LENGTH && store) {
        // Need more items - fetch next batch of decorated items
        console.log(`[BufferedItems] Near end of seenItems (${remainingInSeen} remaining), fetching more`)
        const reduxState = store.getState()
        const items = reduxState[displayMode === 'unread' ? 'itemsUnread' : 'itemsSaved'].items
        const feeds = reduxState.feeds.feeds
        const usedIds = seenItems.map(i => i._id)

        const nextItems = get().findNextDecoratedItems(BUFFER_LENGTH, items, usedIds)

        if (nextItems.length > 0) {
          // Inflate the new items
          const inflated = getItemsSync(nextItems)
          console.log(`[BufferedItems] Appending ${inflated.length} new items to seenItems`)

          // Add feed info if in unread mode
          const inflatedWithFeeds = displayMode === ItemType.saved
            ? inflated
            : inflated.map(bi => {
                const feed = feeds && feeds.length > 0 && feeds.find(f => f._id === bi.feed_id)
                return {
                  ...bi,
                  isFeedMercury: feed && feed.isMercury
                }
              })

          // Append to seenItems
          get().appendToSeenItems(inflatedWithFeeds)
        }
      }

      // Rebuild buffer if needed (at edges)
      if (get().shouldRebuildBuffer()) {
        get().rebuildBufferFromSeen()
      }
    },

    clearBuffer: () => set({
      bufferedItems: [],
      bufferStartIndex: 0,
      bufferIndex: 0,
      previouslyInflated: [],
      seenItems: [],
      globalIndex: 0
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
        const inflated = getItemsSync(toInflate)
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
    },

    findNextDecoratedItems: (count, allItems, usedIds) => {
      // Filter out already-seen items
      const unseenItems = allItems.filter(item => !usedIds.includes(item._id))

      // Separate by decoration status
      const decorated = unseenItems.filter(item => item.isDecorated === true)
      const undecorated = unseenItems.filter(item => item.isDecorated !== true)

      // Prioritize decorated, fall back to undecorated if needed
      const result = []
      result.push(...decorated.slice(0, count))

      if (result.length < count) {
        const needed = count - result.length
        result.push(...undecorated.slice(0, needed))
        console.log(`[BufferedItems] Found ${result.length - (count - needed)} decorated items and ${needed} undecorated items (requested ${count})`)
      } else {
        console.log(`[BufferedItems] Found ${result.length} decorated items (requested ${count})`)
      }

      return result.slice(0, count)
    },

    appendToSeenItems: (items) => {
      const { seenItems } = get()
      set({ seenItems: [...seenItems, ...items] })
    },

    rebuildBufferFromSeen: () => {
      const { seenItems, globalIndex } = get()

      // Create 5-item window: 1 before, current, 3 after (when possible)
      const start = Math.max(0, globalIndex - 1)
      const end = Math.min(seenItems.length, start + BUFFER_LENGTH)

      const bufferedItems = seenItems.slice(start, end)

      // Adjust bufferIndex based on position
      let bufferIndex
      if (globalIndex === 0) {
        bufferIndex = 0
      } else if (globalIndex >= seenItems.length - 1) {
        bufferIndex = bufferedItems.length - 1
      } else {
        bufferIndex = 1 // Usually in position 1 with 1 item before
      }

      set({
        bufferedItems,
        bufferIndex,
        bufferStartIndex: start
      })
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

export const useGlobalIndex = () =>
  useBufferedItemsStore(state => state.globalIndex)

export const useSeenItemsLength = () =>
  useBufferedItemsStore(state => state.seenItems.length)

// Individual action hooks - simple and avoids selector issues
export const useSetBufferIndex = () =>
  useBufferedItemsStore(state => state.setBufferIndex)

export const useUpdateFromRedux = () =>
  useBufferedItemsStore(state => state.updateFromRedux)

export const useClearBuffer = () =>
  useBufferedItemsStore(state => state.clearBuffer)
