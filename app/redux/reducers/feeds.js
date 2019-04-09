const initialState = {
  feeds: [],
  lastUpdated: 0
}

export function feeds (state = initialState, action) {
  let feeds
  let feed
  let newState, dirtyFeed, dirtyFeedIndex

  switch (action.type) {
    case 'FEEDS_ADD_FEED_SUCCESS':
      let cleanedFeeds = state.feeds.filter(feed => !!feed)
      return {
        ...state,
        feeds: [
          ...cleanedFeeds,
          action.addedFeed
        ]
      }
    case 'FEEDS_ADD_FEEDS_SUCCESS':
      let newFeeds = action.addedFeeds.filter(addedFeed => {
        return !state.feeds
          .find(feed => feed.url === addedFeed.url || feed._id === addedFeed._id)
      })
      return {
        ...state,
        feeds: [
          ...state.feeds,
          ...newFeeds
        ]
      }
    case 'FEEDS_ADD_FEED':
      console.log(action)
      return state

    case 'FEEDS_REMOVE_FEED':
      return {
        ...state,
        feeds: state.feeds.filter(feed => feed._id !== action.id)
      }

    case 'FEEDS_UPDATE_FEEDS':
      return {
        ...state,
        feeds: action.feeds
      }

    case 'FEEDS_UPDATE_FEED':
      newState = { ...state }
      dirtyFeedIndex = newState.feeds.findIndex(f => f._id === action.feed._id)
      dirtyFeed = newState.feeds[dirtyFeedIndex]
      newState.feeds[dirtyFeedIndex] = {
        ...dirtyFeed,
        ...action.feed
      }
      return newState

    case 'FEED_SET_CACHED_COVER_IMAGE':
      newState = { ...state }
      dirtyFeedIndex = newState.feeds.findIndex(f => f._id === action.id)
      dirtyFeed = newState.feeds[dirtyFeedIndex]
      newState.feeds[dirtyFeedIndex] = {
        ...dirtyFeed,
        cachedCoverImageId: action.cachedCoverImageId
      }
      return newState

    case 'ITEM_ADD_READING_TIME':
      feeds = [ ...state.feeds ]
      feed = feeds.find(feed => feed._id === action.item.feed_id)

      feed.reading_time = feed.reading_time || 0
      feed.reading_time += action.readingTime

      feed.number_read = feed.number_read || 0
      feed.number_read++

      const contentLength = action.item.content_length || (action.item.content_html
        ? action.item.content_html.length
        : 1)
      const readingRate = action.readingTime / contentLength
      feed.reading_rate = (feed.reading_rate && feed.reading_rate !== 'NaN') ?
        feed.reading_rate :
        0
      feed.reading_rate = (feed.reading_rate * (feed.number_read - 1) + readingRate) / feed.number_read
      feed.reading_rate = Number.parseFloat(feed.reading_rate.toFixed(4))

      if (feed.reading_rate === null || feed.reading_rate === 'NaN') {
        debugger
      }

      return {
        ...state,
        feeds
      }

    case 'ITEM_SHARE_ITEM':
      feeds = [ ...state.feeds ]
      feed = feeds.find(feed => feed._id === action.item.feed_id)
      feed.number_shared = feed.number_shared || 0
      feed.number_shared++
      return {
        ...state,
        feeds
      }

    case 'ITEM_SAVE_ITEM':
      feeds = [ ...state.feeds ]
      feed = feeds.find(feed => feed._id === action.item.feed_id)
      feed.number_saved = feed.number_saved || 0
      feed.number_saved++
      return {
        ...state,
        feeds
      }

    case 'FEED_MARK_READ':
      feeds = [ ...state.feeds ]
      feed = feeds.find(feed => feed._id === action.item.feed_id)
      const feedId = action.id
      const currentItem = state.items[state.index]
      items = [ ...state.items ].filter((item) => {
        return item.feed_id !== feedId &&
          item._id !== currentItem._id
      })
      let newIndex = 0
      items.forEach((item, index) => {
        if (item._id === currentItem._id) {
          newIndex = index
        }
      })
      if (newIndex == 0) {
        // find the first unread item and start there
        let i = 0
        for (let item of items) {
          if (!item.readAt) {
            newIndex = i
            break
          }
          i++
        }
      }
      return {
        ...state,
        items,
        index: newIndex
      }


    default:
      return state
  }
}
