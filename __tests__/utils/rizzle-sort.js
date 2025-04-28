import { Direction } from '../../store/config/types'
import rizzleSort from '../../utils/rizzle-sort'

const items = [
  {
    title: 'Item 1a',
    created_at: new Date('1/4/2019/09:00').getTime(),
    feed_id: 1,
    shuffle_factor: -0.5
  },
  {
    title: 'Item 1b',
    created_at: new Date('2/4/2019/09:00').getTime(),
    feed_id: 1,
    shuffle_factor: 0
  },
  {
    title: 'Item 1c',
    created_at: new Date('3/4/2019/09:00').getTime(),
    feed_id: 1,
    shuffle_factor: 0.5
  },
  {
    title: 'Item 2a',
    created_at: new Date('1/4/2019/10:00').getTime(),
    feed_id: 2,
    shuffle_factor: 0.5
  },
  {
    title: 'Item 2b',
    created_at: new Date('2/4/2019/10:00').getTime(),
    feed_id: 2,
    shuffle_factor: 0
  },
  {
    title: 'Item 2c',
    created_at: new Date('3/4/2019/10:00').getTime(),
    feed_id: 2,
    shuffle_factor: -0.5
  },
  {
    title: 'Item 3a',
    created_at: new Date('1/4/2019/11:00').getTime(),
    feed_id: 3,
    shuffle_factor: -0.5
  },
  {
    title: 'Item 3b',
    created_at: new Date('2/4/2019/11:00').getTime(),
    feed_id: 3,
    shuffle_factor: 0
  },
  {
    title: 'Item 3c',
    created_at: new Date('3/4/2019/11:00').getTime(),
    feed_id: 3,
    shuffle_factor: 0.5
  },
  {
    title: 'Item 4a',
    created_at: new Date('1/4/2019/12:00').getTime(),
    feed_id: 4,
    shuffle_factor: -0.8
  },
  {
    title: 'Item 4b',
    created_at: new Date('2/4/2019/12:00').getTime(),
    feed_id: 4,
    shuffle_factor: 0
  },
  {
    title: 'Item 4c',
    created_at: new Date('3/4/2019/12:00').getTime(),
    feed_id: 4,
    shuffle_factor: 0.8
  }
]

const feeds = [
  {
    _id: 1,
    readingRate: 1
  },
  {
    _id: 2,
    readingRate: 2
  },
  {
    _id: 3,
    readingRate: 3
  },
  {
    _id: 4
  }
]

const sorted1 = [
  'Item 4c',
  'Item 3c',
  'Item 2c',
  'Item 1c',
  'Item 4b',
  'Item 3b',
  'Item 2b',
  'Item 1b',
  'Item 4a',
  'Item 3a',
  'Item 2a',
  'Item 1a'
]

describe('rizzleSort', () => {
  it('should do straight sort when shuffle_factors all = 0', () => {
    const itemsNoShuffle = items.map(i => ({
      ...i,
      shuffle_factor: 0
    }))
    const sorted = rizzleSort(itemsNoShuffle, feeds, Direction.desc).map(i => i.title)
    console.log(sorted)
    expect(sorted).toEqual(sorted1)
  })

  // it('should shuffle deterministically', () => {
  //   const sorted = rizzleSort(items, feeds, 0).map(i => i.title)
  //   console.log(sorted)
  //   expect(sorted).toEqual(sorted1)
  // })

})
