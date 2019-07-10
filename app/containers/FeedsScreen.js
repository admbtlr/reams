import { connect } from 'react-redux'
import FeedsScreen from '../components/FeedsScreen.js'

const sortFeeds = (a, b) => ((a.isLiked === b.isLiked) ? 0 : a.isLiked ? -1 : 1) ||
  b.number_unread - a.number_unread ||
  b.title - a.title

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
