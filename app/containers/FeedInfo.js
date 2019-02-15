import { connect } from 'react-redux'
import FeedInfo from '../components/FeedInfo.js'
import { getIndex, getItems } from '../utils/get-item'

const mapStateToProps = (state, ownProps) => {
  const items = getItems(state)
  const index = getIndex(state)
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
