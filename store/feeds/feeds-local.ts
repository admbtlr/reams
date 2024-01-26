import { 
  UNSET_BACKEND,
  UserActionTypes
} from '../user/types'
import { 
  CACHE_FEED_ICON_ERROR,
  SET_CACHED_FEED_ICON,
  SET_FEEDS,
  SET_CACHED_COVER_IMAGE,
  FeedActionTypes,
  FeedLocal,
  FeedsLocalState,
  REMOVE_FEED,
  REMOVE_CACHED_COVER_IMAGE,
  ADD_FEEDS_TO_STORE,
} from './types'
import { 
  ITEMS_BATCH_FETCHED,
  MARK_ITEM_READ,
  ItemActionTypes
} from '../items/types'

const initialState: FeedsLocalState = {
  feeds: []
}

export function feedsLocal (
  state = initialState, 
  action: FeedActionTypes | UserActionTypes | ItemActionTypes
) {
  let feeds: FeedLocal[]
  let feed: FeedLocal | undefined

  switch (action.type) {
    case ADD_FEEDS_TO_STORE:
      feeds = action.feeds.filter(f => !state.feeds
        .find(feed => feed._id === f._id)).map(f => ({
          _id: f._id,
          isNew: true
        }))
      return {
        ...state,
        feeds: [
          ...state.feeds,
          ...feeds
        ]
      }

    case REMOVE_FEED:
      return {
        ...state,
        feeds: state.feeds.filter(feed => feed._id !== action.feed._id)
      }
  
    case SET_CACHED_FEED_ICON:
      feeds = state.feeds.map(f => f)
      feed = feeds.find(f => f._id === action.id)
      if (feed) {
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

    case CACHE_FEED_ICON_ERROR:
      feed = state.feeds.find(f => f._id === action.id)
      if (feed) {
        const errors = feed.numCachingErrors || 0
        feed = {
          ...feed,
          numCachingErrors: errors + 1,
          lastCachingError: Date.now()
        }
      } else {
        feed = {
          _id: action.id,
          numCachingErrors: 1,
          lastCachingError: Date.now()
        }
      }
      return {
        ...state,
        feeds: [
          ...state.feeds,
          feed
        ]
      }

    case SET_FEEDS:
      feeds = state.feeds.map(f => f)
      action.feeds.forEach(newFeed => {
        feed = feeds.find(f => f._id === newFeed._id)
        if (!feed) {
          feeds.push({
            _id: newFeed._id,
            isNew: true
          })
         }
      })
      return {
        ...state,
        feeds
      }

    case SET_CACHED_COVER_IMAGE:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            cachedCoverImageId: action.cachedCoverImageId
          } :
          feed)
      }

    case REMOVE_CACHED_COVER_IMAGE:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            cachedCoverImageId: null
          } :
          feed)
      }
  
    case MARK_ITEM_READ:
      const item = action.item
      return {
        ...state,
        feeds: state.feeds.map(feed => ({
          ...feed,
          cachedCoverImageId: feed.cachedCoverImageId === item._id ?
            null :
            feed.cachedCoverImageId
        }))
      }

    case ITEMS_BATCH_FETCHED:
      // not really sure whether I should be using this, but I guess it makes sense...
      return {
        ...state,
        feeds: state.feeds.map(feed => ({
          ...feed,
          isNew: false
        }))
      }

    case UNSET_BACKEND:
      if (action.backend === 'reams') {
        return initialState
      } else {
        return state
      }

    default:
      return state

  }
}

