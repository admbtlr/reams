import { connect } from 'react-redux'
import FeedsScreen from '../components/FeedsScreen.js'

const testFeeds = [
  {
    isLiked: true,
    title: 'a',
    number_unread: 10
  },
  {
    isLiked: false,
    title: 'h',
    number_unread: 0
  },
  {
    isLiked: false,
    title: 'g',
    number_unread: 0
  },
  {
    isLiked: false,
    title: 'f',
    number_unread: 1
  },
  {
    isLiked: false,
    title: 'e',
    number_unread: 2
  },
  {
    isLiked: false,
    title: 'd',
    number_unread: 3
  },
  {
    isLiked: false,
    title: 'c',
    number_unread: 3
  },
  {
    isLiked: true,
    title: 'b',
    number_unread: 9
  }
]

// const sortFeeds = (a, b) => (a.isLiked && b.isLiked) ? (a.title < b.title ? -1 : 1) :
//   a.isLiked ? -1 :
//   b.isLiked ? 1 :
//   b.number_unread === a.number_unread ?
//     (a.title < b.title ? -1 : 1) :
//     b.number_unread - a.number_unread

const sortFeeds = (a, b) => b.number_unread - a.number_unread

const mapStateToProps = (state) => {
  const items = state.itemsUnread.items
  const feeds = state.feeds.feeds.slice().sort(sortFeeds)
  const itemSort = state.config.itemSort
  const backendLabels = {
    feedbin: 'Feedbin',
    feedwrangler: 'Feedwrangler',
    rizzle: 'Rizzle'
  }

  return {
    backend: backendLabels[state.config.backend],
    feeds,
    numItems: items.length,
    itemSort
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    markAllRead: (olderThan) => dispatch({
      type: 'FEED_MARK_READ',
      id: null,
      originalId: null,
      olderThan: olderThan || Math.floor(Date.now() / 1000)
    }),
    showModal: (modalProps) => dispatch({
      type: 'UI_SHOW_MODAL',
      modalProps
    }),
    unsubscribe: (id) => dispatch({
      type: 'FEEDS_REMOVE_FEED',
      id
    }),
    clearReadItems: () => dispatch({
      type: 'ITEMS_CLEAR_READ'
    }),
    clearFeedFilter: () => dispatch({
      type: 'CONFIG_SET_FEED_FILTER',
      feedId: null
    })
  }
}

let FeedsScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedsScreen)

export default FeedsScreenContainer
