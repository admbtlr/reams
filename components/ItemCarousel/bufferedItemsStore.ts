import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Item, ItemInflated, ItemType, UPDATE_CURRENT_ITEM } from '@/store/items/types'
import { Feed } from '@/store/feeds/types'
import { BUFFER_LENGTH, RENDER_WINDOW } from './constants'
import { getItemsSync } from '@/storage'
import { store } from '@/store'

export interface RenderedSlot {
  slotIndex: number
  item: ItemInflated
}

interface BufferedItemsStore {
  // State
  seenItems: ItemInflated[]  // Display order == slot order, so seenItems[slot] is the item at slot
  currentSlot: number        // Position in the full-width ScrollView
  renderedWindow: RenderedSlot[] // Slots [currentSlot-1 … currentSlot+2] clamped; kept in state so selectors return stable references
  listResetCount: number     // Incremented on every list reset (filter change / clear) to trigger scroll re-anchoring
  previouslyInflated: ItemInflated[]

  // Public API - called by manager and components
  updateFromRedux: (items: Item[], feeds: Feed[], displayMode: ItemType, dispatch: any) => void
  setCurrentSlot: (slot: number, dispatch: any, displayMode: ItemType) => void
  clearBuffer: () => void

  // Selectors
  getItemAtSlot: (slot: number) => ItemInflated | undefined
  getCurrentItem: () => ItemInflated | undefined
  getRenderedWindow: () => RenderedSlot[]

  // Internal methods (can call each other)
  findNextDecoratedItems: (count: number, allItems: Item[], usedIds: string[]) => Item[]
  appendToSeenItems: (items: ItemInflated[]) => void
  inflateWithFeeds: (items: Item[], feeds: Feed[], displayMode: ItemType) => ItemInflated[]
  fetchMoreItems: (displayMode: ItemType) => boolean
}

const clampSlot = (slot: number, seenLength: number) =>
  Math.max(0, Math.min(slot, Math.max(0, seenLength - 1)))

// Slots [currentSlot-1, currentSlot, currentSlot+1, currentSlot+2], clamped at edges
const computeWindow = (seenItems: ItemInflated[], currentSlot: number): RenderedSlot[] => {
  const start = Math.max(0, currentSlot - RENDER_WINDOW.before)
  const end = Math.min(seenItems.length, currentSlot + 1 + RENDER_WINDOW.after)
  const window: RenderedSlot[] = []
  for (let slot = start; slot < end; slot++) {
    window.push({ slotIndex: slot, item: seenItems[slot] })
  }
  return window
}

