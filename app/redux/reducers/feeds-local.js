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
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            hasCachedIcon: true
          } :
          feed)
      }

    default:
      return state

  }
}

