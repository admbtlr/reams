import { connect } from 'react-redux'
import FeedIcon from '../components/FeedIcon.js'

const mapStateToProps = (state, ownProps) => {
  let feed, feedLocal
  if (ownProps.feed) {
    feed = ownProps.feed
    feedLocal = state.feedsLocal.feeds.find(f => f._id === feed._id)
  } else {
    feedLocal = state.feedsLocal.feeds.find(f => f._id === ownProps.id)
    feed = state.feeds.feeds.find(f => f._id === ownProps.id)
  }
  return {
    ...ownProps,
    feed,
    hasCachedIcon: feedLocal && feedLocal.hasCachedIcon,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

let FeedIconContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedIcon)

export default FeedIconContainer