export const useBufferedItemsStore = create<BufferedItemsStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    seenItems: [],
    currentSlot: 0,
    renderedWindow: [],
    listResetCount: 0,
    previouslyInflated: [],

    // Public API
    updateFromRedux: (items, feeds, displayMode, dispatch) => {
      if (items.length === 0) {
        get().clearBuffer()
        return
      }

      let { seenItems } = get()

      // Check if seenItems are still valid (i.e., still in the new items list)
      // This handles filter changes where we need to reset from scratch
      const seenItemsStillValid = seenItems.length === 0 ||
        seenItems.every(seenItem => items.find(item => item._id === seenItem._id))

      if (!seenItemsStillValid) {
        console.log('[BufferedItems] Items list changed (filter/display mode), resetting slots')
        get().clearBuffer()
        // Re-get seenItems after clearing
        seenItems = get().seenItems
      }

      if (seenItems.length === 0) {
        // First time initialization - find decorated items to fill the first slots
        console.log(`[BufferedItems] Initial slot fill - searching for ${BUFFER_LENGTH} items`)
        const nextItems = get().findNextDecoratedItems(BUFFER_LENGTH, items, [])
        const inflatedWithFeeds = get().inflateWithFeeds(nextItems, feeds, displayMode)
        console.log(`[BufferedItems] Inflated ${inflatedWithFeeds.length} items for initial slots`)

        set({
          seenItems: inflatedWithFeeds,
          currentSlot: 0,
          renderedWindow: computeWindow(inflatedWithFeeds, 0)
        })

        // Dispatch Redux action for first item
        if (inflatedWithFeeds.length > 0) {
          dispatch({
            type: UPDATE_CURRENT_ITEM,
            displayMode,
            itemId: inflatedWithFeeds[0]._id
          })
        }
      }
      // If seenItems already exists, don't do anything - slot management happens in setCurrentSlot
    },

    setCurrentSlot: (slot, dispatch, displayMode) => {
      const { seenItems, currentSlot: previousSlot } = get()
      const previousItem = seenItems[previousSlot]

      // Fill slots ahead of the user before clamping, so a fast swipe never
      // lands on an unfilled slot
      if (slot >= seenItems.length) {
        get().fetchMoreItems(displayMode)
      }

      // Re-read in case fetchMoreItems appended while we were deciding
      const finalSeen = get().seenItems
      const newSlot = clampSlot(slot, finalSeen.length)
      set({
        currentSlot: newSlot,
        renderedWindow: computeWindow(finalSeen, newSlot)
      })

      // Dispatch Redux action
      const newItem = finalSeen[newSlot]
      if (newItem) {
        dispatch({
          type: UPDATE_CURRENT_ITEM,
          displayMode,
          itemId: newItem._id,
          previousItemId: previousItem?._id
        })
      }

      // Check if we need to fetch more items when scrolling forward
      const remainingInSeen = finalSeen.length - newSlot
      if (remainingInSeen <= BUFFER_LENGTH && store) {
        console.log(`[BufferedItems] Near end of seenItems (${remainingInSeen} remaining), fetching more`)
        get().fetchMoreItems(displayMode)
      }
    },

    clearBuffer: () => set(state => ({
      seenItems: [],
      currentSlot: 0,
      renderedWindow: [],
      listResetCount: state.listResetCount + 1,
      previouslyInflated: []
    })),

    // Selectors
    getItemAtSlot: (slot) => {
      const { seenItems } = get()
      return seenItems[slot]
    },

    getCurrentItem: () => {
      const { seenItems, currentSlot } = get()
      return seenItems[currentSlot]
    },

    // Slots [currentSlot-1, currentSlot, currentSlot+1, currentSlot+2], clamped at edges.
    // Kept in state (renderedWindow) so hook selectors return stable references;
    // this derived getter is for non-reactive callers and tests.
    getRenderedWindow: () => {
      const { seenItems, currentSlot } = get()
      return computeWindow(seenItems, currentSlot)
    },

    // Internal methods
    inflateWithFeeds: (items, feeds, displayMode) => {
      const { previouslyInflated } = get()
      const previouslyInflatedMaxLength = 20

      const toInflate = items.filter(b => !('styles' in b))
      let inflated: ItemInflated[] = []
      if (toInflate.length > 0) {
        const now = Date.now()
        inflated = getItemsSync(toInflate)
        console.log(`Time taken to inflate items: ${Date.now() - now}ms`)

        const newPreviouslyInflated = [...previouslyInflated, ...inflated]
        const trimmedPreviouslyInflated = newPreviouslyInflated.length > previouslyInflatedMaxLength ?
          newPreviouslyInflated.slice(-previouslyInflatedMaxLength) :
          newPreviouslyInflated

        set({ previouslyInflated: trimmedPreviouslyInflated })
      }

      const buffered = items.map(item => {
        if ('styles' in item) return item as ItemInflated
        const already = previouslyInflated.find(pi => pi._id === item._id)
        if (already) return already
        return inflated.find(inf => inf._id === item._id) as ItemInflated
      })

      if (displayMode === ItemType.saved) {
        return buffered
      }
      return buffered.map(bi => {
        const feed = feeds && feeds.length > 0 && feeds.find(f => f._id === bi.feed_id)
        return {
          ...bi,
          isFeedMercury: feed && feed.isMercury
        }
      })
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
      const { seenItems, currentSlot } = get()
      const newSeen = [...seenItems, ...items]
      set({
        seenItems: newSeen,
        // appending can extend the window when clamped at the end
        renderedWindow: computeWindow(newSeen, currentSlot)
      })
    },

    // Fetches the next batch of items near the end of seenItems. Returns true
    // if anything was appended.
    fetchMoreItems: (displayMode: ItemType): boolean => {
      if (!store) return false
      const { seenItems } = get()
      const reduxState = store.getState()
      const items = reduxState[displayMode === 'unread' ? 'itemsUnread' : 'itemsSaved'].items
      const feeds = reduxState.feeds.feeds
      const usedIds = seenItems.map(i => i._id)

      const nextItems = get().findNextDecoratedItems(BUFFER_LENGTH, items, usedIds)
      if (nextItems.length === 0) return false

      const inflatedWithFeeds = get().inflateWithFeeds(nextItems, feeds, displayMode)
      console.log(`[BufferedItems] Appending ${inflatedWithFeeds.length} new items to seenItems`)
      get().appendToSeenItems(inflatedWithFeeds)
      return true
    }
  }))
)

// Selective hooks for better performance
export const useItemAtSlot = (slot: number) =>
  useBufferedItemsStore(state => state.seenItems[slot])

export const useCurrentItem = () =>
  useBufferedItemsStore(state => state.getCurrentItem())

export const useSeenItems = () =>
  useBufferedItemsStore(state => state.seenItems)

export const useSeenItemsLength = () =>
  useBufferedItemsStore(state => state.seenItems.length)

export const useCurrentSlot = () =>
  useBufferedItemsStore(state => state.currentSlot)

export const useListResetCount = () =>
  useBufferedItemsStore(state => state.listResetCount)

export const useRenderedWindow = () =>
  useBufferedItemsStore(state => state.renderedWindow)

// Individual action hooks - simple and avoids selector issues
export const useSetCurrentSlot = () =>
  useBufferedItemsStore(state => state.setCurrentSlot)

export const useUpdateFromRedux = () =>
  useBufferedItemsStore(state => state.updateFromRedux)

export const useClearBuffer = () =>
  useBufferedItemsStore(state => state.clearBuffer)
