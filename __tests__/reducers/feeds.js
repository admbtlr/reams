import { ADD_READING_TIME } from '../../store/items/types'
import { feeds } from '../../store/feeds/feeds.ts'

describe('feeds reducer', () => {
  it('should return the initial state', () => {
    expect(feeds(undefined, {})).toEqual({
      feeds: [],
      lastUpdated: 0
    })
  })

  // it('should handle ADD_READING_TIME', () => {
  //   expect(
  //     feeds([], {
  //       type: ADD_READING_TIME
  //     })
  //   ).toEqual([])
  // })
})
