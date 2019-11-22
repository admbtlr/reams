import { connect } from 'react-redux'
import FeedExpanded from '../components/FeedExpanded.js'
// import {getCachedCoverImagePath} from '../utils/'

const mapStateToProps = (state, ownProps) => {
  const feedId = ownProps.feed._id
  const feed = state.feeds.feeds.find(f => f._id === feedId)
  // const feedLocal = state.feedsLocal.feeds.find(f => f._id === feedId)
  // const feedItems = items.filter(i => i.feed_id === feedId)
  // const numFeedItems = feedItems.length
  // const coverImageItem = feedItems.find(item => item.banner_image)
  // const coverImageId = coverImageItem ?
  //   coverImageItem._id :
  //   null
  // const coverImageDimensions = coverImageItem ?
  //   coverImageItem.imageDimensions :
  //   null

  if (feed) {
    return {
      ...ownProps,
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
      type: 'CONFIG_SET_FEED_FILTER',
      feedFilter: id
    }),
    markAllRead: (id, originalId, olderThan) => dispatch({
      type: 'FEED_MARK_READ',
      id,
      originalId,
      olderThan: olderThan || Date.now()
    }),
    clearReadItems: () => dispatch({
      type: 'ITEMS_CLEAR_READ'
    }),
    unsubscribe: (id) => dispatch({
      type: 'FEEDS_REMOVE_FEED',
      id
    }),
    toggleMute: (id) => dispatch({
      type: 'FEED_TOGGLE_MUTE',
      id
    }),
    toggleLike: (id) => dispatch({
      type: 'FEED_TOGGLE_LIKE',
      id
    }),
    setCachedCoverImage: (feedId, cachedCoverImageId) => {
      return dispatch({
        type: 'FEED_SET_CACHED_COVER_IMAGE',
        id: feedId,
        cachedCoverImageId
      })
    }
  }
}

let FeedExpandedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedExpanded)

export default FeedExpandedContainer
