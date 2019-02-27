import { connect } from 'react-redux'
import FeedsScreen from '../components/FeedsScreen.js'
// import { itemDidScroll } from '../redux/actions/item.js'

let feedsCache = []

const areFeedsListsEqual = (a, b) => {
  if (a.length !== b.length) {
    return false
  }
  let equal = true
  a.forEach((f, i) => {
    if (a[i].numItems !== b[i].numItems) {
      equal = false
    }
  })
  return equal
}

const mapStateToProps = (state) => {
  const items = state.itemsUnread.items
  const feeds = state.feeds.feeds.sort((a, b) => b.number_unread - a.number_unread)

  // if (!areFeedsListsEqual(feeds, feedsCache)) {
  //   feedsCache = [...feeds]
  // }

  return {
    feeds: feeds,
    numItems: items.length,
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
