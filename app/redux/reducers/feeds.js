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
          {
            ...action.feed,
            isNew: true
          }
        ]
      }
    case 'FEEDS_ADD_FEEDS_SUCCESS':
      let newFeeds = action.feeds.filter(f => !state.feeds
          .find(feed => feed.url === f.url || feed._id === f._id))
        .map(f => ({
          ...f,
          isNew: true
        }))
      return {
        ...state,
        feeds: [
          ...state.feeds,
          ...newFeeds
        ]
      }
    case 'FEEDS_REFRESH_FEED_LIST':
      return {
        ...state,
        feeds: action.feeds
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
        feeds: action.feeds.map(f => ({
          ...f,
          isNew: false
        }))
      }

    case 'FEEDS_UPDATE_FEED':
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.feed._id ?
          {
            ...feed,
            ...action.feed,
            isNew: false
          } :
          feed)
      }

    case 'CONFIG_UNSET_BACKEND':
      return initialState

    case 'ITEM_ADD_READING_TIME':
      feeds = [ ...state.feeds ]
      feed = feeds.find(feed => feed._id === action.item.feed_id)

      // fix a bug where saved items can try and record reading time
      // even though they have no feed
      if (!feed) return state

      feed.reading_time = feed.reading_time || 0
      feed.reading_time += action.readingTime

      feed.number_read = feed.number_read || 0
      feed.number_read++
      feed.number_unread--

      const getContentLength = (item) => {
        if (item.hasShownMercury) {
          return item.content_mercury.length
        } else if (item.content_html) {
          return item.content_html.length
        } else {
          return 1
        }
      }

      const readingRate = action.readingTime / getContentLength(action.item)
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
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.item.feed_id ?
          {
            ...feed,
            number_shared: feed.number_shared ? feed.number_shared + 1 : 1
          } :
          feed)
      }

    case 'ITEM_SAVE_ITEM':
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.item.feed_id ?
          {
            ...feed,
            number_saved: feed.number_saved ? feed.number_saved + 1 : 1
          } :
          feed)
      }

    case 'FEED_TOGGLE_LIKE':
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            isLiked: !!!feed.isLiked
          } :
          feed)
      }

    case 'FEED_UNLIKE':
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            isLiked: false
          } :
          feed)
      }

    case 'FEED_TOGGLE_MUTE':
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            isMuted: !!!feed.isMuted
          } :
          feed)
      }

    case 'FEED_UNMUTE':
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            isMuted: false
          } :
          feed)
      }

    case 'ITEMS_MARK_READ':
      return updateUnreadCounts(action.items, state)

    case 'ITEMS_PRUNE_UNREAD':
      return updateUnreadCounts(action.prunedItems, state)

    case 'ITEM_MARK_READ':
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.item.feed_id ?
          {
            ...feed,
            number_unread: feed.number_unread - 1
          } :
          feed)
      }

    default:
      return state
  }
}

function updateUnreadCounts (itemsToClear, state) {
  let feedsWithCleared = {}
  itemsToClear.forEach(item => {
    let feed
    if (feedsWithCleared[item.feed_id]) {
      feedsWithCleared[item.feed_id]++
    } else {
      feedsWithCleared[item.feed_id] = 1
    }
  })
  return {
    ...state,
    feeds: state.feeds.map(feed => feedsWithCleared[feed._id] ?
      {
        ...feed,
        number_unread: feed.number_unread - feedsWithCleared[feed._id]
      } :
      feed)
  }
}