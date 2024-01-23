import { connect } from 'react-redux'
import { SET_FILTER } from '../store/config/types'
import {
  CLEAR_READ_ITEMS, 
  SORT_ITEMS,
  UPDATE_CURRENT_INDEX,
  ItemType 
} from '../store/items/types'
import {
  MARK_FEED_READ,
  REMOVE_FEED,
  LIKE_FEED_TOGGLE,
  MUTE_FEED_TOGGLE,
  MERCURY_FEED_TOGGLE,
  SET_CACHED_COVER_IMAGE,
  REMOVE_CACHED_COVER_IMAGE
} from '../store/feeds/types'
import FeedExpanded from '../components/FeedExpanded.js'
// import {getCachedCoverImagePath} from '../utils/'

const mapStateToProps = (state, ownProps) => {
  const feedId = ownProps.feed ?
    ownProps.feed._id :
    ownProps.feedId
  const feed = state.feeds.feeds.find(f => f._id === feedId)
  const items = state.itemsUnread.items

  // this stuff is all in the ownProps from FeedContracted,
  // but not from TopBar - hence we have to get it
  const feedLocal = state.feedsLocal.feeds.find(f => f._id === feedId)
  const feedItems = items.filter(i => i.feed_id === feedId)
  const numFeedItems = feedItems.length
  const coverImageItem = feedItems.find(item => item.coverImageUrl)
  const coverImageId = coverImageItem ?
    coverImageItem._id :
    null
  const coverImageDimensions = coverImageItem ?
    coverImageItem.imageDimensions :
    null

  if (feed) {
    return {
      ...ownProps,
      feed: {
        ...feed,
        numUnread: feedItems.length,
        numRead: feed.number_read || 0,
        readingTime: feed.reading_time || 0,
        readingRate: feed.reading_rate || 0,
        coverImageId,
        coverImageDimensions,
        cachedCoverImageId: feedLocal && feedLocal.cachedCoverImageId,
        iconDimensions: feedLocal && feedLocal.cachedIconDimensions
      },
      isFeedOnboardingDone: state.config.isFeedOnboardingDone
    }
  } else {
    return {
      isDeleted: true
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    filterItems: (id) => dispatch({
      type: SET_FILTER,
      filter: { type: 'feed', id }
    }),
    setIndex: (index) => dispatch({
      type: UPDATE_CURRENT_INDEX,
      index,
      displayMode: ItemType.unread
    }),
    markAllRead: (feed, olderThan) => dispatch({
      type: MARK_FEED_READ,
      feed,
      olderThan: olderThan || Date.now()
    }),
    clearReadItems: () => dispatch({
      type: CLEAR_READ_ITEMS
    }),
    unsubscribe: (feed) => dispatch({
      type: REMOVE_FEED,
      feed
    }),
    toggleMute: (feed) => {
      dispatch({
        type: MUTE_FEED_TOGGLE,
        feed
      })
      dispatch({
        type: CLEAR_READ_ITEMS
      })
    },
    toggleLike: (feed) => {
      dispatch({
        type: LIKE_FEED_TOGGLE,
        feed
      })
      dispatch({
        type: SORT_ITEMS
      })
    },
    toggleMercury: (feed) => dispatch({
      type: MERCURY_FEED_TOGGLE,
      feed
    }),
    setCachedCoverImage: (feedId, cachedCoverImageId) => {
      return dispatch({
        type: SET_CACHED_COVER_IMAGE,
        id: feedId,
        cachedCoverImageId
      })
    },
    removeCachedCoverImage: (feedId) => {
      return dispatch({
        type: REMOVE_CACHED_COVER_IMAGE,
        id: feedId
      })
    }
  }
}

let FeedExpandedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedExpanded)

export default FeedExpandedContainer
