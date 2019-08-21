const initialState = {
  feeds: [],
  lastUpdated: 0
}

export function feedsLocal (state = initialState, action) {
  let feeds
  let feed
  let newState, dirtyFeed, dirtyFeedIndex

  switch (action.type) {
    case 'FEED_SET_CACHED_FAVICON':
      feeds = state.feeds.map(f => f)
      if (feeds.find(f => f._id === action.id)) {
        feeds.find(f => f._id === action.id).hasCachedIcon = true
      } else {
        feeds.push({
          _id: action.id,
          hasCachedIcon: true
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

