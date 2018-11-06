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
  const items = state.items.items
  const feeds = state.feeds.feeds.map(feed => {
    return {
      ...feed,
      numItems: items.filter(i => i.feed_id === feed._id).length
    }
  }).sort((a, b) => b.numItems - a.numItems)

  if (!areFeedsListsEqual(feeds, feedsCache)) {
    feedsCache = [...feeds]
  }

  return {
    feeds: feedsCache
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    markAllRead: (id) => dispatch({
      type: 'FEED_MARK_READ',
      id
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
