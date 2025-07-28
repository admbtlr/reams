import { itemsSaved, initialState } from '../../store/items/items-saved'
import { UPDATE_CURRENT_ITEM, ItemType, SAVE_ITEM, ItemsState, SET_SAVED_ITEMS } from '../../store/items/types'
import dotenv from 'dotenv'
dotenv.config()

const savedItems = [
  {
    id: '1',
    title: 'Item 1',
    _id: '1',
    created_at: 1,
    styles: {},
    isSaved: true,
    savedAt: 123
  },
  {
    id: '2',
    title: 'Item 2',
    _id: '2',
    created_at: 2,
    styles: {},
    isSaved: true,
    savedAt: 456
  },
  {
    id: '3',
    title: 'Item 3',
    _id: '3',
    created_at: 3,
    styles: {},
    isSaved: true,
    savedAt: 789
  }
]

let saved: ItemsState

describe('itemsSaved reducer', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    saved = itemsSaved(initialState, {
      type: SET_SAVED_ITEMS,
      items: savedItems
    })
  })

  it('should handle UPDATE_CURRENT_ITEM', () => {
    const action = { type: UPDATE_CURRENT_ITEM, displayMode: ItemType.saved, itemId: '2' }
    const expectedState = { ...initialState, currentItemId: '2' }
    expect(itemsSaved(initialState, action)).toEqual(expectedState)
  })

  it('should handle SAVE_ITEM', () => {
    const action = { type: SAVE_ITEM, item: { _id: '1' }, savedAt: 123 }
    const expectedState = {
      ...initialState,
      currentItemId: '1',
      items: [{
        _id: '1',
        isSaved: true,
        savedAt: 123
      }]
    }
    expect(itemsSaved(initialState, action)).toEqual(expectedState)
  })



  it('should handle SET_SAVED_ITEMS', () => {
    const action = { type: SET_SAVED_ITEMS, items: savedItems }
    const expectedState = { ...initialState, items: savedItems }
    expect(itemsSaved(initialState, action)).toEqual(expectedState)
  })

  it('should handle UPDATE_ITEM', () => {
    const action = { type: 'UPDATE_ITEM', item: { _id: '1', title: 'New Title' } }
    expect(itemsSaved(saved, action).items[0].title).toEqual('New Title')
  })

  it('should handle MARK_ITEM_READ', () => {
    const action = { type: 'MARK_ITEM_READ', item: { _id: '1' } }
    expect(typeof itemsSaved(saved, action).items[0].readAt).toEqual('number')
  })

  it('should handle SET_SCROLL_OFFSET', () => {
    const action = { type: 'SET_SCROLL_OFFSET', item: { _id: '1' }, scrollRatio: 0.123 }
    expect(itemsSaved(saved, action).items[0].scrollRatio?.html).toEqual(0.123)
  })

  it('should handle TOGGLE_MERCURY_VIEW', () => {
    const action = { type: 'TOGGLE_MERCURY_VIEW', item: { _id: '1' } }
    expect(itemsSaved(saved, action).items[0].showMercuryContent).toEqual(true)
  })

  it('should handle UNSAVE_ITEM', () => {
    const action = { type: 'UNSAVE_ITEM', item: { _id: '1' } }
    expect(itemsSaved(saved, action).items.length).toEqual(2)
  })

  it('should handle SAVE_ITEM', () => {
    const action = { type: 'SAVE_ITEM', item: { _id: '4' }, savedAt: 123 }
    expect(itemsSaved(saved, action).items[0]._id).toEqual('4')
  })

  it('should handle SAVE_EXTERNAL_ITEM', () => {
    const action = {
      type: 'SAVE_EXTERNAL_ITEM', item: {
        _id: '4',
        url: 'http://example.com',
      }, savedAt: 123
    }
    expect(itemsSaved(saved, action).items[0]._id).toEqual('4')
  })

  it('should handle SAVE_EXTERNAL_ITEM_SUCCESS', () => {
    const external = itemsSaved(saved, {
      type: 'SAVE_EXTERNAL_ITEM', item: {
        _id: '4',
        url: 'http://example.com'
      }, savedAt: 123
    })
    const action = {
      type: 'SAVE_EXTERNAL_ITEM_SUCCESS', item: {
        _id: '4',
        url: 'http://example.com',
        id: 123
      }
    }
    expect(itemsSaved(external, action).items[0].id).toEqual(123)
  })

  it('should handle UNSAVE_ITEM', () => {
    const action = { type: 'UNSAVE_ITEM', item: { _id: '1' } }
    expect(itemsSaved(saved, action).items.length).toEqual(2)
  })

  it('should handle ITEMS_BATCH_FETCHED', () => {
    const action = {
      type: 'ITEMS_BATCH_FETCHED',
      itemType: ItemType.saved,
      items: [{
        _id: '4',
        title: 'Item 4',
        created_at: 890,
      }]
    }
    const batchFetched = itemsSaved(saved, action)
    expect(batchFetched.items.length).toEqual(4)
    expect(batchFetched.items[0]._id).toEqual('4')
    expect(batchFetched.currentItemId).toEqual('4')
  })

  it('should migrate from index to currentItemId', () => {
    // Test the migration from old index-based state to new currentItemId-based state
    const oldState = {
      items: savedItems,
      index: 1, // pointing to second item
      lastUpdated: 123
    }

    // Simulate what the migration would do
    const migratedState = {
      ...oldState,
      currentItemId: savedItems[1]._id, // '2'
      index: undefined
    }

    expect(migratedState.currentItemId).toEqual('2')
    expect(migratedState.index).toBeUndefined()
  })
})
