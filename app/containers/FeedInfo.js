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
    markAllRead: (feedId) => dispatch({
      type: 'ITEMS_MARK_ALL_READ',
      feedId
    }),
    unsubscribe: (feedId) => {
      console.log(`Unsubscribe from ${feedId}`)
    }
  }
}

let FeedInfoContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedInfo)

export default FeedInfoContainer
