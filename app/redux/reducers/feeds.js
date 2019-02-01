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

    case 'FEEDS_SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.lastUpdated
      }

    case 'ITEM_ADD_READING_TIME':
      const feeds = [ ...state.feeds ]
      const feed = feeds.find(feed => feed._id === action.item.feed_id)

      feed.reading_time = feed.reading_time || 0
      feed.reading_time += action.readingTime

      feed.num_read = feed.num_read || 0
      feed.num_read++

      const readingRate = action.readingTime / action.item.content_length
      feed.reading_rate = feed.reading_rate || 0
      feed.reading_rate = (feed.reading_rate * (feed.num_read - 1) + readingRate) / feed.num_read

      return {
        ...state,
        feeds
      }

    // case 'ITEMS_FETCH_DATA_SUCCESS':
    //   const feeds = state.feeds
    //   action.items.forEach(item => {
    //     if (!state.feeds.find(feed => feed._id === item.feed_id)) {
    //       feeds.push({
    //         id: item.feed_id,
    //         title: item.feed_title
    //       })
    //     }
    //   })
    //   return {
    //     ...state,
    //     feeds
    //   }

    default:
      return state
  }
}
