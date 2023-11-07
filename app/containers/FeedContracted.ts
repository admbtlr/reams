import { connect } from 'react-redux'
import { SET_FILTER } from '../store/config/types'
import { 
  CLEAR_READ_ITEMS,
  UPDATE_CURRENT_INDEX,
  ItemType,
  Item
} from '../store/items/types'
import { 
  Feed,
  FeedLocal,
  MARK_FEED_READ,
  REMOVE_FEED,
  REMOVE_CACHED_COVER_IMAGE,
  SET_CACHED_COVER_IMAGE
} from '../store/feeds/types'
import FeedContracted from '../components/FeedContracted'
import {getCachedCoverImagePath} from '../utils'
import { SHOW_MODAL } from '../store/ui/types'
import { Category, DELETE_CATEGORY, UPDATE_CATEGORY } from '../store/categories/types'

export interface WrappedFeed {
  feedId: string
  feed: Feed
  feedLocal: FeedLocal
  feedItems: Item[]
  numFeedItems: number
  color: string
  coverImageItem: Item
  coverImageId: string
  coverImageDimensions: number[]
}

const mapStateToProps = (state: any, ownProps: any) => {
  const items = state.itemsUnread.items

  let feeds = ownProps.feeds ?? [ ownProps.feed ]
  feeds = feeds.map((feedsEntry: Feed | string) => {
    const feed: Feed = typeof feedsEntry === 'string' ?
      state.feeds.feeds.find((f: Feed) => f._id === feedsEntry) :
      feedsEntry
    if (feed === undefined) {
      console.log('FeedContracted: feed not found')
      return null
    }
    const feedItems = items.filter((i: Item) => i.feed_id === feed._id)
    const coverImageItem = feedItems.find((item: Item) => item.coverImageUrl)
    return {
      feedId: feed._id,
      feed: state.feeds.feeds.find((f: Feed) => f._id === feed._id),
      feedLocal: state.feedsLocal.feeds.find((f: Feed) => f._id === feed._id),
      feedItems,
      numFeedItems: feedItems.length,
      color: feed.color,
      coverImageItem,
      coverImageId: coverImageItem ?
        coverImageItem._id :
        null,
      coverImageDimensions: coverImageItem ?
        coverImageItem.imageDimensions :
        null
    }
  })

  if (feeds.length) {
    return {
      ...ownProps,
      isPortrait: state.config.orientation === 'portrait',
      feeds
      // feed: {
      //   ...feed,
      //   numUnread: items.filter(i => i.feed_id === feedId).length,
      //   numRead: feed.number_read || 0,
      //   readingTime: feed.reading_time || 0,
      //   readingRate: feed.reading_rate || 0,
      //   coverImageId,
      //   coverImageDimensions,
      //   cachedCoverImageId: feedLocal && feedLocal.cachedCoverImageId,
      //   iconDimensions: feedLocal && feedLocal.cachedIconDimensions
      // }
    }
  } else {
    return {
      isDeleted: true
    }
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    filterItems: (_id: string, title: string, type: string) => dispatch({
      type: SET_FILTER,
      filter: { _id, title, type }
    }),
    markAllRead: (id: string, originalId: string, olderThan: string) => dispatch({
      type: MARK_FEED_READ,
      id,
      originalId,
      olderThan: olderThan || Date.now()
    }),
    clearReadItems: () => dispatch({
      type: CLEAR_READ_ITEMS
    }),
    setIndex: (index: number) => dispatch({
      type: UPDATE_CURRENT_INDEX,
      index,
      displayMode: ItemType.unread
    }),
    unsubscribe: (id: string) => dispatch({
      type: REMOVE_FEED,
      id
    }),
    setCachedCoverImage: (feedId: string, cachedCoverImageId: string) => {
      return dispatch({
        type: SET_CACHED_COVER_IMAGE,
        id: feedId,
        cachedCoverImageId
      })
    },
    removeCachedCoverImage: (feedId: string) => {
      return dispatch({
        type: REMOVE_CACHED_COVER_IMAGE,
        id: feedId
      })
    },
    showModal: (modalProps) => dispatch({
      type: SHOW_MODAL,
      modalProps
    }),
    updateCategory: (category: Category) => dispatch({
      type: UPDATE_CATEGORY,
      category
    }),
    deleteCategory: (category: Category) => dispatch({
      type: DELETE_CATEGORY,
      category
    })
  }
}

let FeedContractedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedContracted)

export default FeedContractedContainer
