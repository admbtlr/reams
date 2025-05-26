import { ITEMS_BATCH_FETCHED, ItemType, ItemsState, SET_SCROLL_OFFSET, TOGGLE_MERCURY_VIEW } from '../../store/items/types'
import { itemsUnread, initialState } from '../../store/items/items-unread'
import dotenv from 'dotenv'
import { MUTE_FEED_TOGGLE, REMOVE_FEED } from '../../store/feeds/types'
dotenv.config()

const newItems = [
  {
    id: '1',
    title: 'Item 1',
    _id: '1',
    feed_id: '1',
    created_at: 1,
    styles: {}
  },
  {
    id: '2',
    title: 'Item 2',
    _id: '2',
    feed_id: '1',
    created_at: 2,
    styles: {}
  },
  {
    id: '3',
    title: 'Item 3',
    _id: '3',
    feed_id: '2',
    created_at: 3,
    styles: {}
  }
]

jest.mock('../../utils/rizzle-sort')

let initial: ItemsState
let itemsFetched: ItemsState

describe('items-unread reducer', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    initial = itemsUnread(initialState, {})
    itemsFetched = itemsUnread(initial, {
      type: ITEMS_BATCH_FETCHED,
      itemType: ItemType.unread,
      items: newItems
    })
  })

  it('should return the initial state', () => {
    expect(initial).toEqual(initialState)
  })

  it('should handle ITEMS_BATCH_FETCHED', () => {
    expect(itemsFetched).toEqual({
      ...initialState,
      items: newItems
    })
  })

  it('should handle UPDATE_CURRENT_INDEX', () => {
    const result = itemsUnread(initial, {
      type: 'UPDATE_CURRENT_INDEX',
      displayMode: ItemType.unread,
      index: 1
    })
    expect(result).toEqual({
      ...initial,
      index: 1
    })
    const result2 = itemsUnread(initial, {
      type: 'UPDATE_CURRENT_INDEX',
      displayMode: ItemType.saved,
      index: 1
    })
    expect(result2).toEqual(initial)
  })

  it('should handle INCREMENT_INDEX', () => {
    const result = itemsUnread(initial, {
      type: 'INCREMENT_INDEX',
      displayMode: ItemType.unread
    })
    expect(result).toEqual({
      ...initial,
      index: 0
    })
    const result2 = itemsUnread(itemsFetched, {
      type: 'INCREMENT_INDEX',
      displayMode: ItemType.unread
    })
    expect(result2).toEqual({
      ...itemsFetched,
      index: 1
    })
    const result3 = itemsUnread(initial, {
      type: 'INCREMENT_INDEX',
      displayMode: ItemType.saved
    })
    expect(result3).toEqual(initial)
  })

  it('should handle DECREMENT_INDEX', () => {
    const incremented = itemsUnread(itemsFetched, {
      type: 'INCREMENT_INDEX',
      displayMode: ItemType.unread
    })
    expect(incremented).toEqual({
      ...itemsFetched,
      index: 1
    })
    const decremented = itemsUnread(incremented, {
      type: 'DECREMENT_INDEX',
      displayMode: ItemType.unread
    })
    expect(decremented).toEqual({
      ...incremented,
      index: 0
    })
    const result3 = itemsUnread(incremented, {
      type: 'DECREMENT_INDEX',
      displayMode: ItemType.saved
    })
    expect(result3).toEqual(incremented)
  })
  it('should handle UPDATE_ITEM', () => {
    const updatedItem = itemsUnread(itemsFetched, {
      type: 'UPDATE_ITEM',
      item: {
        _id: '2',
        title: 'Item 2 updated'
      }
    })
    expect(updatedItem.items[1].title).toEqual('Item 2 updated')
  })
  it('should handle MARK_ITEM_READ', () => {
    const markedRead = itemsUnread(itemsFetched, {
      type: 'MARK_ITEM_READ',
      item: {
        _id: '2'
      }
    })
    expect(typeof (markedRead.items[1].readAt)).toEqual('number')
  })
  it('should handle PRUNE_UNREAD', () => {
    const markedRead = itemsUnread(itemsFetched, {
      type: 'MARK_ITEM_READ',
      item: {
        _id: '2'
      }
    })
    const pruned = itemsUnread(markedRead, {
      type: 'PRUNE_UNREAD',
      maxItems: 2,
      itemSort: 'created_at',
      prunedItems: [{
        _id: '3'
      }]
    })
    expect(pruned.items.length).toEqual(2)
  })
  it('should handle MUTE_FEED_TOGGLE', () => {
    const muted = itemsUnread(itemsFetched, {
      type: MUTE_FEED_TOGGLE,
      feed: {
        _id: '1'
      }
    })
    expect(muted.items.length).toEqual(1)
  })
  it('should handle REMOVE_FEED', () => {
    const muted = itemsUnread(itemsFetched, {
      type: REMOVE_FEED,
      feed: {
        _id: '1'
      }
    })
    expect(muted.items.length).toEqual(1)
  })
  it('should handle SET_LAST_UPDATED', () => {
    const updated = itemsUnread(itemsFetched, {
      type: 'SET_LAST_UPDATED',
      itemType: ItemType.unread
    })
    expect(updated.lastUpdated).toBeGreaterThan(0)
  })
  it('should handle TOGGLE_MERCURY_VIEW', () => {
    const toggled = itemsUnread(itemsFetched, {
      type: TOGGLE_MERCURY_VIEW,
      item: {
        _id: '2'
      }
    })
    expect(toggled.items.find(i => i._id === '2')?.showMercuryContent).toEqual(true)
  })
  it('should handle SET_SCROLL_OFFSET', () => {
    const updated = itemsUnread(itemsFetched, {
      type: SET_SCROLL_OFFSET,
      item: {
        _id: '2'
      },
      scrollRatio: 0.123
    })
    expect(updated.items.find(i => i._id === '2')?.scrollRatio?.html).toEqual(0.123)
    const toggled = itemsUnread(itemsFetched, {
      type: TOGGLE_MERCURY_VIEW,
      item: {
        _id: '2'
      }
    })
    const updated2 = itemsUnread(toggled, {
      type: SET_SCROLL_OFFSET,
      item: {
        _id: '2'
      },
      scrollRatio: 0.123
    })
    expect(updated2.items.find(i => i._id === '2')?.scrollRatio?.mercury).toEqual(0.123)
  })
  it('should handle SAVE_ITEM', () => {
    const saved = itemsUnread(itemsFetched, {
      type: 'SAVE_ITEM',
      item: {
        _id: '2'
      },
      savedAt: 123
    })
    expect(saved.items[1].isSaved).toEqual(true)
  })
  it('should handle UNSAVE_ITEM', () => {
    const saved = itemsUnread(itemsFetched, {
      type: 'SAVE_ITEM',
      item: {
        _id: '2'
      },
      savedAt: 123
    })
    const unsaved = itemsUnread(saved, {
      type: 'UNSAVE_ITEM',
      item: {
        _id: '2'
      }
    })
    expect(unsaved.items[1].isSaved).toEqual(false)
    expect(unsaved.items[1].savedAt).toEqual(undefined)
  })
  it('should handle ITEM_DECORATION_SUCCESS', () => {
    const decorated = itemsUnread(itemsFetched, {
      type: 'ITEM_DECORATION_SUCCESS',
      item: {
        _id: '2'
      },
      mercuryStuff: {
        lead_image_url: 'http://example.com/image.jpg'
      }
    })
    expect(decorated.items[1].coverImageUrl).toEqual('http://example.com/image.jpg')
    expect(decorated.items[1].isDecorated).toEqual(true)
  })
  it('should handle ITEM_DECORATION_FAILURE', () => {
    const decorated = itemsUnread(itemsFetched, {
      type: 'ITEM_DECORATION_FAILURE',
      item: {
        _id: '2'
      }
    })
    expect(decorated.items[1].decoration_failures).toEqual(1)
  })
  it('should handle IMAGE_ANALYSIS_DONE', () => {
    const analyzed = itemsUnread(itemsFetched, {
      type: 'IMAGE_ANALYSIS_DONE',
      item: {
        _id: '2'
      }
    })
    expect(analyzed.items[1]._id).toEqual('2')
    expect(analyzed.items[1].isAnalysed).toBeTruthy()
  })
})
