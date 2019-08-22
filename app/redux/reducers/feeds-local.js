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

    default:
      return state

  }
}

