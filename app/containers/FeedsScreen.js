import { connect } from 'react-redux'
import FeedsScreen from '../components/FeedsScreen.js'
// import { itemDidScroll } from '../redux/actions/item.js'

const mapStateToProps = (state, ownProps) => {
  const items = state.items.items
  const feeds = state.feeds.feeds.map(feed => {
    return {
      ...feed,
      numItems: items.filter(i => i.feed_id === feed._id).length
    }
  }).sort((a, b) => b.numItems - a.numItems)
  return {
    ...ownProps,
    feeds
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
    })
  }
}

let FeedsScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedsScreen)

export default FeedsScreenContainer
