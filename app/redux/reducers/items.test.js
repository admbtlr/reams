import { items } from './items'

const state = {
  items: [
    {
      _id: '1',
      feed_item_id: 1,
      created_at: 1
    },
    {
      _id: '2',
      feed_item_id: 2,
      created_at: 2,
      readAt: 5
    },
    {
      _id: '3',
      feed_item_id: 3,
      created_at: 3
    },
    {
      _id: '4',
      feed_item_id: 4,
      created_at: 4
    }
  ]
}

const action = {
  items: [
    {
      _id: '2',
      feed_item_id: 2,
      created_at: 2
    },
    {
      _id: '3',
      feed_item_id: 3,
      created_at: 3
    },
    {
      _id: '4',
      feed_item_id: 4,
      created_at: 4
    },
    {
      _id: '5',
      feed_item_id: 5,
      created_at: 5
    }
  ]
}

describe('items reducer', () => {
  it('should update the index', () => {
    expect(
      items({}, {
        type: 'ITEMS_UPDATE_CURRENT_INDEX',
        index: 23
      })
    ).toEqual({
      index: 23
    })
  })

  it ('should interleave items correctly', () => {
    expect(
      items({
        ...state,
        index: 2
      }, {
        ...action,
        type: 'ITEMS_FETCH_DATA_SUCCESS'
      })
    ).toEqual({
      items: [
        {
          _id: '3',
          feed_item_id: 3,
          created_at: 3
        },
        {
          _id: '4',
          feed_item_id: 4,
          created_at: 4
        },
        {
          _id: '5',
          feed_item_id: 5,
          created_at: 5
        }
      ],
      index: 0
    })
  })
})
