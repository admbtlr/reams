/**
 * bufferedItemsStore Tests
 *
 * Tests for the slot-based carousel state: seenItems as the slot->item map,
 * currentSlot, the rendered window, and forward-only item picking.
 */

import { useBufferedItemsStore } from '@/components/ItemCarousel/bufferedItemsStore'
import { RENDER_WINDOW } from '@/components/ItemCarousel/constants'

// Mock storage so inflation is synchronous and cheap
jest.mock('@/storage', () => ({
  getItemsSync: (items) => items.map(i => ({ ...i, styles: { title: {} } }))
}))

// Mock the Redux store used for fetching more items
const mockReduxItems = Array.from({ length: 20 }, (_, i) => ({
  _id: `item-${i}`,
  url: `https://example.com/${i}`,
  title: `Item ${i}`,
  feed_id: 'feed1',
  isDecorated: i % 2 === 0 // every other item is decorated
}))

jest.mock('@/store', () => ({
  store: {
    getState: () => ({
      itemsUnread: { items: mockReduxItems },
      itemsSaved: { items: [] },
      feeds: { feeds: [{ _id: 'feed1', title: 'Feed', url: 'https://example.com' }] }
    })
  }
}))

const makeDispatch = () => jest.fn()

describe('bufferedItemsStore (slot-based)', () => {
  beforeEach(() => {
    useBufferedItemsStore.getState().clearBuffer()
    jest.clearAllMocks()
  })

  test('initial fill populates seenItems and resets to slot 0', () => {
    const dispatch = makeDispatch()
    useBufferedItemsStore.getState().updateFromRedux(mockReduxItems, [], 'unread', dispatch)

    const { seenItems, currentSlot } = useBufferedItemsStore.getState()
    expect(seenItems.length).toBe(4) // BUFFER_LENGTH
    expect(currentSlot).toBe(0)
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'UPDATE_CURRENT_ITEM',
      itemId: seenItems[0]._id
    }))
  })

  test('rendered window is [current-1, current, current+1, current+2] clamped at start', () => {
    const dispatch = makeDispatch()
    useBufferedItemsStore.getState().updateFromRedux(mockReduxItems, [], 'unread', dispatch)

    const window0 = useBufferedItemsStore.getState().getRenderedWindow()
    expect(window0.map(w => w.slotIndex)).toEqual([0, 1, 2])
    expect(window0[0].item._id).toBe(useBufferedItemsStore.getState().seenItems[0]._id)
  })

  test('setCurrentSlot updates slot, dispatches current item, and slides the window', () => {
    const dispatch = makeDispatch()
    useBufferedItemsStore.getState().updateFromRedux(mockReduxItems, [], 'unread', dispatch)

    useBufferedItemsStore.getState().setCurrentSlot(2, dispatch, 'unread')

    const state = useBufferedItemsStore.getState()
    expect(state.currentSlot).toBe(2)
    expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
      type: 'UPDATE_CURRENT_ITEM',
      itemId: state.seenItems[2]._id,
      previousItemId: state.seenItems[0]._id
    }))

    const window = state.getRenderedWindow()
    // window is [current-1, current, current+1, current+2]; more items were
    // appended because we neared the end of seenItems, so slot 4 exists
    expect(window.map(w => w.slotIndex)).toEqual([1, 2, 3, 4])
  })

  test('window is clamped at the end of seenItems', () => {
    const dispatch = makeDispatch()
    useBufferedItemsStore.getState().updateFromRedux(mockReduxItems, [], 'unread', dispatch)

    // seenItems has 4 items; jump near the end
    useBufferedItemsStore.getState().setCurrentSlot(3, dispatch, 'unread')

    const state = useBufferedItemsStore.getState()
    // fetching more near the end should have appended items
    expect(state.seenItems.length).toBeGreaterThan(4)
    const window = state.getRenderedWindow()
    const expectedStart = Math.max(0, state.currentSlot - RENDER_WINDOW.before)
    const expectedEnd = Math.min(state.seenItems.length, state.currentSlot + 1 + RENDER_WINDOW.after)
    expect(window[0].slotIndex).toBe(expectedStart)
    expect(window[window.length - 1].slotIndex).toBe(expectedEnd - 1)
  })

  test('setCurrentSlot beyond the end of seenItems fills slots first, then clamps', () => {
    const dispatch = makeDispatch()
    useBufferedItemsStore.getState().updateFromRedux(mockReduxItems, [], 'unread', dispatch)

    const before = useBufferedItemsStore.getState().seenItems.length
    useBufferedItemsStore.getState().setCurrentSlot(100, dispatch, 'unread')

    const state = useBufferedItemsStore.getState()
    expect(state.seenItems.length).toBeGreaterThan(before)
    expect(state.currentSlot).toBeLessThanOrEqual(state.seenItems.length - 1)
  })

  test('already-displayed items are never re-picked (forward-looking only)', () => {
    const dispatch = makeDispatch()
    useBufferedItemsStore.getState().updateFromRedux(mockReduxItems, [], 'unread', dispatch)

    const seenIds = new Set(useBufferedItemsStore.getState().seenItems.map(i => i._id))
    useBufferedItemsStore.getState().setCurrentSlot(3, dispatch, 'unread')

    const allSeen = useBufferedItemsStore.getState().seenItems
    const ids = allSeen.map(i => i._id)
    expect(new Set(ids).size).toBe(ids.length) // no duplicates
    for (const id of seenIds) {
      expect(ids.filter(x => x === id).length).toBe(1) // originals kept exactly once
    }
  })

  test('invalid seenItems (filter change) reset to slot 0 and bump listResetCount', () => {
    const dispatch = makeDispatch()
    useBufferedItemsStore.getState().updateFromRedux(mockReduxItems, [], 'unread', dispatch)
    useBufferedItemsStore.getState().setCurrentSlot(2, dispatch, 'unread')

    const resetCountBefore = useBufferedItemsStore.getState().listResetCount

    // New filter: completely different items
    const otherItems = [{ _id: 'other-1', url: 'https://other.com/1', feed_id: 'feed1', isDecorated: true }]
    useBufferedItemsStore.getState().updateFromRedux(otherItems, [], 'unread', dispatch)

    const state = useBufferedItemsStore.getState()
    expect(state.currentSlot).toBe(0)
    expect(state.listResetCount).toBe(resetCountBefore + 1)
    expect(state.seenItems.every(i => i._id.startsWith('other-'))).toBe(true)
  })

  test('clearBuffer empties seenItems, resets slot, bumps listResetCount', () => {
    const dispatch = makeDispatch()
    useBufferedItemsStore.getState().updateFromRedux(mockReduxItems, [], 'unread', dispatch)
    useBufferedItemsStore.getState().setCurrentSlot(1, dispatch, 'unread')

    const resetCountBefore = useBufferedItemsStore.getState().listResetCount
    useBufferedItemsStore.getState().clearBuffer()

    const state = useBufferedItemsStore.getState()
    expect(state.seenItems).toEqual([])
    expect(state.currentSlot).toBe(0)
    expect(state.listResetCount).toBe(resetCountBefore + 1)
    expect(state.getRenderedWindow()).toEqual([])
  })
})
