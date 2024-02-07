import { 
  UNSET_BACKEND,
  UserActionTypes
} from '../user/types'
import {
  ADD_FEEDS_TO_STORE,
  SET_FEEDS,
  ADD_FEED,
  REMOVE_FEED,
  UPDATE_FEEDS,
  UPDATE_FEED,
  LIKE_FEED_TOGGLE,
  UNLIKE_FEED,
  MUTE_FEED_TOGGLE,
  UNMUTE_FEED,
  MERCURY_FEED_TOGGLE,
  Feed,
  FeedActionTypes,
  FeedsState,
  ADD_FEEDS
} from './types'
import { 
  ADD_readingTime,
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

export const selectFeeds = (state: FeedsState) => state.feeds

export function feeds (
  state = initialState, 
  action: FeedActionTypes | UserActionTypes | ItemActionTypes | UserActionTypes
) {
  let feeds
  let feed
  let newState, dirtyFeed, dirtyFeedIndex

  switch (action.type) {
    case ADD_FEEDS_TO_STORE:
      let newFeeds = action.feeds.filter((f:Feed) => !state.feeds
        .find(feed => feed.url === f.url || feed._id === f._id))
      return {
        ...state,
        feeds: [
          ...state.feeds,
          ...newFeeds
        ]
      }
    case SET_FEEDS:
      return {
        ...state,
        feeds: action.feeds
      }
    case ADD_FEED:
    case ADD_FEEDS:
      return state

    case REMOVE_FEED:
      return {
        ...state,
        feeds: state.feeds.filter(feed => feed._id !== action.feed._id)
      }

    case UPDATE_FEEDS:
      feeds = state.feeds.map(f => {
        let updatedFeed = action.feeds.find((uf:Feed) => uf._id === f._id)
        return updatedFeed || f
      })
      return {
        ...state,
        feeds
      }

    case UPDATE_FEED:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.feed._id ?
          {
            ...feed,
            ...action.feed
          } :
          feed)
      }

    case UNSET_BACKEND:
      if (action.backend === 'reams') {
        return initialState
      } else {
        return state
      }

    case ADD_readingTime:
      feed = state.feeds.find(feed => feed._id === action.item.feed_id)

      // fix a bug where saved items can try and record reading time
      // even though they have no feed
      if (!feed) return state

      feed = { ...feed }
      feed.readingTime = feed.readingTime || 0
      feed.readingTime += action.readingTime

      feed.readCount = feed.readCount || 0
      feed.readCount++
      feed.unreadCount && feed.unreadCount--

      // const getContentLength = (item: Item) => {
      //   if (item.hasShownMercury) {
      //     return item.content_mercury ? item.content_mercury.length : 0
      //   } else if (item.content_html) {
      //     return item.content_html.length
      //   } else {
      //     return 1
      //   }
      // }

      if (action.item.content_length !== undefined) {
        const readingRate = action.readingTime / action.item.content_length
        feed.readingRate = (feed.readingRate && !Number.isNaN(feed.readingRate)) ?
          feed.readingRate :
          0
        feed.readingRate = (feed.readingRate * (feed.readCount - 1) + readingRate) / feed.readCount
        feed.readingRate = Number.parseFloat(feed.readingRate.toFixed(4))

        if (feed.readingRate === null || Number.isNaN(feed.readingRate)) {
          debugger
        }
      }
      
      return {
        ...state,
        feeds: [
          ...state.feeds.filter(f => f._id !== action.item.feed_id),
          feed
        ]
      }

    case SHARE_ITEM:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.item.feed_id ?
          {
            ...feed,
            sharedCount: feed.sharedCount ? feed.sharedCount + 1 : 1
          } :
          feed)
      }

    case SAVE_ITEM:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.item.feed_id ?
          {
            ...feed,
            savedCount: feed.savedCount ? feed.savedCount + 1 : 1
          } :
          feed)
      }

    case LIKE_FEED_TOGGLE:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.feed._id ?
          {
            ...feed,
            isLiked: !!!feed.isLiked
          } :
          feed)
      }

    case UNLIKE_FEED:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.feed._id ?
          {
            ...feed,
            isLiked: false
          } :
          feed)
      }

    case MUTE_FEED_TOGGLE:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.feed._id ?
          {
            ...feed,
            isMuted: !!!feed.isMuted
          } :
          feed)
      }

    case UNMUTE_FEED:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.feed._id ?
          {
            ...feed,
            isMuted: false
          } :
          feed)
      }

    case MERCURY_FEED_TOGGLE:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.feed._id ?
          {
            ...feed,
            isMercury: !!!feed.isMercury
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
            unreadCount: feed.unreadCount ? feed.unreadCount - 1 : 0,
            readCount: feed.readCount ? feed.readCount + 1 : 1
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
        unreadCount: (feed.unreadCount || 0) - feedsWithCleared[feed._id],
        readCount: (feed.readCount || 0) + feedsWithCleared[feed._id]
      } :
      feed)
  }
}