import { ADD_readingTime, MARK_ITEMS_READ, MARK_ITEM_READ, SAVE_ITEM, SHARE_ITEM } from '../../store/items/types'
import { feeds } from '../../store/feeds/feeds.ts'
import { ADD_FEED, ADD_FEEDS_TO_STORE, LIKE_FEED_TOGGLE, MERCURY_FEED_TOGGLE, MUTE_FEED_TOGGLE, REMOVE_FEED, SET_FEEDS, UNLIKE_FEED, UNMUTE_FEED, UPDATE_FEED, UPDATE_FEEDS } from '../../store/feeds/types'
import { UNSET_BACKEND } from '../../store/user/types'

const newFeed = {
  _id: 1,
  title: 'Test Feed',
  url: 'http://test.com/feed',
  rootUrl: 'http://test.com/',
}

const initial = {
  feeds: [],
  lastUpdated: 0
}
const added = feeds(initial, {
  type: ADD_FEEDS_TO_STORE,
  feeds: [newFeed]
})

describe('feeds reducer', () => {
  it('should return the initial state', () => {
    expect(feeds(undefined, {})).toEqual({
      feeds: [],
      lastUpdated: 0
    })
  })

  it('should handle ADD_FEEDS_TO_STORE', () => {
    expect(
      feeds(initial, {
        type: ADD_FEEDS_TO_STORE,
        feeds: [newFeed]
      })
    ).toEqual({
      feeds: [newFeed],
      lastUpdated: 0
    })
  })

  it('should handle SET_FEEDS', () => {
    expect(
      feeds(initial, {
        type: SET_FEEDS,
        feeds: [newFeed]
      })
    ).toEqual({
      feeds: [newFeed],
      lastUpdated: 0
    })
  })

  it('should handle ADD_FEED', () => {
    expect(
      feeds(initial, {
        type: ADD_FEED,
        feed: newFeed
      })
    ).toEqual(initial)
  })

  it('should handle REMOVE_FEED', () => {
    expect(
      feeds(added, {
        type: REMOVE_FEED,
        feed: newFeed
      })
    ).toEqual(initial)
  })

  it('should handle UPDATE_FEED', () => {
    const updatedFeed = {
      ...newFeed,
      title: 'Updated Feed'
    }
    expect(
      feeds(added, {
        type: UPDATE_FEED,
        feed: updatedFeed
      })
    ).toEqual({
      feeds: [updatedFeed],
      lastUpdated: 0
    })
  })

  it('should handle UPDATE_FEEDS', () => {
    const updatedFeed = {
      ...newFeed,
      title: 'Updated Feed'
    }
    expect(
      feeds(added, {
        type: UPDATE_FEEDS,
        feeds: [updatedFeed]
      })
    ).toEqual({
      feeds: [updatedFeed],
      lastUpdated: 0
    })
  })

  it('should handle UNSET_BACKEND', () => {
    expect(
      feeds(added, {
        type: UNSET_BACKEND,
        backend: 'test'
      })
    ).toEqual(added)
    expect(
      feeds(added, {
        type: UNSET_BACKEND,
        backend: 'reams'
      })
    ).toEqual(initial)
  })

  it('should handle ADD_READING_TIME', () => {
    const withUnreadCount = feeds(added, {
      type: UPDATE_FEED,
      feed: {
        ...newFeed,
        unreadCount: 10
      }
    })
    const withReadingTime = feeds(withUnreadCount, {
      type: ADD_readingTime,
      item: {
        content_length: 10,
        feed_id: newFeed._id,
      },
      readingTime: 10
    })
    expect(withReadingTime.feeds[0].readingTime).toEqual(10)
  })

  it('should handle SHARE_ITEM', () => {
    const withShare = feeds(added, {
      type: SHARE_ITEM,
      item: {
        feed_id: newFeed._id,
      }
    })
    expect(withShare.feeds[0].sharedCount).toEqual(1)
  })

  it('should handle SAVE_ITEM', () => {
    const withShare = feeds(added, {
      type: SAVE_ITEM,
      item: {
        feed_id: newFeed._id,
      }
    })
    expect(withShare.feeds[0].savedCount).toEqual(1)
  })

  it('should handle LIKE_FEED_TOGGLE', () => {
    const withLike = feeds(added, {
      type: LIKE_FEED_TOGGLE,
      feed: newFeed
    })
    expect(withLike.feeds[0].isLiked).toEqual(true)
    const withUnlike = feeds(withLike, {
      type: LIKE_FEED_TOGGLE,
      feed: newFeed
    })
    expect(withUnlike.feeds[0].isLiked).toEqual(false)
  })

  it('should handle UNLIKE_FEED', () => {
    const withLike = feeds(added, {
      type: LIKE_FEED_TOGGLE,
      feed: newFeed
    })
    const withUnlike = feeds(withLike, {
      type: UNLIKE_FEED,
      feed: newFeed
    })
    expect(withUnlike.feeds[0].isLiked).toEqual(false)
  })

  it('should handle MUTE_FEED_TOGGLE', () => {
    const withMute = feeds(added, {
      type: MUTE_FEED_TOGGLE,
      feed: newFeed
    })
    expect(withMute.feeds[0].isMuted).toEqual(true)
    const withUnmute = feeds(withMute, {
      type: MUTE_FEED_TOGGLE,
      feed: newFeed
    })
    expect(withUnmute.feeds[0].isMuted).toEqual(false)
  })

  it('should handle UNMUTE_FEED', () => {
    const withMute = feeds(added, {
      type: MUTE_FEED_TOGGLE,
      feed: newFeed
    })
    const withUnmute = feeds(withMute, {
      type: UNMUTE_FEED,
      feed: newFeed
    })
    expect(withUnmute.feeds[0].isMuted).toEqual(false)
  })

  it('should handle MERCURY_FEED_TOGGLE', () => {
    const withMercury = feeds(added, {
      type: MERCURY_FEED_TOGGLE,
      feed: newFeed
    })
    expect(withMercury.feeds[0].isMercury).toEqual(true)
    const withoutMercury = feeds(withMercury, {
      type: MERCURY_FEED_TOGGLE,
      feed: newFeed
    })
    expect(withoutMercury.feeds[0].isMercury).toEqual(false)
  })

  it('should handle MARK_ITEMS_READ', () => {
    const withUnreadCount = feeds(added, {
      type: UPDATE_FEED,
      feed: {
        ...newFeed,
        unreadCount: 10
      }
    })
    const withMarkRead = feeds(withUnreadCount, {
      type: MARK_ITEMS_READ,
      items: [{ feed_id: newFeed._id }]
    })
    expect(withMarkRead.feeds[0].unreadCount).toEqual(9)
    expect(withMarkRead.feeds[0].readCount).toEqual(1)
  })

  it('should handle MARK_ITEM_READ', () => {
    const withUnreadCount = feeds(added, {
      type: UPDATE_FEED,
      feed: {
        ...newFeed,
        unreadCount: 10
      }
    })
    const withMarkRead = feeds(withUnreadCount, {
      type: MARK_ITEM_READ,
      item: { feed_id: newFeed._id }
    })
    expect(withMarkRead.feeds[0].unreadCount).toEqual(9)
    expect(withMarkRead.feeds[0].readCount).toEqual(1)
  })
})
