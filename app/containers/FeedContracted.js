import { connect } from 'react-redux'
import { SET_FEED_FILTER } from '../store/config/types'
import { 
  MARK_FEED_READ,
  REMOVE_FEED,
  SET_CACHED_FEED_COVER_IMAGE
} from '../store/feeds/types'
import FeedContracted from '../components/FeedContracted.js'
import {getCachedCoverImagePath} from '../utils/'

const mapStateToProps = (state, ownProps) => {
  const feedId = ownProps.feed._id
  const items = state.itemsUnread.items
  const feed = state.feeds.feeds.find(f => f._id === feedId)
  const feedLocal = state.feedsLocal.feeds.find(f => f._id === feedId)
  const feedItems = items.filter(i => i.feed_id === feedId)
  const numFeedItems = feedItems.length
  const coverImageItem = feedItems.find(item => item.banner_image)
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
        numUnread: items.filter(i => i.feed_id === feedId).length,
        numRead: feed.number_read || 0,
        readingTime: feed.reading_time || 0,
        readingRate: feed.reading_rate || 0,
        coverImageId,
        coverImageDimensions,
        cachedCoverImageId: feedLocal && feedLocal.cachedCoverImageId,
        iconDimensions: feedLocal && feedLocal.cachedIconDimensions
      }
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
      type: SET_FEED_FILTER,
      feedFilter: id
    }),
    markAllRead: (id, originalId, olderThan) => dispatch({
      type: MARK_FEED_READ,
      id,
      originalId,
      olderThan: olderThan || Date.now()
    }),
    clearReadItems: () => dispatch({
      type: 'ITEMS_CLEAR_READ'
    }),
    unsubscribe: (id) => dispatch({
      type: REMOVE_FEED,
      id
    }),
    setCachedCoverImage: (feedId, cachedCoverImageId) => {
      return dispatch({
        type: SET_CACHED_FEED_COVER_IMAGE,
        id: feedId,
        cachedCoverImageId
      })
    }
  }
}

let FeedContractedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedContracted)

export default FeedContractedContainer
