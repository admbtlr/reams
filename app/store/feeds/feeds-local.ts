import { 
  SET_BACKEND,
  UNSET_BACKEND,
  ConfigActionTypes
} from '../config/types'
import { 
  CACHE_FEED_ICON_ERROR,
  SET_CACHED_FEED_ICON,
  FEED_HAS_RENDERED_ICON,
  SET_FEEDS,
  SET_CACHED_FEED_COVER_IMAGE,
  FeedActionTypes,
  FeedLocal,
  FeedsLocalState,
  ADD_FEED_SUCCESS,
  ADD_FEEDS_SUCCESS,
  REMOVE_FEED
} from './types'
import { 
  ITEMS_BATCH_FETCHED,
  ItemActionTypes
} from '../items/types'

const initialState: FeedsLocalState = {
  feeds: []
}

export function feedsLocal (
  state = initialState, 
  action: FeedActionTypes | ConfigActionTypes | ItemActionTypes
) {
  let feeds: FeedLocal[]
  let feed: FeedLocal | undefined

  switch (action.type) {
    case ADD_FEED_SUCCESS:
      feeds = state.feeds.filter(f => f._id !== action.feed._id)
      return {
        ...state,
        feeds: [
          ...feeds,
          {
            _id: action.feed._id,
            isNew: true
          }
        ]
      }
    case ADD_FEEDS_SUCCESS:
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
      feeds = state.feeds.map(f => f)
      feed = feeds.find(f => f._id === action.id)
      if (feed) {
        const errors = feed.numCachingErrors || 0
        feed.numCachingErrors = errors + 1
        feed.lastCachingError = Date.now()
      } else {
        feeds.push({
          _id: action.id,
          numCachingErrors: 1,
          lastCachingError: Date.now()
        })
      }
      return {
        ...state,
        feeds
      }

    case FEED_HAS_RENDERED_ICON:
      feeds = state.feeds.map(f => f)
      feed = feeds.find(f => f._id === action.id)
      if (feed) {
        feed.hasRenderedIcon = true
      } else {
        feeds.push({
          _id: action.id,
          hasRenderedIcon: true
        })
      }
      return {
        ...state,
        feeds
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

    case SET_CACHED_FEED_COVER_IMAGE:
      return {
        ...state,
        feeds: state.feeds.map(feed => feed._id === action.id ?
          {
            ...feed,
            cachedCoverImageId: action.cachedCoverImageId
          } :
          feed)
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

    case SET_BACKEND:
    case UNSET_BACKEND:
      return initialState

    default:
      return state

  }
}

