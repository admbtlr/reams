const initialState = {
  feeds: [],
  lastUpdated: 0
}

export function feedsLocal (state = initialState, action) {
  let feeds
  let feed
  let newState, dirtyFeed, dirtyFeedIndex

  switch (action.type) {
    case 'FEED_SET_CACHED_FEED_ICON':
      feeds = state.feeds.map(f => f)
      if (feeds.find(f => f._id === action.id)) {
        let feed = feeds.find(f => f._id === action.id)
        feed.hasCachedIcon = true
        feed.cachedIconDimensions = action.dimensions
      } else {
        feeds.push({
          _id: action.id,
          hasCachedIcon: true,
          cachedIconDimensions: action.dimensions
        })
      }
      return {
        ...state,
        feeds
      }

    case 'FEED_ERROR_CACHING_ICON':
      feeds = state.feeds.map(f => f)
      let feed = feeds.find(f => f._id === action.id)
      if (feed) {
        const errors = feed.numCachingErrors || 0
        feed.numCachingErrors = errors + 1
        feed.lastCachingError = Date.now()
      } else {
        feeds.push({
          _id: action.id,
          numCachingErrors: 1,
          lastCachingError: Date.now()
        })
      }
      return {
        ...state,
        feeds
      }

    case 'FEED_HAS_RENDERED_ICON':
      feeds = state.feeds.map(f => f)
      if (feeds.find(f => f._id === action.id)) {
        let feed = feeds.find(f => f._id === action.id)
        feed.hasRenderedIcon = true
      } else {
        feeds.push({
          _id: action.id,
          hasRenderedIcon: true
        })
      }
      return {
        ...state,
        feeds
      }

    case 'FEEDS_SET_NEW':
      feeds = state.feeds.map(f => f)
      action.feeds.forEach(newFeed => {
        let feed = feeds.find(f => f._id === newFeed._id)
        if (feed) {
           feed.isNew = true
         } else {
          feeds.push({
            _id: newFeed._id,
            isNew: true
          })
         }
      })
      return {
        ...state,
        feeds
      }

    case 'FEED_SET_CACHED_COVER_IMAGE':
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            cachedCoverImageId: action.cachedCoverImageId
          } :
          feed)
      }

    case 'ITEMS_BATCH_FETCHED':
      // not really sure whether I should be using this, but I guess it makes sense...
      return {
        ...state,
        feeds: state.feeds.map(feed => ({
          ...feed,
          isNew: false
        }))
      }

    default:
      return state

  }
}

