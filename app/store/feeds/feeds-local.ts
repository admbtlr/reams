import { 
  UNSET_BACKEND,
  ConfigActionTypes
} from '../config/types'
import { 
  CACHE_FEED_ICON_ERROR,
  SET_CACHED_FEED_ICON,
  FEED_HAS_RENDERED_ICON,
  SET_FEEDS_NEW,
  SET_CACHED_FEED_COVER_IMAGE,
  FeedActionTypes,
  FeedLocal,
  FeedsLocalState
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
  let newState, dirtyFeed, dirtyFeedIndex

  switch (action.type) {
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

    case SET_FEEDS_NEW:
      feeds = state.feeds.map(f => f)
      action.feeds.forEach(newFeed => {
        feed = feeds.find(f => f._id === newFeed._id)
        if (feed) {
           feed.isNew = true
         } else {
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

    case UNSET_BACKEND:
      return initialState

    default:
      return state

  }
}

