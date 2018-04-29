const initialState = {
  feeds: []
}

export function feeds (state = initialState, action) {
  switch (action.type) {
    case 'FEEDS_ADD_FEED_SUCCESS':
      let cleanedFeeds = state.feeds.filter(feed => !!feed)
      return {
        feeds: [
          ...cleanedFeeds,
          action.feed
        ]
      }
    case 'FEEDS_ADD_FEED':
      console.log(action)
      return state

    case 'FEEDS_REMOVE_FEED':
      return {
        feeds: state.feeds.filter(feed => feed._id !== action.id)
      }

    default:
      return state
  }
}
