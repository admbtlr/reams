import { connect } from 'react-redux'
import FeedInfo from '../components/FeedInfo.js'
// import { itemDidScroll } from '../redux/actions/item.js'

const mapStateToProps = (state, ownProps) => {
  const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const index = state.items.display === 'unread' ? state.items.index : state.items.savedIndex
  const numFeedItems = 43
  return {
    item: items[ownProps.index],
    numFeedItems
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    markAllRead: (feedName) => dispatch({
      type: 'ITEMS_MARK_ALL_READ',
      feedName
    }),
    unsubscribe: (feedName) => {
      console.log(`Unsubscribe from ${feedName}`)
    }
  }
}

let FeedInfoContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedInfo)

export default FeedInfoContainer
