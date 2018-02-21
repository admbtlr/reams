const initialState = {
  feeds: []
}

export function feeds (state = initialState, action) {
  switch (action.type) {
    case 'FEEDS_ADD_FEED':
      return {
        feeds: [
          ...state.feeds,
          action.feed
        ]
      }

    case 'FEEDS_REMOVE_FEED':
      return state.feeds.filter(feed => feed !== action.feed)
    default:
      return state
  }
}
