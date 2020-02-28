import { feeds } from '../../store/feeds/feeds.ts/index.js.js.js'

describe('feeds reducer', () => {
  it('should return the initial state', () => {
    expect(feeds(undefined, {})).toEqual({
      feeds: [],
      lastUpdated: 0
    })
  })

  it('should handle ADD_READING_TIME', () => {
    expect(
      feeds([], {
        type: 'ADD_READING_TIME'
      })
    ).toEqual([])
  })
})
