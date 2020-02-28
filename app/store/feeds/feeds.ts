import { 
  UNSET_BACKEND,
  ConfigActionTypes
} from '../config/types'
import {
  ADD_FEED_SUCCESS,
  ADD_FEEDS_SUCCESS,
  REFRESH_FEED_LIST,
  ADD_FEED,
  REMOVE_FEED,
  UPDATE_FEEDS,
  UPDATE_FEED,
  LIKE_FEED_TOGGLE,
  UNLIKE_FEED,
  MUTE_FEED_TOGGLE,
  UNMUTE_FEED,
  FeedActionTypes,
  FeedsState
} from './types'
import { 
  ADD_READING_TIME,
  MARK_ITEM_READ,
  MARK_ITEMS_READ,
  PRUNE_UNREAD,
  SAVE_ITEM,
  SHARE_ITEM,
  ItemActionTypes,
  Item
} from '../items/types'

const initialState:FeedsState = {
  feeds: [],
  lastUpdated: 0
}

export function feeds (
  state = initialState, 
  action: FeedActionTypes | ConfigActionTypes | ItemActionTypes
) {
  let feeds
  let feed
  let newState, dirtyFeed, dirtyFeedIndex

  switch (action.type) {
    case ADD_FEED_SUCCESS:
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
    case ADD_FEEDS_SUCCESS:
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
    case REFRESH_FEED_LIST:
      return {
        ...state,
        feeds: action.feeds
      }
    case ADD_FEED:
      console.log(action)
      return state

    case REMOVE_FEED:
      return {
        ...state,
        feeds: state.feeds.filter(feed => feed._id !== action.feed._id)
      }

    case UPDATE_FEEDS:
      return {
        ...state,
        feeds: action.feeds.map(f => ({
          ...f,
          isNew: false
        }))
      }

    case UPDATE_FEED:
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

    case UNSET_BACKEND:
      return initialState

    case ADD_READING_TIME:
      feeds = [ ...state.feeds ]
      feed = feeds.find(feed => feed._id === action.item.feed_id)

      // fix a bug where saved items can try and record reading time
      // even though they have no feed
      if (!feed) return state

      feed.reading_time = feed.reading_time || 0
      feed.reading_time += action.readingTime

      feed.number_read = feed.number_read || 0
      feed.number_read++
      feed.number_unread && feed.number_unread--

      const getContentLength = (item: Item) => {
        if (item.hasShownMercury) {
          return item.content_mercury ? item.content_mercury.length : 0
        } else if (item.content_html) {
          return item.content_html.length
        } else {
          return 1
        }
      }

      const readingRate = action.readingTime / getContentLength(action.item)
      feed.reading_rate = (feed.reading_rate && feed.reading_rate !== NaN) ?
        feed.reading_rate :
        0
      feed.reading_rate = (feed.reading_rate * (feed.number_read - 1) + readingRate) / feed.number_read
      feed.reading_rate = Number.parseFloat(feed.reading_rate.toFixed(4))

      if (feed.reading_rate === null || feed.reading_rate === NaN) {
        debugger
      }

      return {
        ...state,
        feeds
      }

    case SHARE_ITEM:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.item.feed_id ?
          {
            ...feed,
            number_shared: feed.number_shared ? feed.number_shared + 1 : 1
          } :
          feed)
      }

    case SAVE_ITEM:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.item.feed_id ?
          {
            ...feed,
            number_saved: feed.number_saved ? feed.number_saved + 1 : 1
          } :
          feed)
      }

    case LIKE_FEED_TOGGLE:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            isLiked: !!!feed.isLiked
          } :
          feed)
      }

    case UNLIKE_FEED:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            isLiked: false
          } :
          feed)
      }

    case MUTE_FEED_TOGGLE:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            isMuted: !!!feed.isMuted
          } :
          feed)
      }

    case UNMUTE_FEED:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            isMuted: false
          } :
          feed)
      }

    case MARK_ITEMS_READ:
      return updateUnreadCounts(action.items, state)

    case PRUNE_UNREAD:
      return updateUnreadCounts(action.prunedItems, state)

    case MARK_ITEM_READ:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.item.feed_id ?
          {
            ...feed,
            number_unread: feed.number_unread ? feed.number_unread - 1 : 0
          } :
          feed)
      }

    default:
      return state
  }
}

function updateUnreadCounts (itemsToClear: Item[], state: FeedsState) {
  let feedsWithCleared: { [key: string]: number } = {}
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
        number_unread: (feed.number_unread || 0) - feedsWithCleared[feed._id]
      } :
      feed)
  }
}