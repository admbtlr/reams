import { connect } from 'react-redux'
import Feed from '../components/Feed.js'
import {getCachedImagePath} from '../utils/'

const mapStateToProps = (state, ownProps) => {
  const feedId = ownProps.feedId
  const items = state.itemsUnread.items
  const feed = state.feeds.feeds.find(f => f._id === feedId)
  const feedItems = items.filter(i => i.feed_id === feedId)
  const numFeedItems = feedItems.length
  const coverImageItem = feedItems.find(item => item.banner_image)
  const coverImagePath = coverImageItem ?
    getCachedImagePath(coverImageItem) :
    null
  const coverImageDimensions = coverImageItem ?
    coverImageItem.imageDimensions :
    null
  return {
    ...ownProps,
    numFeedItems,
    numRead: feed.num_read || 0,
    readingTime: feed.reading_time || 0,
    readingRate: feed.reading_rate || 0,
    coverImagePath,
    coverImageDimensions
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
      olderThan: olderThan || Math.floor(Date.now() / 1000)
    }),
    clearReadItems: () => dispatch({
      type: 'ITEMS_CLEAR_READ'
    }),
    unsubscribe: (id) => dispatch({
      type: 'FEEDS_REMOVE_FEED',
      id
    })
  }
}

let FeedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Feed)

export default FeedContainer
