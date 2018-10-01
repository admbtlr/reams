const initialState = {
  feeds: [],
  lastUpdated: 0
}

export function feeds (state = initialState, action) {
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
      let newFeeds = action.addedFeeds.filter(addedFeed => !state.feeds.find(feed => feed.url === addedFeed.url))
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

    case 'FEEDS_SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.lastUpdated
      }

    default:
      return state
  }
}
