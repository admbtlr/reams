import { ITEMS_BATCH_FETCHED, ItemType } from '../../store/items/types'
import { itemsUnread, initialState } from '../../store/items/items-unread'
import dotenv from 'dotenv'
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
    feed_id: '2',
    created_at: 2,
    styles: {}
  },
  {
    id: '3',
    title: 'Item 3',
    _id: '3',
    feed_id: '3',
    created_at: 3,
    styles: {}
  }
]

describe('items-unread reducer', () => {
  it('should return the initial state', () => {
    const initial = itemsUnread(initialState, {})
    expect(initial).toEqual(initialState)
  })

  it('should set the new itesm', () => {
    const initial = itemsUnread(initialState, {
      type: ITEMS_BATCH_FETCHED,
      itemType: ItemType.unread,
      items: newItems
    })
    expect(initial).toEqual(initialState)
  })
})
