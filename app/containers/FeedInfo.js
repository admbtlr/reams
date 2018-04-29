import { connect } from 'react-redux'
import FeedInfo from '../components/FeedInfo.js'
// import { itemDidScroll } from '../redux/actions/item.js'

const mapStateToProps = (state, ownProps) => {
  const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const index = state.items.display === 'unread' ? state.items.index : state.items.savedIndex
  const item = items[ownProps.index]
  const numFeedItems = items.filter(i => i.feed_id === item.feed_id).length
  return {
    item,
    numFeedItems
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

let FeedInfoContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedInfo)

export default FeedInfoContainer
